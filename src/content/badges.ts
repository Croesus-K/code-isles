/**
 * 徽章定义数据。10 枚冒险者徽章，覆盖 M4 里程碑的"成就感"维度。
 * 所有徽章的达成条件都可在纯函数 earnedBadgeIds(save, course) 中推导出来
 * （见 ../core/badges.ts），无需在关卡流程中额外埋点。
 *
 * 字段约定：
 * - id：稳定的英文串，存档里只存这个；新增/删除只能从末尾追加，旧的永远保留。
 * - name / desc：纯展示文案，便于以后改语种不影响存档。
 * - icon：单个 emoji，作为徽章卡片左上角的小图标。
 */

export interface BadgeDef {
  id: string
  name: string
  desc: string
  icon: string
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-voyage',
    name: '初航',
    desc: '通过第一关。',
    icon: '⚓',
  },
  {
    id: 'region-1-master',
    name: '变量平原之主',
    desc: '通关变量平原全部关卡。',
    icon: '🏔',
  },
  {
    id: 'region-2-master',
    name: '分支森林之主',
    desc: '通关分支森林全部关卡。',
    icon: '🌲',
  },
  {
    id: 'region-3-master',
    name: '循环洞窟之主',
    desc: '通关循环洞窟全部关卡。',
    icon: '⛰',
  },
  {
    id: 'region-4-master',
    name: '列表湖之主',
    desc: '通关列表湖全部关卡。',
    icon: '🌊',
  },
  {
    id: 'region-5-master',
    name: '字典城之主',
    desc: '通关字典城全部关卡。',
    icon: '🏰',
  },
  {
    id: 'star-apprentice',
    name: '三星学徒',
    desc: '任意一关获得 ★★★ 评价。',
    icon: '⭐',
  },
  {
    id: 'perfectionist',
    name: '完美主义者',
    desc: '同一区域内所有关卡均获得 ★★★。',
    icon: '💎',
  },
  {
    id: 'flawless-warrior',
    name: '零伤勇士',
    desc: '任意 Boss 关以零错误零提示通关。',
    icon: '🛡',
  },
  {
    id: 'graduate',
    name: '毕业生',
    desc: '通过毕业大测验（字典城 B 关）。',
    icon: '🎓',
  },
]

/** id → 定义 的快速查询表；缺失时返回 undefined，调用方需自行处理。 */
export const BADGE_INDEX: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
)