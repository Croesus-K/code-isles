import { useEffect, useState } from 'react'

interface Props {
  message: string | null
  /** 自动消失时间（ms）。0 = 不自动消失。默认 1800。 */
  autoHideMs?: number
}

/**
 * 轻量 toast：父组件传 message，message 变化时显示 autoHideMs 毫秒后自动清空。
 * 父组件传 null/空 隐藏。建议一个 view 放一个，key 不同即可堆叠多条。
 *
 * 设计取舍：
 * - 不用全局 Context/Store —— 一两个 view 用得着，本地 state 足够
 * - role=status：屏幕阅读器自动播报，不抢焦点
 * - aria-live=polite：不打断当前播报
 */
export function Toast({ message, autoHideMs = 1800 }: Props) {
  const [shown, setShown] = useState<string | null>(null)
  useEffect(() => {
    if (!message) {
      setShown(null)
      return
    }
    setShown(message)
    if (autoHideMs > 0) {
      const id = setTimeout(() => setShown(null), autoHideMs)
      return () => clearTimeout(id)
    }
  }, [message, autoHideMs])
  if (!shown) return null
  return (
    <div className="toast" role="status" aria-live="polite">
      {shown}
    </div>
  )
}
