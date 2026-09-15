import type { CourseDef } from '../content/course'
import { clearedCount, isRegionUnlocked } from '../core/progress'
import type { SaveData } from '../core/save/schema'
import { PixelButton } from './PixelButton'
import { PixelPanel } from './PixelPanel'

interface Props {
  course: CourseDef
  save: SaveData
  onEnter: (regionIndex: number) => void
}

export function WorldMap({ course, save, onEnter }: Props) {
  return (
    <>
      <header className="title-block">
        <h1 className="game-logo game-logo--small">{course.title}</h1>
        <p className="game-tagline">{course.subtitle}</p>
      </header>
      <PixelPanel title="世界地图">
        <div className="stack">
          {course.regions.map((region, i) => {
            const unlocked = isRegionUnlocked(save, course, i)
            const done = clearedCount(save, region)
            const total = region.levels.length
            const allDone = total > 0 && done === total
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
                      ? '建设中 · 后续版本开放'
                      : unlocked
                        ? `${done}/${total} 关已通关 · ${region.tagline}`
                        : '通过上一区域的 Boss 关后解锁'}
                  </span>
                </span>
                <span className={`badge ${!unlocked ? 'badge--locked' : allDone ? 'badge--done' : ''}`}>
                  {region.comingSoon ? '建设中' : allDone ? '已通关' : unlocked ? '可进入' : '未解锁'}
                </span>
              </PixelButton>
            )
          })}
        </div>
      </PixelPanel>
    </>
  )
}
