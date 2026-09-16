import { create } from 'zustand'
import { earnedBadgeIds } from './badges'
import type { CourseDef } from '../content/course'
import { computeReward, type RewardInfo } from './progress'
import {
  defaultSave,
  grantGold,
  grantXp,
  parseSave,
  serializeSave,
  spendGold,
  type PlayerState,
  type SaveData,
  type Stars,
} from './save/schema'
import { clearSaved, loadSave, persistSave } from './save/storage'

const storage = typeof localStorage === 'undefined' ? null : localStorage
const init = storage ? loadSave(storage) : { save: null as SaveData | null, corrupt: false }

interface GameStore {
  save: SaveData
  hasSave: boolean
  /** true = 上次启动检测到存档损坏并已自动重置；UI 一次性提示 */
  corruptDetected: boolean
  /** true = 最近一次写入失败（隐私模式 / quota 满）；进入"读档不持久化"降级态 */
  persistFailed: boolean
  newGame: () => void
  addXp: (amount: number) => void
  addGold: (amount: number) => void
  /** 花金币；余额不足返回 false */
  spend: (amount: number) => boolean
  /**
   * 通关结算：首次全额奖励，重复通关按 25%（复习奖励）；星级只升不降。
   * 传入 course 时，顺手根据新存档推导"应当拥有"的徽章并合并（只增不减）。
   */
  completeLevel: (
    regionId: string,
    levelId: string,
    base: { xp: number; gold: number },
    result: { stars: Stars; bonusGold: number },
    course?: CourseDef,
  ) => RewardInfo & { stars: Stars }
  /** 根据当前存档 + 课程推导并合并徽章（幂等）。返回本次新增的徽章 id 列表。 */
  syncBadges: (course: CourseDef) => string[]
  /** 切换音效开关；立即写入并持久化。 */
  toggleSound: () => void
  exportSave: () => string
  /** 导入成功返回 true；坏 JSON 或版本不符返回 false */
  importSave: (raw: string) => boolean
  resetSave: () => void
  /** 用户关掉损坏提示横幅 */
  dismissCorruptNotice: () => void
}

export const useGameStore = create<GameStore>()((set, get) => {
  const commit = (next: SaveData) => {
    let ok = true
    if (storage) ok = persistSave(storage, next)
    set({ save: next, hasSave: true, persistFailed: !ok })
  }
  const withPlayer = (fn: (p: PlayerState) => PlayerState | null): boolean => {
    const cur = get().save
    const player = fn(cur.player)
    if (player) commit({ ...cur, player })
    return player !== null
  }
  return {
    save: init.save ?? defaultSave(),
    hasSave: init.save !== null,
    corruptDetected: init.corrupt,
    persistFailed: false,
    newGame: () => commit(defaultSave()),
    addXp: (amount) => {
      withPlayer((p) => grantXp(p, amount))
    },
    addGold: (amount) => {
      withPlayer((p) => grantGold(p, amount))
    },
    spend: (amount) => withPlayer((p) => spendGold(p, amount)),
    completeLevel: (regionId, levelId, base, result, course) => {
      const cur = get().save
      const region = cur.regions[regionId] ?? { unlocked: true, levels: {} }
      const already = region.levels[levelId]?.cleared ?? false
      const reward = computeReward(already, { xp: base.xp, gold: base.gold + result.bonusGold })
      const prevStars = region.levels[levelId]?.stars ?? 0
      const stars = Math.max(prevStars, result.stars) as Stars
      let next: SaveData = {
        ...cur,
        regions: {
          ...cur.regions,
          [regionId]: {
            ...region,
            unlocked: true,
            levels: { ...region.levels, [levelId]: { cleared: true, stars } },
          },
        },
        player: grantXp(grantGold(cur.player, reward.gold), reward.xp),
      }
      if (course) {
        const earned = earnedBadgeIds(next, course)
        const owned = new Set(next.badges)
        const missing = earned.filter((id) => !owned.has(id))
        if (missing.length > 0) {
          next = { ...next, badges: Array.from(new Set([...next.badges, ...earned])) }
        }
      }
      commit(next)
      return { ...reward, stars }
    },
    syncBadges: (course) => {
      const cur = get().save
      const earned = earnedBadgeIds(cur, course)
      const owned = new Set(cur.badges)
      const newly = earned.filter((id) => !owned.has(id))
      if (newly.length > 0) {
        commit({ ...cur, badges: Array.from(new Set([...cur.badges, ...earned])) })
      }
      return newly
    },
    toggleSound: () => {
      const cur = get().save
      commit({ ...cur, settings: { ...cur.settings, soundOn: !cur.settings.soundOn } })
    },
    exportSave: () => serializeSave(get().save),
    importSave: (raw) => {
      const next = parseSave(raw)
      if (!next) return false
      commit(next)
      return true
    },
    resetSave: () => {
      if (storage) clearSaved(storage)
      set({ save: defaultSave(), hasSave: false, persistFailed: false })
    },
    dismissCorruptNotice: () => set({ corruptDetected: false }),
  }
})