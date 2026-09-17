import type { CourseDef, Question } from '../content/course'
import type { SaveData } from './save/schema'

export interface ReviewItem {
  questionKey: string
  question: Question
  /** 第一次入错题本的时间（显示用） */
  wrongAt: string
  attempts: number
}

/**
 * 把 questionKey (`regionId:levelId:questionIndex`) 拆出来，从 course 查回题目。
 * 返回 null = 数据漂移 / 旧 key 失效，由调用方过滤。
 */
export function resolveReviewItem(
  key: string,
  course: CourseDef,
): { question: Question; regionId: string; levelId: string; questionIndex: number } | null {
  const parts = key.split(':')
  if (parts.length !== 3) return null
  const [regionId, levelId, qIdxStr] = parts
  const region = course.regions.find((r) => r.id === regionId)
  if (!region) return null
  const level = region.levels.find((l) => l.id === levelId)
  if (!level) return null
  const questionIndex = parseInt(qIdxStr, 10)
  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= level.questions.length) {
    return null
  }
  return { question: level.questions[questionIndex], regionId, levelId, questionIndex }
}

/**
 * 把 save.wrongAnswers 转成可复习队列：
 *  - 数据漂移的项（course 找不到）静默丢弃
 *  - focusQuestionKey：仅保留指定的那一道（直达复习），找不到返回空队列
 *  - 否则按 wrongAt 倒序（最近答错的优先）
 *
 * 抽出纯函数便于测试；ReviewSessionView 直接调它。
 */
export function buildReviewQueue(
  save: SaveData,
  course: CourseDef,
  focusQuestionKey?: string,
): ReviewItem[] {
  const items: ReviewItem[] = []
  for (const r of save.wrongAnswers ?? []) {
    const resolved = resolveReviewItem(r.questionKey, course)
    if (!resolved) continue
    items.push({
      questionKey: r.questionKey,
      question: resolved.question,
      wrongAt: r.wrongAt,
      attempts: r.attempts,
    })
  }
  if (focusQuestionKey) {
    const idx = items.findIndex((it) => it.questionKey === focusQuestionKey)
    if (idx < 0) return []
    return [items[idx]]
  }
  items.sort((a, b) => (b.wrongAt || '').localeCompare(a.wrongAt || ''))
  return items
}