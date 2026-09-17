import { describe, expect, it } from 'vitest'
import { pythonBasics } from '../src/content/python-basics'

/**
 * 课程内容质检：结构与字段合法性（不含知识点正确性——那靠人工审查）。
 * 以后新增区域/关卡，跑测试就能兜住结构性错误。
 */
describe('课程内容完整性', () => {
  const regions = pythonBasics.regions

  it('五个区域齐备，区域 id 与顺序正确', () => {
    expect(regions.map((r) => r.id)).toEqual(['1', '2', '3', '4', '5'])
    expect(regions.every((r) => r.levels.length >= 4)).toBe(true)
  })

  it('每区域唯一 Boss 且在最后，关卡 id 前缀与区域一致，数值为正', () => {
    for (const r of regions) {
      const last = r.levels[r.levels.length - 1]
      expect(last.boss, `${r.id} 最后一关应为 Boss`).toBe(true)
      expect(r.levels.filter((l) => l.boss).length, `${r.id} 只能有一个 Boss`).toBe(1)
      for (const l of r.levels) {
        expect(l.id.startsWith(`${r.id}-`), `${l.id} 前缀应为 ${r.id}-`).toBe(true)
        expect(l.xp, `${l.id} xp`).toBeGreaterThan(0)
        expect(l.gold, `${l.id} gold`).toBeGreaterThan(0)
      }
    }
  })

  /**
   * 题量策略：「高效入门」节奏。
   * - 普通关 3~9 题（少而精：每关只教 1 个核心概念，题目宁少勿滥）
   * - Boss 关 ≥ 4 题（综合实战题，不靠堆量）
   * 设计权衡：原本是"普通关 4-9 / Boss ≥ 8"，导致新手在前 3 关就答 20+ 题选择题，
   * 容易疲劳。新版每关控制在 3-4 道（含实战 + Bug 题型），让新手更快进入下一关。
   */
  it('题量：普通关 3~9 题，Boss ≥ 4 题', () => {
    for (const r of regions) {
      for (const l of r.levels) {
        const n = l.questions.length
        if (l.boss) {
          expect(n, `${l.id} Boss 题量`).toBeGreaterThanOrEqual(4)
        } else {
          expect(n, `${l.id} 题量下限`).toBeGreaterThanOrEqual(3)
          expect(n, `${l.id} 题量上限`).toBeLessThanOrEqual(9)
        }
      }
    }
  })

  it('每道题都有非空 hint 与 explain', () => {
    for (const r of regions) {
      for (const l of r.levels) {
        for (const q of l.questions) {
          expect(q.hint?.trim(), `${l.id} 有题缺提示`).toBeTruthy()
          expect(q.explain.trim(), `${l.id} 有题缺解析`).toBeTruthy()
        }
      }
    }
  })

  it('各题型字段合法', () => {
    for (const r of regions) {
      for (const l of r.levels) {
        for (const q of l.questions) {
          switch (q.kind) {
            case 'choice':
            case 'output':
              expect(q.options.length, `${l.id} 选项数下限`).toBeGreaterThanOrEqual(2)
              expect(q.options.length, `${l.id} 选项数上限`).toBeLessThanOrEqual(4)
              expect(q.answerIndex, `${l.id} 答案索引越界`).toBeLessThan(q.options.length)
              break
            case 'fill':
              expect(q.code.includes('___'), `${l.id} 填空代码应含 ___`).toBe(true)
              expect(q.answers.length, `${l.id} 填空答案`).toBeGreaterThan(0)
              break
            case 'order':
              expect(q.lines.length, `${l.id} 排序行数`).toBeGreaterThanOrEqual(3)
              expect(new Set(q.lines).size, `${l.id} 排序行应唯一`).toBe(q.lines.length)
              break
            case 'bug':
              expect(q.answerLine, `${l.id} 找错行越界`).toBeLessThan(q.code.length)
              break
          }
        }
      }
    }
  })

  it('学习卡非空', () => {
    for (const r of regions) {
      for (const l of r.levels) {
        expect(l.learn.title.trim(), `${l.id} 学习卡标题`).toBeTruthy()
        expect(l.learn.body.length, `${l.id} 学习卡正文`).toBeGreaterThanOrEqual(2)
      }
    }
  })
})
