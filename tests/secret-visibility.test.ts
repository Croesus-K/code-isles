import { describe, expect, it } from 'vitest'
import type { CourseDef } from '../src/content/course'
import { isRegionUnlocked, isRegionVisibleOnMap } from '../src/core/progress'
import { defaultSave, validateSave } from '../src/core/save/schema'

/**
 * 秘境岛地图可见性：激活前只挂载在课程数据末尾、不在世界地图渲染；
 * 激活（关卡下发 + 有效密钥）后作为独立区域浮出。
 */

// 与 src/core/secret-key.ts / tools/mint-key.mjs 同算法的测试用铸钥器
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
function fnv1a32(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}
function mintKey(payload: string): string {
  const check = fnv1a32(payload) & 0xfffff
  let checkChars = ''
  for (let i = 0; i < 4; i++) checkChars += ALPHABET[Math.floor(check / 32 ** i) % 32]
  return `ISLE-${payload.slice(0, 4)}-${payload.slice(4)}-${checkChars}`
}

const learn = { title: 't', body: ['b'] }
const secretStub = { id: '6', name: '秘境岛', tagline: '', hidden: true, levels: [] }
const courseWithStub: CourseDef = {
  id: 't',
  title: 't',
  subtitle: '',
  lang: 'Py',
  regions: [
    {
      id: '1',
      name: 'r1',
      tagline: '',
      levels: [{ id: '1-1', name: 'a', xp: 10, gold: 5, learn, questions: [] }],
    },
    secretStub,
  ],
}
const courseWithSecret = {
  ...courseWithStub,
  regions: [
    courseWithStub.regions[0],
    {
      ...secretStub,
      levels: [{ id: '6-1', name: 's', xp: 10, gold: 5, learn, questions: [] }],
    },
  ],
} as CourseDef

describe('秘境岛地图可见性', () => {
  it('未激活：隐藏区域不出现在世界地图，但仍在课程数据中挂载', () => {
    expect(courseWithStub.regions.length).toBe(2)
    expect(courseWithStub.regions[1].name).toBe('秘境岛')
    expect(isRegionVisibleOnMap(defaultSave(), courseWithStub, 1)).toBe(false)
    expect(isRegionVisibleOnMap(defaultSave(), courseWithStub, 0)).toBe(true)
  })

  it('激活（关卡已下发 + 有效密钥）：作为独立区域浮出地图', () => {
    const save = validateSave({ ...defaultSave(), secretKey: mintKey('ABCD2345') })!
    expect(isRegionUnlocked(save, courseWithSecret, 1)).toBe(true)
    expect(isRegionVisibleOnMap(save, courseWithSecret, 1)).toBe(true)
  })

  it('有格式合法的密钥但关卡未下发（如离线）：地图上仍不可见', () => {
    const save = validateSave({ ...defaultSave(), secretKey: mintKey('ABCD2345') })!
    expect(isRegionUnlocked(save, courseWithStub, 1)).toBe(false)
    expect(isRegionVisibleOnMap(save, courseWithStub, 1)).toBe(false)
  })

  it('坏密钥 + 关卡已下发：不可见（密钥被吊销/篡改的场景）', () => {
    const save = validateSave({ ...defaultSave(), secretKey: 'ISLE-AAAA-BBBB-CCCC' })!
    expect(isRegionVisibleOnMap(save, courseWithSecret, 1)).toBe(false)
  })
})
