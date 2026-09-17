import { describe, expect, it } from 'vitest'
import { pythonBasics } from '../src/content/python-basics'
import { buildWrongBookMarkdown } from '../src/core/wrongbook-export'
import type { WrongAnswerRecord } from '../src/core/save/schema'

// 固定时间便于断言
const FIXED_NOW = new Date('2025-03-15T14:30:00.000Z')

function key(regionId: string, levelId: string, qIdx: number): WrongAnswerRecord {
  return {
    questionKey: `${regionId}:${levelId}:${qIdx}`,
    wrongAt: '2025-03-14T09:15:00.000Z',
    attempts: 1,
  }
}

describe('错题本 Markdown 导出', () => {
  it('空错题本 → 友好提示', () => {
    const md = buildWrongBookMarkdown([], pythonBasics, FIXED_NOW)
    expect(md).toContain('# 代码群岛 · 错题清单')
    expect(md).toContain('共 0 道题')
    expect(md).toContain('还没有需要巩固的题目')
  })

  it('题目 prompt / 区域名 / 关卡名 / attempts 都进入 markdown', () => {
    const md = buildWrongBookMarkdown([key('1', '1-1', 0)], pythonBasics, FIXED_NOW)
    expect(md).toContain('## 变量平原') // region name
    expect(md).toContain('### ') // level heading
    expect(md).toContain('答错 1 次')
    // prompt 内容（pythonBasics 第一题）
    expect(md.length).toBeGreaterThan(100)
  })

  it('attempts 自增如实展示', () => {
    const rec = { questionKey: '1:1-1:0', wrongAt: '2025-01-01T00:00:00.000Z', attempts: 7 }
    const md = buildWrongBookMarkdown([rec], pythonBasics, FIXED_NOW)
    expect(md).toContain('答错 7 次')
  })

  it('数据漂移（key 拆不出 region / level / idx）→ 静默跳过，整篇 markdown 仍生成', () => {
    const records: WrongAnswerRecord[] = [
      key('1', '1-1', 0),
      { questionKey: 'broken-no-colons', wrongAt: '', attempts: 1 },
      { questionKey: '999:1-1:0', wrongAt: '', attempts: 1 }, // 不存在的 region
      { questionKey: '1:999-9:0', wrongAt: '', attempts: 1 }, // 不存在的 level
      { questionKey: '1:1-1:999', wrongAt: '', attempts: 1 }, // 不存在的 questionIndex
    ]
    const md = buildWrongBookMarkdown(records, pythonBasics, FIXED_NOW)
    expect(md).toContain('共 1 道题')
    // 不应该 throw
    expect(md).toContain('# 代码群岛')
  })

  it('按 region 顺序 / level 顺序 / questionIndex 顺序排序', () => {
    const records: WrongAnswerRecord[] = [
      key('5', '5-2', 1), // 字典城第 2 关第 1 题 → 应最后
      key('1', '1-2', 0), // 变量平原第 2 关第 0 题
      key('1', '1-1', 1), // 变量平原第 1 关第 1 题
    ]
    const md = buildWrongBookMarkdown(records, pythonBasics, FIXED_NOW)
    // 字典城区域 heading 应在变量平原之后
    const regionPlain = md.indexOf('## 变量平原')
    const regionDict = md.indexOf('## 字典城')
    expect(regionPlain).toBeGreaterThan(0)
    expect(regionDict).toBeGreaterThan(0)
    expect(regionPlain).toBeLessThan(regionDict)
    // 变量平原内的 level 顺序：1-1 < 1-2（按数字），所以 "贴标签的宝箱"(1-1) 应
    // 排在 "数字三兄弟"(1-2) 之前。pick the actual level names from pythonBasics：
    const region1 = pythonBasics.regions[0]
    const l1Name = region1.levels.find((l) => l.id === '1-1')!.name
    const l2Name = region1.levels.find((l) => l.id === '1-2')!.name
    expect(md.indexOf(l1Name)).toBeLessThan(md.indexOf(l2Name))
  })

  it('导出时间格式化为本地 YYYY-MM-DD HH:mm', () => {
    // FIXED_NOW = 2025-03-15T14:30:00Z；不同时区输出的本地 HH:MM 不同，
    // 我们断言日期部分 + HH:MM 模式都在
    const md = buildWrongBookMarkdown([], pythonBasics, FIXED_NOW)
    expect(md).toContain('2025-03-15')
    expect(md).toMatch(/\d{2}:\d{2}/)
  })

  it('不暴露正确答案', () => {
    // 第一道题 answerIndex 是 0；导出文本不应该出现 "1. " 这样的答案标记暗指
    // 我们用模糊断言：导入的 markdown 里不含"答案"二字（防止某些 prompt 自带）
    const md = buildWrongBookMarkdown([key('1', '1-1', 0)], pythonBasics, FIXED_NOW)
    expect(md).not.toContain('正确答案')
    expect(md).not.toContain('answerIndex')
  })

  it('空 wrongAt 时间显示"时间未记录"', () => {
    const rec = { questionKey: '1:1-1:0', wrongAt: '', attempts: 1 }
    const md = buildWrongBookMarkdown([rec], pythonBasics, FIXED_NOW)
    expect(md).toContain('时间未记录')
  })
})
