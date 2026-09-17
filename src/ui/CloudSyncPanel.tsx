import { useEffect, useState } from 'react'
import { useGameStore } from '../core/store'
import { audio } from '../core/audio'
import {
  GH_GIST_KEY,
  GH_SYNCED_AT_KEY,
  GH_TOKEN_KEY,
  downloadSave,
  fetchLoginName,
  findOrCreateSaveGist,
  uploadSave,
} from '../core/cloud-sync'

interface CloudState {
  token: string | null
  gistId: string | null
  login: string | null
  syncedAt: string | null
  busy: null | 'connect' | 'upload' | 'download'
  message: { kind: 'ok' | 'err'; text: string } | null
}

function readLocal(): Pick<CloudState, 'token' | 'gistId' | 'syncedAt'> {
  try {
    return {
      token: localStorage.getItem(GH_TOKEN_KEY),
      gistId: localStorage.getItem(GH_GIST_KEY),
      syncedAt: localStorage.getItem(GH_SYNCED_AT_KEY),
    }
  } catch {
    return { token: null, gistId: null, syncedAt: null }
  }
}

/**
 * GitHub 云端同步面板。手动「上传 / 下载」两键模型：
 * 上传 = 本地整包覆盖云端；下载 = 云端覆盖本地（有确认）。
 * Token 只存 localStorage、只发往 api.github.com，见 core/cloud-sync.ts 头注。
 */
export function CloudSyncPanel() {
  const exportSave = useGameStore((s) => s.exportSave)
  const importSave = useGameStore((s) => s.importSave)
  const [st, setSt] = useState<CloudState>({ ...readLocal(), login: null, busy: null, message: null })
  const [tokenInput, setTokenInput] = useState('')

  // 已连接时显示登录名（轻量校验 token 仍有效）
  useEffect(() => {
    if (!st.token || st.login) return
    let alive = true
    fetchLoginName(st.token)
      .then((login) => {
        if (alive) setSt((s) => ({ ...s, login }))
      })
      .catch(() => {
        if (alive) setSt((s) => ({ ...s, login: null }))
      })
    return () => {
      alive = false
    }
  }, [st.token, st.login])

  const connected = Boolean(st.token && st.gistId)

  const connect = async () => {
    const token = tokenInput.trim()
    if (!token) return
    audio.play('click')
    setSt((s) => ({ ...s, busy: 'connect', message: null }))
    try {
      const login = await fetchLoginName(token)
      const gistId = await findOrCreateSaveGist(token)
      localStorage.setItem(GH_TOKEN_KEY, token)
      localStorage.setItem(GH_GIST_KEY, gistId)
      setSt((s) => ({ ...s, token, gistId, login, busy: null, message: { kind: 'ok', text: `已连接 ${login}，云端存档就绪。` } }))
      setTokenInput('')
    } catch (e) {
      setSt((s) => ({ ...s, busy: null, message: { kind: 'err', text: e instanceof Error ? e.message : String(e) } }))
    }
  }

  const disconnect = () => {
    audio.play('click')
    localStorage.removeItem(GH_TOKEN_KEY)
    localStorage.removeItem(GH_GIST_KEY)
    localStorage.removeItem(GH_SYNCED_AT_KEY)
    setSt({ token: null, gistId: null, login: null, syncedAt: null, busy: null, message: null })
  }

  const upload = async () => {
    if (!st.token || !st.gistId) return
    audio.play('click')
    setSt((s) => ({ ...s, busy: 'upload', message: null }))
    try {
      // exportSave() 返回当前存档的序列化结果 —— 与本地持久化同一来源
      const raw = exportSave()
      await uploadSave(st.token, st.gistId, JSON.parse(raw))
      const at = new Date().toISOString()
      localStorage.setItem(GH_SYNCED_AT_KEY, at)
      setSt((s) => ({ ...s, busy: null, syncedAt: at, message: { kind: 'ok', text: '已上传到云端。' } }))
    } catch (e) {
      setSt((s) => ({ ...s, busy: null, message: { kind: 'err', text: e instanceof Error ? e.message : String(e) } }))
    }
  }

  const download = async () => {
    if (!st.token || !st.gistId) return
    audio.play('click')
    setSt((s) => ({ ...s, busy: 'download', message: null }))
    try {
      const remote = await downloadSave(st.token, st.gistId)
      if (!remote) {
        setSt((s) => ({ ...s, busy: null, message: { kind: 'err', text: '云端还没有存档，先上传一次。' } }))
        return
      }
      const ok = window.confirm('用云端存档覆盖本地进度？（本地现有的进度会丢失）')
      if (!ok) {
        setSt((s) => ({ ...s, busy: null, message: null }))
        return
      }
      // 重新序列化后走标准导入管线（validateSave 全量校验 + 徽章 reconcile）
      importSave(JSON.stringify(remote))
      const at = new Date().toISOString()
      localStorage.setItem(GH_SYNCED_AT_KEY, at)
      setSt((s) => ({ ...s, busy: null, syncedAt: at, message: { kind: 'ok', text: '已从云端恢复。' } }))
    } catch (e) {
      setSt((s) => ({ ...s, busy: null, message: { kind: 'err', text: e instanceof Error ? e.message : String(e) } }))
    }
  }

  return (
    <section className="cloudsync" aria-label="GitHub 云端存档">
      <h4 className="side-title">云端存档 · GitHub</h4>
      {!connected ? (
        <>
          <p className="cloudsync__hint">
            生成一个只勾 <code>gist</code> 权限的{' '}
            <a href="https://github.com/settings/tokens/new?scopes=gist&description=code-isles" target="_blank" rel="noreferrer">
              Personal Access Token
            </a>
            ，粘贴到下面。Token 只保存在你的浏览器，仅用于访问你的 Gist。
          </p>
          <div className="cloudsync__row">
            <input
              className="cloudsync__input"
              type="password"
              value={tokenInput}
              placeholder="ghp_… 或 github_pat_…"
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void connect()
              }}
              aria-label="GitHub Personal Access Token"
            />
            <button className="side-btn side-btn--primary" disabled={!tokenInput.trim() || st.busy !== null} onClick={() => void connect()}>
              {st.busy === 'connect' ? '连接中…' : '连接'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="cloudsync__status">
            已连接{st.login ? <strong> {st.login}</strong> : null}
            {st.syncedAt ? <span className="cloudsync__time"> · 上次同步 {st.syncedAt.slice(0, 16).replace('T', ' ')}</span> : null}
          </p>
          <div className="cloudsync__row">
            <button className="side-btn" disabled={st.busy !== null} onClick={() => void upload()}>
              {st.busy === 'upload' ? '上传中…' : '↑ 上传到云端'}
            </button>
            <button className="side-btn" disabled={st.busy !== null} onClick={() => void download()}>
              {st.busy === 'download' ? '下载中…' : '↓ 从云端恢复'}
            </button>
            <button className="side-btn side-btn--danger" onClick={disconnect}>
              断开
            </button>
          </div>
        </>
      )}
      {st.message && (
        <p className={st.message.kind === 'ok' ? 'cloudsync__msg cloudsync__msg--ok' : 'cloudsync__msg cloudsync__msg--err'} role="status">
          {st.message.text}
        </p>
      )}
    </section>
  )
}