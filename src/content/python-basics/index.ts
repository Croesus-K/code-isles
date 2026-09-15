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
  subtitle: 'Code Isles · 用像素冒险学正经知识 · 首期课程：Python 基础',
  regions: [region1, region2, region3, region4, region5],
}
