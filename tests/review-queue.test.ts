import { describe, expect, it } from 'vitest'
import { buildReviewQueue, resolveReviewItem } from '../src/core/review-queue'
import { defaultSave, type SaveData } from '../src/core/save/schema'
import type { CourseDef, ChoiceQuestion, BugQuestion } from '../src/content/course'

const Q1: ChoiceQuestion = {
  kind: 'choice',
  prompt: '关键字',
  explain: '',
  options: ['if', 'var'],
  answerIndex: 0,
}
const Q2: BugQuestion = {
  kind: 'bug',
  prompt: '哪行报错',
  explain: '',
  code: ['x'],
  answerLine: 0,
}

const COURSE: CourseDef = {
  id: 'c',
  title: 't',
  subtitle: '',
  regions: [
    {
      id: 'r1',
      name: '入门岛',
      tagline: '',
      levels: [
        { id: '1-1', name: 'L1', xp: 0, gold: 0, learn: { title: '', body: [] }, questions: [Q1] },
        { id: '1-2', name: 'L2', xp: 0, gold: 0, learn: { title: '', body: [] }, questions: [Q2] },
      ],
    },
  ],
}

function saveWith(...keys: Array<{ qk: string; wrongAt: string; attempts: number }>): SaveData {
  const base = defaultSave()
  base.wrongAnswers = keys.map((k) => ({
    questionKey: k.qk,
    wrongAt: k.wrongAt,
    attempts: k.attempts,
  }))
  return base
}

describe('resolveReviewItem', () => {
  it('正常 key 返回题目', () => {
    const r = resolveReviewItem('r1:1-1:0', COURSE)
    expect(r).not.toBeNull()
    expect(r!.question).toBe(Q1)
  })
  it('非法格式 / 不存在的 region / level / index → null', () => {
    expect(resolveReviewItem('bad', COURSE)).toBeNull()
    expect(resolveReviewItem('r99:1-1:0', COURSE)).toBeNull()
    expect(resolveReviewItem('r1:99-99:0', COURSE)).toBeNull()
    expect(resolveReviewItem('r1:1-1:99', COURSE)).toBeNull()
  })
})

describe('buildReviewQueue', () => {
  it('空错题本 → 空队列', () => {
    expect(buildReviewQueue(defaultSave(), COURSE)).toEqual([])
  })

  it('数据漂移（找不到的 key）静默丢弃', () => {
    const save = saveWith(
      { qk: 'r1:1-1:0', wrongAt: '2025-01-01T00:00:00Z', attempts: 1 },
      { qk: 'ghost:nope:0', wrongAt: '2025-01-01T00:00:00Z', attempts: 1 },
    )
    const queue = buildReviewQueue(save, COURSE)
    expect(queue).toHaveLength(1)
    expect(queue[0].questionKey).toBe('r1:1-1:0')
  })

  it('默认按 wrongAt 倒序（最近优先）', () => {
    const save = saveWith(
      { qk: 'r1:1-1:0', wrongAt: '2025-01-01T00:00:00Z', attempts: 1 },
      { qk: 'r1:1-2:0', wrongAt: '2025-03-01T00:00:00Z', attempts: 2 },
    )
    const queue = buildReviewQueue(save, COURSE)
    expect(queue.map((q) => q.questionKey)).toEqual(['r1:1-2:0', 'r1:1-1:0'])
  })

  it('focusQuestionKey 仅保留指定的那一道', () => {
    const save = saveWith(
      { qk: 'r1:1-1:0', wrongAt: '2025-01-01T00:00:00Z', attempts: 1 },
      { qk: 'r1:1-2:0', wrongAt: '2025-03-01T00:00:00Z', attempts: 2 },
    )
    const queue = buildReviewQueue(save, COURSE, 'r1:1-1:0')
    expect(queue).toHaveLength(1)
    expect(queue[0].questionKey).toBe('r1:1-1:0')
    expect(queue[0].question).toBe(Q1)
  })

  it('focusQuestionKey 找不到（数据漂移）→ 空队列', () => {
    const save = saveWith(
      { qk: 'r1:1-1:0', wrongAt: '2025-01-01T00:00:00Z', attempts: 1 },
    )
    const queue = buildReviewQueue(save, COURSE, 'ghost:99:0')
    expect(queue).toEqual([])
  })

  it('保留 attempts / wrongAt 字段', () => {
    const save = saveWith(
      { qk: 'r1:1-1:0', wrongAt: '2025-05-05T05:05:05Z', attempts: 7 },
    )
    const queue = buildReviewQueue(save, COURSE)
    expect(queue[0].attempts).toBe(7)
    expect(queue[0].wrongAt).toBe('2025-05-05T05:05:05Z')
  })
})