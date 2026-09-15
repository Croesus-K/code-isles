import { create } from 'zustand'
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
const loaded = storage ? loadSave(storage) : null

interface GameStore {
  save: SaveData
  hasSave: boolean
  newGame: () => void
  addXp: (amount: number) => void
  addGold: (amount: number) => void
  /** 花金币；余额不足返回 false */
  spend: (amount: number) => boolean
  /** 通关结算：首次全额奖励，重复通关按 25%（复习奖励）；星级只升不降 */
  completeLevel: (
    regionId: string,
    levelId: string,
    base: { xp: number; gold: number },
    result: { stars: Stars; bonusGold: number },
  ) => RewardInfo & { stars: Stars }
  exportSave: () => string
  /** 导入成功返回 true；坏 JSON 或版本不符返回 false */
  importSave: (raw: string) => boolean
  resetSave: () => void
}

export const useGameStore = create<GameStore>()((set, get) => {
  const commit = (next: SaveData) => {
    if (storage) persistSave(storage, next)
    set({ save: next, hasSave: true })
  }
  const withPlayer = (fn: (p: PlayerState) => PlayerState | null): boolean => {
    const cur = get().save
    const player = fn(cur.player)
    if (player) commit({ ...cur, player })
    return player !== null
  }
  return {
    save: loaded ?? defaultSave(),
    hasSave: loaded !== null,
    newGame: () => commit(defaultSave()),
    addXp: (amount) => {
      withPlayer((p) => grantXp(p, amount))
    },
    addGold: (amount) => {
      withPlayer((p) => grantGold(p, amount))
    },
    spend: (amount) => withPlayer((p) => spendGold(p, amount)),
    completeLevel: (regionId, levelId, base, result) => {
      const cur = get().save
      const region = cur.regions[regionId] ?? { unlocked: true, levels: {} }
      const already = region.levels[levelId]?.cleared ?? false
      const reward = computeReward(already, { xp: base.xp, gold: base.gold + result.bonusGold })
      const prevStars = region.levels[levelId]?.stars ?? 0
      const stars = Math.max(prevStars, result.stars) as Stars
      const next: SaveData = {
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
      commit(next)
      return { ...reward, stars }
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
      set({ save: defaultSave(), hasSave: false })
    },
  }
})
