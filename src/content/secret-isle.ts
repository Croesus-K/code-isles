import type { CourseDef } from './course'

/**
 * 独立隐藏课程「秘境岛」——与 Python / JS / C / C++ 平级的第五门课。
 *
 * 静态 regions 为空：全部内容由服务端 /api/secret/unlock 凭在册密钥下发
 * （App 启动恢复 + 兑换时经 withSecretRegions 并入）。未解锁时课程菜单
 * 显示「🔒 凭密钥解锁」，进入后由 App 渲染解锁引导而不是空地图。
 * Worker 下发的区域（'6'、'j5'，未来 c5/cpp5）在此聚合成一条学习线。
 */
export const secretIsle: CourseDef = {
  id: 'secret-isle',
  title: '秘境岛',
  subtitle: '打赏专属的隐藏学习项目：凭在册密钥解锁',
  regions: [],
}
