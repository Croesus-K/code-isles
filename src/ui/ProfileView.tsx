import { useMemo, useState } from 'react'
import { BADGES, BADGE_INDEX } from '../content/badges'
import { earnedBadgeIds } from '../core/badges'
import type { CourseDef } from '../content/course'
import type { SaveData, WrongAnswerRecord } from '../core/save/schema'
import { useGameStore } from '../core/store'
import { audio } from '../core/audio'
import { copyTextToClipboard } from '../core/clipboard'
import { downloadWrongBookMarkdown, renderWrongBookMarkdown } from '../core/wrongbook-export'
import { importWrongBookFromMarkdown, type ImportResult } from '../core/wrongbook-import'
import { lastNDays, weeklyReport } from '../core/stats'
import { t } from '../core/strings'
import { PixelPanel } from './PixelPanel'
import { PixelButton } from './PixelButton'
import { Toast } from './Toast'

interface Props {
  course: CourseDef
  save: SaveData
  onBack: () => void
  onStartReview: () => void
  /** 点错题条目直达复习该题 */
  onStartReviewQuestion: (questionKey: string) => void
}

interface ResolvedWrong {
  record: WrongAnswerRecord
  regionName: string
  levelName: string
  questionPreview: string
  levelIndex: number
  questionIndex: number
}

const QUESTION_PREVIEW_LEN = 40

/**
 * 把 questionKey (`regionId:levelId:questionIndex`) 拆出来，从 course 查回上下文。
 * 查不到的（旧存档 / 数据漂移）返回 null，由调用方决定如何展示。
 */
function resolveWrong(
  record: WrongAnswerRecord,
  course: CourseDef,
): ResolvedWrong | null {
  const parts = record.questionKey.split(':')
  if (parts.length !== 3) return null
  const [regionId, levelId, qIdxStr] = parts
  const regionIndex = course.regions.findIndex((r) => r.id === regionId)
  if (regionIndex < 0) return null
  const region = course.regions[regionIndex]
  const levelIndex = region.levels.findIndex((l) => l.id === levelId)
  if (levelIndex < 0) return null
  const level = region.levels[levelIndex]
  const questionIndex = parseInt(qIdxStr, 10)
  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= level.questions.length) {
    return null
  }
  const q = level.questions[questionIndex]
  const preview = q.prompt.length > QUESTION_PREVIEW_LEN
    ? q.prompt.slice(0, QUESTION_PREVIEW_LEN) + '…'
    : q.prompt
  return {
    record,
    regionName: region.name,
    levelName: level.name,
    questionPreview: preview.replace(/\n/g, ' '),
    levelIndex,
    questionIndex,
  }
}

/**
 * 冒险者档案：徽章墙 + 概览数字 + 错题本。
 * 已达成徽章 = 亮卡；未达成 = 灰卡，显示达成条件文案。
 * 错题本按区域 → 关卡分组，最多展示前 50 条（更多提示"+"）。
 */
export function ProfileView({
  course,
  save,
  onBack,
  onStartReview,
  onStartReviewQuestion,
}: Props) {
  const earnedSet = useMemo(() => new Set(earnedBadgeIds(save, course)), [save, course])
  const earnedCount = earnedSet.size
  const totalCount = BADGES.length

  // 汇总"冒险者概况"——XP、等级、金币、通关关数、毕业状态。
  const totalCleared = Object.values(save.regions).reduce(
    (acc, rp) => acc + Object.values(rp.levels).filter((lp) => lp.cleared).length,
    0,
  )
  const totalLv = course.regions.reduce((acc, r) => acc + r.levels.length, 0)

  // 解析错题：剔掉无法解析的（content 改版后旧 key 失效），按最近时间倒序
  const wrongList = useMemo(() => {
    const list = (save.wrongAnswers ?? [])
      .map((r) => resolveWrong(r, course))
      .filter((x): x is ResolvedWrong => x !== null)
    list.sort((a, b) => (b.record.wrongAt || '').localeCompare(a.record.wrongAt || ''))
    return list
  }, [save.wrongAnswers, course])

  const WRONG_PREVIEW_LIMIT = 50
  const visibleWrong = wrongList.slice(0, WRONG_PREVIEW_LIMIT)
  const hiddenCount = wrongList.length - visibleWrong.length

  // 学习统计：周报 + 7 天活动柱状图
  const weekly = useMemo(() => weeklyReport(save.history ?? []), [save.history])
  const last7 = useMemo(() => lastNDays(save.history ?? [], 7), [save.history])
  const last30 = useMemo(() => lastNDays(save.history ?? [], 30), [save.history])
  const totalAnswers = weekly.totalCorrect + weekly.totalWrong
  const accuracyPct = totalAnswers === 0 ? 0 : Math.round(weekly.accuracy * 100)
  void last30 // 留作后续热力图扩展

  const [toast, setToast] = useState<string | null>(null)
  const onCopyWrongBook = async () => {
    audio.play('click')
    const md = renderWrongBookMarkdown(save.wrongAnswers ?? [], course)
    const ok = await copyTextToClipboard(md)
    setToast(ok ? t('toast.copied') : t('toast.copyFail'))
  }

  // 错题本导入：粘贴 Markdown → 解析 → 合并到 save
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const appendWrongAnswers = useGameStore((s) => s.appendWrongAnswers)
  const onParseImport = () => {
    audio.play('click')
    if (!importText.trim()) {
      setToast(t('toast.importEmpty'))
      return
    }
    const existing = new Set((save.wrongAnswers ?? []).map((w) => w.questionKey))
    const result: ImportResult = importWrongBookFromMarkdown(
      importText,
      course,
      existing,
    )
    const added = appendWrongAnswers(result.records)
    const finalAdded = added
    const finalSkipped = result.skipped + (result.records.length - added)
    setToast(
      result.added === 0 && result.skipped === 0 && result.unrecognized === 0
        ? t('toast.importEmpty')
        : t('toast.imported', {
            added: finalAdded,
            skipped: finalSkipped,
            unrecognized: result.unrecognized,
          }),
    )
    // 成功导入或跳过部分即可清空；unrecognized > 0 时保留供用户检查
    if (finalAdded > 0 || finalSkipped > 0) {
      setImportText('')
      setShowImport(false)
    }
    void finalAdded
    void finalSkipped
  }

  return (
    <>
      <div className="crumbs">
        <button className="crumb-btn" onClick={onBack}>
          ← 返回世界地图
        </button>
        <span>／ 冒险者档案</span>
      </div>

      <PixelPanel title="冒险者概况">
        <p className="profile-summary">
          金币 <strong className="gold">{save.player.gold}</strong> · XP {save.player.xp} · 通关{' '}
          {totalCleared}/{totalLv} 关 · 徽章 {earnedCount}/{totalCount}
        </p>
      </PixelPanel>

      <PixelPanel title="📊 学习统计 · 最近 7 天">
        {totalAnswers === 0 && weekly.totalCleared === 0 ? (
          <p className="stats__empty">还没有活动记录——去通关一关，统计就开始生长 ✨</p>
        ) : (
          <>
            <div className="stats__kpis">
              <div className="stats__kpi">
                <div className="stats__kpi-val">{weekly.totalCleared}</div>
                <div className="stats__kpi-label">通关</div>
              </div>
              <div className="stats__kpi">
                <div className="stats__kpi-val">{totalAnswers}</div>
                <div className="stats__kpi-label">答题</div>
              </div>
              <div className="stats__kpi">
                <div className="stats__kpi-val">{accuracyPct}%</div>
                <div className="stats__kpi-label">正确率</div>
              </div>
              <div className="stats__kpi">
                <div className="stats__kpi-val">{weekly.currentStreak}</div>
                <div className="stats__kpi-label">连续天数</div>
              </div>
              <div className="stats__kpi">
                <div className="stats__kpi-val">{weekly.bestStreak}</div>
                <div className="stats__kpi-label">最佳连击</div>
              </div>
            </div>
            <div
              className="stats__bars"
              role="img"
              aria-label={`最近 7 天活动：${last7.map((c) => `${c.date} 答对 ${c.correct} 答错 ${c.wrong}`).join('；')}`}
            >
              {last7.map((c) => {
                const total = c.correct + c.wrong
                const heightPct = total === 0 ? 4 : Math.max(8, (total / 8) * 100) // 8 题/天 = 满格参考线
                const isToday = c.date === last7[last7.length - 1].date
                const dayLabel = c.date.slice(5) // MM-DD
                return (
                  <div key={c.date} className="stats__bar-col" title={t('stats.barTip', { date: c.date, correct: c.correct, wrong: c.wrong, cleared: c.cleared })}>
                    <div className={`stats__bar ${isToday ? 'stats__bar--today' : ''}`} style={{ height: `${heightPct}%` }} />
                    <div className="stats__bar-label">{dayLabel}</div>
                  </div>
                )
              })}
            </div>
            <p className="stats__legend">柱高 = 答题数 · 今日柱额外高亮 · 7 天活动 ≥ 1 即计入连续天数</p>
          </>
        )}
      </PixelPanel>

      <PixelPanel
        title={`错题本（${wrongList.length}）`}
        className={wrongList.length === 0 ? 'wrongbook wrongbook--empty' : 'wrongbook'}
      >
        {wrongList.length === 0 ? (
          <p className="wrongbook__empty">还没有错题，继续保持 ✨</p>
        ) : (
          <>
            <p className="wrongbook__hint">
              这些是最近答错的题目；全对通关会自动从错题本移除。
              {hiddenCount > 0 && ` 仅显示最近 ${WRONG_PREVIEW_LIMIT} 条，还有 ${hiddenCount} 条更早的。`}
            </p>
            <ul className="wrongbook__list">
              {visibleWrong.map((w) => (
                <li key={w.record.questionKey}>
                  <button
                    type="button"
                    className="wrongbook__item wrongbook__item--clickable"
                    onClick={() => {
                      audio.play('click')
                      onStartReviewQuestion(w.record.questionKey)
                    }}
                    title={`直达复习：${w.regionName} · ${w.levelName}`}
                    aria-label={`复习：${w.regionName} · ${w.levelName}，${w.questionPreview}（答错 ${w.record.attempts} 次）`}
                  >
                    <span className="wrongbook__where">
                      {w.regionName} · {w.levelName}
                    </span>
                    <span className="wrongbook__q">{w.questionPreview}</span>
                    <span className="wrongbook__attempts" aria-hidden="true">
                      ×{w.record.attempts}
                    </span>
                    <span className="wrongbook__cta" aria-hidden="true">→</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="row row--center">
              <PixelButton
                onClick={onStartReview}
                disabled={wrongList.length === 0}
                title={wrongList.length === 0 ? '错题本为空，没有可复习的题目' : `复习 ${wrongList.length} 道错题`}
              >
                📘 复习这 {wrongList.length} 道错题
              </PixelButton>
              <PixelButton
                variant="ghost"
                onClick={() => {
                  audio.play('click')
                  downloadWrongBookMarkdown(save.wrongAnswers ?? [], course)
                }}
                disabled={wrongList.length === 0}
                title={wrongList.length === 0 ? '没有错题可导出' : '导出 Markdown 清单'}
              >
                📄 导出错题清单
              </PixelButton>
              <PixelButton
                variant="ghost"
                onClick={onCopyWrongBook}
                disabled={wrongList.length === 0}
                title={wrongList.length === 0 ? '没有错题可复制' : '复制 Markdown 清单到剪贴板'}
              >
                📋 复制到剪贴板
              </PixelButton>
              <PixelButton
                variant="ghost"
                onClick={() => {
                  if (confirm('确定清空所有错题记录？')) {
                    useGameStore.getState().clearWrongAnswers()
                  }
                }}
              >
                清空错题本
              </PixelButton>
            </div>
          </>
        )}
      </PixelPanel>

      <PixelPanel title={t('panel.import')}>
        <p className="muted small">{t('import.hint')}</p>
        {showImport ? (
          <div className="import-area">
            <textarea
              className="import-area__textarea"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={t('import.placeholder')}
              rows={10}
              spellCheck={false}
              aria-label={t('panel.import')}
            />
            <div className="row row--center">
              <PixelButton variant="ghost" onClick={onParseImport} disabled={!importText.trim()}>
                {t('import.btn.parse')}
              </PixelButton>
              <PixelButton
                variant="ghost"
                onClick={() => {
                  audio.play('click')
                  setImportText('')
                  setShowImport(false)
                }}
              >
                {t('import.btn.cancel')}
              </PixelButton>
            </div>
          </div>
        ) : (
          <div className="row row--center">
            <PixelButton variant="ghost" onClick={() => setShowImport(true)}>
              📥 粘贴 Markdown 导入
            </PixelButton>
          </div>
        )}
      </PixelPanel>

      <PixelPanel title="徽章墙">
        <div className="badge-grid">
          {BADGES.map((b) => {
            const got = earnedSet.has(b.id)
            return (
              <div
                key={b.id}
                className={`badge-card ${got ? 'badge-card--earned' : 'badge-card--locked'}`}
                aria-label={got ? `已获得：${b.name}` : `未获得：${b.name}`}
              >
                <div className="badge-card__icon">{got ? b.icon : '🔒'}</div>
                <div className="badge-card__name">{BADGE_INDEX[b.id]?.name ?? b.name}</div>
                <div className="badge-card__desc">{b.desc}</div>
                <div className="badge-card__state">{got ? '已获得' : '未达成'}</div>
              </div>
            )
          })}
        </div>
      </PixelPanel>

      <div className="row row--center">
        <PixelButton onClick={onBack}>回到世界地图</PixelButton>
      </div>
      <Toast message={toast} />
    </>
  )
}