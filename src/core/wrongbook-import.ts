import type { CourseDef } from '../content/course'
import type { WrongAnswerRecord } from './save/schema'

/**
 * 错题本 Markdown 导入。
 *
 * 设计取舍：
 * - 导出的 markdown 不含 questionKey，也不含 attempts/wrongAt（隐私 + 体积考虑）。
 *   导入时只能"重建"——按 region.name + level.name + prompt 前 40 字符反查 course 里的题目。
 * - 反查失败的条目：跳过并累计未识别数；UI 上提示"识别 X 条 / 跳过 Y 条"。
 * - 已存在的 questionKey：跳过（保留原 attempts，避免用户手动清零）。
 *   这是更保守的策略——导入是"补充"，不是"覆盖"。
 * - wrongAt 用 now；attempts 固定 1（无外部信息可用）。
 */

export interface ImportedEntry {
  /** 反查成功构造的 questionKey */
  questionKey: string
  /** 反查来源的 region.name（用于错误日志） */
  regionName: string
  levelName: string
  /** 用于反查的 prompt 前 N 字符（未匹配上时回显） */
  promptPreview: string
}

export interface ImportResult {
  /** 反查成功、且为新条目的数量 */
  added: number
  /** 反查成功但 questionKey 已存在，跳过的数量 */
  skipped: number
  /** 反查失败的条目数（区域/关卡/题目都没匹配上） */
  unrecognized: number
  /** 反查失败条目的简表（最多 5 条），用于 UI 提示 */
  unrecognizedSamples: Array<{ regionName: string; levelName: string; promptPreview: string }>
  /** 构造的记录列表（不含已存在的），调用方负责合并进 save.wrongAnswers */
  records: WrongAnswerRecord[]
}

/** 一段错题块：含 regionName / levelName / prompt 原文 */
interface ParsedBlock {
  regionName: string
  levelName: string
  prompt: string
}

/**
 * 把 markdown 拆成 regionName / levelName / prompt 块。
 * 容错策略：
 * - "## 区域名" → regionName
 * - "### 关卡名 · 题型" → levelName（按 ' · ' 切）
 * - "答错 N 次 · 时间" → 跳过
 * - 题目正文（prompt）到下一个 ##/###/---/空行分隔符前
 */
function parseMarkdown(md: string): ParsedBlock[] {
  const lines = md.split(/\r?\n/)
  const blocks: ParsedBlock[] = []
  let regionName = ''
  let levelName = ''
  let promptLines: string[] = []

  const flush = () => {
    const prompt = promptLines.join('\n').trim()
    if (regionName && levelName && prompt) {
      blocks.push({ regionName, levelName, prompt })
    }
    promptLines = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      flush()
      // "## 区域名" — 排除 "# 代码群岛 · 错题清单"（h1）
      regionName = line.slice(3).trim()
      continue
    }
    if (line.startsWith('### ')) {
      flush()
      // "### 关卡名 · 题型" — 取 '·' 之前的部分
      const title = line.slice(4).trim()
      levelName = title.split('·')[0].trim() || title
      continue
    }
    if (line === '---' || line === '```') {
      // 分隔符：保留 prompt 内容，但标记块边界（不真正 flush，由下个 ##/### 触发）
      if (promptLines.length > 0) promptLines.push(raw)
      continue
    }
    // 空行 + 非空文本：累积 prompt
    if (line === '') {
      // 空行作为段落分隔，保留
      if (promptLines.length > 0 && promptLines[promptLines.length - 1] !== '') {
        promptLines.push('')
      }
      continue
    }
    // 跳过元信息行（以 > 开头）和统计行
    if (line.startsWith('>')) continue
    if (/^答错 \d+ 次/.test(line)) continue
    promptLines.push(raw)
  }
  flush()
  return blocks
}

/**
 * prompt 前 N 字符用于反查比对（去首尾空白 + 去换行）。
 * 与导出一致：questionPreview 长度 = 40（见 ProfileView QUESTION_PREVIEW_LEN）。
 */
const PROMPT_MATCH_PREFIX = 40

function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/**
 * 在 course 中反查 questionKey。匹配规则：
 * 1. regionName 完全匹配 region.name
 * 2. levelName 完全匹配 level.name
 * 3. prompt 前 PROMPT_MATCH_PREFIX 字符与 level.questions[i].prompt 前缀匹配（normalize 后）
 * 返回第一条命中；找不到返回 null。
 */
function lookupQuestionKey(
  block: ParsedBlock,
  course: CourseDef,
): { questionKey: string; promptPreview: string } | null {
  const targetNorm = normalize(block.prompt)
  for (const region of course.regions) {
    if (region.name !== block.regionName) continue
    for (const level of region.levels) {
      if (level.name !== block.levelName) continue
      for (let i = 0; i < level.questions.length; i++) {
        const q = level.questions[i]
        const qNorm = normalize(q.prompt)
        // 匹配策略：两边取最短长度后比对；
        // 用户/导出会做小编辑（加"是"或换行），但前几个字基本不变。
        // 太短（< 6 字符）拒绝匹配——防误中。
        const minLen = Math.min(qNorm.length, targetNorm.length)
        if (minLen < 6) continue
        if (qNorm.slice(0, minLen) === targetNorm.slice(0, minLen)) {
          return {
            questionKey: `${region.id}:${level.id}:${i}`,
            promptPreview: targetNorm.slice(0, PROMPT_MATCH_PREFIX),
          }
        }
      }
    }
  }
  return null
}

/**
 * 把 markdown 文本转成可追加到 save.wrongAnswers 的记录列表。
 * - alreadyKeys: save 里已存在的 questionKey 集合（避免 attempts 归零）
 * - now: 用于设置 wrongAt（默认 now；测试可注入）
 */
export function importWrongBookFromMarkdown(
  md: string,
  course: CourseDef,
  alreadyKeys: ReadonlySet<string>,
  now: Date = new Date(),
): ImportResult {
  const blocks = parseMarkdown(md)
  const records: WrongAnswerRecord[] = []
  let added = 0
  let skipped = 0
  let unrecognized = 0
  const unrecognizedSamples: ImportResult['unrecognizedSamples'] = []

  for (const block of blocks) {
    const found = lookupQuestionKey(block, course)
    if (!found) {
      unrecognized++
      if (unrecognizedSamples.length < 5) {
        unrecognizedSamples.push({
          regionName: block.regionName,
          levelName: block.levelName,
          promptPreview: normalize(block.prompt).slice(0, 30) + (normalize(block.prompt).length > 30 ? '…' : ''),
        })
      }
      continue
    }
    if (alreadyKeys.has(found.questionKey)) {
      skipped++
      continue
    }
    records.push({
      questionKey: found.questionKey,
      wrongAt: now.toISOString(),
      attempts: 1,
    })
    added++
  }
  return { added, skipped, unrecognized, unrecognizedSamples, records }
}
