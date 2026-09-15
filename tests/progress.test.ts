import { describe, expect, it } from 'vitest'
import type { CourseDef } from '../src/content/course'
import {
  clearedCount,
  comboBonus,
  computeReward,
  computeStars,
  isLevelUnlocked,
  isRegionUnlocked,
  levelCleared,
  type RewardInfo,
} from '../src/core/progress'
import { defaultSave, validateSave } from '../src/core/save/schema'
import { useGameStore } from '../src/core/store'

const learn = { title: 't', body: ['b'] }
const testCourse: CourseDef = {
  id: 't',
  title: '测试群岛',
  subtitle: '',
  regions: [
    {
      id: '1',
      name: 'r1',
      tagline: '',
      levels: [
        { id: '1-1', name: 'a', xp: 30, gold: 10, learn, questions: [] },
        { id: '1-B', name: 'boss', xp: 80, gold: 30, boss: true, learn, questions: [] },
      ],
    },
    {
      id: '2',
      name: 'r2',
      tagline: '',
      levels: [{ id: '2-1', name: 'c', xp: 10, gold: 5, learn, questions: [] }],
    },
  ],
}

function saveWith(regions: unknown) {
  return validateSave({ ...defaultSave(), regions })!
}

describe('解锁推导', () => {
  it('区域 1 永远解锁，后续区域在 Boss 通关前锁定', () => {
    expect(isRegionUnlocked(defaultSave(), testCourse, 0)).toBe(true)
    expect(isRegionUnlocked(defaultSave(), testCourse, 1)).toBe(false)
  })

  it('区域 1 Boss 通关后解锁区域 2', () => {
    const save = saveWith({ '1': { unlocked: true, levels: { '1-B': { cleared: true, stars: 0 } } } })
    expect(isRegionUnlocked(save, testCourse, 1)).toBe(true)
  })

  it('区域内关卡按顺序解锁', () => {
    expect(isLevelUnlocked(defaultSave(), testCourse.regions[0], 0)).toBe(true)
    expect(isLevelUnlocked(defaultSave(), testCourse.regions[0], 1)).toBe(false)
    const save = saveWith({ '1': { unlocked: true, levels: { '1-1': { cleared: true, stars: 0 } } } })
    expect(isLevelUnlocked(save, testCourse.regions[0], 1)).toBe(true)
  })

  it('通关状态与计数', () => {
    expect(levelCleared(defaultSave(), '1', '1-1')).toBe(false)
    const save = saveWith({ '1': { unlocked: true, levels: { '1-1': { cleared: true, stars: 0 } } } })
    expect(levelCleared(save, '1', '1-1')).toBe(true)
    expect(clearedCount(save, testCourse.regions[0])).toBe(1)
    expect(clearedCount(save, testCourse.regions[1])).toBe(0)
  })
})

describe('奖励计算', () => {
  it('首次通关全额', () => {
    expect(computeReward(false, { xp: 80, gold: 30 })).toEqual({ xp: 80, gold: 30, firstClear: true })
  })

  it('重复通关按 25% 向下取整', () => {
    const r: RewardInfo = computeReward(true, { xp: 80, gold: 30 })
    expect(r).toEqual({ xp: 20, gold: 7, firstClear: false })
    expect(computeReward(true, { xp: 35, gold: 12 })).toEqual({ xp: 8, gold: 3, firstClear: false })
  })
})

describe('completeLevel 结算', () => {
  it('首次通关：全额奖励（含连击加成）并写入通关记录与星级', () => {
    const s = useGameStore.getState()
    s.resetSave()
    const reward = s.completeLevel('1', '1-1', { xp: 30, gold: 10 }, { stars: 2, bonusGold: 4 })
    expect(reward).toEqual({ xp: 30, gold: 14, firstClear: true, stars: 2 })
    const after = useGameStore.getState().save
    expect(after.player).toEqual({ xp: 30, gold: 14 })
    expect(after.regions['1']!.levels['1-1']!.cleared).toBe(true)
    expect(after.regions['1']!.levels['1-1']!.stars).toBe(2)
  })

  it('重复通关：25% 奖励；星级只升不降', () => {
    const s = useGameStore.getState()
    const reward = s.completeLevel('1', '1-1', { xp: 30, gold: 10 }, { stars: 3, bonusGold: 0 })
    expect(reward).toEqual({ xp: 7, gold: 2, firstClear: false, stars: 3 })
    expect(useGameStore.getState().save.player).toEqual({ xp: 37, gold: 16 })
    expect(useGameStore.getState().save.regions['1']!.levels['1-1']!.stars).toBe(3)
    useGameStore.getState().resetSave()
  })
})

describe('星级与连击规则', () => {
  it('computeStars：全对零提示 3 星，错2提示1内 2 星，其余 1 星', () => {
    expect(computeStars(0, 0)).toBe(3)
    expect(computeStars(2, 1)).toBe(2)
    expect(computeStars(1, 2)).toBe(1)
    expect(computeStars(3, 0)).toBe(1)
  })

  it('comboBonus：第 2 连击起每题 +2，封顶 +10', () => {
    expect(comboBonus(0)).toBe(0)
    expect(comboBonus(1)).toBe(0)
    expect(comboBonus(2)).toBe(2)
    expect(comboBonus(5)).toBe(8)
    expect(comboBonus(6)).toBe(10)
    expect(comboBonus(9)).toBe(10)
  })
})

describe('存档 regions 深度校验', () => {
  it('合法 region 结构通过', () => {
    const save = saveWith({ '1': { unlocked: true, levels: { '1-1': { cleared: true, stars: 2 } } } })
    expect(save.regions['1']!.levels['1-1']!.stars).toBe(2)
  })

  it('星数越界 / 结构残缺直接拒绝', () => {
    expect(validateSave({ ...defaultSave(), regions: { '1': { unlocked: true, levels: { '1-1': { cleared: true, stars: 5 } } } } })).toBeNull()
    expect(validateSave({ ...defaultSave(), regions: { '1': { unlocked: 'yes', levels: {} } } })).toBeNull()
    expect(validateSave({ ...defaultSave(), regions: { '1': { unlocked: true, levels: { '1-1': { cleared: true } } } } })).toBeNull()
  })
})
