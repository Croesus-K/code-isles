import { useState } from 'react'
import type { LevelDef } from '../content/course'
import { comboBonus, computeStars, type RewardInfo } from '../core/progress'
import { useGameStore } from '../core/store'
import { PixelButton } from './PixelButton'
import { PixelPanel } from './PixelPanel'
import { QuizQuestion } from './QuizQuestion'

interface Props {
  regionId: string
  level: LevelDef
  onBack: () => void
}

type Phase = 'learn' | 'quiz' | 'result'

export function LevelView({ regionId, level, onBack }: Props) {
  const completeLevel = useGameStore((s) => s.completeLevel)
  const [phase, setPhase] = useState<Phase>('learn')
  const [qIndex, setQIndex] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [hints, setHints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bonus, setBonus] = useState(0)
  const [reward, setReward] = useState<(RewardInfo & { stars: number }) | null>(null)

  const restart = () => {
    setPhase('learn')
    setQIndex(0)
    setWrong(0)
    setHints(0)
    setStreak(0)
    setBonus(0)
    setReward(null)
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      const next = streak + 1
      setStreak(next)
      const b = comboBonus(next)
      if (b > 0) setBonus((v) => v + b)
    } else {
      setStreak(0)
    }
  }

  const finish = () => {
    const stars = computeStars(wrong, hints)
    const r = completeLevel(regionId, level.id, { xp: level.xp, gold: level.gold }, {
      stars,
      bonusGold: bonus,
    })
    setReward(r)
    setPhase('result')
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
            <PixelButton onClick={() => setPhase('quiz')}>
              开始挑战（{level.questions.length} 题）
            </PixelButton>
          </div>
        </PixelPanel>
      )}

      {phase === 'quiz' && (
        <PixelPanel title={level.boss ? '⚔ Boss 挑战' : '知识挑战'}>
          <QuizQuestion
            question={level.questions[qIndex]}
            index={qIndex}
            total={level.questions.length}
            combo={streak}
            onAnswer={(correct) => {
              if (!correct) setWrong((w) => w + 1)
              handleAnswer(correct)
            }}
            onHintUsed={() => setHints((h) => h + 1)}
            onNext={() => {
              if (qIndex + 1 < level.questions.length) setQIndex(qIndex + 1)
              else finish()
            }}
          />
        </PixelPanel>
      )}

      {phase === 'result' && reward && (
        <PixelPanel title="结算">
          <p className="result-big">{level.boss ? '区域攻破！' : '通关！'}</p>
          <p className="star-row">
            {'★'.repeat(reward.stars)}
            {'☆'.repeat(3 - reward.stars)}
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
          <div className="row row--center">
            <PixelButton onClick={onBack}>返回区域</PixelButton>
            <PixelButton variant="ghost" onClick={restart}>
              再刷一次
            </PixelButton>
          </div>
        </PixelPanel>
      )}
    </>
  )
}
