import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { audio } from './core/audio'
import { useGameStore } from './core/store'
import { applyUpdate, subscribeSw } from './core/serviceWorker'
import {
  fireWrongBookReminder,
  requestNotificationPermission,
  shouldNotifyToday,
} from './core/notifications'
import { COURSE_PREF_KEY, COURSES, DEFAULT_COURSE_ID, courseProgress, getCourse } from './content/courses'
import { AnnouncePanel } from './ui/AnnouncePanel'
import { DonateModal } from './ui/DonateModal'
import { LevelView } from './ui/LevelView'
import { MainMenu } from './ui/MainMenu'
import { PixelButton } from './ui/PixelButton'
import { PixelPanel } from './ui/PixelPanel'
import { ProfileView } from './ui/ProfileView'
import { RegionMap } from './ui/RegionMap'
import { ReviewSessionView } from './ui/ReviewSessionView'
import { SideMenu } from './ui/SideMenu'
import { WorldMap } from './ui/WorldMap'
import { XpBar } from './ui/XpBar'

type Scene =
  | { name: 'title' }
  | { name: 'world' }
  | { name: 'region'; regionIndex: number }
  | { name: 'level'; regionIndex: number; levelIndex: number }
  | { name: 'profile' }
  | { name: 'review'; focusQuestionKey?: string }

function readCoursePref(): string {
  try {
    return localStorage.getItem(COURSE_PREF_KEY) ?? DEFAULT_COURSE_ID
  } catch {
    return DEFAULT_COURSE_ID
  }
}

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
  const [courseId, setCourseId] = useState(readCoursePref)
  const fileRef = useRef<HTMLInputElement>(null)
  const [swState, setSwState] = useState({ needUpdate: false, offline: false })

  const course = getCourse(courseId)

  // 状态条 4 秒后自动回落默认文案 —— 一次性提示（导出成功/切课等）不该永久驻留
  useEffect(() => {
    if (status === '欢迎来到群岛。') return
    const t = setTimeout(() => setStatus('欢迎来到群岛。'), 4000)
    return () => clearTimeout(t)
  }, [status])

  // 课程选择持久化（独立于存档：换课不清进度，也不随存档导出）
  useEffect(() => {
    try {
      localStorage.setItem(COURSE_PREF_KEY, courseId)
    } catch {
      // 隐私模式下存不进去也无妨，会话内仍生效
    }
  }, [courseId])

  // 同步 audio 模块与存档中的音效开关。
  useEffect(() => {
    audio.setEnabled(save.settings.soundOn)
  }, [save.settings.soundOn])

  // 订阅 Service Worker 状态（离线 / 新版本）
  useEffect(() => {
    return subscribeSw(setSwState)
  }, [])

  // 进入"档案"场景时自动 reconcile 一次徽章（按当前课程计算）。
  useEffect(() => {
    if (scene.name === 'profile') syncBadges(course)
  }, [scene.name, course, syncBadges])

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

  // —— 工具箱动作（渲染在左菜单）——
  const download = () => {
    audio.play('click')
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'code-isles-save.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('存档已导出。')
  }

  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    audio.play('click')
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const ok = importSave(await file.text())
    setStatus(ok ? '存档导入成功。' : '导入失败：这不是有效的群岛存档。')
    if (ok) setStatus('存档导入成功。')
  }

  const onToggleSound = () => {
    toggleSound()
    // 开启时给个轻 click 作"开启音效"反馈；关闭时不响。
    if (!save.settings.soundOn) audio.play('click')
  }

  const onReset = () => {
    audio.play('click')
    resetSave()
    setScene({ name: 'title' })
    setStatus('存档已清除。')
  }

  // 课程切换：进行中的关卡/区域回退到新课程的世界地图（title 场景原地不动）
  const onSelectCourse = (id: string) => {
    const next = getCourse(id)
    setCourseId(id)
    setScene((s) => (s.name === 'title' ? s : { name: 'world' }))
    setStatus(`已切换到「${next.lang ?? next.title}」。`)
  }

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

  const statusLine = <p className="status-line">{status}</p>

  // 独立主菜单：开屏页全屏独占，不与游戏内三栏壳混用
  if (scene.name === 'title') {
    return (
      <main className="mainmenu-screen">
        {offlineBanner}
        {updateBanner}
        {corruptNotice}
        <MainMenu
          save={save}
          hasSave={hasSave}
          onStart={() => setScene({ name: 'world' })}
          onProfile={() => setScene({ name: 'profile' })}
          onReview={() => setScene({ name: 'review' })}
          statusLine={statusLine}
        />
        <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
      </main>
    )
  }

  return (
    <div className="app-shell">
      <SideMenu
        sceneName={scene.name}
        activeCourse={course}
        save={save}
        onSelectCourse={onSelectCourse}
        onGoTitle={() => setScene({ name: 'title' })}
        onGoWorld={() => setScene({ name: 'world' })}
        onGoProfile={() => setScene({ name: 'profile' })}
        onGoReview={() => setScene({ name: 'review' })}
        onExport={download}
        onImportClick={() => fileRef.current?.click()}
        onToggleSound={onToggleSound}
        soundOn={save.settings.soundOn}
        onDonate={() => setShowDonate(true)}
        onReset={onReset}
        persistFailed={persistFailed}
      />

      <main className="screen">
        {offlineBanner}
        {updateBanner}
        {corruptNotice}

        <PixelPanel title="冒险者">
          <XpBar xp={save.player.xp} />
          <p className="stat-line status-bar__gold">
            金币 <strong className="gold">{save.player.gold}</strong>
          </p>
        </PixelPanel>

        {scene.name === 'world' && (
          <>
            {/* 语言选择：进入世界地图后第一步选语言，切换即刷新下方地图 */}
            <PixelPanel title="选择要学的语言">
              <div className="lang-pick" role="tablist" aria-label="选择要学的语言">
                {COURSES.map((c) => {
                  const active = c.id === course.id
                  const prog = courseProgress(save, c)
                  const pct = prog.total > 0 ? Math.round((prog.cleared / prog.total) * 100) : 0
                  return (
                    <button
                      key={c.id}
                      role="tab"
                      aria-selected={active}
                      className={`lang-tab${active ? ' lang-tab--active' : ''}`}
                      onClick={() => {
                        if (active) return
                        audio.play('click')
                        onSelectCourse(c.id)
                      }}
                    >
                      <span className="lang-tab__name">{c.lang ?? c.title}</span>
                      <span className="lang-tab__meta">
                        {prog.total > 0 ? `${prog.cleared}/${prog.total} 关 · ${pct}%` : '敬请期待'}
                      </span>
                      <span className="lang-tab__bar" aria-hidden="true">
                        <span className="lang-tab__bar-fill" style={{ width: `${pct}%` }} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </PixelPanel>
            <WorldMap
              course={course}
              save={save}
              onEnter={(regionIndex) => setScene({ name: 'region', regionIndex })}
              onOpenProfile={() => setScene({ name: 'profile' })}
            />
            {statusLine}
          </>
        )}

        {scene.name === 'profile' && (
          <ProfileView
            course={course}
            save={save}
            onBack={() => setScene({ name: 'world' })}
            onStartReview={() => setScene({ name: 'review' })}
            onStartReviewQuestion={(qk) => setScene({ name: 'review', focusQuestionKey: qk })}
          />
        )}

        {scene.name === 'review' && (
          <ReviewSessionView
            course={course}
            save={save}
            onExit={() => setScene({ name: 'profile' })}
            focusQuestionKey={scene.focusQuestionKey}
          />
        )}

        {scene.name === 'region' && (
          <RegionMap
            region={course.regions[scene.regionIndex]}
            save={save}
            onBack={() => setScene({ name: 'world' })}
            onEnterLevel={(levelIndex) =>
              setScene({ name: 'level', regionIndex: scene.regionIndex, levelIndex })
            }
          />
        )}

        {scene.name === 'level' && (
          <LevelView
            regionId={course.regions[scene.regionIndex].id}
            level={course.regions[scene.regionIndex].levels[scene.levelIndex]}
            onBack={() => setScene({ name: 'region', regionIndex: scene.regionIndex })}
          />
        )}

        <footer className="footnote">
          代码群岛 · 多课程像素学习游戏。左侧菜单可切换课程 / 云端同步 / 工具箱；右侧为更新公告。
        </footer>
        <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
      </main>

      <AnnouncePanel />
    </div>
  )
}