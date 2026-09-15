import { useState } from 'react'
import type { ChoiceQuestion, OutputQuestion } from '../content/course'
import { HintButton } from './HintButton'
import { PixelButton } from './PixelButton'

type Question = ChoiceQuestion | OutputQuestion

interface Props {
  question: Question
  isLast: boolean
  onAnswer: (correct: boolean) => void
  onHintUsed: () => void
  onNext: () => void
}

const LABELS = 'ABCD'

/** 概念选择 / 输出预测 共用视图（差异只在数据字段，呈现一致） */
export function ChoiceView({ question, isLast, onAnswer, onHintUsed, onNext }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const correct = picked === question.answerIndex

  return (
    <div>
      <p className="q-prompt">{question.prompt}</p>
      {question.code ? <pre className="code-block">{question.code}</pre> : null}
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
            {`${LABELS[i]}. ${opt}`}
          </PixelButton>
        )
      })}
      {answered && (
        <>
          <p className={`explain ${correct ? 'explain--good' : ''}`}>
            {correct ? '答对了！' : '答错了。'}
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
