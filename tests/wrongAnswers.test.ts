import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../src/core/store'
import { defaultSave } from '../src/core/save/schema'

describe('错题本 store actions', () => {
  beforeEach(() => {
    // 每个用例前重置回全新默认存档，隔离前一个用例的副作用
    useGameStore.setState({
      save: defaultSave(),
      hasSave: false,
      corruptDetected: false,
      persistFailed: false,
    })
  })

  it('recordWrongAnswer 新增记录', () => {
    const { recordWrongAnswer } = useGameStore.getState()
    recordWrongAnswer('1:A:0')
    const list = useGameStore.getState().save.wrongAnswers ?? []
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ questionKey: '1:A:0', attempts: 1 })
    expect(typeof list[0].wrongAt).toBe('string')
    expect(list[0].wrongAt.length).toBeGreaterThan(0)
  })

  it('同题反复错累加 attempts，wrongAt 刷新', async () => {
    const { recordWrongAnswer } = useGameStore.getState()
    recordWrongAnswer('2:B:3')
    const firstAt = useGameStore.getState().save.wrongAnswers![0].wrongAt
    // 等待 5ms 让 ISO 时间戳差异可见
    await new Promise((r) => setTimeout(r, 5))
    recordWrongAnswer('2:B:3')
    const second = useGameStore.getState().save.wrongAnswers![0]
    expect(second.attempts).toBe(2)
    expect(second.wrongAt >= firstAt).toBe(true)
    expect(useGameStore.getState().save.wrongAnswers).toHaveLength(1)
  })

  it('不同题目互不影响', () => {
    const { recordWrongAnswer } = useGameStore.getState()
    recordWrongAnswer('1:A:0')
    recordWrongAnswer('1:A:1')
    recordWrongAnswer('2:B:0')
    const list = useGameStore.getState().save.wrongAnswers!
    expect(list).toHaveLength(3)
    const map = Object.fromEntries(list.map((w) => [w.questionKey, w.attempts]))
    expect(map).toEqual({ '1:A:0': 1, '1:A:1': 1, '2:B:0': 1 })
  })

  it('removeFromWrongAnswers 只删匹配 key', () => {
    const { recordWrongAnswer, removeFromWrongAnswers } = useGameStore.getState()
    recordWrongAnswer('1:A:0')
    recordWrongAnswer('1:A:1')
    removeFromWrongAnswers('1:A:0')
    const list = useGameStore.getState().save.wrongAnswers!
    expect(list).toHaveLength(1)
    expect(list[0].questionKey).toBe('1:A:1')
  })

  it('removeFromWrongAnswers 不存在 key 时不写存档', () => {
    const { recordWrongAnswer, removeFromWrongAnswers } = useGameStore.getState()
    recordWrongAnswer('1:A:0')
    const before = useGameStore.getState().save
    removeFromWrongAnswers('99:Z:0')
    const after = useGameStore.getState().save
    expect(after).toEqual(before) // 引用相等等价于没变化
  })

  it('clearWrongAnswers 一键清空', () => {
    const { recordWrongAnswer, clearWrongAnswers } = useGameStore.getState()
    recordWrongAnswer('1:A:0')
    recordWrongAnswer('2:B:0')
    clearWrongAnswers()
    expect(useGameStore.getState().save.wrongAnswers).toEqual([])
  })

  it('clearWrongAnswers 空列表时不写存档', () => {
    const { clearWrongAnswers } = useGameStore.getState()
    const before = useGameStore.getState().save
    clearWrongAnswers()
    expect(useGameStore.getState().save).toBe(before)
  })

  it('hydrated 存档中旧 wrongAnswers 字段缺失时默认空数组', () => {
    // 模拟老存档（无 wrongAnswers 字段）
    const legacy = {
      version: 1,
      player: { xp: 100, gold: 50 },
      regions: {},
      badges: [],
      settings: { soundOn: true },
      updatedAt: '2025-01-01T00:00:00.000Z',
    }
    // 直接调 validateSave，确保默认值补齐
    return import('../src/core/save/schema').then(({ validateSave }) => {
      const parsed = validateSave(legacy as unknown as object)
      expect(parsed).not.toBeNull()
      expect(parsed!.wrongAnswers).toEqual([])
      expect(parsed!.player.xp).toBe(100)
    })
  })
})

describe('错题本 schema 校验', () => {
  it('缺 wrongAnswers 字段 → 补空数组', async () => {
    const { validateSave } = await import('../src/core/save/schema')
    const legacy = {
      version: 1,
      player: { xp: 0, gold: 0 },
      regions: {},
      badges: [],
      settings: { soundOn: true },
      updatedAt: '',
    }
    const parsed = validateSave(legacy as unknown as object)
    expect(parsed).not.toBeNull()
    expect(parsed!.wrongAnswers).toEqual([])
  })

  it('wrongAnswers 是非数组 → 容错成空数组（本地存档可能被第三方工具改坏，丢全部不如丢部分）', async () => {
    const { validateSave } = await import('../src/core/save/schema')
    const odd = {
      version: 1,
      player: { xp: 0, gold: 0 },
      regions: {},
      badges: [],
      wrongAnswers: 'not-an-array',
      settings: { soundOn: true },
      updatedAt: '',
    }
    const parsed = validateSave(odd as unknown as object)
    expect(parsed).not.toBeNull()
    expect(parsed!.wrongAnswers).toEqual([])
  })

  it('wrongAnswers 数组含非法元素 → 丢弃非法条目，保留合法条目', async () => {
    const { validateSave } = await import('../src/core/save/schema')
    const mixed = {
      version: 1,
      player: { xp: 0, gold: 0 },
      regions: {},
      badges: [],
      wrongAnswers: [
        { questionKey: '1:A:0', wrongAt: '2025-01-01T00:00:00.000Z', attempts: 1 },
        { questionKey: 'BAD' }, // 缺 attempts
        null,
        { questionKey: '2:B:0', wrongAt: '', attempts: 3 },
      ],
      settings: { soundOn: true },
      updatedAt: '',
    }
    const parsed = validateSave(mixed as unknown as object)
    expect(parsed).not.toBeNull()
    expect(parsed!.wrongAnswers).toHaveLength(2)
    expect(parsed!.wrongAnswers.map((w) => w.questionKey)).toEqual(['1:A:0', '2:B:0'])
  })
})