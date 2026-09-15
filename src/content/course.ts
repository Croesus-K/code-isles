/**
 * 课程数据包类型定义。代码与内容分离：新增课程只需新增一个数据文件，
 * 引擎（地图/关卡/判题/存档）不改动。
 *
 * 题型五种（kind 字段区分，判题与渲染按 kind 分发）：
 * - choice  概念选择：四选一，可带题干代码块
 * - output  输出预测：给代码，从选项里猜运行结果
 * - fill    代码填空：补全 ___ 空位，精确匹配（区分大小写）
 * - order   代码排序：把打乱的行拖回正确顺序
 * - bug     找错题：指出哪一行会报错
 */

export interface BaseQuestion {
  prompt: string
  /** 答错时展示的解析 */
  explain: string
  /** 花金币可购买的提示（见 core/progress.ts HINT_COST） */
  hint?: string
}

export interface ChoiceQuestion extends BaseQuestion {
  kind: 'choice'
  /** 可选题干代码块 */
  code?: string
  options: string[]
  answerIndex: number
}

export interface OutputQuestion extends BaseQuestion {
  kind: 'output'
  code: string
  options: string[]
  answerIndex: number
}

export interface FillQuestion extends BaseQuestion {
  kind: 'fill'
  /** 含 ___ 空位的代码 */
  code: string
  /** 可接受的答案（去首尾空格后精确匹配，区分大小写） */
  answers: string[]
  placeholder?: string
}

export interface OrderQuestion extends BaseQuestion {
  kind: 'order'
  /** 正确顺序的代码行；展示时打乱 */
  lines: string[]
}

export interface BugQuestion extends BaseQuestion {
  kind: 'bug'
  /** 逐行代码；answerLine 指向会出错的行（0 起） */
  code: string[]
  answerLine: number
}

export type Question = ChoiceQuestion | OutputQuestion | FillQuestion | OrderQuestion | BugQuestion

export interface LearnCard {
  title: string
  /** 若干段正文 */
  body: string[]
  /** 可选示例代码（逐行展示） */
  code?: string
}

export interface LevelDef {
  /** 关卡 id，如 "1-1" */
  id: string
  name: string
  /** 通关基础奖励（重复通关按复习奖励打折，见 core/progress.ts） */
  xp: number
  gold: number
  /** 区域最后一关（Boss），通关后解锁下一区域 */
  boss?: boolean
  learn: LearnCard
  questions: Question[]
}

export interface RegionDef {
  /** 区域 id，如 "1" */
  id: string
  name: string
  tagline: string
  /** 内容未完成：世界地图上显示"建设中"且不可进入 */
  comingSoon?: boolean
  levels: LevelDef[]
}

export interface CourseDef {
  id: string
  title: string
  subtitle: string
  regions: RegionDef[]
}
