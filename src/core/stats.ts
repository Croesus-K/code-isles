import { todayLocal, type DailyStat } from './save/schema'

/** 一天格子（带强度计算，供热力图/柱状图渲染） */
export interface DayCell {
  date: string
  cleared: number
  correct: number
  wrong: number
  /** 相对强度 0~1（基于窗口内 max）或 null（无活动） */
  intensity: number | null
}

/** 周报：最近 7 天聚合指标 */
export interface WeeklyReport {
  totalCleared: number
  totalCorrect: number
  totalWrong: number
  /** 0~1，全为 0 时返回 0 */
  accuracy: number
  activeDays: number
  /** 含今日连续活跃天数（今日无活动 = 0） */
  currentStreak: number
  /** 7 天窗口内最长连续活跃 */
  bestStreak: number
}

/** 把日期字符串往回数 i 天（i=0 返回当天） */
function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  dt.setDate(dt.getDate() + days)
  return todayLocal(dt)
}

function isActive(cell: { cleared: number; correct: number; wrong: number }): boolean {
  return cell.cleared > 0 || cell.correct > 0 || cell.wrong > 0
}

/**
 * 最近 n 天活动网格（按日期升序）。缺失的日期补 0；intensity 按窗口内 max 归一化。
 * 纯函数；today 参数用于测试注入（默认本地当日）。
 */
export function lastNDays(
  history: readonly DailyStat[],
  n: number,
  today: string = todayLocal(),
): DayCell[] {
  if (n <= 0) return []
  const map = new Map(history.map((s) => [s.date, s]))
  const out: DayCell[] = []
  // 从 n-1 天前到今天
  for (let i = n - 1; i >= 0; i--) {
    const date = shiftDate(today, -i)
    const stat = map.get(date)
    out.push(
      stat
        ? { date: stat.date, cleared: stat.cleared, correct: stat.correct, wrong: stat.wrong, intensity: null }
        : { date, cleared: 0, correct: 0, wrong: 0, intensity: null },
    )
  }
  // 计算窗口内最大活动量
  const max = out.reduce((m, c) => Math.max(m, c.correct + c.wrong), 0)
  for (const cell of out) {
    const total = cell.correct + cell.wrong
    cell.intensity = total === 0 || max === 0 ? null : total / max
  }
  return out
}

/** 最近 7 天周报。today 用于测试注入。 */
export function weeklyReport(
  history: readonly DailyStat[],
  today: string = todayLocal(),
): WeeklyReport {
  const cells = lastNDays(history, 7, today)
  let totalCorrect = 0
  let totalWrong = 0
  let totalCleared = 0
  for (const c of cells) {
    totalCorrect += c.correct
    totalWrong += c.wrong
    totalCleared += c.cleared
  }
  const total = totalCorrect + totalWrong
  const accuracy = total === 0 ? 0 : totalCorrect / total
  const activeDays = cells.filter(isActive).length

  // currentStreak：从今天往回数连续活跃天数（含今日无活动 = 0）
  let currentStreak = 0
  for (let i = cells.length - 1; i >= 0; i--) {
    if (isActive(cells[i])) currentStreak++
    else break
  }
  // bestStreak：7 天窗口内最长连续
  let bestStreak = 0
  let run = 0
  for (const c of cells) {
    if (isActive(c)) {
      run++
      if (run > bestStreak) bestStreak = run
    } else {
      run = 0
    }
  }
  return { totalCleared, totalCorrect, totalWrong, accuracy, activeDays, currentStreak, bestStreak }
}

/**
 * 把今日对应字段 +n。若 history 里已有今日条目则就地累加；否则追加。
 * 纯函数：返回新数组或与原数组同引用（n 非法 / 字段非法时）。
 */
export type DailyField = 'cleared' | 'correct' | 'wrong'

export function bumpDailyStat(
  history: readonly DailyStat[],
  field: DailyField,
  n = 1,
  today: string = todayLocal(),
): DailyStat[] {
  if (!Number.isInteger(n) || n <= 0) return history as DailyStat[]
  if (field !== 'cleared' && field !== 'correct' && field !== 'wrong') return history as DailyStat[]
  const idx = history.findIndex((s) => s.date === today)
  if (idx < 0) {
    return [...history, { date: today, cleared: 0, correct: 0, wrong: 0, [field]: n }]
  }
  const cur = history[idx]
  return [
    ...history.slice(0, idx),
    { ...cur, [field]: cur[field] + n },
    ...history.slice(idx + 1),
  ]
}
