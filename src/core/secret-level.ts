/**
 * 秘境岛关卡内容：服务端拉取 + 本地缓存。
 *
 * 数据流：
 *  1. 兑换 / 启动恢复时 POST /api/secret/unlock { key }
 *  2. 服务端（counter-worker）校验在册密钥 → 返回 { ok, key, levels }
 *     其中 levels = { [courseId]: RegionDef }（两门课的秘境岛）
 *  3. 成功后写 localStorage 缓存（离线可玩），失败按状态分类：
 *     bad-key = 密钥不在册（吊销/打错）→ 清除解锁态
 *     network = 网络问题 → 保留现状，下次再试
 *
 * 安全说明：缓存存在玩家自己浏览器的 localStorage 里（属于玩家的
 * 解锁产物，可随存档迁移）；bundle 本身永远不含秘境岛题目。
 */
import type { RegionDef } from '../content/course'
import { checkKey } from './secret-key'

/** 服务端端点：站点根路径下（Worker 同域路由接管 /api/secret*） */
const ENDPOINT = '/api/secret/unlock'

export const SECRET_LEVELS_CACHE_KEY = 'code-isles-secret-levels-v1'

/** courseId → 秘境岛 RegionDef */
export type SecretLevels = Record<string, RegionDef>

export type SecretFetchResult =
  | { status: 'ok'; key: string; levels: SecretLevels }
  | { status: 'bad-key' }
  | { status: 'network' }

/** 轻量结构校验：至少要像一份 { courseId: RegionDef }，防服务端异常数据炸 UI */
export function validateLevelsPayload(data: unknown): SecretLevels | null {
  if (typeof data !== 'object' || data === null) return null
  const out: SecretLevels = {}
  let count = 0
  for (const [courseId, region] of Object.entries(data as Record<string, unknown>)) {
    if (typeof courseId !== 'string' || courseId.length === 0) return null
    if (typeof region !== 'object' || region === null) return null
    const r = region as Record<string, unknown>
    if (typeof r.id !== 'string' || r.id.length === 0) return null
    if (typeof r.name !== 'string') return null
    if (!Array.isArray(r.levels) || r.levels.length === 0) return null
    for (const lv of r.levels) {
      const l = lv as Record<string, unknown>
      if (typeof l.id !== 'string' || !Array.isArray(l.questions)) return null
    }
    out[courseId] = region as unknown as RegionDef
    count += 1
  }
  return count > 0 ? out : null
}

/**
 * 调服务端校验密钥并拉取秘境岛内容。
 * fetchImpl 可注入（单测）；生产用全局 fetch。
 */
export async function fetchSecretLevels(
  rawKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SecretFetchResult> {
  const key = checkKey(rawKey)
  if (!key) return { status: 'bad-key' }
  try {
    const res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    if (res.status === 403) return { status: 'bad-key' }
    if (!res.ok) return { status: 'network' }
    const data: unknown = await res.json()
    if (typeof data !== 'object' || data === null) return { status: 'network' }
    const payload = data as Record<string, unknown>
    if (payload.ok !== true) return { status: 'bad-key' }
    const levels = validateLevelsPayload(payload.levels)
    if (!levels) return { status: 'network' }
    return { status: 'ok', key, levels }
  } catch {
    return { status: 'network' }
  }
}

interface CacheShape {
  key: string
  levels: SecretLevels
}

/** 缓存秘境岛内容（localStorage；写入失败静默——隐私模式大不了每次联网拉） */
export function cacheSecretLevels(storage: Pick<Storage, 'setItem'> | null, key: string, levels: SecretLevels): void {
  if (!storage) return
  try {
    const payload: CacheShape = { key, levels }
    storage.setItem(SECRET_LEVELS_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // quota 满 / 隐私模式：不缓存也能玩，只是冷启动要联网
  }
}

/** 读缓存：密钥与内容成对返回；没有 / 损坏 → null */
export function loadCachedSecretLevels(storage: Pick<Storage, 'getItem'> | null): CacheShape | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(SECRET_LEVELS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed.key !== 'string') return null
    const levels = validateLevelsPayload(parsed.levels)
    if (!levels) return null
    return { key: parsed.key, levels }
  } catch {
    return null
  }
}

/** 吊销 / 换钥时清掉旧缓存 */
export function clearCachedSecretLevels(storage: Pick<Storage, 'removeItem'> | null): void {
  if (!storage) return
  try {
    storage.removeItem(SECRET_LEVELS_CACHE_KEY)
  } catch {
    // 同上，静默
  }
}
