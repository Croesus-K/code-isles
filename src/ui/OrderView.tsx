import { useEffect, useState } from 'react'
import type { OrderQuestion } from '../content/course'
import { t } from '../core/strings'
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

  // 键盘可达性：
  // - 未提交：1~N 把 pool 第 N 行放入 placed；Backspace 撤回最后一行；R 重置（重新洗牌 + 清空已放）
  // - 已提交：Enter 进入下一题
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (submitted) {
        if (e.key === 'Enter') {
          e.preventDefault()
          onNext()
        }
        return
      }
      if (e.key === 'Backspace' && placed.length > 0) {
        e.preventDefault()
        unplace(placed.length - 1)
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        if (placed.length === 0 && pool.length === question.lines.length) return
        e.preventDefault()
        setPlaced([])
        setPool(shuffled(question.lines))
        return
      }
      const num = Number.parseInt(e.key, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= pool.length) {
        e.preventDefault()
        place(pool[num - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, pool, placed, question.lines, onNext])

  return (
    <div>
      <p className="q-prompt">{question.prompt}</p>
      {!submitted ? (
        <>
          <p className="order-label">
            {t('order.yourSeq', {
              hints: t('order.kbdHint', { n: '1~N' }),
            })}
          </p>
          <div className="order-seq">
            {placed.map((line, i) => (
              <PixelButton key={`${line}-${i}`} className="seq-line seq-line--placed" onClick={() => unplace(i)}>
                {i + 1}. {line}
              </PixelButton>
            ))}
            {placed.length === 0 && <p className="order-empty">{t('order.empty')}</p>}
          </div>
          <p className="order-label">{t('order.pool')}</p>
          <div className="order-pool">
            {pool.map((line, i) => (
              <PixelButton
                key={line}
                className="seq-line"
                onClick={() => place(line)}
                aria-keyshortcuts={String(i + 1)}
              >
                <span className="seq-line__no">{i + 1}</span> {line}
              </PixelButton>
            ))}
          </div>
          <div className="row row--center">
            <PixelButton onClick={submit} disabled={pool.length > 0}>
              {t('btn.submitOrder')}
            </PixelButton>
          </div>
          <HintButton hint={question.hint} onUsed={onHintUsed} />
        </>
      ) : (
        <>
          <p className={`explain ${correct ? 'explain--good' : ''}`}>
            {correct ? t('result.orderRight') : t('result.orderWrong')}
            {question.explain}
          </p>
          {!correct && <pre className="code-block">{question.lines.join('\n')}</pre>}
          <div className="row row--center">
            <PixelButton onClick={onNext}>{isLast ? t('btn.viewSummary') : t('btn.next')}</PixelButton>
          </div>
        </>
      )}
    </div>
  )
}
