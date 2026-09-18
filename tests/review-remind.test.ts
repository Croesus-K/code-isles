import { describe, expect, it } from 'vitest'
import {
  dismissWrongReviewRemind,
  shouldShowWrongReviewRemind,
  WRONG_REVIEW_REMIND_THRESHOLD,
} from '../src/core/review-remind'
import { defaultSave, type SaveData, type WrongAnswerRecord } from '../src/core/save/schema'

function mkWrong(n: number): WrongAnswerRecord[] {
  return Array.from({ length: n }, (_, i) => ({
    questionKey: `1:1-1:${i}`,
    wrongAt: '2026-09-01T00:00:00.000Z',
    attempts: 1,
  }))
}

function mkStorage(values: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> {
  const map = new Map(Object.entries(values))
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => void map.set(k, v),
  }
}

describe('shouldShowWrongReviewRemind', () => {
  it('错题数 < 阈值 → 不显示', () => {
    const save: SaveData = { ...defaultSave(), wrongAnswers: mkWrong(WRONG_REVIEW_REMIND_THRESHOLD - 1) }
    expect(shouldShowWrongReviewRemind(save, mkStorage())).toBe(false)
  })

  it('错题数 = 阈值 + 没有任何 dismiss → 显示', () => {
    const save: SaveData = { ...defaultSave(), wrongAnswers: mkWrong(WRONG_REVIEW_REMIND_THRESHOLD) }
    expect(shouldShowWrongReviewRemind(save, mkStorage())).toBe(true)
  })

  it('错题数 = 阈值 + 7 天前 dismiss → 重新显示', () => {
    const save: SaveData = { ...defaultSave(), wrongAnswers: mkWrong(WRONG_REVIEW_REMIND_THRESHOLD) }
    const dismissedAt = new Date('2026-09-01T00:00:00.000Z')
    const now = new Date(dismissedAt.getTime() + 8 * 24 * 60 * 60 * 1000)
    const storage = mkStorage({ 'code-isles-wrong-remind-dismissed-at': dismissedAt.toISOString() })
    expect(shouldShowWrongReviewRemind(save, storage, now)).toBe(true)
  })

  it('错题数 = 阈值 + 3 天前 dismiss → 仍隐藏', () => {
    const save: SaveData = { ...defaultSave(), wrongAnswers: mkWrong(WRONG_REVIEW_REMIND_THRESHOLD) }
    const dismissedAt = new Date('2026-09-01T00:00:00.000Z')
    const now = new Date(dismissedAt.getTime() + 3 * 24 * 60 * 60 * 1000)
    const storage = mkStorage({ 'code-isles-wrong-remind-dismissed-at': dismissedAt.toISOString() })
    expect(shouldShowWrongReviewRemind(save, storage, now)).toBe(false)
  })

  it('localStorage 缺失 → 显示', () => {
    const save: SaveData = { ...defaultSave(), wrongAnswers: mkWrong(WRONG_REVIEW_REMIND_THRESHOLD) }
    expect(shouldShowWrongReviewRemind(save, null)).toBe(true)
  })

  it('localStorage 里有非时间字符串 → 当作未 dismiss，显示', () => {
    const save: SaveData = { ...defaultSave(), wrongAnswers: mkWrong(WRONG_REVIEW_REMIND_THRESHOLD) }
    const storage = mkStorage({ 'code-isles-wrong-remind-dismissed-at': 'not-a-date' })
    expect(shouldShowWrongReviewRemind(save, storage)).toBe(true)
  })
})

describe('dismissWrongReviewRemind', () => {
  it('写入当前 ISO 时间', () => {
    const storage = mkStorage()
    const now = new Date('2026-09-18T10:00:00.000Z')
    dismissWrongReviewRemind(storage, now)
    expect(storage.getItem('code-isles-wrong-remind-dismissed-at')).toBe('2026-09-18T10:00:00.000Z')
  })

  it('storage 不可写 → 静默失败（不抛错）', () => {
    expect(() => dismissWrongReviewRemind(null)).not.toThrow()
  })

  it('写入后再次判定 → 7 天内不显示', () => {
    const save: SaveData = { ...defaultSave(), wrongAnswers: mkWrong(WRONG_REVIEW_REMIND_THRESHOLD) }
    const storage = mkStorage()
    const t0 = new Date('2026-09-18T00:00:00.000Z')
    dismissWrongReviewRemind(storage, t0)
    expect(shouldShowWrongReviewRemind(save, storage, t0)).toBe(false)
    const t1 = new Date(t0.getTime() + 6 * 24 * 60 * 60 * 1000)
    expect(shouldShowWrongReviewRemind(save, storage, t1)).toBe(false)
  })
})