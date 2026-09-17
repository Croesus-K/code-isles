/**
 * 剪贴板写入：优先 navigator.clipboard.writeText（需要 secure context + 用户手势），
 * 否则降级到「临时 textarea + document.execCommand('copy')」（旧浏览器 / 非 https）。
 * 两条路径都失败时返回 false，由调用方决定提示语。
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 路径 1：现代 Clipboard API
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 权限被拒 / 非安全上下文——尝试降级
    }
  }

  // 路径 2：临时 textarea + execCommand 兜底
  if (typeof document === 'undefined') return false
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  // 防止页面滚动跳到 textarea
  ta.style.position = 'fixed'
  ta.style.top = '0'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}
