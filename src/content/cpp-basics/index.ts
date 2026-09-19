import type { CourseDef } from '../course'
import { regionCpp1 } from './cpp1'
import { regionCpp2 } from './cpp2'
import { regionCpp3 } from './cpp3'
import { regionCpp4 } from './cpp4'

/** 秘境岛已升级为独立课程（src/content/secret-isle.ts），本课程不再内嵌 stub。 */

/** C++ 基础课程（cpp1-cpp4） */
export const cppBasics: CourseDef = {
  id: 'cpp-basics',
  title: 'C++ 基础',
  subtitle: 'C++ 入门：从 cout 到类与 STL',
  lang: 'C++',
  regions: [regionCpp1, regionCpp2, regionCpp3, regionCpp4],
}
