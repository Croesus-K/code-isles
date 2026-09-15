/**
 * 8-bit 风格音效合成器。零素材、零网络依赖——全部由 OscillatorNode + GainNode 现场合成。
 *
 * AudioContext 在首次调用 play* 之前**不创建**，以避免浏览器自动播放策略拦截。
 * 静音开关：调用 setEnabled(false) 后所有音效都直接 return，不再触碰 AudioContext。
 *
 * 声效清单（按调用顺序）：
 *  - click     ：超短 click（按钮反馈）— 80 Hz 方波，60ms
 *  - correct   ：上行二音 — C5 → G5 正弦，120ms 间隔
 *  - wrong     ：低短促 — 110 Hz 方波，180ms 带降调
 *  - combo     ：上行琶音 — C5/E5/G5 三连音
 *  - levelClear：胜利四音 — C5/E5/G5/C6
 *  - buy       ：购买提示 — 金币叮 — A5/G5/E5 快收
 */

type SoundName = 'click' | 'correct' | 'wrong' | 'combo' | 'levelClear' | 'buy'

interface AudioEngine {
  play: (name: SoundName) => void
  setEnabled: (on: boolean) => void
  isEnabled: () => boolean
  /** 测试用：强制重置内部状态。 */
  __reset: () => void
}

let ctx: AudioContext | null = null
let enabled = true

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
  } catch {
    ctx = null
  }
  return ctx
}

/**
 * 调度一个 oscillator+envelope；返回触发时间，方便后续音串联。
 * startAt 缺省 = 当前 ctx 时间。
 */
function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  startAt?: number,
  peak = 0.18,
): number {
  const ac = getCtx()
  if (!ac) return 0
  const t0 = startAt ?? ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, t0)
  // 起音 8ms、释音 envelope
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.008)
  gain.gain.setValueAtTime(peak, t0 + Math.max(0.008, duration - 0.04))
  gain.gain.linearRampToValueAtTime(0, t0 + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
  return t0 + duration
}

function play(name: SoundName) {
  if (!enabled) return
  const ac = getCtx()
  if (!ac) return
  // 用户首次交互后，浏览器允许 AudioContext；resume 一下以防挂起态。
  if (ac.state === 'suspended') void ac.resume()
  switch (name) {
    case 'click':
      tone(220, 0.05, 'square', undefined, 0.12)
      break
    case 'correct': {
      const t0 = ac.currentTime
      tone(523.25, 0.12, 'sine', t0)
      tone(783.99, 0.18, 'sine', t0 + 0.1)
      break
    }
    case 'wrong':
      tone(146.83, 0.18, 'square', undefined, 0.2)
      break
    case 'combo': {
      const t0 = ac.currentTime
      tone(523.25, 0.09, 'triangle', t0)
      tone(659.25, 0.09, 'triangle', t0 + 0.08)
      tone(783.99, 0.16, 'triangle', t0 + 0.16)
      break
    }
    case 'levelClear': {
      const t0 = ac.currentTime
      tone(523.25, 0.14, 'square', t0, 0.16)
      tone(659.25, 0.14, 'square', t0 + 0.14, 0.16)
      tone(783.99, 0.14, 'square', t0 + 0.28, 0.16)
      tone(1046.5, 0.32, 'square', t0 + 0.42, 0.18)
      break
    }
    case 'buy': {
      const t0 = ac.currentTime
      tone(880, 0.07, 'triangle', t0, 0.16)
      tone(783.99, 0.07, 'triangle', t0 + 0.06, 0.16)
      tone(659.25, 0.14, 'triangle', t0 + 0.12, 0.16)
      break
    }
  }
}

export const audio: AudioEngine = {
  play,
  setEnabled: (on) => {
    enabled = on
  },
  isEnabled: () => enabled,
  __reset: () => {
    enabled = true
    if (ctx) {
      try {
        ctx.close()
      } catch {
        // ignore
      }
    }
    ctx = null
  },
}