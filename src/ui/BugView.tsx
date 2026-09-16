import { useEffect, useState } from 'react'
import type { BugQuestion } from '../content/course'
import { HintButton } from './HintButton'
import { PixelButton } from './PixelButton'

interface Props {
  question: BugQuestion
  isLast: boolean
  onAnswer: (correct: boolean) => void
  onHintUsed: () => void
  onNext: () => void
}

/** 找错题：点击你觉得会出错的那一行 */
export function BugView({ question, isLast, onAnswer, onHintUsed, onNext }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const correct = picked === question.answerLine

  // 键盘可达性：
  // - 未答题时按 1~N 选对应行（行号 1-based 与按钮上的数字标签一致）
  // - 已答题后按 Enter 进入下一题
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (answered) {
        if (e.key === 'Enter') {
          e.preventDefault()
          onNext()
        }
        return
      }
      const num = Number.parseInt(e.key, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= question.code.length) {
        e.preventDefault()
        const idx = num - 1
        setPicked(idx)
        onAnswer(idx === question.answerLine)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, question.code.length, question.answerLine, onAnswer, onNext])

  return (
    <div>
      <p className="q-prompt">{question.prompt}</p>
      <div className="bug-code">
        {question.code.map((line, i) => {
          let cls = 'pixel-btn bug-line'
          if (answered) {
            if (i === question.answerLine) cls += ' bug-line--bad'
            else if (i === picked) cls += ' bug-line--dim'
          }
          return (
            <PixelButton
              key={i}
              className={cls}
              disabled={answered}
              aria-pressed={answered ? i === picked : undefined}
              aria-keyshortcuts={String(i + 1)}
              onClick={() => {
                setPicked(i)
                onAnswer(i === question.answerLine)
              }}
            >
              <span className="bug-line__no">{i + 1}</span>
              <span className="bug-line__text">{line}</span>
            </PixelButton>
          )
        })}
      </div>
      {answered && (
        <>
          <p className={`explain ${correct ? 'explain--good' : ''}`}>
            {correct ? '找对了！' : '不是这行。'}
            {question.explain}
          </p>
          <div className="row row--center">
            <PixelButton onClick={onNext}>{isLast ? '查看结算' : '下一题'}</PixelButton>
          </div>
        </>
      )}
      {!answered && <HintButton hint={question.hint} onUsed={onHintUsed} />}
    </div>
  )
}