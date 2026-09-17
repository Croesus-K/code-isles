import type { CourseDef, Question } from '../content/course'
import type { SaveData } from './save/schema'
import { levelCleared } from './progress'

export interface ChallengeItem {
  questionKey: string
  question: Question
  regionId: string
  regionName: string
  levelId: string
  levelName: string
}

/**
 * 「综合挑战」题库：从「已通关关卡的全部题目」里随机抽 N 道。
 *
 * 设计动机：玩家通关 region1-5 后想"再练手"——但当前游戏只有"错题复习"
 * 一条路，错过没进错题本的题就没法再次作答。综合挑战是"从全题库随机抽题"
 * 的兜底模式，鼓励复盘已学知识。
 *
 * 抽题范围：当前课程内、区域已发布、关卡已通关的全部题目。
 * - 不区分 boss 与普通关（boss 题出现在综合挑战里反而更刺激）
 * - 不记录错题本（避免把"挑战模式"的答错污染到真正的错题本）
 * - 不可用的题（数据漂移）静默丢弃
 *
 * 抽出纯函数便于测试；ChallengeView 直接调它。
 */
export function buildChallengeQueue(
  save: SaveData,
  course: CourseDef,
  count: number,
  random: () => number = Math.random,
): ChallengeItem[] {
  const all: ChallengeItem[] = []
  for (const region of course.regions) {
    if (region.comingSoon) continue
    for (const level of region.levels) {
      if (!levelCleared(save, region.id, level.id)) continue
      for (let i = 0; i < level.questions.length; i++) {
        all.push({
          questionKey: `${region.id}:${level.id}:${i}`,
          question: level.questions[i]!,
          regionId: region.id,
          regionName: region.name,
          levelId: level.id,
          levelName: level.name,
        })
      }
    }
  }
  // Fisher–Yates 洗牌后取前 count 道
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = all[i]!
    all[i] = all[j]!
    all[j] = tmp
  }
  return all.slice(0, count)
}

/** 综合挑战默认抽题数：够刺激又不至于刷太久 */
export const CHALLENGE_DEFAULT_COUNT = 10

/**
 * 当前课程"已通关"关卡的总题数。ChallengeView 用它告诉用户
 * "你目前可挑战 X 道"，X 为 0 时隐藏入口。
 */
export function challengePoolSize(save: SaveData, course: CourseDef): number {
  let total = 0
  for (const region of course.regions) {
    if (region.comingSoon) continue
    for (const level of region.levels) {
      if (!levelCleared(save, region.id, level.id)) continue
      total += level.questions.length
    }
  }
  return total
}