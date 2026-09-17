/**
 * 公告 / 更新日志。
 *
 * 数据流：
 *  1. 内置兜底列表 src/content/announcements.ts（随版本发布，离线可用）
 *  2. 运行时抓取 /announcements.json（no-store + 时间戳防 SW 缓存）
 *  3. 两者按 id 去重合并，按日期倒序；远端条目优先展示
 *
 * 站长发布新公告的两种方式（详见 docs/cloud-and-announcements.md）：
 *  - 改仓库里的 public/announcements.json → 重新部署
 *  - 把 json 里的 remoteUrl 指向你的公开 Gist raw 地址 → 改 Gist 即时生效，无需重新部署
 */

export type AnnouncementTag = 'feature' | 'fix' | 'notice'

export interface Announcement {
  /** 稳定唯一 id（去重 + 已读判断的依据），如 'r17-review-jump' */
  id: string
  /** YYYY-MM-DD */
  date: string
  tag: AnnouncementTag
  title: string
  body: string
}

/** localStorage 键：记录"最后一次全部已读"的 ISO 时间 */
export const ANN_LAST_READ_KEY = 'code-isles-ann-last-read'

/** 内置兜底列表（与 public/announcements.json 保持同步，json 优先） */
export const BUNDLED_ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: 'r18-quiz-state-fix',
    date: '2026-09-17',
    tag: 'fix',
    title: '答题状态泄漏修复',
    body: '修复换题后选项高亮 / 解析残留的问题；此前在残影状态下点「下一题」会被误判为答对并白拿星级。',
  },
  {
    id: 'r17-review-jump',
    date: '2026-09-17',
    tag: 'feature',
    title: '错题本点击直达复习',
    body: '档案页错题本条目现在可以整条点击，直接进入该题的单题复习模式。',
  },
  {
    id: 'r16-review-shortcut',
    date: '2026-09-17',
    tag: 'feature',
    title: 'R 键加入复习队列',
    body: '答题界面按 R 可把当前题加入复习队列（不虚增答错统计），底部有按键提示。',
  },
  {
    id: 'r15-worldmap-progress',
    date: '2026-09-16',
    tag: 'feature',
    title: '世界地图通关进度条',
    body: '世界地图新增全局通关进度（已通关 / 可玩关卡总数），建设中区域不计入分母。',
  },
  {
    id: 'r14-import-export',
    date: '2026-09-16',
    tag: 'feature',
    title: '错题本 Markdown 导入 / 导出',
    body: '支持把错题本导出为 Markdown 复制或下载，也能粘贴回错题本一键恢复（跨设备迁移不用导存档了）。',
  },
  {
    id: 'r13-stats',
    date: '2026-09-16',
    tag: 'feature',
    title: '学习统计与周报',
    body: '档案页新增最近 7 天活动柱状图、正确率、连续打卡与 30 天热力图；历史保留 90 天。',
  },
  {
    id: 'r12-a11y',
    date: '2026-09-15',
    tag: 'notice',
    title: '无障碍与键盘操作强化',
    body: '接入 eslint-plugin-jsx-a11y；选择题可用数字键 1~N 作答、Enter 进下一题；弹窗键盘可达。',
  },
]

/** 按 id 去重（远端优先），按日期倒序，非法条目丢弃 */
export function mergeAnnouncements(
  bundled: readonly Announcement[],
  remote: readonly Announcement[],
): Announcement[] {
  const seen = new Set<string>()
  const out: Announcement[] = []
  for (const a of [...remote, ...bundled]) {
    if (!a || typeof a.id !== 'string' || typeof a.title !== 'string') continue
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date ?? '')) continue
    if (seen.has(a.id)) continue
    seen.add(a.id)
    out.push({ id: a.id, date: a.date, tag: a.tag ?? 'notice', title: a.title, body: a.body ?? '' })
  }
  return out.sort((x, y) => y.date.localeCompare(x.date))
}

/** 未读数：date 大于 lastRead 的条目数；lastRead 为空 → 全部未读 */
export function unreadCount(list: readonly Announcement[], lastReadIso: string | null): number {
  if (!lastReadIso) return list.length
  return list.filter((a) => a.date > lastReadIso.slice(0, 10)).length
}

export interface LoadAnnouncementsResult {
  list: Announcement[]
  /** true = 成功用到了远端（json 文件或 remoteUrl 指向的源） */
  fromRemote: boolean
}

/**
 * 加载公告：尝试 fetch json（同源或 remoteUrl），失败静默回退内置列表。
 * fetchImpl 可注入（单测）；生产传 fetch。
 */
export async function loadAnnouncements(
  baseUrl: string,
  fetchImpl: typeof fetch,
): Promise<LoadAnnouncementsResult> {
  const bundled = BUNDLED_ANNOUNCEMENTS
  try {
    // 先抓本地 json（它可能带 remoteUrl 指向 Gist 等外部源）
    const res = await fetchImpl(`${baseUrl}announcements.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: unknown = await res.json()
    const json = data as { remoteUrl?: string; announcements?: Announcement[] }
    const localList = Array.isArray(json.announcements) ? json.announcements : []

    if (json.remoteUrl) {
      // 远端失败不拖垮整体：落到本地 json 的列表（或最终内置兜底）
      try {
        const remote = await fetchImpl(`${json.remoteUrl}?t=${Date.now()}`, { cache: 'no-store' })
        if (remote.ok) {
          const remoteData: unknown = await remote.json()
          const remoteList: Announcement[] = Array.isArray(remoteData)
            ? remoteData
            : Array.isArray((remoteData as { announcements?: Announcement[] }).announcements)
              ? (remoteData as { announcements: Announcement[] }).announcements
              : []
          return { list: mergeAnnouncements(bundled, [...localList, ...remoteList]), fromRemote: true }
        }
      } catch {
        // fall through
      }
    }
    if (localList.length > 0) return { list: mergeAnnouncements(bundled, localList), fromRemote: true }
    return { list: mergeAnnouncements(bundled, []), fromRemote: false }
  } catch {
    return { list: mergeAnnouncements(bundled, []), fromRemote: false }
  }
}