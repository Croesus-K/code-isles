/**
 * 徽章达成判定：纯函数，根据存档 + 课程定义推导"应当拥有"的所有徽章 id。
 * 幂等——同样的 save 反复调用，结果一致；调用方负责把新 id 合入 save.badges。
 *
 * 徽章规则一览（与 src/content/badges.ts 的展示文案严格对应）：
 *  - first-voyage       ：任意关卡 cleared
 *  - region-N-master    ：区域 N 全部 level 都被 cleared（N ∈ [1,5]）
 *  - star-apprentice    ：存在 cleared level 且 stars === 3
 *  - perfectionist      ：存在某区域，所有 level 都 stars === 3（且至少有 1 关）
 *  - flawless-warrior   ：任意 boss level stars === 3（3 星 ⟺ 零错零提示）
 *  - graduate           ：区域 5 的 boss（5-B）被 cleared
 *  - challenge-novice   ：完成至少 1 次综合挑战
 *  - challenge-veteran  ：累计完成 10 次综合挑战
 *  - challenge-ace      ：综合挑战至少 1 次全对通关（wrong + skip 都为 0）
 *
 * 不在快照里持久化任何中间量——所有判定都能从 save + course 直接重建。
 */

import type { CourseDef, RegionDef } from '../content/course'
import type { SaveData } from './save/schema'

/** "区域 N 全部 cleared" 通用判定；找不到对应区域返回 false。 */
function regionFullyCleared(save: SaveData, course: CourseDef, regionIndex: number): boolean {
  const region: RegionDef | undefined = course.regions[regionIndex]
  if (!region) return false
  const rp = save.regions[region.id]
  if (!rp) return false
  return region.levels.every((lv) => rp.levels[lv.id]?.cleared === true)
}

/** "区域 N 全部 ★★★" 通用判定；找不到对应区域或没关卡返回 false。 */
function regionAllThreeStars(save: SaveData, course: CourseDef, regionIndex: number): boolean {
  const region: RegionDef | undefined = course.regions[regionIndex]
  if (!region || region.levels.length === 0) return false
  const rp = save.regions[region.id]
  if (!rp) return false
  return region.levels.every((lv) => rp.levels[lv.id]?.stars === 3)
}

/** 任意 boss 关 stars===3。 */
function anyBossFlawless(save: SaveData, course: CourseDef): boolean {
  for (const region of course.regions) {
    const rp = save.regions[region.id]
    if (!rp) continue
    for (const lv of region.levels) {
      if (lv.boss && rp.levels[lv.id]?.stars === 3) return true
    }
  }
  return false
}

/** 任意 cleared 关 stars===3。 */
function anyLevelThreeStars(save: SaveData): boolean {
  for (const rp of Object.values(save.regions)) {
    for (const lp of Object.values(rp.levels)) {
      if (lp.cleared && lp.stars === 3) return true
    }
  }
  return false
}

/** 是否有任意关卡被 cleared（用于 first-voyage）。 */
function anyLevelCleared(save: SaveData): boolean {
  for (const rp of Object.values(save.regions)) {
    for (const lp of Object.values(rp.levels)) {
      if (lp.cleared) return true
    }
  }
  return false
}

/** 公开 API：推导当前存档下"应该拥有"的徽章 id 集合（去重、顺序稳定）。 */
export function earnedBadgeIds(save: SaveData, course: CourseDef): string[] {
  const earned = new Set<string>()

  if (anyLevelCleared(save)) earned.add('first-voyage')

  if (regionFullyCleared(save, course, 0)) earned.add('region-1-master')
  if (regionFullyCleared(save, course, 1)) earned.add('region-2-master')
  if (regionFullyCleared(save, course, 2)) earned.add('region-3-master')
  if (regionFullyCleared(save, course, 3)) earned.add('region-4-master')
  if (regionFullyCleared(save, course, 4)) earned.add('region-5-master')

  if (anyLevelThreeStars(save)) earned.add('star-apprentice')

  for (let i = 0; i < course.regions.length; i++) {
    if (regionAllThreeStars(save, course, i)) {
      earned.add('perfectionist')
      break
    }
  }

  if (anyBossFlawless(save, course)) earned.add('flawless-warrior')

  // graduate：区域 5（字典城）的 boss level（5-B）被 cleared。
  const region5 = course.regions[4]
  if (region5) {
    const bossLv = region5.levels.find((lv) => lv.boss)
    if (bossLv) {
      const rp = save.regions[region5.id]
      if (rp?.levels[bossLv.id]?.cleared) earned.add('graduate')
    }
  }

  // 综合挑战系列徽章
  const cs = save.challengeStats
  if (cs) {
    if (cs.finished >= 1) earned.add('challenge-novice')
    if (cs.finished >= 10) earned.add('challenge-veteran')
    if (cs.perfect >= 1) earned.add('challenge-ace')
  }

  return Array.from(earned)
}