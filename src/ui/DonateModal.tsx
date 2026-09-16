import { useEffect } from 'react'
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

export function DonateModal({ open, onClose }: Props) {
  // 每次打开给一声 click 作开启反馈。
  useEffect(() => {
    if (open) {
      audio.play('click')
    }
  }, [open])

  // Esc 关闭。
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
      <div className="donate-card" onClick={(e) => e.stopPropagation()}>
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
