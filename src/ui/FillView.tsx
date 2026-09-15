import { useState } from 'react'
import type { FillQuestion } from '../content/course'
import { HintButton } from './HintButton'
import { PixelButton } from './PixelButton'

interface Props {
  question: FillQuestion
  isLast: boolean
  onAnswer: (correct: boolean) => void
  onHintUsed: () => void
  onNext: () => void
}

/** 代码填空：去首尾空格后精确匹配（区分大小写，Python 本就区分大小写） */
export function FillView({ question, isLast, onAnswer, onHintUsed, onNext }: Props) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const correct = submitted && question.answers.includes(value.trim())

  const submit = () => {
    if (!value.trim() || submitted) return
    setSubmitted(true)
    onAnswer(question.answers.includes(value.trim()))
  }

  return (
    <div>
      <p className="q-prompt">{question.prompt}</p>
      <pre className="code-block">{question.code}</pre>
      {!submitted ? (
        <>
          <input
            className="fill-input"
            value={value}
            placeholder={question.placeholder ?? '在此填写答案'}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
          />
          <div className="row row--center">
            <PixelButton onClick={submit} disabled={!value.trim()}>
              提交答案
            </PixelButton>
          </div>
          <HintButton hint={question.hint} onUsed={onHintUsed} />
        </>
      ) : (
        <>
          <p className={`explain ${correct ? 'explain--good' : ''}`}>
            {correct ? '答对了！' : `答错了。正确答案：${question.answers[0]}。`}
            {question.explain}
          </p>
          <div className="row row--center">
            <PixelButton onClick={onNext}>{isLast ? '查看结算' : '下一题'}</PixelButton>
          </div>
        </>
      )}
    </div>
  )
}
