/**
 * 代码群岛 Code Isles · Service Worker
 *
 * 策略：
 * - precache：app shell（index.html、favicon、manifest）
 * - navigation fallback：网络失败时回退到缓存的 index.html（保证离线打开也能加载 SPA）
 * - static assets：stale-while-revalidate（fonts / JS / CSS），命中即放行缓存，
 *   异步刷新到缓存以便下次拿到新版
 * - 跨域 / 非 GET / Chrome extension 请求直接放行，不缓存
 *
 * 版本策略：每次构建手动 bump CACHE_VERSION，旧 cache 在 activate 时清除。
 * 不引入 Workbox 是为了让 SW 逻辑保持可读（<100 行）且零依赖。
 */
/* eslint-disable no-restricted-globals */
// 更新部署时必须 bump：activate 靠"版本名不同"清理旧缓存，同名永不清理
const CACHE_VERSION = 'code-isles-v6'
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
  )
  // 让新版 SW 立刻接管页面（下次 navigation 由新 SW 控制；当前页面依赖 skipWaiting + clients.claim）
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  // 只处理同源 GET；其它（POST / 跨域 / chrome-extension://）直接放行
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // SPA navigation + index.html 壳（含 PJAX/预取等非 navigate 拉取）：一律网络优先，
  // 失败才回退缓存 —— 部署新版后绝不能让旧壳把旧 hash 的 JS/CSS 再带回来
  const isHtmlShell =
    req.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html')
  if (isHtmlShell) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // 顺便把最新 index.html 写进缓存（动态 precache）
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res
        })
        .catch(() =>
          caches.match(req).then(
            (cached) => cached || caches.match('./index.html'),
          ),
        ),
    )
    return
  }

  // 静态资源：stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(req)
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(req, res.clone()).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})

// 允许页面主动调用 navigator.serviceWorker.controller.postMessage({type:'SKIP_WAITING'})
// 在新版部署后让用户点"立即刷新"按钮触发
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})