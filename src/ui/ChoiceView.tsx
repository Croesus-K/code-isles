import { useEffect, useState } from 'react'
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

  // 键盘可达性：
  // - 未答题时按 1~N 选答案（与按钮上 A/B/C/D 字母标签形成 A=1 的隐式映射）
  // - 已答题后按 Enter 进入下一题
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 文本输入控件聚焦时不抢键盘（虽然本视图没有输入框，但防御性写法）
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
      if (!Number.isNaN(num) && num >= 1 && num <= question.options.length) {
        e.preventDefault()
        const idx = num - 1
        setPicked(idx)
        onAnswer(idx === question.answerIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, question.options.length, question.answerIndex, onAnswer, onNext])

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
            aria-pressed={answered ? i === picked : undefined}
            aria-keyshortcuts={String(i + 1)}
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