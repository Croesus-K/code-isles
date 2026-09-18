import type { RegionDef } from '../course'

/**
 * 隐藏区域「秘境岛」占位 stub（2026-09-18 起服务端下发制）。
 *
 * 题目内容不在客户端 bundle 里——只有持在册密钥调通 /api/secret/unlock
 * 后，Worker 才把完整 RegionDef 下发，App 用 withSecretRegion 把这个
 * levels 为空的 stub 原位替换成可玩区域。
 */
export const regionJ5Stub: RegionDef = {
  id: 'j5',
  name: '秘境岛',
  tagline: '藏宝图上的最后一座岛',
  hidden: true,
  levels: [],
}
