import { useMemo, useState } from 'react'
import type { CourseDef, Question } from '../content/course'
import type { SaveData } from '../core/save/schema'
import { useGameStore } from '../core/store'
import { audio } from '../core/audio'
import { PixelPanel } from './PixelPanel'
import { PixelButton } from './PixelButton'
import { QuizQuestion } from './QuizQuestion'

interface Props {
  course: CourseDef
  save: SaveData
  onExit: () => void
}

interface ReviewItem {
  questionKey: string
  question: Question
  /** 第一次入错题本的时间（显示用） */
  wrongAt: string
  attempts: number
}

/**
 * 把 questionKey (`regionId:levelId:questionIndex`) 拆出来，从 course 查回题目。
 * 返回 null = 数据漂移 / 旧 key 失效，由调用方过滤。
 */
function resolveQuestion(
  key: string,
  course: CourseDef,
): { question: Question; regionId: string; levelId: string; questionIndex: number } | null {
  const parts = key.split(':')
  if (parts.length !== 3) return null
  const [regionId, levelId, qIdxStr] = parts
  const region = course.regions.find((r) => r.id === regionId)
  if (!region) return null
  const level = region.levels.find((l) => l.id === levelId)
  if (!level) return null
  const questionIndex = parseInt(qIdxStr, 10)
  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= level.questions.length) {
    return null
  }
  return { question: level.questions[questionIndex], regionId, levelId, questionIndex }
}

/**
 * 复习模式：按 wrongAt 倒序展示错题，答对即移出错题本，答错 +1 attempts。
 * 流程与正常关卡不同：
 *  - 没有 learn 卡（已经学过）
 *  - 没有 XP / 金币 / 星级（纯巩固）
 *  - 错题队列在组件挂载时快照，过程中不再变（用户外部清空不影响本次）
 *  - 答完进 result 屏，可「再来一组」或返回档案
 */
export function ReviewSessionView({ course, save, onExit }: Props) {
  const removeFromWrongAnswers = useGameStore((s) => s.removeFromWrongAnswers)
  const recordWrongAnswer = useGameStore((s) => s.recordWrongAnswer)

  // 错题快照：进入复习时一次性解析完，过程中不再随存档变化
  const queue = useMemo<ReviewItem[]>(() => {
    const items: ReviewItem[] = []
    for (const r of save.wrongAnswers ?? []) {
      const resolved = resolveQuestion(r.questionKey, course)
      if (!resolved) continue
      items.push({
        questionKey: r.questionKey,
        question: resolved.question,
        wrongAt: r.wrongAt,
        attempts: r.attempts,
      })
    }
    // 最近答错的排前——用户最近才被这道题卡住，先巩固它
    items.sort((a, b) => (b.wrongAt || '').localeCompare(a.wrongAt || ''))
    return items
  }, [course, save.wrongAnswers])

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)

  const total = queue.length
  const current = !finished && index < total ? queue[index] : null
  const done = finished || index >= total
  const currentNumber = !done ? index + 1 : total

  const finish = () => {
    setFinished(true)
    audio.play('levelClear')
  }

  const goNext = () => {
    if (index + 1 >= total) finish()
    else setIndex(index + 1)
  }

  const handleAnswer = (correct: boolean) => {
    if (!current) return
    if (correct) {
      removeFromWrongAnswers(current.questionKey)
      setCorrectCount((c) => c + 1)
      const next = streak + 1
      setStreak(next)
      audio.play(next >= 2 ? 'combo' : 'correct')
    } else {
      recordWrongAnswer(current.questionKey)
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

  const retry = () => {
    setIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setSkippedCount(0)
    setStreak(0)
    setFinished(false)
  }

  if (total === 0) {
    return (
      <>
        <div className="crumbs">
          <button className="crumb-btn" onClick={onExit}>
            ← 返回档案
          </button>
          <span>／ 复习模式</span>
        </div>
        <PixelPanel title="复习模式" className="review-empty">
          <p className="review-empty__text">错题本已空！没有需要复习的题目。</p>
          <div className="row row--center">
            <PixelButton onClick={onExit}>返回档案</PixelButton>
          </div>
        </PixelPanel>
      </>
    )
  }

  return (
    <>
      <div className="crumbs">
        <button className="crumb-btn" onClick={onExit}>
          ← 退出复习
        </button>
        <span>／ 复习模式 · {currentNumber} / {total} 题</span>
      </div>

      {!done && current && (
        <>
          <PixelPanel title="📒 复习模式" className="review-banner">
            <p className="review-banner__text">
              不奖励 XP / 金币 / 星级。答对自动移出错题本；答错将 +1 累计次数；可随时跳过。
              这次答错过 <strong>{current.attempts}</strong> 次。
            </p>
          </PixelPanel>
          <PixelPanel title={current.question.kind === 'fill' ? '代码填空' : '知识挑战'}>
            <QuizQuestion
              question={current.question}
              index={index}
              total={total}
              combo={streak}
              onAnswer={(correct) => {
                handleAnswer(correct)
                // 复习模式：答题后不卡在原地等"下一题"，直接自动进入下一题
                // —— 错题复习追求流畅节奏，让用户连刷不要被打断
                setTimeout(goNext, correct ? 600 : 1200)
              }}
              onHintUsed={() => {
                audio.play('buy')
              }}
              onNext={goNext}
            />
            <div className="row row--center review-skip">
              <PixelButton variant="ghost" onClick={handleSkip}>
                跳过此题
              </PixelButton>
            </div>
          </PixelPanel>
        </>
      )}

      {done && (
        <PixelPanel title="复习完成" className="review-result review-result--in">
          <p className="review-result__big">
            {wrongCount === 0 ? '🎉 全部答对！错题本已清空。' : '本次复习结束'}
          </p>
          <p className="review-result__stats">
            答对 <strong className="ok">{correctCount}</strong> · 答错{' '}
            <strong className="bad">{wrongCount}</strong> · 跳过{' '}
            <strong>{skippedCount}</strong> / 共 {total} 题
          </p>
          <div className="row row--center">
            <PixelButton onClick={retry}>再来一组</PixelButton>
            <PixelButton variant="ghost" onClick={onExit}>
              返回档案
            </PixelButton>
          </div>
        </PixelPanel>
      )}
    </>
  )
}