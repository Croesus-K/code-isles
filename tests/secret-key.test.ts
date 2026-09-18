import { describe, expect, it, vi } from 'vitest'
import { checkKey, maskKey, verifyKey } from '../src/core/secret-key'
import {
  SECRET_LEVELS_CACHE_KEY,
  cacheSecretLevels,
  clearCachedSecretLevels,
  fetchSecretLevels,
  loadCachedSecretLevels,
  validateLevelsPayload,
  type SecretLevels,
} from '../src/core/secret-level'
import { isRegionUnlocked, isSecretUnlocked } from '../src/core/progress'
import { earnedBadgeIds } from '../src/core/badges'
import { defaultSave } from '../src/core/save/schema'
import { COURSES, getCourse, withSecretRegion } from '../src/content/courses'
import type { RegionDef } from '../src/content/course'

/**
 * 真实发卡钥（tools/mint-key.mjs 以当前在册制算法铸造）。
 * 客户端只校验格式与校验段；是否在册由服务端查 D1 判定。
 */
const REAL_KEY = 'ISLE-FRRU-8328-RTFY'

/** 内存 Storage 桩（单测隔离，不碰真实 localStorage） */
function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => void m.clear(),
    key: (i: number) => Array.from(m.keys())[i] ?? null,
    get length() {
      return m.size
    },
  } as Storage
}

function makeFetch(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify(body), { status })) as typeof fetch
}

function fakeRegion(id: string, levelId: string): RegionDef {
  return {
    id,
    name: '秘境岛',
    tagline: 'test',
    hidden: true,
    levels: [
      {
        id: levelId,
        name: '加试',
        xp: 10,
        gold: 5,
        boss: true,
        learn: { title: 't', body: ['a', 'b'] },
        questions: [
          { kind: 'output', prompt: 'p?', code: '1+1', options: ['2', '3'], answerIndex: 0, explain: 'e' },
        ],
      },
    ],
  }
}

function fakeLevels(courseId: string, region: RegionDef): SecretLevels {
  return { [courseId]: region }
}

describe('secret-key 密钥格式校验', () => {
  it('真实发卡钥通过格式校验，返回规范形态', () => {
    expect(checkKey(REAL_KEY)).toBe(REAL_KEY)
    expect(verifyKey(REAL_KEY)).toBe(true)
  })

  it('归一化：小写 / 无连字符 / 无前缀 / 带空格都接受', () => {
    expect(checkKey('isle-frru-8328-rtfy')).toBe(REAL_KEY)
    expect(checkKey('FRRU8328RTFY')).toBe(REAL_KEY)
    expect(checkKey('  isle frru 8328 rtfy ')).toBe(REAL_KEY)
  })

  it('篡改校验段 / 载荷 → 格式校验失败（FNV 挡手滑打错字）', () => {
    expect(verifyKey('ISLE-FRRU-8328-RTFZ')).toBe(false)
    expect(verifyKey('ISLE-FRRU-8329-RTFY')).toBe(false)
    expect(verifyKey('ISLE-7RRU-8328-RTFY')).toBe(false)
  })

  it('垃圾输入全部拒绝（长度 / 字符集 / 空串）', () => {
    expect(checkKey('')).toBeNull()
    expect(checkKey('hello')).toBeNull()
    expect(checkKey('I0LO-I0LO-I0LO')).toBeNull() // 0/1/I/O/L 不在字母表
    expect(checkKey('AAAA-AAAA-AAAA')).toBeNull() // 校验段不对
    expect(checkKey('FRRU-8328-RTF')).toBeNull() // 少一位
    expect(checkKey('FRRU-8328-RTFYS')).toBeNull() // 多一位
  })

  it('maskKey：合法钥露前 8 位，非法钥显示 —', () => {
    expect(maskKey(REAL_KEY)).toBe('ISLE-FRRU-8328-••••')
    expect(maskKey('garbage')).toBe('—')
  })
})

describe('validateLevelsPayload 响应结构校验', () => {
  it('合法 payload 通过', () => {
    const levels = fakeLevels('python-basics', fakeRegion('6', '6-1'))
    expect(validateLevelsPayload(levels)).toEqual(levels)
  })

  it('空对象 / 非对象 / 缺字段 / 空 levels / 坏问题数组全部拒绝', () => {
    expect(validateLevelsPayload(null)).toBeNull()
    expect(validateLevelsPayload('x')).toBeNull()
    expect(validateLevelsPayload({})).toBeNull()
    expect(validateLevelsPayload({ 'p': { id: '', name: 'x', levels: [{}] } })).toBeNull()
    expect(validateLevelsPayload({ 'p': { id: '6', name: 'x', levels: [] } })).toBeNull()
    expect(
      validateLevelsPayload({ 'p': { id: '6', name: 'x', levels: [{ id: '6-1', questions: 'no' }] } }),
    ).toBeNull()
  })
})

describe('fetchSecretLevels 服务端交互', () => {
  const levels = fakeLevels('python-basics', fakeRegion('6', '6-1'))

  it('200 + ok → 返回规范密钥与内容', async () => {
    const f = makeFetch(200, { ok: true, key: REAL_KEY, levels })
    const res = await fetchSecretLevels(REAL_KEY, f)
    expect(res).toEqual({ status: 'ok', key: REAL_KEY, levels })
  })

  it('403 → bad-key；500 → network；ok:false → bad-key', async () => {
    expect((await fetchSecretLevels(REAL_KEY, makeFetch(403, { ok: false })))).toEqual({ status: 'bad-key' })
    expect((await fetchSecretLevels(REAL_KEY, makeFetch(500, { error: 'server' })))).toEqual({ status: 'network' })
    expect((await fetchSecretLevels(REAL_KEY, makeFetch(200, { ok: false })))).toEqual({ status: 'bad-key' })
  })

  it('畸形成功响应（levels 结构不对）→ network（不当成密钥错误）', async () => {
    const f = makeFetch(200, { ok: true, key: REAL_KEY, levels: { 'p': { id: '6' } } })
    expect(await fetchSecretLevels(REAL_KEY, f)).toEqual({ status: 'network' })
  })

  it('格式就非法的输入：不发起请求直接 bad-key', async () => {
    const f = vi.fn() as unknown as typeof fetch
    expect(await fetchSecretLevels('garbage', f)).toEqual({ status: 'bad-key' })
    expect(f).not.toHaveBeenCalled()
  })

  it('fetch 抛异常（断网）→ network', async () => {
    const f = vi.fn(async () => {
      throw new TypeError('failed to fetch')
    }) as unknown as typeof fetch
    expect(await fetchSecretLevels(REAL_KEY, f)).toEqual({ status: 'network' })
  })
})

describe('秘境岛内容缓存（localStorage）', () => {
  it('写入 → 读取往返；clear 后读不到', () => {
    const storage = memoryStorage()
    const levels = fakeLevels('python-basics', fakeRegion('6', '6-1'))
    cacheSecretLevels(storage, REAL_KEY, levels)
    expect(loadCachedSecretLevels(storage)).toEqual({ key: REAL_KEY, levels })
    clearCachedSecretLevels(storage)
    expect(loadCachedSecretLevels(storage)).toBeNull()
  })

  it('缓存损坏 / 缺 key → 返回 null 而不是抛错', () => {
    const storage = memoryStorage()
    storage.setItem(SECRET_LEVELS_CACHE_KEY, '{oops')
    expect(loadCachedSecretLevels(storage)).toBeNull()
    storage.setItem(SECRET_LEVELS_CACHE_KEY, JSON.stringify({ levels: {} }))
    expect(loadCachedSecretLevels(storage)).toBeNull()
  })

  it('storage 为 null（SSR / 测试注入）时全操作安全', () => {
    expect(() => cacheSecretLevels(null, REAL_KEY, {})).not.toThrow()
    expect(loadCachedSecretLevels(null)).toBeNull()
    expect(() => clearCachedSecretLevels(null)).not.toThrow()
  })
})

describe('withSecretRegion 动态合并', () => {
  it('secret 为空 / levels 为空 → 原样返回', () => {
    const py = getCourse('python-basics')
    expect(withSecretRegion(py, null)).toBe(py)
    expect(withSecretRegion(py, fakeRegion('6', '6-1') && { ...fakeRegion('6', '6-1'), levels: [] })).toBe(py)
  })

  it('stub 同 id → 原位替换；无 stub → 追加末尾', () => {
    const py = getCourse('python-basics')
    const full = fakeRegion('6', '6-1')
    const merged = withSecretRegion(py, full)
    expect(merged).not.toBe(py)
    expect(merged.regions[merged.regions.length - 1]).toBe(full)
    expect(merged.regions.filter((r) => r.id === '6').length).toBe(1)

    const js = getCourse('javascript-basics')
    const mergedJs = withSecretRegion(js, fakeRegion('x9', 'x9-1'))
    expect(mergedJs.regions[mergedJs.regions.length - 1]?.id).toBe('x9')
    expect(js.regions.length).toBe(mergedJs.regions.length - 1)
  })
})

describe('隐藏区域解锁（progress / badges）', () => {
  const py = getCourse('python-basics')
  const js = getCourse('javascript-basics')
  const pyStub = py.regions.find((r) => r.hidden)!
  const jsStub = js.regions.find((r) => r.hidden)!
  const pyStubIndex = py.regions.indexOf(pyStub)
  const jsStubIndex = js.regions.indexOf(jsStub)

  it('两门课都有秘境岛占位，id 仍全局唯一', () => {
    expect(pyStub?.id).toBe('6')
    expect(jsStub?.id).toBe('j5')
    const ids = COURSES.flatMap((c) => c.regions.map((r) => r.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('stub（内容未下发）即使有密钥也锁定；常规区域 1 不受影响', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    expect(isSecretUnlocked(save)).toBe(true)
    expect(isRegionUnlocked(save, py, pyStubIndex)).toBe(false)
    expect(isRegionUnlocked(save, js, jsStubIndex)).toBe(false)
    expect(isRegionUnlocked(save, py, 0)).toBe(true)
    expect(isRegionUnlocked(save, js, 0)).toBe(true)
  })

  it('内容下发后（合并课程）：有格式合法密钥即解锁，无需通关前置 Boss', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    const merged = withSecretRegion(py, fakeRegion('6', '6-1'))
    const idx = merged.regions.findIndex((r) => r.id === '6')
    expect(isRegionUnlocked(save, merged, idx)).toBe(true)
  })

  it('无效密钥：秘境岛保持锁定', () => {
    const save = { ...defaultSave(), secretKey: 'ISLE-AAAA-AAAA-AAAA' }
    expect(isSecretUnlocked(save)).toBe(false)
  })

  it('赞助者徽章：格式合法密钥即达成；未解锁不达成', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    expect(earnedBadgeIds(save, py)).toContain('isles-benefactor')
    expect(earnedBadgeIds(save, js)).toContain('isles-benefactor')
    expect(earnedBadgeIds(defaultSave(), py)).not.toContain('isles-benefactor')
  })

  it('graduate：常规区域 Boss 达成，隐藏区域（stub 或完整）不参与', () => {
    const js = getCourse('javascript-basics')
    const jsSave = defaultSave()
    const j4 = js.regions.find((r) => r.id === 'j4')!
    const bossJ4 = j4.levels.find((l) => l.boss)!
    jsSave.regions['j4'] = { unlocked: true, levels: { [bossJ4.id]: { cleared: true, stars: 1 } } }
    expect(earnedBadgeIds(jsSave, js)).toContain('graduate')
  })
})

describe('存档集成（schema）', () => {
  it('secretKey 随存档序列化 / 解析往返', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    const raw = JSON.parse(JSON.stringify(save))
    expect(raw.secretKey).toBe(REAL_KEY)
    expect(isSecretUnlocked(raw)).toBe(true)
  })

  it('旧存档（无 secretKey）视为未解锁', () => {
    const save = defaultSave()
    expect(save.secretKey).toBeUndefined()
    expect(isSecretUnlocked(save)).toBe(false)
  })
})
