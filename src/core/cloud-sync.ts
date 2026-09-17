/**
 * GitHub 云端存档：用私有 Gist 当免费网盘，无需自建后端。
 *
 * 认证方式：用户在 GitHub 生成只勾 gist 权限的 Personal Access Token，
 * 粘贴进应用。Token 只存在浏览器 localStorage，只发往 https://api.github.com，
 * 任何第三方（包括本站）都无法用它做 gist 以外的事。
 *
 * 同步策略：手动「上传 / 下载」两键，避免多设备自动同步互相覆盖的冲突问题。
 * 上传 = PATCH gist；下载 = GET gist → validateSave 校验后并入本地。
 *
 * 测试策略：buildGistFiles / extractSaveFromGist / parseRemoteSave 是纯函数直接测；
 * API 函数依赖 fetch，测试里 vi.stubGlobal 注入假 fetch。
 */
import { SAVE_GIST_FILE, parseSave, serializeSave, type SaveData } from './save/schema'

export const GIST_DESCRIPTION = 'code-isles-cloud-save'
export const GH_TOKEN_KEY = 'code-isles-gh-token'
export const GH_GIST_KEY = 'code-isles-gh-gist'
export const GH_SYNCED_AT_KEY = 'code-isles-gh-synced-at'

const API_BASE = 'https://api.github.com'

/** gist 的 files 结构：{ "文件名": { content: "..." } } */
export function buildGistFiles(save: SaveData): Record<string, { content: string }> {
  return { [SAVE_GIST_FILE]: { content: serializeSave(save) } }
}

/** 从 GET /gists/:id 的返回里提出存档 + 更新时间；文件缺失/损坏返回 null */
export function extractSaveFromGist(
  gist: { files?: Record<string, { content?: string } | null>; updated_at?: string } | null,
): { save: SaveData; updatedAt: string } | null {
  const content = gist?.files?.[SAVE_GIST_FILE]?.content
  if (!content) return null
  const save = parseSave(content)
  if (!save) return null
  return { save, updatedAt: gist?.updated_at ?? '' }
}

export interface RemoteSaveMeta {
  updatedAt: string
  /** 云端 updatedAt 与本地存档 updatedAt 的先后关系 */
  relation: 'remote-newer' | 'remote-older' | 'same' | 'local-empty'
}

export function compareWithLocal(remote: SaveData, local: SaveData | null): RemoteSaveMeta['relation'] {
  if (!local || !local.updatedAt) return 'local-empty'
  const r = remote.updatedAt || ''
  const l = local.updatedAt || ''
  if (r === l) return 'same'
  return r > l ? 'remote-newer' : 'remote-older'
}

/** 统一的 API 调用 + 错误翻译（把常见 HTTP 状态翻成人话） */
export async function ghApi<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new Error('网络错误：连不上 api.github.com（检查网络或代理）')
  }
  if (res.status === 401) throw new Error('Token 无效或已过期（需要 gist 权限）')
  if (res.status === 403) throw new Error('GitHub API 限流或权限不足，请稍后再试')
  if (res.status === 404) throw new Error('云端存档不存在（可能已被删除）')
  if (!res.ok) throw new Error(`GitHub API 错误：HTTP ${res.status}`)
  return (await res.json()) as T
}

interface GhGist {
  id: string
  description?: string
  updated_at?: string
  files?: Record<string, { content?: string } | null>
}

/** 在账号里找承载存档的 gist；没有就创建一个私有的。返回 gist id */
export async function findOrCreateSaveGist(token: string): Promise<string> {
  const gists = await ghApi<GhGist[]>(token, '/gists?per_page=100')
  const found = Array.isArray(gists)
    ? gists.find((g) => g.description === GIST_DESCRIPTION && g.files?.[SAVE_GIST_FILE])
    : undefined
  if (found) return found.id
  const created = await ghApi<GhGist>(token, '/gists', {
    method: 'POST',
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: { [SAVE_GIST_FILE]: { content: '{}' } },
    }),
  })
  if (!created?.id) throw new Error('创建云端存档失败（响应异常）')
  return created.id
}

/** 上传：整包覆盖 gist 里的存档文件 */
export async function uploadSave(token: string, gistId: string, save: SaveData): Promise<void> {
  await ghApi<GhGist>(token, `/gists/${gistId}`, {
    method: 'PATCH',
    body: JSON.stringify({ files: buildGistFiles(save) }),
  })
}

/** 下载：拿回云端存档（未经 validate 之前的原始 parse 结果），失败返回 null */
export async function downloadSave(token: string, gistId: string): Promise<SaveData | null> {
  const gist = await ghApi<GhGist>(token, `/gists/${gistId}`)
  return extractSaveFromGist(gist)?.save ?? null
}

/** 用 token 反查登录名，连接时显示「已连接 as xxx」 */
export async function fetchLoginName(token: string): Promise<string> {
  const user = await ghApi<{ login?: string }>(token, '/user')
  return user?.login ?? ''
}