import { useEffect, useState } from 'react'
import type { LevelDef } from '../content/course'
import { comboBonus, computeStars, type RewardInfo } from '../core/progress'
import { pythonBasics } from '../content/python-basics'
import { useGameStore } from '../core/store'
import { earnedBadgeIds } from '../core/badges'
import { BADGE_INDEX } from '../content/badges'
import { audio } from '../core/audio'
import { PixelButton } from './PixelButton'
import { PixelPanel } from './PixelPanel'
import { QuizQuestion } from './QuizQuestion'
import { Toast } from './Toast'

interface Props {
  regionId: string
  level: LevelDef
  onBack: () => void
}

type Phase = 'learn' | 'quiz' | 'result'

export function LevelView({ regionId, level, onBack }: Props) {
  const completeLevel = useGameStore((s) => s.completeLevel)
  const recordWrongAnswer = useGameStore((s) => s.recordWrongAnswer)
  const recordCorrect = useGameStore((s) => s.recordCorrect)
  const removeFromWrongAnswers = useGameStore((s) => s.removeFromWrongAnswers)
  const addToReviewQueue = useGameStore((s) => s.addToReviewQueue)
  const [phase, setPhase] = useState<Phase>('learn')
  const [qIndex, setQIndex] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [hints, setHints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bonus, setBonus] = useState(0)
  const [reward, setReward] = useState<(RewardInfo & { stars: number }) | null>(null)
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)

  // R 键：把当前题加入复习队列（不影响日统计 'wrong'）
  // 仅在 quiz phase 生效；input/button 焦点时不抢键
  useEffect(() => {
    if (phase !== 'quiz') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'r' && e.key !== 'R') return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.target as HTMLElement | null)?.isContentEditable) return
      e.preventDefault()
      const qk = `${regionId}:${level.id}:${qIndex}`
      const attempts = addToReviewQueue(qk)
      audio.play('click')
      setToast(`✓ 已加入复习队列（累计 ${attempts} 次）`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, regionId, level.id, qIndex, addToReviewQueue])

  const restart = () => {
    audio.play('click')
    setPhase('learn')
    setQIndex(0)
    setWrong(0)
    setHints(0)
    setStreak(0)
    setBonus(0)
    setReward(null)
    setNewBadges([])
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      const next = streak + 1
      setStreak(next)
      const b = comboBonus(next)
      if (b > 0) {
        setBonus((v) => v + b)
        audio.play('combo')
      } else {
        audio.play('correct')
      }
    } else {
      setStreak(0)
      audio.play('wrong')
    }
  }

  const finish = () => {
    const stars = computeStars(wrong, hints)
    const before = useGameStore.getState().save
    const earnedBefore = new Set(before.badges ?? [])
    const r = completeLevel(
      regionId,
      level.id,
      { xp: level.xp, gold: level.gold },
      { stars, bonusGold: bonus },
      pythonBasics,
    )
    // 全对通关：把本关所有题移出错题本（用户已经掌握）
    if (wrong === 0) {
      for (let i = 0; i < level.questions.length; i++) {
        removeFromWrongAnswers(`${regionId}:${level.id}:${i}`)
      }
    }
    const after = useGameStore.getState().save
    const earnedNow = earnedBadgeIds(after, pythonBasics)
    const fresh = earnedNow.filter((id) => !earnedBefore.has(id))
    setReward(r)
    setNewBadges(fresh)
    setPhase('result')
    audio.play('levelClear')
  }

  return (
    <>
      <div className="crumbs">
        <button className="crumb-btn" onClick={onBack}>
          ← 返回区域
        </button>
        <span>
          ／ {level.id} {level.name}
        </span>
      </div>

      {phase === 'learn' && (
        <PixelPanel title={`学习卡 · ${level.learn.title}`}>
          <div className="learn-card">
            {level.learn.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {level.learn.code ? <pre className="code-block">{level.learn.code}</pre> : null}
          </div>
          <div className="row row--center">
            <PixelButton
              onClick={() => {
                audio.play('click')
                setPhase('quiz')
              }}
            >
              开始挑战（{level.questions.length} 题）
            </PixelButton>
          </div>
        </PixelPanel>
      )}

      {phase === 'quiz' && (
        <PixelPanel title={level.boss ? '⚔ Boss 挑战' : '知识挑战'}>
          <QuizQuestion
            // key 强制换题时重挂载：清掉选项选中态/解释/提示/填空输入等内部 state，
            // 否则上一题的作答状态会泄漏进下一题（跳题还可能被误判为答对）
            key={`${regionId}:${level.id}:${qIndex}`}
            question={level.questions[qIndex]}
            index={qIndex}
            total={level.questions.length}
            combo={streak}
            onAnswer={(correct) => {
              if (!correct) {
                setWrong((w) => w + 1)
                recordWrongAnswer(`${regionId}:${level.id}:${qIndex}`)
              } else {
                recordCorrect()
              }
              handleAnswer(correct)
            }}
            onHintUsed={() => {
              audio.play('buy')
              setHints((h) => h + 1)
            }}
            onNext={() => {
              if (qIndex + 1 < level.questions.length) setQIndex(qIndex + 1)
              else finish()
            }}
          />
          <p className="shortcut-hint">按 <kbd>R</kbd> 把当前题加入复习队列（不影响战绩）</p>
        </PixelPanel>
      )}

      {phase === 'result' && reward && (
        <PixelPanel title="结算" className="result-panel result-panel--in">
          <p className="result-big">{level.boss ? '区域攻破！' : '通关！'}</p>
          <p className="star-row" aria-label={`获得 ${reward.stars} 星`}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`star-item ${i < reward.stars ? 'star-item--on' : 'star-item--off'}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {i < reward.stars ? '★' : '☆'}
              </span>
            ))}
          </p>
          <p className="result-sub">
            答对 {level.questions.length - wrong}/{level.questions.length} 题 · 用了 {hints} 次提示
          </p>
          <div className="reward-row">
            <span>+{reward.xp} XP</span>
            <span>+{reward.gold} 金币</span>
          </div>
          {bonus > 0 && <p className="result-note">含连击加成 +{bonus} 金币。</p>}
          {!reward.firstClear && <p className="result-note">复习模式：奖励按 25% 发放。星级只升不降。</p>}

          {newBadges.length > 0 && (
            <div className="badge-unlock" role="status" aria-live="polite">
              <p className="badge-unlock__title">🏆 获得新徽章</p>
              <ul className="badge-unlock__list">
                {newBadges.map((id, i) => {
                  const def = BADGE_INDEX[id]
                  return (
                    <li
                      key={id}
                      className="badge-unlock__item"
                      style={{ animationDelay: `${i * 140}ms` }}
                    >
                      <span className="badge-unlock__icon">{def?.icon ?? '🏅'}</span>
                      <span className="badge-unlock__name">{def?.name ?? id}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="row row--center">
            <PixelButton
              onClick={() => {
                audio.play('click')
                onBack()
              }}
            >
              返回区域
            </PixelButton>
            <PixelButton variant="ghost" onClick={restart}>
              再刷一次
            </PixelButton>
          </div>
        </PixelPanel>
      )}
      <Toast message={toast} />
    </>
  )
}
