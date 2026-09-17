import { useState } from 'react'
import type { ReactNode } from 'react'
import type { SaveData } from '../core/save/schema'
import { audio } from '../core/audio'
import { AnnouncePanel } from './AnnouncePanel'
import { PixelButton } from './PixelButton'

interface MainMenuProps {
  save: SaveData
  hasSave: boolean
  onStart: () => void
  onProfile: () => void
  onReview: () => void
  statusLine?: ReactNode
}

/**
 * 独立主菜单：开屏全屏页，不与游戏内三栏壳（左菜单/右公告）混用。
 * 职责：开始冒险（语言选择在世界地图页进行）+ 档案/复习/公告入口。
 * 不放课程切换 —— 语言选择的唯一入口是世界地图顶部的选择面板。
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

      <div className="row row--center">
        <PixelButton size="lg" onClick={() => { audio.play('click'); p.onStart() }}>
          {p.hasSave ? '继续冒险' : '开始冒险'}
        </PixelButton>
      </div>
      <p className="footnote">进入世界地图后可选择要学习的语言</p>

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