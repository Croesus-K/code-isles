/**
 * UI 文案集中管理
 *
 * 设计取舍：
 * - 当前仅 zh-CN 单语；先抽出框架，未来加 en-US 时只需新增一份字典 + 切换函数
 * - 不抽内容（题目 prompt/explain/answer/区域名）—— 教学内容由 content/* 提供
 * - 不抽动态日志（console、错误信息）—— 这些是开发者面而非用户面
 *
 * 使用：
 *   import { t } from '../core/strings'
 *   <button>{t('btn.submit')}</button>
 *   <p>{t('p.wrongCount', { n: 5 })}</p>   // 参数插值：{n} → 5
 */

export type StringKey =
  // --- 顶部标题 ---
  | 'tagline.adventurer'
  // --- WorldMap ---
  | 'panel.worldMap'
  | 'panel.wrongbook'
  | 'panel.stats'
  | 'label.wrongCount'
  | 'label.totalAttempts'
  | 'stats.barTip'
  | 'stats.empty'
  | 'toast.copied'
  | 'toast.copyFail'
  | 'btn.review'
  | 'btn.export'
  | 'btn.copy'
  | 'panel.adventurer'
  | 'btn.adventurerBadges'
  | 'meta.building'
  | 'meta.lockedHint'
  | 'meta.regionTag'
  | 'badge.building'
  | 'badge.completed'
  | 'badge.available'
  | 'badge.locked'
  | 'hot.tooltip'
  // --- ProfileView ---
  | 'profile.title'
  | 'profile.subtitle'
  | 'profile.sectionBadges'
  | 'profile.sectionStats'
  | 'profile.badges.empty'
  | 'profile.stats.gold'
  | 'profile.stats.xp'
  | 'profile.stats.cleared'
  | 'profile.stats.combo'
  | 'profile.stats.attempts'
  | 'profile.stats.accuracy'
  | 'profile.sectionSave'
  | 'profile.btn.download'
  | 'profile.btn.reset'
  | 'profile.btn.confirmReset'
  | 'profile.btn.cancelReset'
  | 'profile.btn.done'
  | 'profile.sectionWrong'
  | 'profile.wrong.empty'
  | 'profile.wrong.countLabel'
  | 'profile.wrong.btn.review'
  | 'profile.wrong.btn.export'
  | 'profile.wrong.btn.clear'
  | 'profile.wrong.exportEmpty'
  | 'profile.wrong.exportNoItems'
  // --- ReviewSessionView ---
  | 'review.title'
  | 'review.banner'
  | 'review.empty'
  | 'review.result.good'
  | 'review.result.bad'
  | 'review.btn.next'
  | 'review.btn.done'
  | 'review.remaining'
  // --- RegionMap ---
  | 'region.btn.back'
  | 'region.empty'
  // --- LevelView ---
  | 'level.btn.back'
  | 'level.btn.exit'
  | 'level.summary.title'
  | 'level.summary.subtitle'
  | 'level.summary.again'
  | 'level.summary.home'
  | 'level.summary.gold'
  | 'level.summary.xp'
  // --- ChoiceView / BugView / FillView / OrderView ---
  | 'kind.choice'
  | 'kind.output'
  | 'kind.fill'
  | 'kind.order'
  | 'kind.bug'
  | 'progress.label'
  | 'combo.label'
  | 'result.correct'
  | 'result.wrong'
  | 'result.bugRight'
  | 'result.bugWrong'
  | 'result.orderRight'
  | 'result.orderWrong'
  | 'result.fillAnswer'
  | 'btn.next'
  | 'btn.viewSummary'
  | 'btn.submit'
  // --- OrderView 专属 ---
  | 'order.yourSeq'
  | 'order.empty'
  | 'order.pool'
  | 'order.kbdHint'
  | 'btn.submitOrder'
  // --- FillView ---
  | 'fill.placeholder'
  // --- HintButton ---
  | 'hint.btn'
  | 'hint.already'
  | 'hint.label'
  // --- DonateModal ---
  | 'donate.btn'
  | 'donate.title'
  | 'donate.body'
  | 'donate.placeholder'
  | 'donate.amounts'
  | 'donate.amountCustom'
  | 'donate.confirm'
  | 'donate.thanks'
  // --- 通用 ---
  | 'btn.back'
  | 'btn.close'
  | 'btn.cancel'

const zhCN = {
  // --- 顶部 ---
  'tagline.adventurer': '冒险者，你好',

  // --- WorldMap ---
  'panel.worldMap': '世界地图',
  'panel.wrongbook': '📒 错题本',
  'panel.stats': '📊 学习统计 · 最近 7 天',
  'label.wrongCount': '{n} 道题待巩固',
  'label.totalAttempts': '（累计答错 {n} 次）',
  'stats.barTip': '{date} · 答对 {correct} 答错 {wrong} · 通关 {cleared}',
  'stats.empty': '还没有活动记录——去通关一关，统计就开始生长 ✨',
  'toast.copied': '✓ 已复制到剪贴板',
  'toast.copyFail': '复制失败，请改用「导出」按钮',
  'btn.review': '📘 复习',
  'btn.export': '📄 导出',
  'btn.copy': '📋 复制',
  'panel.adventurer': '冒险者档案',
  'btn.adventurerBadges': '冒险者徽章',
  'meta.building': '建设中 · 后续版本开放',
  'meta.lockedHint': '通过上一区域的 Boss 关后解锁',
  'meta.regionTag': '{done}/{total} 关已通关 · {tagline}',
  'badge.building': '建设中',
  'badge.completed': '已通关',
  'badge.available': '可进入',
  'badge.locked': '未解锁',
  'hot.tooltip': '本区域 {count} 道错题，累计答错 {attempts} 次',

  // --- ProfileView ---
  'profile.title': '冒险者档案',
  'profile.subtitle': '回顾你的旅程与荣耀',
  'profile.sectionBadges': '徽章',
  'profile.sectionStats': '战绩',
  'profile.badges.empty': '尚未获得徽章，继续闯关吧！',
  'profile.stats.gold': '金币',
  'profile.stats.xp': '经验',
  'profile.stats.cleared': '已通关关卡',
  'profile.stats.combo': '最高连击',
  'profile.stats.attempts': '总答题数',
  'profile.stats.accuracy': '总正确率',
  'profile.sectionSave': '存档',
  'profile.btn.download': '下载存档',
  'profile.btn.reset': '清空存档',
  'profile.btn.confirmReset': '确认清空',
  'profile.btn.cancelReset': '取消',
  'profile.btn.done': '返回',
  'profile.sectionWrong': '错题本',
  'profile.wrong.empty': '错题本是空的 🎉',
  'profile.wrong.countLabel': '已收录 {n} 道错题',
  'profile.wrong.btn.review': '📘 复习这 {n} 道错题',
  'profile.wrong.btn.export': '📄 导出错题清单',
  'profile.wrong.btn.clear': '清空错题本',
  'profile.wrong.exportEmpty': '没有错题可导出',
  'profile.wrong.exportNoItems': '还没有需要巩固的题目',

  // --- ReviewSessionView ---
  'review.title': '错题复习',
  'review.banner': '复习模式 · 答对即可从错题本移除',
  'review.empty': '错题本是空的，先去收集一些错题吧！',
  'review.result.good': '答对了！已从错题本移除。',
  'review.result.bad': '还差一点。再看一遍解析，下次继续。',
  'review.btn.next': '下一题',
  'review.btn.done': '完成',
  'review.remaining': '还剩 {n} 题',

  // --- RegionMap ---
  'region.btn.back': '← 返回世界地图',
  'region.empty': '该区域没有可挑战的关卡',

  // --- LevelView ---
  'level.btn.back': '← 返回区域',
  'level.btn.exit': '退出关卡',
  'level.summary.title': '关卡通关！',
  'level.summary.subtitle': '胜利的号角已经吹响 🎉',
  'level.summary.again': '再玩一次',
  'level.summary.home': '返回世界地图',
  'level.summary.gold': '金币',
  'level.summary.xp': '经验',

  // --- 题型 / 通用 ---
  'kind.choice': '概念选择',
  'kind.output': '输出预测',
  'kind.fill': '代码填空',
  'kind.order': '代码排序',
  'kind.bug': '找错题',
  'progress.label': '第 {i}/{n} 题',
  'combo.label': '连击 ×{n}',
  'result.correct': '答对了！',
  'result.wrong': '答错了。',
  'result.bugRight': '找对了！',
  'result.bugWrong': '不是这行。',
  'result.orderRight': '排序正确！',
  'result.orderWrong': '顺序不对。',
  'result.fillAnswer': '答错了。正确答案：{ans}。',
  'btn.next': '下一题',
  'btn.viewSummary': '查看结算',
  'btn.submit': '提交答案',

  // --- OrderView ---
  'order.yourSeq': '你的顺序（点击某行可撤回） · {hints}',
  'order.empty': '（点击下方代码行加入）',
  'order.pool': '待选行：',
  'order.kbdHint': '{n} 加入 · ⌫ 撤回 · R 重置',
  'btn.submitOrder': '提交顺序',

  // --- FillView ---
  'fill.placeholder': '在此填写答案',

  // --- HintButton ---
  'hint.btn': '💡 看提示',
  'hint.already': '💡 已用提示',
  'hint.label': '提示',

  // --- DonateModal ---
  'donate.btn': '☕ 请开发者喝杯咖啡',
  'donate.title': '支持代码群岛',
  'donate.body': '如果你觉得这个项目对你有帮助，可以请开发者喝杯咖啡 ☕',
  'donate.placeholder': '其他金额',
  'donate.amounts': '¥6 · ¥18 · ¥66 · ¥128',
  'donate.amountCustom': '自定义',
  'donate.confirm': '前往支付',
  'donate.thanks': '感谢支持 ❤',

  // --- 通用 ---
  'btn.back': '返回',
  'btn.close': '关闭',
  'btn.cancel': '取消',
} satisfies Record<StringKey, string>

/**
 * 简单字符串插值：把 {key} 替换为 params[key]
 *   t('label.wrongCount', { n: 5 }) → '5 道题待巩固'
 */
export function t(key: StringKey, params?: Record<string, string | number>): string {
  let s = zhCN[key]
  if (!params) return s
  return s.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
}

/**
 * 列出所有 key（仅测试用） —— 防止新增 key 时忘记注册中文
 */
export function _allKeys(): StringKey[] {
  return Object.keys(zhCN) as StringKey[]
}
