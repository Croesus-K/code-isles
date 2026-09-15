import { useState } from 'react'
import type { OrderQuestion } from '../content/course'
import { HintButton } from './HintButton'
import { PixelButton } from './PixelButton'

interface Props {
  question: OrderQuestion
  isLast: boolean
  onAnswer: (correct: boolean) => void
  onHintUsed: () => void
  onNext: () => void
}

function shuffled(lines: string[]): string[] {
  const arr = [...lines]
  let same = true
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    same = arr.every((l, i) => l === lines[i])
  } while (same && arr.length > 1)
  return arr
}

/** 代码排序：点下方待选行加入你的顺序，点已排的行可撤回 */
export function OrderView({ question, isLast, onAnswer, onHintUsed, onNext }: Props) {
  const [pool, setPool] = useState<string[]>(() => shuffled(question.lines))
  const [placed, setPlaced] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const correct = submitted && placed.every((l, i) => l === question.lines[i])

  const place = (line: string) => {
    if (submitted) return
    setPool((p) => p.filter((l) => l !== line))
    setPlaced((p) => [...p, line])
  }

  const unplace = (idx: number) => {
    if (submitted) return
    const line = placed[idx]
    setPlaced((p) => p.filter((_, i) => i !== idx))
    setPool((p) => [...p, line])
  }

  const submit = () => {
    if (pool.length > 0 || submitted) return
    setSubmitted(true)
    onAnswer(correct)
  }

  return (
    <div>
      <p className="q-prompt">{question.prompt}</p>
      {!submitted ? (
        <>
          <p className="order-label">你的顺序（点击某行可撤回）：</p>
          <div className="order-seq">
            {placed.map((line, i) => (
              <PixelButton key={`${line}-${i}`} className="seq-line seq-line--placed" onClick={() => unplace(i)}>
                {i + 1}. {line}
              </PixelButton>
            ))}
            {placed.length === 0 && <p className="order-empty">（点击下方代码行加入）</p>}
          </div>
          <p className="order-label">待选行：</p>
          <div className="order-pool">
            {pool.map((line) => (
              <PixelButton key={line} className="seq-line" onClick={() => place(line)}>
                {line}
              </PixelButton>
            ))}
          </div>
          <div className="row row--center">
            <PixelButton onClick={submit} disabled={pool.length > 0}>
              提交顺序
            </PixelButton>
          </div>
          <HintButton hint={question.hint} onUsed={onHintUsed} />
        </>
      ) : (
        <>
          <p className={`explain ${correct ? 'explain--good' : ''}`}>
            {correct ? '排序正确！' : '顺序不对。'}
            {question.explain}
          </p>
          {!correct && <pre className="code-block">{question.lines.join('\n')}</pre>}
          <div className="row row--center">
            <PixelButton onClick={onNext}>{isLast ? '查看结算' : '下一题'}</PixelButton>
          </div>
        </>
      )}
    </div>
  )
}
