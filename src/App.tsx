import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { pythonBasics } from './content/python-basics'
import { audio } from './core/audio'
import { useGameStore } from './core/store'
import { applyUpdate, subscribeSw } from './core/serviceWorker'
import {
  fireWrongBookReminder,
  requestNotificationPermission,
  shouldNotifyToday,
} from './core/notifications'
import { DonateModal } from './ui/DonateModal'
import { LevelView } from './ui/LevelView'
import { PixelButton } from './ui/PixelButton'
import { PixelPanel } from './ui/PixelPanel'
import { ProfileView } from './ui/ProfileView'
import { RegionMap } from './ui/RegionMap'
import { ReviewSessionView } from './ui/ReviewSessionView'
import { WorldMap } from './ui/WorldMap'
import { XpBar } from './ui/XpBar'

type Scene =
  | { name: 'title' }
  | { name: 'world' }
  | { name: 'region'; regionIndex: number }
  | { name: 'level'; regionIndex: number; levelIndex: number }
  | { name: 'profile' }
  | { name: 'review' }

export default function App() {
  const {
    save,
    hasSave,
    corruptDetected,
    persistFailed,
    dismissCorruptNotice,
    exportSave,
    importSave,
    resetSave,
    toggleSound,
    syncBadges,
  } = useGameStore()
  const [scene, setScene] = useState<Scene>({ name: 'title' })
  const [status, setStatus] = useState('欢迎来到群岛。')
  const [showDonate, setShowDonate] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [swState, setSwState] = useState({ needUpdate: false, offline: false })

  // 同步 audio 模块与存档中的音效开关。
  useEffect(() => {
    audio.setEnabled(save.settings.soundOn)
  }, [save.settings.soundOn])

  // 订阅 Service Worker 状态（离线 / 新版本）
  useEffect(() => {
    return subscribeSw(setSwState)
  }, [])

  // 进入"档案"场景时自动 reconcile 一次徽章（不强制，但能让旧存档补齐徽章）。
  useEffect(() => {
    if (scene.name === 'profile') syncBadges(pythonBasics)
  }, [scene.name, syncBadges])

  // 进入 WorldMap 时，如已有错题且今日未提醒 → 主动请求权限 + 发一次通知
  // 注意：仅在 world scene 触发，不在 game scene 打断玩家
  useEffect(() => {
    if (scene.name !== 'world') return
    const wrongCount = (save.wrongAnswers ?? []).length
    if (wrongCount === 0) return
    if (shouldNotifyToday()) {
      // 已授权 + 今日未提醒 → 直接发
      fireWrongBookReminder(wrongCount)
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      // 未授权 → 异步请求一次（用户拒绝则不再追问）
      requestNotificationPermission().then((perm) => {
        if (perm === 'granted') fireWrongBookReminder(wrongCount)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.name])

  const download = () => {
    audio.play('click')
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code-isles-save.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    audio.play('click')
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const ok = importSave(await file.text())
    setStatus(ok ? '存档导入成功。' : '导入失败：这不是有效的群岛存档。')
  }

  const onToggleSound = () => {
    toggleSound()
    // 开启时给个轻 click 作"开启音效"反馈；关闭时不响。
    if (!save.settings.soundOn) audio.play('click')
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
        <PixelButton variant="ghost" onClick={onToggleSound}>
          音效：{save.settings.soundOn ? '开' : '关'}
        </PixelButton>
        <PixelButton variant="ghost" onClick={() => setShowDonate(true)}>
          打赏作者
        </PixelButton>
        <PixelButton
          variant="danger"
          onClick={() => {
            audio.play('click')
            resetSave()
            setStatus('存档已清除。')
          }}
        >
          清除存档
        </PixelButton>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
      <p className="status-line">{status}</p>
      {persistFailed && (
        <p className="persist-warning" role="status">
          ⚠ 进度无法写入浏览器（隐私模式或存储已满）。本次冒险仍可继续，但下次打开会丢失。
        </p>
      )}
    </PixelPanel>
  )

  const corruptNotice = corruptDetected ? (
    <PixelPanel className="corrupt-notice" title="存档已自动重置">
      <p className="corrupt-notice__text">
        ⚠ 检测到旧存档数据已损坏，已为你重置为初始状态。如之前有重要进度，请用「导出存档」定期备份；
        出现此提示通常意味着浏览器异常关闭或存储被其他程序修改。
      </p>
      <div className="row row--center">
        <PixelButton onClick={dismissCorruptNotice}>知道了</PixelButton>
      </div>
    </PixelPanel>
  ) : null

  const offlineBanner = swState.offline ? (
    <PixelPanel className="offline-banner" title="离线模式">
      <p className="offline-banner__text">
        ⚠ 当前网络不可用。本应用已缓存到本地，离线时仍可继续答题；联网后自动恢复。
      </p>
    </PixelPanel>
  ) : null

  const updateBanner = swState.needUpdate ? (
    <PixelPanel className="update-banner" title="新版本可用">
      <p className="update-banner__text">
        已下载好新版代码，是否立即刷新？刷新后会清空当前页面状态（存档在 localStorage 不受影响）。
      </p>
      <div className="row row--center">
        <PixelButton
          onClick={() => {
            applyUpdate()
            // 给 SKIP_WAITING + new SW 接管 + clients.claim 一点点时间
            setTimeout(() => window.location.reload(), 300)
          }}
        >
          立即刷新
        </PixelButton>
        <PixelButton variant="ghost" onClick={() => setSwState((s) => ({ ...s, needUpdate: false }))}>
          稍后
        </PixelButton>
      </div>
    </PixelPanel>
  ) : null

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
        {offlineBanner}
        {updateBanner}
        {corruptNotice}
        {saveTools}
        <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
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

      {offlineBanner}
      {updateBanner}
      {corruptNotice}

      {scene.name === 'world' && (
        <>
          <WorldMap
            course={pythonBasics}
            save={save}
            onEnter={(regionIndex) => setScene({ name: 'region', regionIndex })}
            onOpenProfile={() => setScene({ name: 'profile' })}
          />
          <PixelPanel title="冒险者档案">
            <div className="row row--center">
              <PixelButton onClick={() => setScene({ name: 'profile' })}>
                冒险者徽章
              </PixelButton>
            </div>
          </PixelPanel>
        </>
      )}

      {scene.name === 'profile' && (
        <ProfileView
          course={pythonBasics}
          save={save}
          onBack={() => setScene({ name: 'world' })}
          onStartReview={() => setScene({ name: 'review' })}
        />
      )}

      {scene.name === 'review' && (
        <ReviewSessionView
          course={pythonBasics}
          save={save}
          onExit={() => setScene({ name: 'profile' })}
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
      <footer className="footnote">
        M0~M5：基础架构 + Python 基础课程 + 经济闭环 + 成就系统 + 打赏入口。完整规划见 docs/product-plan.md
      </footer>
      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
    </main>
  )
}
