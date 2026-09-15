/**
 * 进度与解锁的全部推导规则。存档里只记"通关过没有"，
 * 谁解锁谁锁定都从这里算出来——避免存档与规则不同步。
 */
import type { CourseDef, RegionDef } from '../content/course'
import type { SaveData } from './save/schema'

/** 区域是否可进入：区域 1 永远解锁；之后要求上一区域的 Boss 关已通关 */
export function isRegionUnlocked(save: SaveData, course: CourseDef, regionIndex: number): boolean {
  const region = course.regions[regionIndex]
  if (!region || region.comingSoon) return false
  if (regionIndex === 0) return true
  const prev = course.regions[regionIndex - 1]
  const last = prev.levels[prev.levels.length - 1]
  if (!last) return false
  return save.regions[prev.id]?.levels[last.id]?.cleared === true
}

/** 区域内关卡是否可挑战：第 1 关永远解锁，之后要求上一关已通关 */
export function isLevelUnlocked(save: SaveData, region: RegionDef, levelIndex: number): boolean {
  if (levelIndex === 0) return true
  const prev = region.levels[levelIndex - 1]
  return save.regions[region.id]?.levels[prev.id]?.cleared === true
}

export function levelCleared(save: SaveData, regionId: string, levelId: string): boolean {
  return save.regions[regionId]?.levels[levelId]?.cleared === true
}

export function clearedCount(save: SaveData, region: RegionDef): number {
  return region.levels.filter((l) => levelCleared(save, region.id, l.id)).length
}

export interface RewardInfo {
  xp: number
  gold: number
  firstClear: boolean
}

/** 首次通关全额奖励；重复通关按 25% 向下取整（复习奖励），防止无限刷钱 */
export function computeReward(
  alreadyCleared: boolean,
  base: { xp: number; gold: number },
): RewardInfo {
  if (!alreadyCleared) return { xp: base.xp, gold: base.gold, firstClear: true }
  return {
    xp: Math.floor(base.xp * 0.25),
    gold: Math.floor(base.gold * 0.25),
    firstClear: false,
  }
}
