import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// node 环境无 localStorage / Notification；用内存 Map + stub Global 模拟
const memoryStore = new Map<string, string>()
const fakeLocalStorage = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => void memoryStore.set(k, v),
  removeItem: (k: string) => void memoryStore.delete(k),
  clear: () => memoryStore.clear(),
  key: (i: number) => Array.from(memoryStore.keys())[i] ?? null,
  get length() {
    return memoryStore.size
  },
}

class FakeNotification {
  static permission: NotificationPermission = 'default'
  static requestPermission = vi.fn(async () => 'granted' as NotificationPermission)
  constructor(_title: string, _opts?: NotificationOptions) {
    /* no-op */
  }
}

describe('notifications', () => {
  beforeEach(() => {
    memoryStore.clear()
    vi.stubGlobal('localStorage', fakeLocalStorage)
    vi.stubGlobal('Notification', FakeNotification)
    FakeNotification.permission = 'default'
    FakeNotification.requestPermission = vi.fn(async () => 'granted' as NotificationPermission)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shouldNotifyToday 默认无 storage 时为 false（无权限）', async () => {
    const { shouldNotifyToday } = await import('../src/core/notifications')
    expect(shouldNotifyToday()).toBe(false)
  })

  it('shouldNotifyToday 已授权 + 今日未标记时为 true', async () => {
    const { shouldNotifyToday } = await import('../src/core/notifications')
    FakeNotification.permission = 'granted'
    expect(shouldNotifyToday()).toBe(true)
  })

  it('shouldNotifyToday 今日已标记时为 false', async () => {
    const { markNotifiedToday, shouldNotifyToday } = await import('../src/core/notifications')
    FakeNotification.permission = 'granted'
    markNotifiedToday()
    expect(shouldNotifyToday()).toBe(false)
    expect(memoryStore.get('ci-lastNotifyDate')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('fireWrongBookReminder 已授权 + 调用后标记今日', async () => {
    const { fireWrongBookReminder, shouldNotifyToday } = await import('../src/core/notifications')
    FakeNotification.permission = 'granted'
    const ctor = vi.fn()
    class SpyNotif {
      static permission: NotificationPermission = 'granted'
      static requestPermission = vi.fn()
      constructor(t: string, o?: NotificationOptions) {
        ctor(t, o)
      }
    }
    vi.stubGlobal('Notification', SpyNotif)
    fireWrongBookReminder(5)
    expect(ctor).toHaveBeenCalledOnce()
    expect(ctor.mock.calls[0][0]).toContain('错题本提醒')
    expect(ctor.mock.calls[0][1].body).toContain('5 道题')
    expect(shouldNotifyToday()).toBe(false) // 已标记今日
  })

  it('fireWrongBookReminder 未授权时静默不调', async () => {
    const { fireWrongBookReminder } = await import('../src/core/notifications')
    FakeNotification.permission = 'denied'
    const ctor = vi.fn()
    class DeniedNotif {
      static permission: NotificationPermission = 'denied'
      static requestPermission = vi.fn()
      constructor() {
        ctor()
      }
    }
    vi.stubGlobal('Notification', DeniedNotif)
    fireWrongBookReminder(3)
    expect(ctor).not.toHaveBeenCalled()
  })

  it('requestNotificationPermission 返回当前 permission', async () => {
    const { requestNotificationPermission } = await import('../src/core/notifications')
    FakeNotification.permission = 'granted'
    expect(await requestNotificationPermission()).toBe('granted')
    FakeNotification.permission = 'denied'
    expect(await requestNotificationPermission()).toBe('denied')
  })
})
