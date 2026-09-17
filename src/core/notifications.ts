/**
 * 错题本每日提醒 —— 利用 Notification API 在用户首次打开 App 时提醒一次
 *
 * 触发条件：
 *   - 浏览器支持 Notification
 *   - wrongAnswers 至少 1 道
 *   - 今日（本地日期）还没提醒过
 *
 * 设计取舍：
 *   - 仅在 world scene 触发，不在 game scene 打断玩家
 *   - 用 localStorage 的独立 key `ci-lastNotifyDate`（不污染 save schema）
 *   - 用户拒绝权限 → 静默放弃，不再追问
 */

const LAST_NOTIFY_KEY = 'ci-lastNotifyDate'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function shouldNotifyToday(): boolean {
  try {
    const last = localStorage.getItem(LAST_NOTIFY_KEY)
    if (last === todayStr()) return false
  } catch {
    return false
  }
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
}

export function markNotifiedToday(): void {
  try {
    localStorage.setItem(LAST_NOTIFY_KEY, todayStr())
  } catch {
    /* localStorage 满 / 隐私模式 — 静默失败 */
  }
}

/** 触发一次错题提醒通知（无副作用、可重复调用） */
export function fireWrongBookReminder(wrongCount: number): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    new Notification('代码群岛 · 错题本提醒', {
      body: `你有 ${wrongCount} 道题待巩固，打开 App 一键复习吧！`,
      tag: 'wrongbook-daily',
      silent: false,
    })
    markNotifiedToday()
  } catch {
    /* 部分浏览器对非用户手势触发的 Notification 抛错 — 静默忽略 */
  }
}

/** 请求浏览器通知权限（如未授权），用户拒绝时返回 'denied' 不再追问 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}
