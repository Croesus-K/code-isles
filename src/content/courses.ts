import type { CourseDef } from './course'
import { pythonBasics } from './python-basics'
import { javascriptBasics } from './javascript-basics'

/**
 * 课程注册表：左侧菜单"课程"区块按此渲染。
 * 新增语言课程 = 新增一个数据文件 + 在此追加一行，引擎零改动。
 *
 * 硬约束：所有课程的 region.id 全局唯一（存档 regions、错题本
 * questionKey 都以 regionId 为键，冲突会互相污染进度）。
 * tests/courses.test.ts 会守护这一点。
 */
export const COURSES: readonly CourseDef[] = [pythonBasics, javascriptBasics]

/** 默认课程 id（老玩家没选过课时落到它上面） */
export const DEFAULT_COURSE_ID = pythonBasics.id

/** 本地记录"上次选择的课程"，独立于存档——换课不清进度，也不随存档导出 */
export const COURSE_PREF_KEY = 'code-isles-course-pref'

export function getCourse(id: string): CourseDef {
  return COURSES.find((c) => c.id === id) ?? pythonBasics
}

/** 课程通关进度（已通关关卡 / 可玩关卡总数），用于菜单里的进度条 */
export function courseProgress(save: {
  regions: Record<string, { levels: Record<string, { cleared: boolean }> }>
}, course: CourseDef): { cleared: number; total: number } {
  let cleared = 0
  let total = 0
  for (const region of course.regions) {
    if (region.comingSoon) continue
    for (const level of region.levels) {
      total += 1
      cleared += save.regions[region.id]?.levels[level.id]?.cleared ? 1 : 0
    }
  }
  return { cleared, total }
}