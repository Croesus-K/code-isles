import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { pythonBasics } from './content/python-basics'
import { useGameStore } from './core/store'
import { LevelView } from './ui/LevelView'
import { PixelButton } from './ui/PixelButton'
import { PixelPanel } from './ui/PixelPanel'
import { RegionMap } from './ui/RegionMap'
import { WorldMap } from './ui/WorldMap'
import { XpBar } from './ui/XpBar'

type Scene =
  | { name: 'title' }
  | { name: 'world' }
  | { name: 'region'; regionIndex: number }
  | { name: 'level'; regionIndex: number; levelIndex: number }

export default function App() {
  const { save, hasSave, exportSave, importSave, resetSave } = useGameStore()
  const [scene, setScene] = useState<Scene>({ name: 'title' })
  const [status, setStatus] = useState('欢迎来到群岛。')
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

  const saveTools = (
    <PixelPanel title="工具箱">
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
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
      <p className="status-line">{status}</p>
    </PixelPanel>
  )

  if (scene.name === 'title') {
    return (
      <main className="screen">
        <header className="title-block">
          <h1 className="game-logo">代码群岛</h1>
          <p className="game-tagline">Code Isles · 用像素冒险学正经知识</p>
          <div className="row row--center">
            <PixelButton size="lg" onClick={() => setScene({ name: 'world' })}>
              {hasSave ? '继续冒险' : '开始冒险'}
            </PixelButton>
          </div>
          {hasSave && <p className="footnote">检测到本地存档，进度将自动续航。</p>}
        </header>
        {saveTools}
      </main>
    )
  }

  return (
    <main className="screen">
      <PixelPanel title="冒险者">
        <XpBar xp={save.player.xp} />
        <p className="stat-line status-bar__gold">
          金币 <strong className="gold">{save.player.gold}</strong>
        </p>
      </PixelPanel>

      {scene.name === 'world' && (
        <WorldMap
          course={pythonBasics}
          save={save}
          onEnter={(regionIndex) => setScene({ name: 'region', regionIndex })}
        />
      )}

      {scene.name === 'region' && (
        <RegionMap
          region={pythonBasics.regions[scene.regionIndex]}
          save={save}
          onBack={() => setScene({ name: 'world' })}
          onEnterLevel={(levelIndex) =>
            setScene({ name: 'level', regionIndex: scene.regionIndex, levelIndex })
          }
        />
      )}

      {scene.name === 'level' && (
        <LevelView
          regionId={pythonBasics.regions[scene.regionIndex].id}
          level={pythonBasics.regions[scene.regionIndex].levels[scene.levelIndex]}
          onBack={() => setScene({ name: 'region', regionIndex: scene.regionIndex })}
        />
      )}

      {saveTools}
      <footer className="footnote">M2 预告：星级评价、连击加成、提示商店与更多题型。</footer>
    </main>
  )
}
