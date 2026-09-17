import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameStore } from '../src/core/store'
import { defaultSave } from '../src/core/save/schema'

function resetStore() {
  useGameStore.setState({ save: defaultSave(), hasSave: false })
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}

describe('addToReviewQueue', () => {
  beforeEach(() => resetStore())
  afterEach(() => vi.unstubAllGlobals())

  it('新增：返回 attempts=1 并写入 wrongAnswers', () => {
    const { addToReviewQueue, save } = useGameStore.getState()
    const result = addToReviewQueue('r1:1-1:0')
    expect(result).toBe(1)
    const updated = useGameStore.getState().save
    expect(updated.wrongAnswers).toHaveLength(1)
    expect(updated.wrongAnswers[0].questionKey).toBe('r1:1-1:0')
    expect(updated.wrongAnswers[0].attempts).toBe(1)
    expect(typeof updated.wrongAnswers[0].wrongAt).toBe('string')
    void save
  })

  it('已存在：attempts +1 并更新 wrongAt', () => {
    const base = defaultSave()
    base.wrongAnswers = [{ questionKey: 'r1:1-1:0', wrongAt: '2020-01-01T00:00:00Z', attempts: 3 }]
    useGameStore.setState({ save: base })

    const { addToReviewQueue } = useGameStore.getState()
    const result = addToReviewQueue('r1:1-1:0')
    expect(result).toBe(4)
    const updated = useGameStore.getState().save
    expect(updated.wrongAnswers).toHaveLength(1) // 没新增第二条
    expect(updated.wrongAnswers[0].attempts).toBe(4)
    expect(updated.wrongAnswers[0].wrongAt).not.toBe('2020-01-01T00:00:00Z')
  })

  it('不影响今日 wrong 统计', () => {
    const base = defaultSave()
    base.history = []
    useGameStore.setState({ save: base })

    const { addToReviewQueue } = useGameStore.getState()
    addToReviewQueue('r1:1-1:0')
    const updated = useGameStore.getState().save
    // history 应当仍为空——和 recordWrongAnswer 的关键区别
    expect(updated.history).toEqual([])
  })

  it('多次按 R 不会刷爆 attempts（累计而非覆盖）', () => {
    const base = defaultSave()
    useGameStore.setState({ save: base })

    const { addToReviewQueue } = useGameStore.getState()
    addToReviewQueue('r1:1-1:0')
    addToReviewQueue('r1:1-1:0')
    addToReviewQueue('r1:1-1:0')
    const updated = useGameStore.getState().save
    expect(updated.wrongAnswers).toHaveLength(1)
    expect(updated.wrongAnswers[0].attempts).toBe(3)
  })
})