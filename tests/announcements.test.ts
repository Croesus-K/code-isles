import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ANN_LAST_READ_KEY,
  BUNDLED_ANNOUNCEMENTS,
  loadAnnouncements,
  mergeAnnouncements,
  unreadCount,
  type Announcement,
} from '../src/core/announcements'

const A1: Announcement = { id: 'a1', date: '2026-09-01', tag: 'feature', title: 'T1', body: 'B1' }
const A2: Announcement = { id: 'a2', date: '2026-09-10', tag: 'fix', title: 'T2', body: 'B2' }
const A3: Announcement = { id: 'a3', date: '2026-09-05', tag: 'notice', title: 'T3', body: 'B3' }

describe('mergeAnnouncements', () => {
  it('按日期倒序', () => {
    const merged = mergeAnnouncements([A1, A2, A3], [])
    expect(merged.map((a) => a.id)).toEqual(['a2', 'a3', 'a1'])
  })

  it('id 去重，远端优先', () => {
    const remote: Announcement = { ...A1, title: '远端版标题' }
    const merged = mergeAnnouncements([A1, A2], [remote, A3])
    expect(merged.map((a) => a.id)).toEqual(['a2', 'a3', 'a1'])
    expect(merged.find((a) => a.id === 'a1')!.title).toBe('远端版标题')
  })

  it('非法条目（缺 id / 日期格式错）丢弃', () => {
    const bad1 = { date: '2026-01-01', title: 'x' } as unknown as Announcement
    const bad2 = { id: 'ok-id', date: 'not-a-date', title: 'x' } as unknown as Announcement
    const merged = mergeAnnouncements([A1], [bad1, bad2])
    expect(merged.map((a) => a.id)).toEqual(['a1'])
  })
})

describe('unreadCount', () => {
  it('lastRead 为空 → 全部未读', () => {
    expect(unreadCount([A1, A2], null)).toBe(2)
  })
  it('只数 date 严格大于 lastRead（按天）的条目', () => {
    expect(unreadCount([A1, A2, A3], '2026-09-05T00:00:00Z')).toBe(1) // 只剩 a2
    expect(unreadCount([A1, A2, A3], '2026-09-30T00:00:00Z')).toBe(0)
  })
})

describe('loadAnnouncements', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('fetch 失败 → 回退内置列表', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    const r = await loadAnnouncements('/', fetch)
    expect(r.fromRemote).toBe(false)
    expect(r.list.map((a) => a.id)).toEqual(BUNDLED_ANNOUNCEMENTS.map((a) => a.id))
  })

  it('json 带 announcements → 与内置合并', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ announcements: [A2] }), { status: 200 }),
    ))
    const r = await loadAnnouncements('/', fetch)
    expect(r.fromRemote).toBe(true)
    const ids = r.list.map((a) => a.id)
    expect(ids).toContain('a2')
    expect(ids.length).toBeGreaterThanOrEqual(BUNDLED_ANNOUNCEMENTS.length)
  })

  it('json 带 remoteUrl → 抓取远端并合并，远端同 id 优先', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string | URL) => {
      const u = String(url)
      if (u.includes('announcements.json')) {
        return new Response(JSON.stringify({ remoteUrl: 'https://example.com/gist.json', announcements: [] }), { status: 200 })
      }
      if (u.includes('gist.json')) {
        return new Response(JSON.stringify([{ ...BUNDLED_ANNOUNCEMENTS[0], title: 'Gist 最新标题' }]), { status: 200 })
      }
      throw new Error('unexpected url ' + u)
    }))
    const r = await loadAnnouncements('/', fetch)
    expect(r.fromRemote).toBe(true)
    expect(r.list.find((a) => a.id === BUNDLED_ANNOUNCEMENTS[0]!.id)!.title).toBe('Gist 最新标题')
  })

  it('remoteUrl 抓取失败 → 仍回退（不抛错）', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string | URL) => {
      const u = String(url)
      if (u.includes('announcements.json')) {
        return new Response(JSON.stringify({ remoteUrl: 'https://example.com/gist.json', announcements: [A3] }), { status: 200 })
      }
      throw new Error('network down')
    }))
    const r = await loadAnnouncements('/', fetch)
    expect(r.fromRemote).toBe(true)
    expect(r.list.map((a) => a.id)).toContain('a3')
  })

  it('localStorage 已读键名常量导出（UI 与测试共用，防拼写漂移）', () => {
    expect(ANN_LAST_READ_KEY).toBe('code-isles-ann-last-read')
  })
})