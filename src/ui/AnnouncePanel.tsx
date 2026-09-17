import { useEffect, useMemo, useState } from 'react'
import {
  ANN_LAST_READ_KEY,
  loadAnnouncements,
  unreadCount,
  type Announcement,
  type AnnouncementTag,
} from '../core/announcements'

const TAG_LABEL: Record<AnnouncementTag, string> = {
  feature: '新功能',
  fix: '修复',
  notice: '公告',
}

function readLastRead(): string | null {
  try {
    return localStorage.getItem(ANN_LAST_READ_KEY)
  } catch {
    return null
  }
}

/**
 * 右侧公告栏：运行时抓取 /announcements.json（可配置 remoteUrl 指向公开 Gist，
 * 站长改 Gist 即可发公告，无需重新部署），失败回退内置列表。
 * 已读记录存 localStorage，新公告有高亮 + 未读计数。
 */
export function AnnouncePanel() {
  const [list, setList] = useState<readonly Announcement[]>([])
  const [fromRemote, setFromRemote] = useState(false)
  const [lastRead, setLastRead] = useState<string | null>(() => readLastRead())

  useEffect(() => {
    let alive = true
    loadAnnouncements(import.meta.env.BASE_URL, fetch).then((r) => {
      if (!alive) return
      setList(r.list)
      setFromRemote(r.fromRemote)
    })
    return () => {
      alive = false
    }
  }, [])

  const unread = useMemo(() => unreadCount(list, lastRead), [list, lastRead])

  const markAllRead = () => {
    const now = new Date().toISOString()
    try {
      localStorage.setItem(ANN_LAST_READ_KEY, now)
    } catch {
      // 隐私模式：本次会话内仍然生效
    }
    setLastRead(now)
  }

  return (
    <aside className="announce" aria-label="更新公告">
      <header className="announce__head">
        <h4 className="side-title">
          更新公告
          {unread > 0 && <span className="announce__badge">{unread}</span>}
        </h4>
        {unread > 0 && (
          <button className="side-btn side-btn--mini" onClick={markAllRead}>
            全部已读
          </button>
        )}
      </header>
      {list.length === 0 ? (
        <p className="announce__empty">暂无公告。</p>
      ) : (
        <ul className="announce__list">
          {list.map((a) => {
            const isNew = unreadCount([a], lastRead) > 0
            return (
              <li key={a.id} className={`announce__item${isNew ? ' announce__item--new' : ''}`}>
                <p className="announce__meta">
                  <span className={`announce__tag announce__tag--${a.tag}`}>{TAG_LABEL[a.tag] ?? '公告'}</span>
                  <time dateTime={a.date}>{a.date}</time>
                  {isNew && <span className="announce__new">NEW</span>}
                </p>
                <p className="announce__title">{a.title}</p>
                {a.body && <p className="announce__body">{a.body}</p>}
              </li>
            )
          })}
        </ul>
      )}
      {fromRemote && <p className="announce__src">● 已同步最新公告</p>}
    </aside>
  )
}