import { SAVE_KEY, parseSave, serializeSave, type SaveData } from './schema'

/** 读写走注入的 Storage，单元测试可塞内存实现。 */
export function loadSave(storage: Storage): SaveData | null {
  const raw = storage.getItem(SAVE_KEY)
  if (raw === null) return null
  return parseSave(raw)
}

export function persistSave(storage: Storage, save: SaveData): void {
  storage.setItem(SAVE_KEY, serializeSave(save))
}

export function clearSaved(storage: Storage): void {
  storage.removeItem(SAVE_KEY)
}
