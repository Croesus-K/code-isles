import { useState } from 'react'
import type { ReactNode } from 'react'
import type { CourseDef } from '../content/course'
import { COURSES, courseProgress } from '../content/courses'
import type { SaveData } from '../core/save/schema'
import { audio } from '../core/audio'
import { AnnouncePanel } from './AnnouncePanel'
import { PixelButton } from './PixelButton'

interface MainMenuProps {
  activeCourse: CourseDef
  save: SaveData
  hasSave: boolean
  onSelectCourse: (courseId: string) => void
  onStart: () => void
  onProfile: () => void
  onReview: () => void
  statusLine?: ReactNode
}

/**
 * 独立主菜单：开屏全屏页，不与游戏内三栏壳（左菜单/右公告）混用。
 * 职责：选课程（语言名为卡片标题）→ 开始冒险；附档案/复习/公告三个入口。
 * 工具箱、云端存档留在游戏内左菜单 —— 主菜单只管"进哪门课、怎么进"。
 */
export function MainMenu(p: MainMenuProps) {
  const [showAnn, setShowAnn] = useState(false)
  const wrongCount = p.save.wrongAnswers?.length ?? 0

  return (
    <div className="mainmenu">
      <header className="title-block">
        <h1 className="game-logo">代码群岛</h1>
        <p className="game-tagline">Code Isles · 用像素冒险学正经知识</p>
      </header>

      <section className="mm-courses" aria-label="选择课程">
        {COURSES.map((c) => {
          const active = c.id === p.activeCourse.id
          const prog = courseProgress(p.save, c)
          const pct = prog.total > 0 ? Math.round((prog.cleared / prog.total) * 100) : 0
          return (
            <button
              key={c.id}
              className={`mm-course${active ? ' mm-course--active' : ''}`}
              onClick={() => {
                if (active) return
                audio.play('click')
                p.onSelectCourse(c.id)
              }}
              aria-pressed={active}
            >
              <span className="mm-course__lang">{c.lang ?? c.title}</span>
              <span className="mm-course__sub">{c.subtitle}</span>
              <span className="mm-course__meta">
                <span>{prog.total > 0 ? `${prog.cleared}/${prog.total} 关` : '敬请期待'}</span>
                <span>{active ? '当前课程' : '点击切换'}</span>
              </span>
              <span className="mm-course__bar" aria-hidden="true">
                <span className="mm-course__bar-fill" style={{ width: `${pct}%` }} />
              </span>
            </button>
          )
        })}
      </section>

      <div className="row row--center">
        <PixelButton size="lg" onClick={() => { audio.play('click'); p.onStart() }}>
          {p.hasSave ? '继续冒险' : '开始冒险'}
        </PixelButton>
      </div>
      {p.hasSave && <p className="footnote">检测到本地存档，进度将自动续航。</p>}

      <div className="row row--center mm-links">
        <PixelButton variant="ghost" onClick={() => { audio.play('click'); p.onProfile() }}>
          🏅 档案 · 成就
        </PixelButton>
        <PixelButton variant="ghost" onClick={() => { audio.play('click'); p.onReview() }}>
          📒 复习错题{wrongCount > 0 ? `（${wrongCount}）` : ''}
        </PixelButton>
        <PixelButton
          variant="ghost"
          aria-pressed={showAnn}
          onClick={() => { audio.play('click'); setShowAnn((v) => !v) }}
        >
          📜 更新公告{showAnn ? ' ▲' : ' ▼'}
        </PixelButton>
      </div>

      {showAnn && <AnnouncePanel />}
      {p.statusLine}
    </div>
  )
}