import { describe, expect, it } from 'vitest'
import { buildChallengeQueue, CHALLENGE_DEFAULT_COUNT, challengePoolSize } from '../src/core/challenge-queue'
import { pythonBasics } from '../src/content/python-basics'
import { defaultSave } from '../src/core/save/schema'
import type { SaveData } from '../src/core/save/schema'

describe('challenge-queue', () => {
  it('未通关任何关卡时返回空数组', () => {
    const queue = buildChallengeQueue(defaultSave(), pythonBasics, 10)
    expect(queue).toEqual([])
  })

  it('只从「已通关」关卡的题目里抽题', () => {
    const save = defaultSave()
    save.regions['1'] = {
      unlocked: true,
      levels: {
        '1-1': { cleared: true, stars: 3 },
        '1-2': { cleared: true, stars: 2 },
        // 1-3 / 1-B 未通关
      },
    }
    const queue = buildChallengeQueue(save, pythonBasics, 100)
    // 1-1 + 1-2 的题目总数应当全部进来
    const level1 = pythonBasics.regions[0]!
    const expectedCount = level1.levels[0]!.questions.length + level1.levels[1]!.questions.length
    expect(queue.length).toBe(expectedCount)
    // 不应出现 1-3 / 1-B
    const levelIds = new Set(queue.map((q) => q.levelId))
    expect(levelIds.has('1-1')).toBe(true)
    expect(levelIds.has('1-2')).toBe(true)
    expect(levelIds.has('1-3')).toBe(false)
    expect(levelIds.has('1-B')).toBe(false)
  })

  it('不污染错题本：综合挑战产出的题来自通关池子，但返回结构纯净', () => {
    const save = defaultSave()
    save.regions['1'] = { unlocked: true, levels: { '1-1': { cleared: true, stars: 3 } } }
    const queue = buildChallengeQueue(save, pythonBasics, 100)
    for (const item of queue) {
      expect(item.questionKey).toMatch(/^1:1-1:\d+$/)
      expect(item.regionName).toBeTruthy()
      expect(item.levelName).toBeTruthy()
    }
  })

  it('抽题数超过池子大小时只返回池子里的全部（不重复）', () => {
    const save = defaultSave()
    save.regions['1'] = { unlocked: true, levels: { '1-1': { cleared: true, stars: 3 } } }
    const queue = buildChallengeQueue(save, pythonBasics, 9999)
    const unique = new Set(queue.map((q) => q.questionKey))
    expect(unique.size).toBe(queue.length)
  })

  it('抽题数 <= 池子大小时返回 N 道（用固定 random 抽样）', () => {
    const save = defaultSave()
    save.regions['1'] = {
      unlocked: true,
      levels: {
        '1-1': { cleared: true, stars: 3 },
        '1-2': { cleared: true, stars: 3 },
        '1-3': { cleared: true, stars: 3 },
      },
    }
    const level1 = pythonBasics.regions[0]!
    const total = level1.levels.reduce((s, l) => s + l.questions.length, 0)
    const queue = buildChallengeQueue(save, pythonBasics, CHALLENGE_DEFAULT_COUNT)
    expect(queue.length).toBe(Math.min(CHALLENGE_DEFAULT_COUNT, total))
  })

  it('抽题是随机的：用相同的 deterministic random 应该产生相同序列', () => {
    const save = defaultSave()
    save.regions['1'] = {
      unlocked: true,
      levels: {
        '1-1': { cleared: true, stars: 3 },
        '1-2': { cleared: true, stars: 3 },
        '1-3': { cleared: true, stars: 3 },
      },
    }
    const seq = [0.1, 0.7, 0.4, 0.2, 0.9]
    let i = 0
    const rng = () => seq[i++ % seq.length] ?? 0.5
    const a = buildChallengeQueue(save, pythonBasics, 5, rng)
    let j = 0
    const rng2 = () => seq[j++ % seq.length] ?? 0.5
    const b = buildChallengeQueue(save, pythonBasics, 5, rng2)
    expect(a.map((x) => x.questionKey)).toEqual(b.map((x) => x.questionKey))
  })

  it('challengePoolSize 只算已通关关卡的题目', () => {
    const save: SaveData = defaultSave()
    expect(challengePoolSize(save, pythonBasics)).toBe(0)
    save.regions['1'] = {
      unlocked: true,
      levels: { '1-1': { cleared: true, stars: 3 } },
    }
    const level1 = pythonBasics.regions[0]!
    expect(challengePoolSize(save, pythonBasics)).toBe(level1.levels[0]!.questions.length)
  })
})