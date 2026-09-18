import type { CourseDef, RegionDef } from '../course'
import { region1 } from './region1'
import { region2 } from './region2'
import { region3 } from './region3'
import { region4 } from './region4'
import { region5 } from './region5'

/**
 * 隐藏区域「秘境岛」占位 stub（2026-09-18 起服务端下发制）。
 *
 * 题目内容不在客户端 bundle 里——只有持在册密钥调通 /api/secret/unlock
 * 后，Worker 才把完整 RegionDef 下发，App 用 withSecretRegion 把这个
 * levels 为空的 stub 原位替换成可玩区域。stub 的作用只是让世界地图
 * 始终有一张"🔒 密钥"占位卡当 teaser。
 */
export const secretStubPython: RegionDef = {
  id: '6',
  name: '秘境岛',
  tagline: '藏宝图上的最后一座岛',
  hidden: true,
  levels: [],
}

/** 首期课程：Python 基础（5 区域 20 关 + 秘境岛占位） */
export const pythonBasics: CourseDef = {
  id: 'python-basics',
  title: '代码群岛',
  subtitle: 'Python 入门：变量、循环、函数与基础语法',
  lang: 'Python',
  regions: [region1, region2, region3, region4, region5, secretStubPython],
}
