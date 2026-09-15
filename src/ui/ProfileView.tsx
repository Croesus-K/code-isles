import { useMemo } from 'react'
import { BADGES, BADGE_INDEX } from '../content/badges'
import { earnedBadgeIds } from '../core/badges'
import type { CourseDef } from '../content/course'
import type { SaveData } from '../core/save/schema'
import { PixelPanel } from './PixelPanel'
import { PixelButton } from './PixelButton'

interface Props {
  course: CourseDef
  save: SaveData
  onBack: () => void
}

/**
 * 冒险者档案：徽章墙 + 概览数字。
 * 已达成徽章 = 亮卡；未达成 = 灰卡，显示达成条件文案。
 */
export function ProfileView({ course, save, onBack }: Props) {
  const earnedSet = useMemo(() => new Set(earnedBadgeIds(save, course)), [save, course])
  const earnedCount = earnedSet.size
  const totalCount = BADGES.length

  // 汇总"冒险者概况"——XP、等级、金币、通关关数、毕业状态。
  const totalCleared = Object.values(save.regions).reduce(
    (acc, rp) => acc + Object.values(rp.levels).filter((lp) => lp.cleared).length,
    0,
  )
  const totalLv = course.regions.reduce((acc, r) => acc + r.levels.length, 0)

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