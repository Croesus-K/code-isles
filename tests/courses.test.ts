import { describe, expect, it } from 'vitest'
import { COURSES, DEFAULT_COURSE_ID, getCourse, courseProgress } from '../src/content/courses'
import { defaultSave } from '../src/core/save/schema'
import type { Question } from '../src/content/course'

describe('课程注册表', () => {
  it('课程 id 唯一', () => {
    const ids = COURSES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('所有课程的 region id 全局唯一（存档与错题本都以 regionId 为键）', () => {
    const regionIds = COURSES.flatMap((c) => c.regions.map((r) => r.id))
    expect(new Set(regionIds).size).toBe(regionIds.length)
  })

  it('getCourse：未知 id 回落默认课程', () => {
    expect(getCourse('nonexistent')).toBe(getCourse(DEFAULT_COURSE_ID))
    expect(getCourse(COURSES[0]!.id)).toBe(COURSES[0])
  })

  it('每道题结构合法（answerIndex/answers/answerLine/lines 越界即内容 bug）', () => {
    for (const course of COURSES) {
      for (const region of course.regions) {
        for (const level of region.levels) {
          expect(level.questions.length, `${course.id}/${region.id}/${level.id}`).toBeGreaterThan(0)
          for (const q of level.questions as Question[]) {
            const ctx = `${course.id}/${region.id}/${level.id}/${q.kind}`
            if (q.kind === 'choice' || q.kind === 'output') {
              expect(q.answerIndex, ctx).toBeGreaterThanOrEqual(0)
              expect(q.answerIndex, ctx).toBeLessThan(q.options.length)
            }
            if (q.kind === 'fill') {
              expect(q.code.includes('___'), ctx).toBe(true)
              expect(q.answers.length, ctx).toBeGreaterThan(0)
            }
            if (q.kind === 'order') {
              expect(q.lines.length, ctx).toBeGreaterThan(1)
            }
            if (q.kind === 'bug') {
              expect(q.answerLine, ctx).toBeGreaterThanOrEqual(0)
              expect(q.answerLine, ctx).toBeLessThan(q.code.length)
            }
          }
        }
      }
    }
  })

  it('courseProgress：comingSoon 区域不计入分母，cleared 按 regionId+levelId 统计', () => {
    const save = defaultSave()
    const course = getCourse('python-basics')
    const firstRegion = course.regions[0]!
    save.regions[firstRegion.id] = {
      unlocked: true,
      levels: { [firstRegion.levels[0]!.id]: { cleared: true, stars: 2 } },
    }
    const prog = courseProgress(save, course)
    expect(prog.cleared).toBe(1)
    expect(prog.total).toBeGreaterThan(1)

    const empty = courseProgress(defaultSave(), course)
    expect(empty.cleared).toBe(0)
  })
})