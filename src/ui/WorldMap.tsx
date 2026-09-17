import { useState } from 'react'
import type { CourseDef } from '../content/course'
import { clearedCount, isRegionUnlocked, levelCleared } from '../core/progress'
import type { SaveData } from '../core/save/schema'
import { audio } from '../core/audio'
import { copyTextToClipboard } from '../core/clipboard'
import { downloadWrongBookMarkdown, renderWrongBookMarkdown } from '../core/wrongbook-export'
import { t } from '../core/strings'
import { PixelButton } from './PixelButton'
import { PixelPanel } from './PixelPanel'
import { Toast } from './Toast'

interface Props {
  course: CourseDef
  save: SaveData
  onEnter: (regionIndex: number) => void
  onOpenProfile: () => void
  /** 已通关任意关卡时显示"综合挑战"入口；未通关则不传 */
  onStartChallenge?: () => void
}

export function WorldMap({ course, save, onEnter, onOpenProfile, onStartChallenge }: Props) {
  const wrongList = save.wrongAnswers ?? []
  const wrongCount = wrongList.length
  // 总答错次数 = attempts 求和，让"反复卡住的题"更显眼
  const totalAttempts = wrongList.reduce((s, r) => s + (r.attempts || 0), 0)
  const hasWrong = wrongCount > 0
  // 显式消费 hasWrong，避免 tsc unused warning（语义：错题本摘要是否需要渲染）
  void hasWrong

  const [toast, setToast] = useState<string | null>(null)

  // 按 region 聚合错题数 + 累计 attempts —— 热力图分布
  // key 形如 "regionId:levelId:qIdx"，按 ':' 切首段即可
  const wrongByRegion = new Map<string, { count: number; attempts: number }>()
  for (const r of wrongList) {
    const regionId = r.questionKey.split(':')[0]
    if (!regionId) continue
    const cur = wrongByRegion.get(regionId) ?? { count: 0, attempts: 0 }
    cur.count += 1
    cur.attempts += r.attempts || 0
    wrongByRegion.set(regionId, cur)
  }

  const onCopyMarkdown = async () => {
    audio.play('click')
    const md = renderWrongBookMarkdown(wrongList, course)
    const ok = await copyTextToClipboard(md)
    setToast(ok ? t('toast.copied') : t('toast.copyFail'))
  }

  // 全局通关进度：所有非 comingSoon 关卡中已通关的比例。
  // comingSoon 的关卡不计入分母——课程没出完，进度会"卡住"看起来很难看。
  const playableLevels = course.regions
    .filter((r) => !r.comingSoon)
    .flatMap((r) => r.levels)
  const totalLevels = playableLevels.length
  const cleared = playableLevels.filter((lv) => {
    // playableLevels 来自 region.flatMap；找不到 region 时 fallback false
    const regionId = course.regions.find((r) => r.levels.some((l) => l.id === lv.id))?.id
    return regionId ? levelCleared(save, regionId, lv.id) : false
  }).length
  const progressPct = totalLevels === 0 ? 0 : Math.round((cleared / totalLevels) * 100)

  return (
    <>
      <header className="title-block">
        <h1 className="game-logo game-logo--small">{course.lang ?? course.title}</h1>
        <p className="game-tagline">{course.subtitle}</p>
      </header>

      <PixelPanel title={t('panel.progress')}>
        <div className="progress">
          <div className="progress__meta">
            <span className="progress__count">
              {t('label.cleared', { cleared, total: totalLevels })}
            </span>
            <span className="progress__pct">{progressPct}%</span>
          </div>
          <div
            className="progress__bar"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('label.cleared', { cleared, total: totalLevels })}
          >
            <div
              className={`progress__fill ${progressPct >= 100 ? 'progress__fill--done' : ''}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </PixelPanel>

      {wrongCount > 0 && (
        <PixelPanel title={t('panel.wrongbook')}>
          <div className="row row--center wrongbook-summary">
            <span className="wrongbook-summary__count">
              {t('label.wrongCount', { n: wrongCount })}
              <span className="wrongbook-summary__attempts">
                {t('label.totalAttempts', { n: totalAttempts })}
              </span>
            </span>
            <PixelButton
              onClick={() => {
                audio.play('click')
                onOpenProfile()
              }}
              title={t('btn.review')}
            >
              {t('btn.review')}
            </PixelButton>
            <PixelButton
              variant="ghost"
              onClick={() => {
                audio.play('click')
                downloadWrongBookMarkdown(wrongList, course)
              }}
              title={t('btn.export')}
            >
              {t('btn.export')}
            </PixelButton>
            <PixelButton variant="ghost" onClick={onCopyMarkdown} title={t('btn.copy')}>
              {t('btn.copy')}
            </PixelButton>
          </div>
        </PixelPanel>
      )}

      <PixelPanel title={t('panel.worldMap')}>
        <div className="stack">
          {course.regions.map((region, i) => {
            const unlocked = isRegionUnlocked(save, course, i)
            const done = clearedCount(save, region)
            const total = region.levels.length
            const allDone = total > 0 && done === total
            const regionWrong = wrongByRegion.get(region.id)
            return (
              <PixelButton
                key={region.id}
                variant="ghost"
                className="region-card"
                disabled={!unlocked}
                onClick={() => onEnter(i)}
              >
                <span className="region-card__info">
                  <span className="region-card__name">
                    {region.id} · {region.name}
                  </span>
                  <span className="region-card__meta">
                    {region.comingSoon
                      ? t('meta.building')
                      : unlocked
                        ? t('meta.regionTag', { done, total, tagline: region.tagline })
                        : t('meta.lockedHint')}
                  </span>
                </span>
                <span className="region-card__right">
                  {regionWrong && regionWrong.count > 0 && (
                    <span
                      className="region-card__hot"
                      title={t('hot.tooltip', { count: regionWrong.count, attempts: regionWrong.attempts })}
                    >
                      🔴 {regionWrong.count}
                    </span>
                  )}
                  <span className={`badge ${!unlocked ? 'badge--locked' : allDone ? 'badge--done' : ''}`}>
                    {region.comingSoon
                      ? t('badge.building')
                      : allDone
                        ? t('badge.completed')
                        : unlocked
                          ? t('badge.available')
                          : t('badge.locked')}
                  </span>
                </span>
              </PixelButton>
            )
          })}
        </div>
      </PixelPanel>

      {onStartChallenge && (
        <PixelPanel title="🏆 综合挑战">
          <div className="row row--center challenge-cta">
            <span className="challenge-cta__text">
              通关关卡后的「题目复盘」入口 —— 从已学题目里随机抽 10 道来战。
              答对 +2 XP，答错不影响错题本。
            </span>
            <PixelButton
              variant="primary"
              onClick={() => {
                audio.play('click')
                onStartChallenge()
              }}
            >
              开始挑战
            </PixelButton>
          </div>
        </PixelPanel>
      )}

      <Toast message={toast} />
    </>
  )
}
