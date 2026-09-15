import type { Question } from '../content/course'
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

const KIND_LABEL: Record<Question['kind'], string> = {
  choice: '概念选择',
  output: '输出预测',
  fill: '代码填空',
  order: '代码排序',
  bug: '找错题',
}

/** 题型分发器：题头（题型标签/进度/连击）+ 按题型分发的答题视图 */
export function QuizQuestion({ question, index, total, combo, onAnswer, onHintUsed, onNext }: Props) {
  const isLast = index + 1 === total
  const shared = { isLast, onAnswer, onHintUsed, onNext }
  return (
    <div>
      <p className="q-progress">
        <span className="kind-tag">{KIND_LABEL[question.kind]}</span>
        第 {index + 1}/{total} 题
        {combo >= 2 && <span className="combo">连击 ×{combo}</span>}
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
