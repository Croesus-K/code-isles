/**
 * 存档数据结构与纯函数。所有变更须经此模块校验，store 只做转发。
 */

export const SAVE_VERSION = 1
export const SAVE_KEY = 'code-isles-save-v1'

/** 云端同步（GitHub Gist）里承载存档的固定文件名 */
export const SAVE_GIST_FILE = 'code-isles-save.json'

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

/** 单条错题记录。questionKey = "${regionId}:${levelId}:${questionIndex}"。 */
export interface WrongAnswerRecord {
  questionKey: string
  /** ISO 时间戳；首次答错的时间，之后每次答错刷新。 */
  wrongAt: string
  /** 该题累计答错次数（去重后只计 1 次/题，但同题反复错会递增）。 */
  attempts: number
}

/**
 * 学习统计每日聚合。date 用本地时区 YYYY-MM-DD（避免 UTC 跨日）。
 * 用于：
 * - 周报（最近 7 天的活动 + 正确率）
 * - 30 天热力图（每日活跃强度）
 * - 连续打卡天数（currentStreak / bestStreak）
 */
export interface DailyStat {
  date: string
  cleared: number
  correct: number
  wrong: number
}

/** 保留最近多少天的历史（更早的丢弃，控制存档体积） */
export const HISTORY_KEEP_DAYS = 90

export interface SaveData {
  version: number
  player: PlayerState
  /** key = 区域 id，如 "1"。结构经 validateSave 深度校验 */
  regions: Record<string, RegionProgress>
  /** 已获得徽章的 id 列表 */
  badges: string[]
  /** 答错过的题目记录（错题本） */
  wrongAnswers: WrongAnswerRecord[]
  /** 学习统计每日聚合（按本地时区日期） */
  history: DailyStat[]
  settings: Settings
  updatedAt: string
}

export function defaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    player: { xp: 0, gold: 0 },
    regions: {},
    badges: [],
    wrongAnswers: [],
    history: [],
    settings: { soundOn: true },
    updatedAt: '',
  }
}

/** 本地时区的 YYYY-MM-DD 字符串（避免 UTC 跨日把活动记错天） */
export function todayLocal(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isISODate(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
}

function validateWrongAnswer(v: unknown): WrongAnswerRecord | null {
  if (typeof v !== 'object' || v === null) return null
  const r = v as Record<string, unknown>
  if (typeof r.questionKey !== 'string' || r.questionKey.length === 0) return null
  if (
    typeof r.attempts !== 'number' ||
    !Number.isInteger(r.attempts) ||
    r.attempts <= 0
  ) {
    return null
  }
  return {
    questionKey: r.questionKey,
    wrongAt: typeof r.wrongAt === 'string' ? r.wrongAt : '',
    attempts: r.attempts,
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
  // 兼容旧存档：缺少 wrongAnswers 视为空数组；数组内逐条校验，非法条目丢弃
  const rawWrong = Array.isArray(d.wrongAnswers) ? d.wrongAnswers : []
  const wrongAnswers: WrongAnswerRecord[] = []
  for (const item of rawWrong) {
    const wa = validateWrongAnswer(item)
    if (wa) wrongAnswers.push(wa)
  }
  // history 校验：按日期合并，丢弃非法条目，保留最近 N 天
  const rawHistory = Array.isArray(d.history) ? d.history : []
  const historyMap = new Map<string, DailyStat>()
  for (const item of rawHistory) {
    if (typeof item !== 'object' || item === null) continue
    const hd = item as Record<string, unknown>
    if (!isISODate(hd.date)) continue
    const cleared = isNonNegativeInt(hd.cleared) ? hd.cleared : 0
    const correct = isNonNegativeInt(hd.correct) ? hd.correct : 0
    const wrong = isNonNegativeInt(hd.wrong) ? hd.wrong : 0
    const existing = historyMap.get(hd.date) ?? { date: hd.date, cleared: 0, correct: 0, wrong: 0 }
    existing.cleared += cleared
    existing.correct += correct
    existing.wrong += wrong
    historyMap.set(hd.date, existing)
  }
  const sortedHistory = Array.from(historyMap.values()).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )
  const history: DailyStat[] =
    sortedHistory.length > HISTORY_KEEP_DAYS
      ? sortedHistory.slice(-HISTORY_KEEP_DAYS)
      : sortedHistory
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
    wrongAnswers,
    history,
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
