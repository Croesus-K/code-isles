import type { CourseDef } from '../content/course'
import { clearedCount, isRegionUnlocked } from '../core/progress'
import type { SaveData } from '../core/save/schema'
import { audio } from '../core/audio'
import { downloadWrongBookMarkdown } from '../core/wrongbook-export'
import { PixelButton } from './PixelButton'
import { PixelPanel } from './PixelPanel'

interface Props {
  course: CourseDef
  save: SaveData
  onEnter: (regionIndex: number) => void
  onOpenProfile: () => void
}

export function WorldMap({ course, save, onEnter, onOpenProfile }: Props) {
  const wrongList = save.wrongAnswers ?? []
  const wrongCount = wrongList.length
  // 总答错次数 = attempts 求和，让"反复卡住的题"更显眼
  const totalAttempts = wrongList.reduce((s, r) => s + (r.attempts || 0), 0)
  const hasWrong = wrongCount > 0
  // 显式消费 hasWrong，避免 tsc unused warning（语义：错题本摘要是否需要渲染）
  void hasWrong

  return (
    <>
      <header className="title-block">
        <h1 className="game-logo game-logo--small">{course.title}</h1>
        <p className="game-tagline">{course.subtitle}</p>
      </header>

      {wrongCount > 0 && (
        <PixelPanel title="📒 错题本">
          <div className="row row--center wrongbook-summary">
            <span className="wrongbook-summary__count">
              {wrongCount} 道题待巩固
              <span className="wrongbook-summary__attempts">
                （累计答错 {totalAttempts} 次）
              </span>
            </span>
            <PixelButton
              onClick={() => {
                audio.play('click')
                onOpenProfile()
              }}
              title="打开档案复习错题"
            >
              📘 复习
            </PixelButton>
            <PixelButton
              variant="ghost"
              onClick={() => {
                audio.play('click')
                downloadWrongBookMarkdown(wrongList, course)
              }}
              title="导出 Markdown 清单"
            >
              📄 导出
            </PixelButton>
          </div>
        </PixelPanel>
      )}

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
