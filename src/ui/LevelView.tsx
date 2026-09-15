import { useState } from 'react'
import type { LevelDef } from '../content/course'
import { useGameStore } from '../core/store'
import type { RewardInfo } from '../core/progress'
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
  const [reward, setReward] = useState<RewardInfo | null>(null)

  const restart = () => {
    setPhase('learn')
    setQIndex(0)
    setWrong(0)
    setReward(null)
  }

  const finish = () => {
    setReward(completeLevel(regionId, level.id, { xp: level.xp, gold: level.gold }))
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
            onAnswer={(correct) => {
              if (!correct) setWrong((w) => w + 1)
            }}
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
          <p className="result-sub">
            答对 {level.questions.length - wrong}/{level.questions.length} 题
          </p>
          <div className="reward-row">
            <span>+{reward.xp} XP</span>
            <span>+{reward.gold} 金币</span>
          </div>
          {!reward.firstClear && <p className="result-note">复习模式：奖励按 25% 发放。</p>}
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
