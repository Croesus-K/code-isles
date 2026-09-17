import type { CourseDef } from '../content/course'
import { COURSES, courseProgress } from '../content/courses'
import type { SaveData } from '../core/save/schema'
import { audio } from '../core/audio'
import { CloudSyncPanel } from './CloudSyncPanel'

export interface SideMenuProps {
  /** 当前场景名（用于高亮入口 + 导航时决定是否重置到 world） */
  sceneName: 'title' | 'world' | 'region' | 'level' | 'profile' | 'review'
  activeCourse: CourseDef
  save: SaveData
  /** 课程切换：menu 换课后通知 App 重置场景到新课程的 world（或留在 title） */
  onSelectCourse: (courseId: string) => void
  onGoWorld: () => void
  onGoProfile: () => void
  onGoReview: () => void
  // —— 工具箱（原首页工具箱整体搬进菜单）——
  onExport: () => void
  onImportClick: () => void
  onToggleSound: () => void
  soundOn: boolean
  onDonate: () => void
  onReset: () => void
  persistFailed: boolean
}

/**
 * 左侧常驻菜单：课程切换 / 快捷入口 / 云端存档 / 工具箱。
 * 桌面三栏布局的左栏；窄屏下 CSS 折叠为顶部块。
 */
export function SideMenu(p: SideMenuProps) {
  const inGame = p.sceneName === 'region' || p.sceneName === 'level'
  return (
    <aside className="sidemenu" aria-label="游戏菜单">
      {/* —— 课程 —— */}
      <section className="sidemenu__section" aria-label="课程">
        <h4 className="side-title">课程</h4>
        <ul className="course-list">
          {COURSES.map((c) => {
            const active = c.id === p.activeCourse.id
            const prog = courseProgress(p.save, c)
            const pct = prog.total > 0 ? Math.round((prog.cleared / prog.total) * 100) : 0
            return (
              <li key={c.id}>
                <button
                  className={`course-item${active ? ' course-item--active' : ''}`}
                  onClick={() => {
                    if (active) return
                    audio.play('click')
                    p.onSelectCourse(c.id)
                  }}
                  aria-current={active ? 'true' : undefined}
                >
                  <span className="course-item__name">{c.lang ?? c.title}</span>
                  <span className="course-item__meta">
                    {prog.total > 0 ? `${prog.cleared}/${prog.total} 关 · ${pct}%` : '敬请期待'}
                  </span>
                  <span className="course-item__bar" aria-hidden="true">
                    <span className="course-item__bar-fill" style={{ width: `${pct}%` }} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="side-note">切换课程不影响已有进度，两门课的进度都保存在同一份存档里。</p>
      </section>

      {/* —— 快捷入口 —— */}
      <section className="sidemenu__section" aria-label="快捷入口">
        <h4 className="side-title">冒险</h4>
        <ul className="side-links">
          <li>
            <button className="side-link" onClick={() => { audio.play('click'); p.onGoWorld() }}>
              🗺 {inGame ? '返回世界地图' : '世界地图'}
            </button>
          </li>
          <li>
            <button className="side-link" onClick={() => { audio.play('click'); p.onGoProfile() }}>
              🏅 档案 · 成就徽章
            </button>
          </li>
          <li>
            <button className="side-link" onClick={() => { audio.play('click'); p.onGoReview() }}>
              📒 复习错题{(p.save.wrongAnswers?.length ?? 0) > 0 ? `（${p.save.wrongAnswers.length}）` : ''}
            </button>
          </li>
        </ul>
      </section>

      {/* —— 云端存档 —— */}
      <CloudSyncPanel />

      {/* —— 工具箱 —— */}
      <section className="sidemenu__section" aria-label="工具箱">
        <h4 className="side-title">工具箱</h4>
        <div className="side-tools">
          <button className="side-btn" onClick={p.onExport}>导出存档</button>
          <button className="side-btn" onClick={p.onImportClick}>导入存档</button>
          <button className="side-btn" onClick={p.onToggleSound}>音效：{p.soundOn ? '开' : '关'}</button>
          <button className="side-btn" onClick={p.onDonate}>打赏作者</button>
          <button className="side-btn side-btn--danger" onClick={p.onReset}>清除存档</button>
        </div>
        {p.persistFailed && (
          <p className="persist-warning" role="status">
            ⚠ 进度无法写入浏览器（隐私模式或存储已满）。本次冒险仍可继续，但下次打开会丢失。
          </p>
        )}
      </section>
    </aside>
  )
}