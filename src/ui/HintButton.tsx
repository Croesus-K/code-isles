import { useState } from 'react'
import { HINT_COST } from '../core/progress'
import { useGameStore } from '../core/store'
import { PixelButton } from './PixelButton'

interface Props {
  hint?: string
  onUsed: () => void
}

/** 花金币买提示；每题最多买一次，买过由本组件内部记住 */
export function HintButton({ hint, onUsed }: Props) {
  const spend = useGameStore((s) => s.spend)
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState('')

  if (!hint) return null
  if (revealed) {
    return <p className="hint-box">提示：{hint}</p>
  }
  return (
    <div className="hint-row">
      <PixelButton
        variant="ghost"
        onClick={() => {
          if (spend(HINT_COST)) {
            setRevealed(true)
            onUsed()
          } else {
            setError(`金币不足（需要 ${HINT_COST}）。答对题目和通关都会掉金币。`)
          }
        }}
      >
        买提示（-{HINT_COST} 金币）
      </PixelButton>
      {error && <span className="hint-error">{error}</span>}
    </div>
  )
}
