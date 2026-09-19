import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { audio } from '../core/audio'
import { maskKey } from '../core/secret-key'
import { PixelButton } from './PixelButton'

interface Props {
  open: boolean
  onClose: () => void
  /** 已兑换的规范密钥（存档里读到什么就传什么；undefined = 未解锁） */
  secretKey?: string
  /** 兑换回调（调服务端校验）：'ok' = 通过；'bad' = 密钥不在册；'network' = 网络问题 */
  onRedeem: (key: string) => Promise<'ok' | 'bad' | 'network'>
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
 *
 * 密钥解锁：打赏后向作者索取专属密钥（ISLE-XXXX-XXXX-XXXX），在下方
 * 输入框兑换即可解锁隐藏岛屿「秘境岛」。校验离线完成（见 core/secret-key.ts）。
 */
const DONATE_URL = ''

/** 弹窗内可聚焦元素选择器：聚焦管理 + Tab 循环用 */
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function DonateModal({ open, onClose, secretKey, onRedeem }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [keyInput, setKeyInput] = useState('')
  const [keyState, setKeyState] = useState<'idle' | 'submitting' | 'ok' | 'err' | 'net'>('idle')

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

  const submitKey = (e: FormEvent) => {
    e.preventDefault()
    if (keyState === 'submitting') return
    setKeyState('submitting')
    void onRedeem(keyInput)
      .then((result) => {
        if (result === 'ok') {
          setKeyState('ok')
          setKeyInput('')
          audio.play('levelClear')
        } else {
          setKeyState(result === 'network' ? 'net' : 'err')
          audio.play('wrong')
        }
      })
      .catch(() => {
        setKeyState('net')
        audio.play('wrong')
      })
  }

  return (
    // role="dialog" + aria-modal="true" 已声明为可交互弹窗；eslint 无法推断故显式禁用
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="donate-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="打赏作者"
      tabIndex={-1}
    >
      {/* card 是 overlay 的子节点，stopPropagation 防冒泡关闭；div 上无 role 故需禁用此条 */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className="donate-card donate-card--wide"
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
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

        <div className="donate-key" aria-label="秘境岛密钥解锁">
          <div className="donate-key__divider" aria-hidden="true">
            <span>🗝 已有专属密钥？</span>
          </div>
          <p className="donate-key__note">
            打赏后向作者索取专属密钥，在此兑换即可解锁隐藏学习项目
            <strong>「秘境岛」</strong>——与四门语言课程平级的独立岛屿。
          </p>
          {keyState === 'ok' && (
            <p className="donate-key__msg donate-key__msg--ok" role="status">
              ✨ 解锁成功！到左侧课程菜单切换到「秘境岛」看看。
            </p>
          )}
          {keyState === 'err' && (
            <p className="donate-key__msg donate-key__msg--err" role="alert">
              密钥不对——检查一下大小写、连字符，或联系作者确认。
            </p>
          )}
          {keyState === 'net' && (
            <p className="donate-key__msg donate-key__msg--err" role="alert">
              网络不给力，没能连上验证服务器——稍后再试一次。
            </p>
          )}
          <form className="donate-key__row" onSubmit={submitKey}>
            <input
              className="donate-key__input"
              type="text"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value)
                if (keyState !== 'idle' && keyState !== 'submitting') setKeyState('idle')
              }}
              placeholder={secretKey ? maskKey(secretKey) : 'ISLE-XXXX-XXXX-XXXX'}
              aria-label="专属密钥"
              spellCheck={false}
              autoComplete="off"
            />
            <PixelButton variant="primary" disabled={keyState === 'submitting' || keyInput.trim().length === 0}>
              {keyState === 'submitting' ? '验证中…' : '解锁'}
            </PixelButton>
          </form>
        </div>

        <div className="row row--center">
          <PixelButton onClick={goSponsor} disabled={!DONATE_URL}>
            {DONATE_URL ? '前往赞助' : '赞助页开发中'}
          </PixelButton>
          <PixelButton variant="ghost" onClick={onClose}>
            关闭
          </PixelButton>
        </div>
      </div>
    </div>
  )
}
