import { describe, expect, it } from 'vitest'
import { pythonBasics } from '../src/content/python-basics'
import { javascriptBasics } from '../src/content/javascript-basics'
import { COURSES } from '../src/content/courses'

/**
 * 课程内容质检：结构与字段合法性（不含知识点正确性——那靠人工审查）。
 * 以后新增区域/关卡，跑测试就能兜住结构性错误。
 *
 * 所有课程用同一套断言：题量、题型分布、字段完整性 —— 保证 COURSES 里
 * 新加课程不会偷偷降低质量门槛。
 */
describe('课程内容完整性（所有课程）', () => {
  const allCourses = COURSES.filter((c) => !c.regions.every((r) => r.comingSoon))

  it('每门已发布课程至少有 3 个 region', () => {
    for (const c of allCourses) {
      expect(c.regions.length, `${c.id} region 数`).toBeGreaterThanOrEqual(3)
    }
  })

  it('每门课程每个常规 region 关数 ≥ 3，最后一关是 Boss 且唯一；隐藏区域允许单关加试', () => {
    for (const c of allCourses) {
      for (const r of c.regions) {
        if (r.comingSoon) continue
        // 秘境岛等隐藏区域是单关毕业加试，不受"区域 ≥ 3 关"的常规体量约束
        if (!r.hidden) {
          expect(r.levels.length, `${c.id}/${r.id} 关数`).toBeGreaterThanOrEqual(3)
        }
        const last = r.levels[r.levels.length - 1]
        expect(last.boss, `${c.id}/${r.id} 最后一关应为 Boss`).toBe(true)
        expect(r.levels.filter((l) => l.boss).length, `${c.id}/${r.id} 只能有一个 Boss`).toBe(1)
        for (const l of r.levels) {
          expect(l.xp, `${l.id} xp`).toBeGreaterThan(0)
          expect(l.gold, `${l.id} gold`).toBeGreaterThan(0)
        }
      }
    }
  })

  /**
   * 题量策略：「高效入门」节奏。
   * - 普通关 3~9 题（少而精：每关只教 1 个核心概念，题目宁少勿滥）
   * - Boss 关 ≥ 4 题（综合实战题，不靠堆量）
   * - 每关至少 1 道填空（fill） + 1 道改错（bug）→ 强制加入「写代码」训练
   */
  it('题量：普通关 3~9 题，Boss ≥ 4 题；每关 ≥ 1 fill + 1 bug', () => {
    for (const c of allCourses) {
      for (const r of c.regions) {
        if (r.comingSoon) continue
        for (const l of r.levels) {
          const n = l.questions.length
          if (l.boss) {
            expect(n, `${l.id} Boss 题量`).toBeGreaterThanOrEqual(4)
          } else {
            expect(n, `${l.id} 题量下限`).toBeGreaterThanOrEqual(3)
            expect(n, `${l.id} 题量上限`).toBeLessThanOrEqual(9)
          }
          const fills = l.questions.filter((q) => q.kind === 'fill').length
          const bugs = l.questions.filter((q) => q.kind === 'bug').length
          expect(fills, `${l.id} 至少 1 道填空`).toBeGreaterThanOrEqual(1)
          expect(bugs, `${l.id} 至少 1 道改错`).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })

  it('每道题都有非空 hint 与 explain', () => {
    for (const c of allCourses) {
      for (const r of c.regions) {
        if (r.comingSoon) continue
        for (const l of r.levels) {
          for (const q of l.questions) {
            expect(q.hint?.trim(), `${l.id} 有题缺提示`).toBeTruthy()
            expect(q.explain.trim(), `${l.id} 有题缺解析`).toBeTruthy()
          }
        }
      }
    }
  })

  it('各题型字段合法', () => {
    for (const c of allCourses) {
      for (const r of c.regions) {
        if (r.comingSoon) continue
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
    }
  })

  it('学习卡非空', () => {
    for (const c of allCourses) {
      for (const r of c.regions) {
        if (r.comingSoon) continue
        for (const l of r.levels) {
          expect(l.learn.title.trim(), `${l.id} 学习卡标题`).toBeTruthy()
          expect(l.learn.body.length, `${l.id} 学习卡正文`).toBeGreaterThanOrEqual(2)
        }
      }
    }
  })
})

// Python 课程的专属结构断言（顺序、id 前缀）保留向后兼容
describe('Python 课程内容完整性', () => {
  const regions = pythonBasics.regions

  it('五个常规区域齐备 + 末尾一个隐藏区域，id 与顺序正确', () => {
    const visible = regions.filter((r) => !r.hidden)
    expect(visible.map((r) => r.id)).toEqual(['1', '2', '3', '4', '5'])
    // 隐藏区域（秘境岛）排在末尾，单关加试不满足"区域 ≥ 4 关"的常规体量
    expect(regions[regions.length - 1]?.hidden).toBe(true)
    expect(regions[regions.length - 1]?.id).toBe('6')
    expect(regions.filter((r) => !r.hidden).every((r) => r.levels.length >= 4)).toBe(true)
    expect(regions[regions.length - 1]!.levels.length).toBeGreaterThanOrEqual(1)
  })

  it('Python 关卡 id 前缀与区域一致', () => {
    for (const r of regions) {
      for (const l of r.levels) {
        expect(l.id.startsWith(`${r.id}-`), `${l.id} 前缀应为 ${r.id}-`).toBe(true)
      }
    }
  })
})

// JS 课程的专属结构断言
describe('JavaScript 课程内容完整性', () => {
  const course = javascriptBasics
  const regions = course.regions

  it('至少 3 个 region，且不全为 comingSoon', () => {
    const real = regions.filter((r) => !r.comingSoon)
    expect(real.length).toBeGreaterThanOrEqual(3)
  })

  it('JS 关卡 id 前缀与 region id 一致（j1-1 / j2-3 / j4-B ...）', () => {
    for (const r of regions) {
      if (r.comingSoon) continue
      for (const l of r.levels) {
        expect(l.id.startsWith(`${r.id}-`), `${l.id} 前缀应为 ${r.id}-`).toBe(true)
      }
    }
  })

  it('JS 课程区域 id 唯一', () => {
    const ids = regions.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('JS 关卡总题数 ≥ 50（保证内容厚度）', () => {
    let total = 0
    for (const r of regions) {
      if (r.comingSoon) continue
      for (const l of r.levels) total += l.questions.length
    }
    expect(total).toBeGreaterThanOrEqual(50)
  })
})
