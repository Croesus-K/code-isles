import { useMemo, useState } from 'react'
import type { CourseDef } from '../content/course'
import type { SaveData } from '../core/save/schema'
import { useGameStore } from '../core/store'
import { audio } from '../core/audio'
import { buildChallengeQueue, CHALLENGE_DEFAULT_COUNT, challengePoolSize } from '../core/challenge-queue'
import { PixelPanel } from './PixelPanel'
import { PixelButton } from './PixelButton'
import { QuizQuestion } from './QuizQuestion'

interface Props {
  course: CourseDef
  save: SaveData
  onExit: () => void
}

/**
 * 综合挑战模式：从「已通关关卡的全部题目」随机抽 10 道。
 *
 * 与复习模式（ReviewSessionView）的区别：
 *  - 题源：复习只走错题本；挑战走通关题池，错过没进错题本的题也能再次作答。
 *  - 奖励：复习模式不奖励 XP / 金币；挑战模式有少量奖励（2 XP / 题，鼓励复盘）。
 *  - 错题记录：复习模式会刷新错题 attempts；挑战模式不污染错题本。
 *  - 跳过：不计入错题，但仍可重新挑战同一批（重新随机洗牌）。
 *
 * 流程：进入 → 随机抽 10 道 → 顺序作答 → 结算页（答对 / 答错 / 跳过统计 + XP）
 */
export function ChallengeView({ course, save, onExit }: Props) {
  const recordCorrect = useGameStore((s) => s.recordCorrect)
  const addXp = useGameStore((s) => s.addXp)

  const poolSize = challengePoolSize(save, course)
  const [seed, setSeed] = useState(0)

  // 进入 / 「换一组」时洗牌取新题
  const queue = useMemo(
    () => buildChallengeQueue(save, course, CHALLENGE_DEFAULT_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [course.id, save.regions, seed],
  )
  const total = queue.length

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const [earnedXp, setEarnedXp] = useState(0)

  const current = !finished && index < total ? queue[index] : null
  const done = finished || index >= total

  const finish = () => {
    setFinished(true)
    audio.play(correctCount === total ? 'levelClear' : 'correct')
  }

  const goNext = () => {
    if (index + 1 >= total) finish()
    else setIndex(index + 1)
  }

  const reshuffle = () => {
    audio.play('click')
    setSeed((s) => s + 1)
    setIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setSkippedCount(0)
    setStreak(0)
    setFinished(false)
    setEarnedXp(0)
  }

  const handleAnswer = (correct: boolean) => {
    if (!current) return
    if (correct) {
      // 综合挑战答对：记录到日统计（不污染错题本）+ 奖励少量 XP
      recordCorrect()
      addXp(2)
      setCorrectCount((c) => c + 1)
      setEarnedXp((x) => x + 2)
      const next = streak + 1
      setStreak(next)
      audio.play(next >= 2 ? 'combo' : 'correct')
    } else {
      setWrongCount((w) => w + 1)
      setStreak(0)
      audio.play('wrong')
    }
  }

  const handleSkip = () => {
    setSkippedCount((s) => s + 1)
    setStreak(0)
    audio.play('click')
    goNext()
  }

  // 题池为空：所有 region 都没通关
  if (poolSize === 0) {
    return (
      <>
        <div className="crumbs">
          <button className="crumb-btn" onClick={onExit}>← 返回世界地图</button>
          <span>／ 综合挑战</span>
        </div>
        <PixelPanel title="🏆 综合挑战" className="challenge-empty">
          <p className="challenge-empty__text">
            需要至少通关一关才能进入综合挑战。先去世界地图打几关吧！
          </p>
          <div className="row row--center">
            <PixelButton onClick={onExit}>返回世界地图</PixelButton>
          </div>
        </PixelPanel>
      </>
    )
  }

  // 进入时题目数太少（例如只通关了 1-1），给出提示而不是 0 道题
  if (total === 0) {
    return (
      <>
        <div className="crumbs">
          <button className="crumb-btn" onClick={onExit}>← 返回世界地图</button>
          <span>／ 综合挑战</span>
        </div>
        <PixelPanel title="🏆 综合挑战" className="challenge-empty">
          <p className="challenge-empty__text">
            题目池里有 {poolSize} 道题，但还不到挑战门槛。继续通关更多关卡再来挑战吧。
          </p>
        </PixelPanel>
      </>
    )
  }

  const currentNumber = !done ? index + 1 : total

  return (
    <>
      <div className="crumbs">
        <button className="crumb-btn" onClick={onExit}>← 退出挑战</button>
        <span>／ 综合挑战 · {currentNumber} / {total} 题</span>
      </div>

      {!done && current && (
        <>
          <PixelPanel title="🏆 综合挑战" className="challenge-banner">
            <p className="challenge-banner__text">
              从已通关的 <strong>{poolSize}</strong> 道题里随机抽 {total} 道来战。
              答对 +2 XP；答错不计奖励但不影响错题本；可随时跳过。
            </p>
            <p className="challenge-banner__source">
              当前题：<strong>{current.regionName}</strong> · {current.levelName}
            </p>
          </PixelPanel>
          <PixelPanel title={current.question.kind === 'fill' ? '代码填空' : '知识挑战'}>
            <QuizQuestion
              key={current.questionKey}
              question={current.question}
              index={index}
              total={total}
              combo={streak}
              onAnswer={handleAnswer}
              onHintUsed={() => audio.play('buy')}
              onNext={goNext}
            />
            <div className="row row--center challenge-skip">
              <PixelButton variant="ghost" onClick={handleSkip}>跳过此题</PixelButton>
              <PixelButton variant="ghost" onClick={reshuffle}>换一组</PixelButton>
            </div>
          </PixelPanel>
        </>
      )}

      {done && (
        <PixelPanel title="综合挑战结算" className="challenge-result">
          <p className="challenge-result__big">
            {wrongCount === 0
              ? '🏆 全对！综合挑战达人！'
              : correctCount > wrongCount
                ? '🎉 表现出色！'
                : '完成挑战'}
          </p>
          <p className="challenge-result__stats">
            答对 <strong className="ok">{correctCount}</strong> · 答错{' '}
            <strong className="bad">{wrongCount}</strong> · 跳过{' '}
            <strong>{skippedCount}</strong> / 共 {total} 题
          </p>
          <p className="challenge-result__xp">
            获得 XP <strong className="gold">+{earnedXp}</strong>
          </p>
          <div className="row row--center">
            <PixelButton onClick={reshuffle}>再来一组</PixelButton>
            <PixelButton variant="ghost" onClick={onExit}>返回世界地图</PixelButton>
          </div>
        </PixelPanel>
      )}
    </>
  )
}