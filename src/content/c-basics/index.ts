import type { CourseDef } from '../course'
import { regionC1 } from './c1'
import { regionC2 } from './c2'
import { regionC3 } from './c3'
import { regionC4 } from './c4'

/** 秘境岛已升级为独立课程（src/content/secret-isle.ts），本课程不再内嵌 stub。 */

/** C 基础课程（c1-c4） */
export const cBasics: CourseDef = {
  id: 'c-basics',
  title: 'C 基础',
  subtitle: 'C 语言入门：从 printf 到指针与内存',
  lang: 'C',
  regions: [regionC1, regionC2, regionC3, regionC4],
}
