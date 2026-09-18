import { describe, expect, it } from 'vitest'
import { checkKey, maskKey, verifyKey } from '../src/core/secret-key'
import { isRegionUnlocked, isSecretUnlocked } from '../src/core/progress'
import { earnedBadgeIds } from '../src/core/badges'
import { defaultSave, parseSave, serializeSave } from '../src/core/save/schema'
import { COURSES, getCourse } from '../src/content/courses'

/**
 * 真实发卡钥（tools/mint-key.mjs 以当前 tools/.secret 的盐铸造）。
 * 如果换了盐，这批 fixture 会全部失效——重新发卡并同步更新这里。
 */
const REAL_KEY = 'ISLE-F6TK-2VE3-9WJS'

describe('secret-key 密钥校验', () => {
  it('真实发卡钥通过校验，返回规范形态', () => {
    expect(checkKey(REAL_KEY)).toBe(REAL_KEY)
    expect(verifyKey(REAL_KEY)).toBe(true)
  })

  it('归一化：小写 / 无连字符 / 无前缀 / 带空格都接受', () => {
    expect(checkKey('isle-f6tk-2ve3-9wjs')).toBe(REAL_KEY)
    expect(checkKey('F6TK2VE39WJS')).toBe(REAL_KEY)
    expect(checkKey('  isle f6tk 2ve3 9wjs ')).toBe(REAL_KEY)
  })

  it('篡改任意一位 → 校验失败', () => {
    const tamperedLast = 'ISLE-F6TK-2VE3-9WJT'
    const tamperedMid = 'ISLE-F6TK-3VE3-9WJS'
    const tamperedFirst = 'ISLE-76TK-2VE3-9WJS'
    expect(verifyKey(tamperedLast)).toBe(false)
    expect(verifyKey(tamperedMid)).toBe(false)
    expect(verifyKey(tamperedFirst)).toBe(false)
  })

  it('垃圾输入全部拒绝（长度 / 字符集 / 空串 / 非字符串形态）', () => {
    expect(checkKey('')).toBeNull()
    expect(checkKey('hello')).toBeNull()
    // 12 位但含字母表外字符（0/1/I/O/L 都不在 ALPHABET）
    expect(checkKey('I0LO-I0LO-I0LO')).toBeNull()
    expect(checkKey('1111-1111-1111')).toBeNull()
    expect(checkKey('AAAA-AAAA-AAAA')).toBeNull()
    expect(checkKey('F6TK-2VE3-9WJ')).toBeNull() // 少一位
    expect(checkKey('F6TK-2VE3-9WJSS')).toBeNull() // 多一位
  })

  it('maskKey：合法钥露前 8 位，非法钥显示 —', () => {
    expect(maskKey(REAL_KEY)).toBe('ISLE-F6TK-2VE3-••••')
    expect(maskKey('garbage')).toBe('—')
  })
})

describe('隐藏区域解锁（progress）', () => {
  const py = getCourse('python-basics')
  const js = getCourse('javascript-basics')
  const pySecret = py.regions.find((r) => r.hidden)!
  const jsSecret = js.regions.find((r) => r.hidden)!
  const pySecretIndex = py.regions.indexOf(pySecret)
  const jsSecretIndex = js.regions.indexOf(jsSecret)

  it('两门课都有隐藏区域，region id 全局唯一由 courses.test 守护', () => {
    expect(pySecret?.id).toBe('6')
    expect(jsSecret?.id).toBe('j5')
  })

  it('默认存档：隐藏区域锁定，常规区域不受密钥影响', () => {
    const save = defaultSave()
    expect(isSecretUnlocked(save)).toBe(false)
    expect(isRegionUnlocked(save, py, pySecretIndex)).toBe(false)
    expect(isRegionUnlocked(save, js, jsSecretIndex)).toBe(false)
    // 常规第 1 区域不因密钥系统改变行为
    expect(isRegionUnlocked(save, py, 0)).toBe(true)
    expect(isRegionUnlocked(save, js, 0)).toBe(true)
  })

  it('存入有效密钥后：隐藏区域解锁（无需通关任何前置 Boss）', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    expect(isSecretUnlocked(save)).toBe(true)
    expect(isRegionUnlocked(save, py, pySecretIndex)).toBe(true)
    expect(isRegionUnlocked(save, js, jsSecretIndex)).toBe(true)
  })

  it('存入无效密钥：隐藏区域仍然锁定', () => {
    const save = { ...defaultSave(), secretKey: 'ISLE-AAAA-AAAA-AAAA' }
    expect(isSecretUnlocked(save)).toBe(false)
    expect(isRegionUnlocked(save, py, pySecretIndex)).toBe(false)
  })

  it('隐藏区域内的关卡沿用常规链（第 1 关解锁）', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    // isLevelUnlocked 第 1 关永远解锁——直接看区域解锁即可进关
    expect(isRegionUnlocked(save, py, pySecretIndex)).toBe(true)
  })
})

describe('赞助者徽章（badges）', () => {
  it('解锁密钥 → isles-benefactor 徽章达成', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    expect(earnedBadgeIds(save, getCourse('python-basics'))).toContain('isles-benefactor')
    expect(earnedBadgeIds(save, getCourse('javascript-basics'))).toContain('isles-benefactor')
  })

  it('未解锁 → 无赞助者徽章', () => {
    expect(earnedBadgeIds(defaultSave(), getCourse('python-basics'))).not.toContain(
      'isles-benefactor',
    )
  })

  it('graduate：Python 5-B 通关仍达成；JS j4-B 通关也达成（新行为）', () => {
    const py = getCourse('python-basics')
    const pySave = defaultSave()
    const region5 = py.regions.find((r) => r.id === '5')!
    const boss5 = region5.levels.find((l) => l.boss)!
    pySave.regions['5'] = {
      unlocked: true,
      levels: { [boss5.id]: { cleared: true, stars: 1 } },
    }
    expect(earnedBadgeIds(pySave, py)).toContain('graduate')

    const js = getCourse('javascript-basics')
    const jsSave = defaultSave()
    const j4 = js.regions.find((r) => r.id === 'j4')!
    const bossJ4 = j4.levels.find((l) => l.boss)!
    jsSave.regions['j4'] = {
      unlocked: true,
      levels: { [bossJ4.id]: { cleared: true, stars: 1 } },
    }
    expect(earnedBadgeIds(jsSave, js)).toContain('graduate')
  })

  it('graduate：隐藏区域的 boss 不参与判定', () => {
    const py = getCourse('python-basics')
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    const secret = py.regions.find((r) => r.hidden)!
    const boss = secret.levels.find((l) => l.boss)!
    save.regions[secret.id] = {
      unlocked: true,
      levels: { [boss.id]: { cleared: true, stars: 3 } },
    }
    const badges = earnedBadgeIds(save, py)
    expect(badges).toContain('isles-benefactor')
    expect(badges).not.toContain('graduate')
  })
})

describe('存档集成（schema）', () => {
  it('secretKey 随存档序列化 / 解析往返', () => {
    const save = { ...defaultSave(), secretKey: REAL_KEY }
    const parsed = parseSave(serializeSave(save))
    expect(parsed?.secretKey).toBe(REAL_KEY)
    expect(isSecretUnlocked(parsed!)).toBe(true)
  })

  it('旧存档（无 secretKey 字段）解析后视为未解锁', () => {
    const parsed = parseSave(serializeSave(defaultSave()))
    expect(parsed).not.toBeNull()
    expect(parsed!.secretKey).toBeUndefined()
    expect(isSecretUnlocked(parsed!)).toBe(false)
  })

  it('secretKey 类型非法时被丢弃（不炸解析）', () => {
    const raw = serializeSave(defaultSave())
    const obj = JSON.parse(raw) as Record<string, unknown>
    obj.secretKey = 12345
    const parsed = parseSave(JSON.stringify(obj))
    expect(parsed).not.toBeNull()
    expect(parsed!.secretKey).toBeUndefined()
  })
})

describe('课程结构（hidden）', () => {
  it('每门课至多一个隐藏区域，且排在末尾', () => {
    for (const course of COURSES) {
      const hiddenIdx = course.regions.map((r, i) => (r.hidden ? i : -1)).filter((i) => i >= 0)
      expect(hiddenIdx.length, course.id).toBeLessThanOrEqual(1)
      if (hiddenIdx.length === 1) {
        expect(hiddenIdx[0], course.id).toBe(course.regions.length - 1)
      }
    }
  })

  it('隐藏区域不是 comingSoon（内容已完整）', () => {
    for (const course of COURSES) {
      for (const region of course.regions) {
        if (region.hidden) expect(region.comingSoon, course.id).toBeFalsy()
      }
    }
  })
})
