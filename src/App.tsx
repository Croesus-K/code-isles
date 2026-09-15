import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { levelFromXp } from './core/level'
import { useGameStore } from './core/store'
import { PixelButton } from './ui/PixelButton'
import { PixelPanel } from './ui/PixelPanel'
import { XpBar } from './ui/XpBar'

export default function App() {
  const { save, hasSave, newGame, addXp, addGold, spend, exportSave, importSave, resetSave } =
    useGameStore()
  const [status, setStatus] = useState('欢迎来到群岛。M0 预览：先试试下面的存档系统。')
  const fileRef = useRef<HTMLInputElement>(null)

  const download = () => {
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code-isles-save.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const ok = importSave(await file.text())
    setStatus(ok ? '存档导入成功。' : '导入失败：这不是有效的群岛存档。')
  }

  return (
    <main className="screen">
      <header className="title-block">
        <h1 className="game-logo">代码群岛</h1>
        <p className="game-tagline">Code Isles · 用像素冒险学正经知识</p>
        <div className="row row--center">
          <PixelButton
            size="lg"
            onClick={() => {
              newGame()
              setStatus('新的冒险开始！')
            }}
          >
            新的冒险
          </PixelButton>
          <PixelButton
            size="lg"
            variant="ghost"
            disabled={!hasSave}
            onClick={() => setStatus('已读取本地存档。')}
          >
            继续冒险
          </PixelButton>
        </div>
      </header>

      <PixelPanel title="航海日志（M0 开发预览）">
        <XpBar xp={save.player.xp} />
        <p className="stat-line">
          金币 <strong className="gold">{save.player.gold}</strong> ｜ 当前等级 Lv.
          {levelFromXp(save.player.xp)}
        </p>
        <div className="row">
          <PixelButton
            onClick={() => {
              addXp(30)
              addGold(10)
              setStatus('通关结算：+30 XP，+10 金币')
            }}
          >
            完成一关（演示）
          </PixelButton>
          <PixelButton
            variant="ghost"
            onClick={() => setStatus(spend(5) ? '花 5 金币买到一条提示。' : '金币不足！')}
          >
            买提示（-5 金币）
          </PixelButton>
        </div>
        <hr className="panel-divider" />
        <div className="row">
          <PixelButton variant="ghost" onClick={download}>
            导出存档
          </PixelButton>
          <PixelButton variant="ghost" onClick={() => fileRef.current?.click()}>
            导入存档
          </PixelButton>
          <PixelButton
            variant="danger"
            onClick={() => {
              resetSave()
              setStatus('存档已清除。')
            }}
          >
            清除存档
          </PixelButton>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onImportFile}
        />
        <p className="status-line">{status}</p>
      </PixelPanel>

      <footer className="footnote">M1 预告：把这一页换成世界地图与区域关卡。</footer>
    </main>
  )
}
