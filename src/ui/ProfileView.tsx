import { useMemo } from 'react'
import { BADGES, BADGE_INDEX } from '../content/badges'
import { earnedBadgeIds } from '../core/badges'
import type { CourseDef } from '../content/course'
import type { SaveData, WrongAnswerRecord } from '../core/save/schema'
import { useGameStore } from '../core/store'
import { PixelPanel } from './PixelPanel'
import { PixelButton } from './PixelButton'

interface Props {
  course: CourseDef
  save: SaveData
  onBack: () => void
  onStartReview: () => void
}

interface ResolvedWrong {
  record: WrongAnswerRecord
  regionName: string
  levelName: string
  questionPreview: string
  levelIndex: number
  questionIndex: number
}

const QUESTION_PREVIEW_LEN = 40

/**
 * 把 questionKey (`regionId:levelId:questionIndex`) 拆出来，从 course 查回上下文。
 * 查不到的（旧存档 / 数据漂移）返回 null，由调用方决定如何展示。
 */
function resolveWrong(
  record: WrongAnswerRecord,
  course: CourseDef,
): ResolvedWrong | null {
  const parts = record.questionKey.split(':')
  if (parts.length !== 3) return null
  const [regionId, levelId, qIdxStr] = parts
  const regionIndex = course.regions.findIndex((r) => r.id === regionId)
  if (regionIndex < 0) return null
  const region = course.regions[regionIndex]
  const levelIndex = region.levels.findIndex((l) => l.id === levelId)
  if (levelIndex < 0) return null
  const level = region.levels[levelIndex]
  const questionIndex = parseInt(qIdxStr, 10)
  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= level.questions.length) {
    return null
  }
  const q = level.questions[questionIndex]
  const preview = q.prompt.length > QUESTION_PREVIEW_LEN
    ? q.prompt.slice(0, QUESTION_PREVIEW_LEN) + '…'
    : q.prompt
  return {
    record,
    regionName: region.name,
    levelName: level.name,
    questionPreview: preview.replace(/\n/g, ' '),
    levelIndex,
    questionIndex,
  }
}

/**
 * 冒险者档案：徽章墙 + 概览数字 + 错题本。
 * 已达成徽章 = 亮卡；未达成 = 灰卡，显示达成条件文案。
 * 错题本按区域 → 关卡分组，最多展示前 50 条（更多提示"+"）。
 */
export function ProfileView({ course, save, onBack, onStartReview }: Props) {
  const earnedSet = useMemo(() => new Set(earnedBadgeIds(save, course)), [save, course])
  const earnedCount = earnedSet.size
  const totalCount = BADGES.length

  // 汇总"冒险者概况"——XP、等级、金币、通关关数、毕业状态。
  const totalCleared = Object.values(save.regions).reduce(
    (acc, rp) => acc + Object.values(rp.levels).filter((lp) => lp.cleared).length,
    0,
  )
  const totalLv = course.regions.reduce((acc, r) => acc + r.levels.length, 0)

  // 解析错题：剔掉无法解析的（content 改版后旧 key 失效），按最近时间倒序
  const wrongList = useMemo(() => {
    const list = (save.wrongAnswers ?? [])
      .map((r) => resolveWrong(r, course))
      .filter((x): x is ResolvedWrong => x !== null)
    list.sort((a, b) => (b.record.wrongAt || '').localeCompare(a.record.wrongAt || ''))
    return list
  }, [save.wrongAnswers, course])

  const WRONG_PREVIEW_LIMIT = 50
  const visibleWrong = wrongList.slice(0, WRONG_PREVIEW_LIMIT)
  const hiddenCount = wrongList.length - visibleWrong.length

  return (
    <>
      <div className="crumbs">
        <button className="crumb-btn" onClick={onBack}>
          ← 返回世界地图
        </button>
        <span>／ 冒险者档案</span>
      </div>

      <PixelPanel title="冒险者概况">
        <p className="profile-summary">
          金币 <strong className="gold">{save.player.gold}</strong> · XP {save.player.xp} · 通关{' '}
          {totalCleared}/{totalLv} 关 · 徽章 {earnedCount}/{totalCount}
        </p>
      </PixelPanel>

      <PixelPanel
        title={`错题本（${wrongList.length}）`}
        className={wrongList.length === 0 ? 'wrongbook wrongbook--empty' : 'wrongbook'}
      >
        {wrongList.length === 0 ? (
          <p className="wrongbook__empty">还没有错题，继续保持 ✨</p>
        ) : (
          <>
            <p className="wrongbook__hint">
              这些是最近答错的题目；全对通关会自动从错题本移除。
              {hiddenCount > 0 && ` 仅显示最近 ${WRONG_PREVIEW_LIMIT} 条，还有 ${hiddenCount} 条更早的。`}
            </p>
            <ul className="wrongbook__list">
              {visibleWrong.map((w) => (
                <li key={w.record.questionKey} className="wrongbook__item">
                  <div className="wrongbook__where">
                    {w.regionName} · {w.levelName}
                  </div>
                  <div className="wrongbook__q">{w.questionPreview}</div>
                  <div className="wrongbook__attempts" aria-label={`答错 ${w.record.attempts} 次`}>
                    ×{w.record.attempts}
                  </div>
                </li>
              ))}
            </ul>
            <div className="row row--center">
              <PixelButton
                onClick={onStartReview}
                disabled={wrongList.length === 0}
                title={wrongList.length === 0 ? '错题本为空，没有可复习的题目' : `复习 ${wrongList.length} 道错题`}
              >
                📘 复习这 {wrongList.length} 道错题
              </PixelButton>
              <PixelButton
                variant="ghost"
                onClick={() => {
                  if (confirm('确定清空所有错题记录？')) {
                    useGameStore.getState().clearWrongAnswers()
                  }
                }}
              >
                清空错题本
              </PixelButton>
            </div>
          </>
        )}
      </PixelPanel>

      <PixelPanel title="徽章墙">
        <div className="badge-grid">
          {BADGES.map((b) => {
            const got = earnedSet.has(b.id)
            return (
              <div
                key={b.id}
                className={`badge-card ${got ? 'badge-card--earned' : 'badge-card--locked'}`}
                aria-label={got ? `已获得：${b.name}` : `未获得：${b.name}`}
              >
                <div className="badge-card__icon">{got ? b.icon : '🔒'}</div>
                <div className="badge-card__name">{BADGE_INDEX[b.id]?.name ?? b.name}</div>
                <div className="badge-card__desc">{b.desc}</div>
                <div className="badge-card__state">{got ? '已获得' : '未达成'}</div>
              </div>
            )
          })}
        </div>
      </PixelPanel>

      <div className="row row--center">
        <PixelButton onClick={onBack}>回到世界地图</PixelButton>
      </div>
    </>
  )
}