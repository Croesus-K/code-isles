import type { CourseDef } from './course'

/**
 * 独立隐藏课程「秘境岛」——与 Python / JS / C / C++ 平级的第五门课。
 *
 * 定位（2026-09-19 起转型）：**证书刷题站**——面向编程证书考试的打赏专属
 * 刷题题库（筹备中）。原「毕业加试」内容已迁回各语言课程（免费）。
 *
 * 静态 regions 为空：全部内容由服务端 /api/secret/unlock 凭在册密钥下发
 * （经 withSecretRegions 并入）。改造期服务端返回空 payload，本课程显示
 * 「筹备中」引导页。题库上线时往 worker 的 SECRET_LEVELS 加键即自动聚合。
 */
export const secretIsle: CourseDef = {
  id: 'secret-isle',
  title: '秘境岛',
  subtitle: '证书刷题站（筹备中）· 打赏专属题库',
  regions: [],
}
