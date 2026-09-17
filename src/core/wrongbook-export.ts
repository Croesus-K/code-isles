import type { CourseDef } from '../content/course'
import type { WrongAnswerRecord } from './save/schema'

interface ResolvedItem {
  record: WrongAnswerRecord
  regionId: string
  regionName: string
  levelName: string
  levelId: string
  questionIndex: number
  questionPrompt: string
  questionKind: string
  /** choice 题的选项 / fill 题的代码 / bug 题的代码行 / order 题的代码行 */
  questionBody: string
}

const KIND_LABEL: Record<string, string> = {
  choice: '概念选择',
  output: '输出预测',
  fill: '代码填空',
  order: '代码排序',
  bug: '找错题',
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

/** ISO → "YYYY-MM-DD HH:mm"（本地时区即可——markdown 给真人阅读，不必精确） */
function formatLocalTime(iso: string): string {
  if (!iso) return '时间未记录'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '时间未记录'
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
    `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  )
}

/**
 * 解析 questionKey。content 改版后旧 key 失效 → 返回 null（调用方过滤）。
 */
function resolve(
  record: WrongAnswerRecord,
  course: CourseDef,
): ResolvedItem | null {
  const parts = record.questionKey.split(':')
  if (parts.length !== 3) return null
  const [regionId, levelId, qIdxStr] = parts
  const region = course.regions.find((r) => r.id === regionId)
  if (!region) return null
  const level = region.levels.find((l) => l.id === levelId)
  if (!level) return null
  const questionIndex = parseInt(qIdxStr, 10)
  if (
    !Number.isInteger(questionIndex) ||
    questionIndex < 0 ||
    questionIndex >= level.questions.length
  ) {
    return null
  }
  const q = level.questions[questionIndex]
  let body = ''
  switch (q.kind) {
    case 'choice':
      body = q.code ? `${q.code}\n\n` + q.options.map((o, i) => `${i + 1}. ${o}`).join('\n') : q.options.map((o, i) => `${i + 1}. ${o}`).join('\n')
      break
    case 'output':
      body = `${q.code}\n\n` + q.options.map((o, i) => `${i + 1}. ${o}`).join('\n')
      break
    case 'fill':
      body = q.code
      break
    case 'order':
      body = q.lines.join('\n')
      break
    case 'bug':
      body = q.code
        .map((line, i) => `${pad2(i + 1)} | ${line}`)
        .join('\n')
      break
  }
  return {
    record,
    regionId,
    regionName: region.name,
    levelName: level.name,
    levelId,
    questionIndex,
    questionPrompt: q.prompt,
    questionKind: q.kind,
    questionBody: body,
  }
}

/**
 * 把错题本渲染成 Markdown 文本。结构：
 *   # 标题
 *   > 元信息（导出时间 · 总数 · 区域数）
 *   ## 区域 A
 *     ### 关卡 X · 题型
 *     答错 N 次 · YYYY-MM-DD HH:mm
 *     题目正文
 *     ```code
 *     ```
 *     ---
 *   ## 区域 B ...
 *
 * 设计取舍：
 *   - 不暴露正确答案——错题本的价值在于让用户带走"我薄弱在哪里"的清单
 *     方便给真人老师看 / 自己重做对照，而不是直接抄答案
 *   - 按 region.name 排序、region 内按 questionIndex 升序——便于核对教材进度
 *   - 时间戳用本地时区；学生抄到 Notion 时一眼能看懂"昨天 14:30 错的"
 *   - 数据漂移（content 改版后旧 key 失效）静默跳过
 */
export function buildWrongBookMarkdown(
  wrongAnswers: readonly WrongAnswerRecord[],
  course: CourseDef,
  now: Date = new Date(),
): string {
  const items: ResolvedItem[] = []
  for (const r of wrongAnswers) {
    const r0 = resolve(r, course)
    if (r0) items.push(r0)
  }

  if (items.length === 0) {
    return (
      `# 代码群岛 · 错题清单\n\n` +
      `> 导出时间：${formatLocalTime(now.toISOString())} · 共 0 道题\n\n` +
      `还没有需要巩固的题目 ✨\n`
    )
  }

  // 按 region 顺序 → level 顺序 → questionIndex 顺序
  // levelId 形如 "1-1"、"1-2"——localeCompare 会按字符比，"1-2"(45) < "1-1"(49)，
  // 排序倒过来。解析成数字数组分段比较才符合"先 1-1 后 1-2"的阅读直觉。
  items.sort((a, b) => {
    if (a.regionId !== b.regionId) return a.regionId.localeCompare(b.regionId)
    const aL = a.levelId.split('-').map((s) => parseInt(s, 10) || 0)
    const bL = b.levelId.split('-').map((s) => parseInt(s, 10) || 0)
    const len = Math.max(aL.length, bL.length)
    for (let i = 0; i < len; i++) {
      const av = aL[i] ?? 0
      const bv = bL[i] ?? 0
      if (av !== bv) return av - bv
    }
    return a.questionIndex - b.questionIndex
  })

  // 按 region 分桶
  const grouped = new Map<string, { regionName: string; items: ResolvedItem[] }>()
  for (const it of items) {
    if (!grouped.has(it.regionId)) {
      grouped.set(it.regionId, { regionName: it.regionName, items: [] })
    }
    grouped.get(it.regionId)!.items.push(it)
  }

  const lines: string[] = []
  lines.push(`# 代码群岛 · 错题清单`)
  lines.push('')
  lines.push(
    `> 导出时间：${formatLocalTime(now.toISOString())} · 共 ${items.length} 道题 · ${grouped.size} 个区域`,
  )
  lines.push('')
  lines.push(`> 答案未导出 — 请在 App 内复习巩固。`)
  lines.push('')

  let isFirstGroup = true
  for (const [, group] of grouped) {
    if (!isFirstGroup) lines.push('')
    isFirstGroup = false
    lines.push(`## ${group.regionName}`)
    lines.push('')
    let isFirstItem = true
    for (const it of group.items) {
      if (!isFirstItem) lines.push('---')
      lines.push('')
      isFirstItem = false
      lines.push(`### ${it.levelName} · ${KIND_LABEL[it.questionKind] ?? it.questionKind}`)
      lines.push('')
      lines.push(
        `答错 ${it.record.attempts} 次 · ${formatLocalTime(it.record.wrongAt)}`,
      )
      lines.push('')
      lines.push(it.questionPrompt)
      lines.push('')
      if (it.questionBody) {
        // 用 python 代码块——课程内容都是 Python
        lines.push('```python')
        lines.push(it.questionBody)
        lines.push('```')
        lines.push('')
      }
    }
  }

  return lines.join('\n')
}

/** 触发浏览器下载 markdown 文件 */
export function downloadWrongBookMarkdown(
  wrongAnswers: readonly WrongAnswerRecord[],
  course: CourseDef,
): void {
  const md = buildWrongBookMarkdown(wrongAnswers, course)
  const ts = new Date()
  const fname =
    `code-isles-wrongbook-${ts.getFullYear()}${pad2(ts.getMonth() + 1)}${pad2(ts.getDate())}.md`
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fname
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 渲染 markdown 文本（不下载、不写剪贴板），供"复制到剪贴板"按钮等场景复用。
 */
export function renderWrongBookMarkdown(
  wrongAnswers: readonly WrongAnswerRecord[],
  course: CourseDef,
): string {
  return buildWrongBookMarkdown(wrongAnswers, course)
}
