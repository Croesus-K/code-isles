/**
 * 存档数据结构与纯函数。所有变更须经此模块校验，store 只做转发。
 */

export const SAVE_VERSION = 1
export const SAVE_KEY = 'code-isles-save-v1'

export type Stars = 0 | 1 | 2 | 3

export interface PlayerState {
  xp: number
  gold: number
}

export interface LevelProgress {
  cleared: boolean
  stars: Stars
}

export interface RegionProgress {
  unlocked: boolean
  /** key = 关卡 id，如 "1-2" */
  levels: Record<string, LevelProgress>
}

export interface Settings {
  soundOn: boolean
}

export interface SaveData {
  version: number
  player: PlayerState
  /** key = 区域 id，如 "1"。结构经 validateSave 深度校验 */
  regions: Record<string, RegionProgress>
  /** 已获得徽章的 id 列表 */
  badges: string[]
  settings: Settings
  updatedAt: string
}

export function defaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    player: { xp: 0, gold: 0 },
    regions: {},
    badges: [],
    settings: { soundOn: true },
    updatedAt: '',
  }
}

function isNonNegativeInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0
}

function validateStars(v: unknown): v is Stars {
  return v === 0 || v === 1 || v === 2 || v === 3
}

function validateLevelProgress(v: unknown): LevelProgress | null {
  if (typeof v !== 'object' || v === null) return null
  const l = v as Record<string, unknown>
  if (typeof l.cleared !== 'boolean' || !validateStars(l.stars)) return null
  return { cleared: l.cleared, stars: l.stars }
}

function validateRegionProgress(v: unknown): RegionProgress | null {
  if (typeof v !== 'object' || v === null) return null
  const r = v as Record<string, unknown>
  if (typeof r.unlocked !== 'boolean' || typeof r.levels !== 'object' || r.levels === null) {
    return null
  }
  const levels: Record<string, LevelProgress> = {}
  for (const [key, val] of Object.entries(r.levels)) {
    const lp = validateLevelProgress(val)
    if (!lp) return null
    levels[key] = lp
  }
  return { unlocked: r.unlocked, levels }
}

/** 校验并规整存档对象；不合法返回 null。只接受当前版本，迁移器以后按 version 逐级加。 */
export function validateSave(data: unknown): SaveData | null {
  if (typeof data !== 'object' || data === null) return null
  const d = data as Record<string, unknown>
  if (d.version !== SAVE_VERSION) return null
  const player = d.player as Record<string, unknown> | undefined
  if (!player || !isNonNegativeInt(player.xp) || !isNonNegativeInt(player.gold)) return null
  const settings = d.settings as Record<string, unknown> | undefined
  if (!settings || typeof settings.soundOn !== 'boolean') return null
  if (typeof d.regions !== 'object' || d.regions === null) return null
  if (!Array.isArray(d.badges) || !d.badges.every((b) => typeof b === 'string')) return null
  const regions: Record<string, RegionProgress> = {}
  for (const [key, val] of Object.entries(d.regions)) {
    const rp = validateRegionProgress(val)
    if (!rp) return null
    regions[key] = rp
  }
  return {
    version: SAVE_VERSION,
    player: { xp: player.xp, gold: player.gold },
    regions,
    badges: d.badges as string[],
    settings: { soundOn: settings.soundOn },
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : '',
  }
}

export function parseSave(raw: string): SaveData | null {
  try {
    return validateSave(JSON.parse(raw))
  } catch {
    return null
  }
}

export function serializeSave(save: SaveData): string {
  return JSON.stringify(
    { ...save, version: SAVE_VERSION, updatedAt: new Date().toISOString() },
    null,
    2,
  )
}

export function grantXp(player: PlayerState, amount: number): PlayerState {
  return { ...player, xp: Math.max(0, player.xp + Math.floor(amount)) }
}

export function grantGold(player: PlayerState, amount: number): PlayerState {
  return { ...player, gold: Math.max(0, player.gold + Math.floor(amount)) }
}

/** 花金币；余额不足返回 null，由调用方决定提示语。 */
export function spendGold(player: PlayerState, amount: number): PlayerState | null {
  const cost = Math.floor(amount)
  if (player.gold < cost) return null
  return { ...player, gold: player.gold - cost }
}
