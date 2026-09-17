import type { CourseDef } from '../course'
import { region1 } from './region1'
import { region2 } from './region2'
import { region3 } from './region3'
import { region4 } from './region4'
import { region5 } from './region5'

/** 首期课程：Python 基础（5 区域 20 关） */
export const pythonBasics: CourseDef = {
  id: 'python-basics',
  title: '代码群岛',
  subtitle: 'Python 入门：变量、循环、函数与基础语法',
  lang: 'Python',
  regions: [region1, region2, region3, region4, region5],
}
