/**
 * 课程数据包类型定义。代码与内容分离：新增课程只需新增一个数据文件，
 * 引擎（地图/关卡/判题/存档）不改动。
 */

export interface LearnCard {
  title: string
  /** 若干段正文 */
  body: string[]
  /** 可选示例代码（逐行展示） */
  code?: string
}

export interface ChoiceQuestion {
  kind: 'choice'
  prompt: string
  /** 可选题干代码块 */
  code?: string
  options: string[]
  answerIndex: number
  /** 答错时展示的解析 */
  explain: string
}

export type Question = ChoiceQuestion

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
