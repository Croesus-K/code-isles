/**
 * 错题本堆积提醒的判定与持久化。
 *
 * 动机：玩家在闯关时累积错题到 wrongAnswers，但只有主动点开档案页"复习"才
 * 会触发复盘。错题 ≥ 5 道时世界地图顶部展示 banner，引导进入复习。
 * 防止骚扰：用户主动 dismiss 后 7 天内不再显示（localStorage 计时）。
 */

import type { SaveData } from './save/schema'

/** 触发 banner 提示的错题数量门槛 */
export const WRONG_REVIEW_REMIND_THRESHOLD = 5

/** dismiss 后多少天内不再显示（避免 banner 反复骚扰） */
const DISMISS_COOLDOWN_DAYS = 7

const STORAGE_KEY = 'code-isles-wrong-remind-dismissed-at'

/**
 * 判定当前是否应该显示"错题本堆积"提醒 banner。
 *
 * 规则（满足全部才显示）：
 *  1. 错题本长度 ≥ 5
 *  2. 用户没有在最近 7 天内 dismiss 掉这个 banner
 */
export function shouldShowWrongReviewRemind(
  save: SaveData,
  storage: Pick<Storage, 'getItem'> | null,
  now: Date = new Date(),
): boolean {
  if (save.wrongAnswers.length < WRONG_REVIEW_REMIND_THRESHOLD) return false
  if (!storage) return true
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return true
  const dismissedAt = new Date(raw)
  if (Number.isNaN(dismissedAt.getTime())) return true
  const elapsed = now.getTime() - dismissedAt.getTime()
  return elapsed > DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
}

/** 把当前时间写入 localStorage，表示"本次 dismiss" */
export function dismissWrongReviewRemind(storage: Pick<Storage, 'setItem'> | null, now: Date = new Date()): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, now.toISOString())
  } catch {
    // localStorage 不可写（隐私模式 / quota 满）——静默降级，下次仍会显示 banner
  }
}