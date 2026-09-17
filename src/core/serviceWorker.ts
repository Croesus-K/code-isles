/**
 * Service Worker 注册 + 状态订阅。
 *
 * 设计目标：
 * - 只在浏览器支持且非 dev（HMR 时 vite 自己管理 SW，避免冲突）时启用
 * - 提供 onNeedUpdate / onOffline / onOnline 三个回调，让 App 在 UI 给出反馈
 * - 通过 controller.postMessage('SKIP_WAITING') 让用户主动触发新版切换
 */

export type SwState = {
  /** true = SW 检测到新版本，等待用户确认 */
  needUpdate: boolean
  /** true = navigator.onLine === false（断网）*/
  offline: boolean
}

type Listener = (state: SwState) => void

let state: SwState = { needUpdate: false, offline: false }
const listeners = new Set<Listener>()

function notify() {
  for (const l of listeners) l(state)
}

export function subscribeSw(listener: Listener): () => void {
  listeners.add(listener)
  listener(state)
  return () => {
    listeners.delete(listener)
  }
}

/** 让 SW 立即进入 activate 状态；调用后页面需要重新加载以使用新资源。 */
export function applyUpdate(): void {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
  }
}

/** 浏览器断网 / 恢复在线监听（外部组件也可单独用 window.addEventListener） */
function wireOnlineEvents() {
  if (typeof window === 'undefined') return
  state = { ...state, offline: !navigator.onLine }
  window.addEventListener('online', () => {
    state = { ...state, offline: false }
    notify()
  })
  window.addEventListener('offline', () => {
    state = { ...state, offline: true }
    notify()
  })
  notify()
}

/**
 * 注册 SW。返回的 Promise resolve 时表示注册已发出（不一定已激活）。
 * 生产构建才注册：dev server 上 vite HMR 会与 SW 抢缓存，反而难调试。
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  // Vite dev 时 import.meta.env.DEV === true；vite preview + 静态托管时 === false
  if (import.meta.env?.DEV) return

  wireOnlineEvents()

  // load 事件后注册，避免首屏加载被 SW 拦截抢走关键资源
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then((reg) => {
        // 已有 SW 在 waiting → 提示用户
        if (reg.waiting) {
          state = { ...state, needUpdate: true }
          notify()
        }
        // 监听新版本安装完成
        reg.addEventListener('updatefound', () => {
          const newSw = reg.installing
          if (!newSw) return
          newSw.addEventListener('statechange', () => {
            if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
              state = { ...state, needUpdate: true }
              notify()
            }
          })
        })
      })
      .catch(() => {
        // 注册失败静默：浏览器禁用 SW / 跨域 / 文件协议——都不影响功能
      })
  })
}