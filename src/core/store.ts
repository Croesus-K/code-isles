import { create } from 'zustand'
import {
  defaultSave,
  grantGold,
  grantXp,
  parseSave,
  serializeSave,
  spendGold,
  type PlayerState,
  type SaveData,
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
