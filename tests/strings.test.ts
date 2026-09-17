import { describe, expect, it } from 'vitest'
import { _allKeys, t } from '../src/core/strings'

describe('strings', () => {
  it('基本 key 翻译', () => {
    expect(t('btn.submit')).toBe('提交答案')
    expect(t('kind.choice')).toBe('概念选择')
  })

  it('参数插值', () => {
    expect(t('label.wrongCount', { n: 5 })).toBe('5 道题待巩固')
    expect(t('progress.label', { i: 3, n: 10 })).toBe('第 3/10 题')
  })

  it('多参数插值', () => {
    expect(
      t('meta.regionTag', { done: 3, total: 5, tagline: '入门冒险' }),
    ).toBe('3/5 关已通关 · 入门冒险')
  })

  it('缺参数时保留 {key} 标记（而非抛错）', () => {
    expect(t('label.wrongCount')).toBe('{n} 道题待巩固')
  })

  it('所有 key 在 zhCN 中都有定义', () => {
    const keys = _allKeys()
    expect(keys.length).toBeGreaterThan(20)
    for (const k of keys) {
      expect(typeof t(k)).toBe('string')
      expect(t(k).length).toBeGreaterThan(0)
    }
  })
})
