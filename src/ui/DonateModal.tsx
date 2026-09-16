import { useEffect, useRef } from 'react'
import { audio } from '../core/audio'
import { PixelButton } from './PixelButton'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * 打赏弹窗。
 *
 * 接入方式：链接型。赞助页 URL 配在下方 DONATE_URL —— 留空时弹窗显示
 * 「赞助页即将上线」占位，填入爱发电 / GitHub Sponsors 等任意 URL 后，
 * 「前往赞助」按钮即跳转新标签页。无需重新构建 JS（URL 是运行时常量，
 * 但因打包进 JS，换 URL 仍需 rebuild + 同步 dist；二维码方案才是零重建）。
 *
 * 当前 DONATE_URL 为空：占位态上线，等平台定好再填。
 */
const DONATE_URL = ''

/** 弹窗内可聚焦元素选择器：聚焦管理 + Tab 循环用 */
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function DonateModal({ open, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  // 每次打开给一声 click 作开启反馈。
  useEffect(() => {
    if (open) {
      audio.play('click')
    }
  }, [open])

  // 弹窗打开时自动聚焦到首个可聚焦按钮，键盘用户不必先 Tab 一圈。
  useEffect(() => {
    if (!open) return
    const card = cardRef.current
    if (!card) return
    const first = card.querySelector<HTMLElement>(FOCUSABLE)
    // requestAnimationFrame 让 React 先完成 commit 后再聚焦
    const id = requestAnimationFrame(() => first?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  // Escape 关闭 + Tab/Shift+Tab 在弹窗内循环（focus trap）。
  // 用 capture phase + stopPropagation：拦截所有键盘事件，避免题视图（ChoiceView /
  // BugView 监听 window keydown 实现数字键快选）在弹窗打开时收到按键、误触发答题。
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      // 先 stopPropagation 拦所有键，再单独处理 Escape 和 Tab
      e.stopPropagation()
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const card = cardRef.current
      if (!card) return
      const focusables = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      // 焦点已不在弹窗内（被外部偷走）→ 拉回首个
      if (!card.contains(active)) {
        e.preventDefault()
        first.focus()
        return
      }
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey, true) // capture phase
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  if (!open) return null

  const goSponsor = () => {
    audio.play('click')
    if (DONATE_URL) {
      window.open(DONATE_URL, '_blank', 'noopener,noreferrer')
    }
    onClose()
  }

  return (
    <div
      className="donate-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="打赏作者"
    >
      <div className="donate-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <div className="donate-card__title">请冒险者喝杯朗姆酒 🍹</div>
        <div className="donate-body">
          {DONATE_URL ? (
            <p className="donate-note">
              扫码打赏，支持群岛继续扩建新课程。金额随意、心意最重要——你的每一枚金币都让下一座岛屿更早浮出水面。
            </p>
          ) : (
            <div className="donate-placeholder" aria-label="赞助页即将上线">
              <div className="donate-placeholder__icon">💰</div>
              <div className="donate-placeholder__text">赞助页即将上线</div>
              <p className="donate-note">
                支持群岛继续扩建新课程。心意我们已记下，等赞助页就位再来赴约。
              </p>
            </div>
          )}
        </div>
        <div className="row row--center">
          <PixelButton onClick={goSponsor} disabled={!DONATE_URL}>
            {DONATE_URL ? '前往赞助' : '赞助页开发中'}
          </PixelButton>
          <PixelButton variant="ghost" onClick={onClose}>
            心领了
          </PixelButton>
        </div>
      </div>
    </div>
  )
}