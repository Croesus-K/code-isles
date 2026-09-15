import { useState } from 'react'
import type { Question } from '../content/course'
import { PixelButton } from './PixelButton'

interface Props {
  question: Question
  index: number
  total: number
  onAnswer: (correct: boolean) => void
  onNext: () => void
}

const OPTION_LABELS = 'ABCD'

export function QuizQuestion({ question, index, total, onAnswer, onNext }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const correct = picked === question.answerIndex

  return (
    <div>
      <p className="q-progress">
        第 {index + 1}/{total} 题
      </p>
      <p className="q-prompt">{question.prompt}</p>
      {question.code ? <pre className="code-block">{question.code}</pre> : null}
      <div>
        {question.options.map((opt, i) => {
          let cls = 'opt'
          if (answered) {
            if (i === question.answerIndex) cls += ' opt--correct'
            else if (i === picked) cls += ' opt--wrong'
          }
          return (
            <PixelButton
              key={i}
              className={cls}
              disabled={answered}
              onClick={() => {
                setPicked(i)
                onAnswer(i === question.answerIndex)
              }}
            >
              {`${OPTION_LABELS[i]}. ${opt}`}
            </PixelButton>
          )
        })}
      </div>
      {answered && (
        <>
          <p className={`explain ${correct ? 'explain--good' : ''}`}>
            {correct ? '答对了！' : '答错了。'}
            {question.explain}
          </p>
          <div className="row row--center">
            <PixelButton onClick={onNext}>{index + 1 === total ? '查看结算' : '下一题'}</PixelButton>
          </div>
        </>
      )}
    </div>
  )
}
