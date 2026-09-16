import { useEffect, useState } from 'react'
import { audio } from '../core/audio'
import { PixelButton } from './PixelButton'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * 打赏弹窗。
 *
 * 收款码以「相对路径字符串」运行时加载，故意不 import 进 JS 包：
 * 这样后续替换二维码时，只需把新的 alipay.png 丢进发布目录并重新部署，
 * 无需重新构建 JS——Cloudflare Pages 复制静态文件即生效。
 *
 * 占位策略：图片加载失败（onError，例如收款码尚未就位）时，回退到内联占位卡，
 * 而不是显示裂图，保证任意阶段观感都完整。
 */
const QR_SRC = './donate/alipay.png'

export function DonateModal({ open, onClose }: Props) {
  const [qrError, setQrError] = useState(false)

  // 每次打开重置错误态，避免上一次 404 残留成永久裂图。
  useEffect(() => {
    if (open) {
      setQrError(false)
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
        <div className="donate-qr">
          {qrError ? (
            <div className="donate-qr__placeholder" aria-label="收款码即将上线">
              <span className="donate-qr__placeholder-line">收款码</span>
              <span className="donate-qr__placeholder-line">即将上线</span>
            </div>
          ) : (
            <img
              src={QR_SRC}
              alt="支付宝收款码"
              className="donate-qr__img"
              onError={() => setQrError(true)}
            />
          )}
        </div>
        <p className="donate-note">
          扫码打赏，支持群岛继续扩建新课程。金额随意、心意最重要——你的每一枚金币都让下一座岛屿更早浮出水面。
        </p>
        <div className="row row--center">
          <PixelButton variant="ghost" onClick={onClose}>
            心领了
          </PixelButton>
        </div>
      </div>
    </div>
  )
}
