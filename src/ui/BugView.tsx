import { useState } from 'react'
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
