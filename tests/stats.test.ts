import { describe, expect, it } from 'vitest'
import { bumpDailyStat, lastNDays, weeklyReport } from '../src/core/stats'

const HIST_FIX = [
  { date: '2025-01-01', cleared: 2, correct: 5, wrong: 1 },
  { date: '2025-01-02', cleared: 0, correct: 3, wrong: 0 },
  // gap: 01-03 missing
  { date: '2025-01-04', cleared: 1, correct: 4, wrong: 2 },
  { date: '2025-01-05', cleared: 0, correct: 0, wrong: 0 }, // 无活动
  { date: '2025-01-06', cleared: 1, correct: 6, wrong: 1 },
  { date: '2025-01-07', cleared: 0, correct: 2, wrong: 0 },
] // today = 2025-01-07

describe('lastNDays', () => {
  it('返回 n 个连续日期格子，缺失补 0', () => {
    const cells = lastNDays(HIST_FIX, 7, '2025-01-07')
    expect(cells).toHaveLength(7)
    expect(cells[0].date).toBe('2025-01-01')
    expect(cells[6].date).toBe('2025-01-07')
    expect(cells[2].correct).toBe(0) // 01-03 missing
    expect(cells[2].intensity).toBeNull()
    expect(cells[3].correct).toBe(4) // 01-04
  })

  it('intensity 按窗口内 max 归一化', () => {
    const cells = lastNDays(HIST_FIX, 7, '2025-01-07')
    // max total = 7 (01-06: 6+1)
    expect(cells[5].intensity).toBe(1)
    expect(cells[3].intensity).toBeCloseTo(6 / 7)
  })

  it('n<=0 返回空', () => {
    expect(lastNDays(HIST_FIX, 0)).toEqual([])
    expect(lastNDays(HIST_FIX, -1)).toEqual([])
  })

  it('n=1 只含今日', () => {
    const cells = lastNDays(HIST_FIX, 1, '2025-01-07')
    expect(cells).toHaveLength(1)
    expect(cells[0].date).toBe('2025-01-07')
    expect(cells[0].correct).toBe(2)
  })
})

describe('weeklyReport', () => {
  it('汇总 7 天窗口内的正确/错误/通关', () => {
    const r = weeklyReport(HIST_FIX, '2025-01-07')
    // correct: 5+3+0+4+0+6+2 = 20
    // wrong:   1+0+0+2+0+1+0 = 4
    // cleared: 2+0+0+1+0+1+0 = 4
    expect(r.totalCorrect).toBe(20)
    expect(r.totalWrong).toBe(4)
    expect(r.totalCleared).toBe(4)
    expect(r.accuracy).toBeCloseTo(20 / 24)
  })

  it('全部 0 时 accuracy = 0 而非 NaN', () => {
    const r = weeklyReport([], '2025-01-07')
    expect(r.accuracy).toBe(0)
    expect(r.totalCleared).toBe(0)
  })

  it('activeDays 只算有活动（correct/wrong/cleared 任一 > 0）', () => {
    const r = weeklyReport(HIST_FIX, '2025-01-07')
    // 01-01, 01-02, 01-04, 01-06, 01-07 = 5 天；01-03 + 01-05 无活动
    expect(r.activeDays).toBe(5)
  })

  it('currentStreak 含今日往回数', () => {
    const r = weeklyReport(HIST_FIX, '2025-01-07')
    // 01-07 有 (correct=2) → 1
    // 01-06 有 → 2
    // 01-05 无 → break
    expect(r.currentStreak).toBe(2)
  })

  it('currentStreak 今日无活动 = 0', () => {
    const hist = [{ date: '2025-01-06', cleared: 1, correct: 0, wrong: 0 }]
    const r = weeklyReport(hist, '2025-01-07')
    expect(r.currentStreak).toBe(0)
  })

  it('bestStreak 取窗口内最长连续', () => {
    // 7 天全部活跃
    const full = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-01-0${i + 1}`,
      cleared: 0,
      correct: 1,
      wrong: 0,
    }))
    expect(weeklyReport(full, '2025-01-07').bestStreak).toBe(7)
  })
})

describe('bumpDailyStat', () => {
  it('无今日条目则追加', () => {
    const out = bumpDailyStat(HIST_FIX, 'cleared', 1, '2025-02-15')
    expect(out).toHaveLength(HIST_FIX.length + 1)
    const last = out[out.length - 1]
    expect(last.date).toBe('2025-02-15')
    expect(last.cleared).toBe(1)
    expect(last.correct).toBe(0)
  })

  it('已有今日条目则就地累加', () => {
    const out = bumpDailyStat(HIST_FIX, 'correct', 3, '2025-01-06')
    const cell = out.find((s) => s.date === '2025-01-06')!
    expect(cell.correct).toBe(9) // 6 + 3
    expect(cell.wrong).toBe(1)
    expect(cell.cleared).toBe(1)
    expect(out).toHaveLength(HIST_FIX.length)
  })

  it('非法 n / 字段返回原引用', () => {
    const before = [...HIST_FIX]
    expect(bumpDailyStat(before, 'correct', 0, '2025-01-06')).toBe(before)
    expect(bumpDailyStat(before, 'correct', -1, '2025-01-06')).toBe(before)
    // 非法字段返回原引用（避免无意义拷贝）
    expect(
      bumpDailyStat(before, 'bogus' as unknown as 'correct', 1, '2025-01-06'),
    ).toBe(before)
  })

  it('原数组不被修改（纯函数）', () => {
    const before = [...HIST_FIX]
    bumpDailyStat(before, 'cleared', 5, '2025-01-06')
    expect(before).toEqual(HIST_FIX)
  })
})
