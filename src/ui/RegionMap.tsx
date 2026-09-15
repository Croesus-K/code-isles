import type { RegionDef } from '../content/course'
import { isLevelUnlocked, levelCleared } from '../core/progress'
import type { SaveData } from '../core/save/schema'
import { PixelButton } from './PixelButton'
import { PixelPanel } from './PixelPanel'

interface Props {
  region: RegionDef
  save: SaveData
  onBack: () => void
  onEnterLevel: (levelIndex: number) => void
}

export function RegionMap({ region, save, onBack, onEnterLevel }: Props) {
  return (
    <>
      <div className="crumbs">
        <button className="crumb-btn" onClick={onBack}>
          ← 世界地图
        </button>
        <span>／ {region.name}</span>
      </div>
      <PixelPanel title={`${region.id} · ${region.name}`}>
        <p className="region-tagline">{region.tagline}</p>
        <div className="path">
          {region.levels.map((level, i) => {
            const unlocked = isLevelUnlocked(save, region, i)
            const cleared = levelCleared(save, region.id, level.id)
            const stars = save.regions[region.id]?.levels[level.id]?.stars ?? 0
            return (
              <div className="node-row" key={level.id}>
                <PixelButton
                  variant={level.boss ? 'primary' : 'ghost'}
                  className={`node-btn ${level.boss ? 'node-btn--boss' : ''}`}
                  disabled={!unlocked}
                  onClick={() => onEnterLevel(i)}
                >
                  <span>
                    <span className="node-btn__name">
                      {level.id} {level.name} {level.boss ? '⚔' : ''}
                    </span>
                    <span className="node-btn__meta">
                      {unlocked
                        ? cleared
                          ? '已通关 · 可复习（奖励 25%）'
                          : '待挑战'
                        : '通过上一关后解锁'}
                    </span>
                  </span>
                  <span className="stars">
                    {cleared ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : ''}
                  </span>
                </PixelButton>
              </div>
            )
          })}
        </div>
      </PixelPanel>
    </>
  )
}
