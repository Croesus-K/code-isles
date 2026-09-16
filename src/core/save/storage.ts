import { SAVE_KEY, defaultSave, parseSave, serializeSave, type SaveData } from './schema'

/** 读写走注入的 Storage，单元测试可塞内存实现。 */

/** 加载结果：save 为 null 表示没存档或解析失败；corrupt 标记告诉调用方是否动过清除。 */
export interface LoadResult {
  save: SaveData | null
  /** true = 之前存在存档但解析失败，已被自动清除 */
  corrupt: boolean
}

export function loadSave(storage: Storage): LoadResult {
  const raw = storage.getItem(SAVE_KEY)
  if (raw === null) return { save: null, corrupt: false }
  const parsed = parseSave(raw)
  if (parsed) return { save: parsed, corrupt: false }
  // 存档存在但内容损坏（JSON 损坏 / 版本不符 / 字段不合法）：
  // 主动清除，避免每次启动都走一次失败路径；同时告诉调用方弹一次性提示。
  try {
    storage.removeItem(SAVE_KEY)
  } catch {
    // 极少数情况下 removeItem 也失败（Safari 隐私模式）——吞掉，下次启动再试
  }
  return { save: null, corrupt: true }
}

/** 写入失败时返回 false（quota 满 / Safari 隐私模式禁用 storage）。 */
export function persistSave(storage: Storage, save: SaveData): boolean {
  try {
    storage.setItem(SAVE_KEY, serializeSave(save))
    return true
  } catch {
    return false
  }
}

export function clearSaved(storage: Storage): boolean {
  try {
    storage.removeItem(SAVE_KEY)
    return true
  } catch {
    return false
  }
}

/** 用于 store 启动兜底：装不出来的存档给一份全新默认存档。 */
export function fallbackSave(): SaveData {
  return defaultSave()
}