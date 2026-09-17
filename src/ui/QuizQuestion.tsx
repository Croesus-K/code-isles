import type { Question } from '../content/course'
import { t } from '../core/strings'
import { BugView } from './BugView'
import { ChoiceView } from './ChoiceView'
import { FillView } from './FillView'
import { OrderView } from './OrderView'

interface Props {
  question: Question
  index: number
  total: number
  combo: number
  onAnswer: (correct: boolean) => void
  onHintUsed: () => void
  onNext: () => void
}

const KIND_KEY = {
  choice: 'kind.choice',
  output: 'kind.output',
  fill: 'kind.fill',
  order: 'kind.order',
  bug: 'kind.bug',
} as const satisfies Record<Question['kind'], Parameters<typeof t>[0]>

/** 题型分发器：题头（题型标签/进度/连击）+ 按题型分发的答题视图 */
export function QuizQuestion({ question, index, total, combo, onAnswer, onHintUsed, onNext }: Props) {
  const isLast = index + 1 === total
  const shared = { isLast, onAnswer, onHintUsed, onNext }
  return (
    <div>
      <p className="q-progress">
        <span className="kind-tag">{t(KIND_KEY[question.kind])}</span>
        {t('progress.label', { i: index + 1, n: total })}
        {combo >= 2 && <span className="combo">{t('combo.label', { n: combo })}</span>}
      </p>
      {question.kind === 'fill' && <FillView question={question} {...shared} />}
      {question.kind === 'order' && <OrderView question={question} {...shared} />}
      {question.kind === 'bug' && <BugView question={question} {...shared} />}
      {(question.kind === 'choice' || question.kind === 'output') && (
        <ChoiceView question={question} {...shared} />
      )}
    </div>
  )
}
