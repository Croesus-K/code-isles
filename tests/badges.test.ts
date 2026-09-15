import { describe, expect, it } from 'vitest'
import { earnedBadgeIds } from '../src/core/badges'
import type { CourseDef } from '../src/content/course'
import { defaultSave, validateSave } from '../src/core/save/schema'

const learn = { title: 't', body: ['b'] }

/** 5 区域、4 关（3 普通 + 1 boss）的标准课程——与 src/content/python-basics 同形。 */
const stdCourse: CourseDef = {
  id: 'std',
  title: '标准',
  subtitle: '',
  regions: [
    {
      id: '1',
      name: 'r1',
      tagline: '',
      levels: [
        { id: '1-1', name: 'a', xp: 30, gold: 10, learn, questions: [] },
        { id: '1-2', name: 'b', xp: 30, gold: 10, learn, questions: [] },
        { id: '1-3', name: 'c', xp: 30, gold: 10, learn, questions: [] },
        { id: '1-B', name: 'boss', xp: 80, gold: 30, boss: true, learn, questions: [] },
      ],
    },
    {
      id: '2',
      name: 'r2',
      tagline: '',
      levels: [
        { id: '2-1', name: 'a', xp: 30, gold: 10, learn, questions: [] },
        { id: '2-2', name: 'b', xp: 30, gold: 10, learn, questions: [] },
        { id: '2-3', name: 'c', xp: 30, gold: 10, learn, questions: [] },
        { id: '2-B', name: 'boss', xp: 80, gold: 30, boss: true, learn, questions: [] },
      ],
    },
    {
      id: '3',
      name: 'r3',
      tagline: '',
      levels: [
        { id: '3-1', name: 'a', xp: 30, gold: 10, learn, questions: [] },
        { id: '3-2', name: 'b', xp: 30, gold: 10, learn, questions: [] },
        { id: '3-3', name: 'c', xp: 30, gold: 10, learn, questions: [] },
        { id: '3-B', name: 'boss', xp: 80, gold: 30, boss: true, learn, questions: [] },
      ],
    },
    {
      id: '4',
      name: 'r4',
      tagline: '',
      levels: [
        { id: '4-1', name: 'a', xp: 30, gold: 10, learn, questions: [] },
        { id: '4-2', name: 'b', xp: 30, gold: 10, learn, questions: [] },
        { id: '4-3', name: 'c', xp: 30, gold: 10, learn, questions: [] },
        { id: '4-B', name: 'boss', xp: 80, gold: 30, boss: true, learn, questions: [] },
      ],
    },
    {
      id: '5',
      name: 'r5',
      tagline: '',
      levels: [
        { id: '5-1', name: 'a', xp: 30, gold: 10, learn, questions: [] },
        { id: '5-2', name: 'b', xp: 30, gold: 10, learn, questions: [] },
        { id: '5-3', name: 'c', xp: 30, gold: 10, learn, questions: [] },
        { id: '5-B', name: 'boss', xp: 80, gold: 30, boss: true, learn, questions: [] },
      ],
    },
  ],
}

function saveWith(regions: unknown) {
  return validateSave({ ...defaultSave(), regions })!
}

describe('earnedBadgeIds 幂等与空态', () => {
  it('空存档：除 first-voyage 之外一律不达成', () => {
    const got = earnedBadgeIds(defaultSave(), stdCourse)
    expect(got).toEqual([])
  })

  it('完全清空后再跑一次结果一致（幂等）', () => {
    const a = earnedBadgeIds(defaultSave(), stdCourse)
    const b = earnedBadgeIds(defaultSave(), stdCourse)
    expect(a).toEqual(b)
  })
})

describe('first-voyage / star-apprentice', () => {
  it('任意一关 cleared → first-voyage', () => {
    const save = saveWith({ '1': { unlocked: true, levels: { '1-1': { cleared: true, stars: 0 } } } })
    expect(earnedBadgeIds(save, stdCourse)).toEqual(['first-voyage'])
  })

  it('clear 一关且 stars===3 → first-voyage + star-apprentice', () => {
    const save = saveWith({ '1': { unlocked: true, levels: { '1-1': { cleared: true, stars: 3 } } } })
    const got = earnedBadgeIds(save, stdCourse)
    expect(got).toContain('first-voyage')
    expect(got).toContain('star-apprentice')
    expect(got.length).toBe(2)
  })

  it('stars===3 但 cleared=false（异常数据）不计入 star-apprentice', () => {
    const save = saveWith({ '1': { unlocked: true, levels: { '1-1': { cleared: false, stars: 3 } } } })
    const got = earnedBadgeIds(save, stdCourse)
    expect(got).toEqual([])
  })
})

describe('region-N-master', () => {
  it('区域 1 全部 cleared → region-1-master；其他区域未达成', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-1': { cleared: true, stars: 2 },
          '1-2': { cleared: true, stars: 1 },
          '1-3': { cleared: true, stars: 1 },
          '1-B': { cleared: true, stars: 0 },
        },
      },
    })
    const got = earnedBadgeIds(save, stdCourse)
    expect(got).toContain('first-voyage')
    expect(got).toContain('region-1-master')
    expect(got).not.toContain('region-2-master')
  })

  it('只差 boss 一关没打：不算 region-1-master', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-1': { cleared: true, stars: 2 },
          '1-2': { cleared: true, stars: 1 },
          '1-3': { cleared: true, stars: 1 },
        },
      },
    })
    const got = earnedBadgeIds(save, stdCourse)
    expect(got).not.toContain('region-1-master')
  })

  it('区域 5 全部 cleared → region-5-master（最后才点亮）', () => {
    const regions: Record<string, { unlocked: boolean; levels: Record<string, { cleared: boolean; stars: 0 | 1 | 2 | 3 }> }> = {}
    for (let r = 1; r <= 4; r++) {
      const rid = String(r)
      regions[rid] = {
        unlocked: true,
        levels: {
          [`${rid}-1`]: { cleared: true, stars: 1 },
          [`${rid}-2`]: { cleared: true, stars: 1 },
          [`${rid}-3`]: { cleared: true, stars: 1 },
          [`${rid}-B`]: { cleared: true, stars: 1 },
        },
      }
    }
    regions['5'] = {
      unlocked: true,
      levels: {
        '5-1': { cleared: true, stars: 1 },
        '5-2': { cleared: true, stars: 1 },
        '5-3': { cleared: true, stars: 1 },
        '5-B': { cleared: true, stars: 1 },
      },
    }
    const save = saveWith(regions)
    const got = earnedBadgeIds(save, stdCourse)
    expect(got).toContain('region-1-master')
    expect(got).toContain('region-2-master')
    expect(got).toContain('region-3-master')
    expect(got).toContain('region-4-master')
    expect(got).toContain('region-5-master')
  })
})

describe('perfectionist', () => {
  it('某区域所有 level 都 stars===3 → perfectionist', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-1': { cleared: true, stars: 3 },
          '1-2': { cleared: true, stars: 3 },
          '1-3': { cleared: true, stars: 3 },
          '1-B': { cleared: true, stars: 3 },
        },
      },
    })
    expect(earnedBadgeIds(save, stdCourse)).toContain('perfectionist')
  })

  it('区域内只要有一个 stars<3 → 不算 perfectionist', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-1': { cleared: true, stars: 3 },
          '1-2': { cleared: true, stars: 2 },
          '1-3': { cleared: true, stars: 3 },
          '1-B': { cleared: true, stars: 3 },
        },
      },
    })
    expect(earnedBadgeIds(save, stdCourse)).not.toContain('perfectionist')
  })
})

describe('flawless-warrior', () => {
  it('任意 boss stars===3 → flawless-warrior', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-1': { cleared: true, stars: 2 },
          '1-B': { cleared: true, stars: 3 },
        },
      },
    })
    const got = earnedBadgeIds(save, stdCourse)
    expect(got).toContain('flawless-warrior')
  })

  it('boss stars<3 不算 flawless-warrior', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-B': { cleared: true, stars: 2 },
        },
      },
    })
    expect(earnedBadgeIds(save, stdCourse)).not.toContain('flawless-warrior')
  })

  it('非 boss 关 ★★★ 不会误触发 flawless-warrior', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-1': { cleared: true, stars: 3 },
          '1-2': { cleared: true, stars: 3 },
        },
      },
    })
    expect(earnedBadgeIds(save, stdCourse)).not.toContain('flawless-warrior')
  })
})

describe('graduate', () => {
  it('5-B cleared → graduate', () => {
    const save = saveWith({
      '5': {
        unlocked: true,
        levels: {
          '5-B': { cleared: true, stars: 1 },
        },
      },
    })
    expect(earnedBadgeIds(save, stdCourse)).toContain('graduate')
  })

  it('5-B 未 cleared → 不算 graduate', () => {
    const save = saveWith({
      '5': {
        unlocked: true,
        levels: {
          '5-1': { cleared: true, stars: 1 },
          '5-2': { cleared: true, stars: 1 },
        },
      },
    })
    expect(earnedBadgeIds(save, stdCourse)).not.toContain('graduate')
  })
})

describe('返回结构', () => {
  it('结果数组元素全是字符串且不重复', () => {
    const save = saveWith({
      '1': {
        unlocked: true,
        levels: {
          '1-1': { cleared: true, stars: 3 },
          '1-2': { cleared: true, stars: 3 },
          '1-3': { cleared: true, stars: 3 },
          '1-B': { cleared: true, stars: 3 },
        },
      },
      '5': {
        unlocked: true,
        levels: { '5-B': { cleared: true, stars: 3 } },
      },
    })
    const got = earnedBadgeIds(save, stdCourse)
    for (const id of got) expect(typeof id).toBe('string')
    expect(new Set(got).size).toBe(got.length)
  })
})