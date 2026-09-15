import { describe, expect, it } from 'vitest'
import { levelFromXp, totalXpForLevel } from '../src/core/level'
import {
  SAVE_KEY,
  defaultSave,
  grantGold,
  grantXp,
  parseSave,
  serializeSave,
  spendGold,
  validateSave,
} from '../src/core/save/schema'
import { clearSaved, loadSave, persistSave } from '../src/core/save/storage'

class MemoryStorage {
  private map = new Map<string, string>()
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v))
  }
  removeItem(k: string) {
    this.map.delete(k)
  }
  clear() {
    this.map.clear()
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null
  }
  get length() {
    return this.map.size
  }
}

describe('存档校验', () => {
  it('默认存档可序列化后再解析', () => {
    const parsed = parseSave(serializeSave(defaultSave()))
    expect(parsed).not.toBeNull()
    expect(parsed!.version).toBe(1)
    expect(parsed!.player).toEqual({ xp: 0, gold: 0 })
  })

  it('坏 JSON 与非法结构返回 null', () => {
    expect(parseSave('not json')).toBeNull()
    expect(parseSave('null')).toBeNull()
    expect(parseSave('{"version":1}')).toBeNull()
    expect(
      validateSave({
        version: 1,
        player: { xp: -5, gold: 0 },
        regions: {},
        badges: [],
        settings: { soundOn: true },
      }),
    ).toBeNull()
  })

  it('未来版本拒绝解析（迁移器以后再加）', () => {
    expect(validateSave({ ...defaultSave(), version: 99 })).toBeNull()
  })

  it('序列化时盖上版本号与时间戳', () => {
    const out = JSON.parse(serializeSave(defaultSave())) as Record<string, unknown>
    expect(out.version).toBe(1)
    expect(typeof out.updatedAt).toBe('string')
    expect((out.updatedAt as string).length).toBeGreaterThan(0)
  })
})

describe('金钱与 XP', () => {
  it('获得不为负', () => {
    expect(grantXp({ xp: 10, gold: 0 }, 30)).toEqual({ xp: 40, gold: 0 })
    expect(grantGold({ xp: 0, gold: 3 }, -10)).toEqual({ xp: 0, gold: 0 })
  })

  it('余额不足不能花', () => {
    expect(spendGold({ xp: 0, gold: 4 }, 5)).toBeNull()
    expect(spendGold({ xp: 0, gold: 5 }, 5)).toEqual({ xp: 0, gold: 0 })
  })
})

describe('升级曲线', () => {
  it('阈值符合 60×(L-1)²', () => {
    expect(totalXpForLevel(1)).toBe(0)
    expect(totalXpForLevel(2)).toBe(60)
    expect(totalXpForLevel(3)).toBe(240)
  })

  it('边界等级正确', () => {
    expect(levelFromXp(0)).toBe(1)
    expect(levelFromXp(59)).toBe(1)
    expect(levelFromXp(60)).toBe(2)
    expect(levelFromXp(239)).toBe(2)
    expect(levelFromXp(240)).toBe(3)
  })
})

describe('localStorage 封装', () => {
  it('存取与清除', () => {
    const storage = new MemoryStorage() as unknown as Storage
    expect(loadSave(storage)).toBeNull()
    persistSave(storage, defaultSave())
    expect(loadSave(storage)).not.toBeNull()
    clearSaved(storage)
    expect(loadSave(storage)).toBeNull()
  })

  it('损坏的存档当作不存在', () => {
    const storage = new MemoryStorage() as unknown as Storage
    storage.setItem(SAVE_KEY, '{oops')
    expect(loadSave(storage)).toBeNull()
  })
})
