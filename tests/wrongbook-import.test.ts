import { describe, expect, it } from 'vitest'
import { importWrongBookFromMarkdown } from '../src/core/wrongbook-import'
import type { CourseDef } from '../src/content/course'
import type { ChoiceQuestion, BugQuestion } from '../src/content/course'

const Q1: ChoiceQuestion = {
  kind: 'choice',
  prompt: '下面哪个是 Python 的关键字？',
  explain: 'if/else 是关键字，var 不是',
  options: ['if', 'var', 'foo', 'bar'],
  answerIndex: 0,
}
const Q2: BugQuestion = {
  kind: 'bug',
  prompt: '哪一行会报 IndentationError？',
  explain: '第二行缩进错误',
  code: ['def f():', '  return 1', '    return 2'],
  answerLine: 2,
}

const COURSE: CourseDef = {
  id: 'py-basics',
  title: 'Python 基础',
  subtitle: '',
  regions: [
    {
      id: 'r1',
      name: '入门岛',
      tagline: '',
      levels: [
        {
          id: '1-1',
          name: '初识 Python',
          xp: 50,
          gold: 10,
          learn: { title: 'x', body: [] },
          questions: [Q1, Q2],
        },
      ],
    },
  ],
}

function buildMd(prompts: string[]): string {
  const lines: string[] = ['# 代码群岛 · 错题清单', '', '> 导出', '', '## 入门岛']
  prompts.forEach((p, i) => {
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push(`### 初识 Python · 概念选择`)
    lines.push('')
    lines.push(`答错 1 次 · 2025-01-01 12:00`)
    lines.push('')
    lines.push(p)
    lines.push('')
    lines.push('```python')
    lines.push(`print(${i})`)
    lines.push('```')
  })
  return lines.join('\n')
}

const NOW = new Date('2025-06-15T10:00:00Z')

describe('importWrongBookFromMarkdown', () => {
  it('按 prompt 前 40 字符反查并生成记录', () => {
    const md = buildMd(['下面哪个是 Python 的关键字？if/else 是'])
    const res = importWrongBookFromMarkdown(md, COURSE, new Set(), NOW)
    expect(res.added).toBe(1)
    expect(res.skipped).toBe(0)
    expect(res.unrecognized).toBe(0)
    expect(res.records).toHaveLength(1)
    expect(res.records[0].questionKey).toBe('r1:1-1:0')
    expect(res.records[0].attempts).toBe(1)
    expect(res.records[0].wrongAt).toBe(NOW.toISOString())
  })

  it('已存在 questionKey 跳过（保留 attempts）', () => {
    const md = buildMd(['下面哪个是 Python 的关键字？if/else 是'])
    const res = importWrongBookFromMarkdown(md, COURSE, new Set(['r1:1-1:0']), NOW)
    expect(res.added).toBe(0)
    expect(res.skipped).toBe(1)
    expect(res.records).toHaveLength(0)
  })

  it('未匹配上 region/level/prompt → unrecognized', () => {
    const md = buildMd(['完全不相关的标题，根本不在题库里'])
    const res = importWrongBookFromMarkdown(md, COURSE, new Set(), NOW)
    expect(res.added).toBe(0)
    expect(res.unrecognized).toBe(1)
    expect(res.records).toHaveLength(0)
    expect(res.unrecognizedSamples).toHaveLength(1)
    expect(res.unrecognizedSamples[0].regionName).toBe('入门岛')
  })

  it('空 markdown 不崩溃', () => {
    const res = importWrongBookFromMarkdown('', COURSE, new Set(), NOW)
    expect(res.added).toBe(0)
    expect(res.unrecognized).toBe(0)
  })

  it('多条混合：命中+跳过+未识别', () => {
    const md = [
      '# 代码群岛 · 错题清单',
      '',
      '## 入门岛',
      '',
      '### 初识 Python · 概念选择',
      '',
      '答错 1 次 · 2025-01-01',
      '',
      '下面哪个是 Python 的关键字？',
      '',
      '---',
      '',
      '### 初识 Python · 找错题',
      '',
      '答错 2 次 · 2025-01-02',
      '',
      '哪一行会报 IndentationError？',
      '',
      '---',
      '',
      '### 初识 Python · 概念选择',
      '',
      '答错 1 次 · 2025-01-03',
      '',
      '完全不存在的题目 abcdefg',
    ].join('\n')
    const res = importWrongBookFromMarkdown(md, COURSE, new Set(['r1:1-1:0']), NOW)
    expect(res.added).toBe(1) // Q2 新增
    expect(res.skipped).toBe(1) // Q1 已存在
    expect(res.unrecognized).toBe(1)
    expect(res.records[0].questionKey).toBe('r1:1-1:1')
  })

  it('region/level 名字不匹配 → unrecognized', () => {
    const md = [
      '## 另一个岛',
      '',
      '### 不存在的关卡 · 概念选择',
      '',
      '答错 1 次',
      '',
      '下面哪个是 Python 的关键字？',
    ].join('\n')
    const res = importWrongBookFromMarkdown(md, COURSE, new Set(), NOW)
    expect(res.added).toBe(0)
    expect(res.unrecognized).toBe(1)
  })

  it('unrecognizedSamples 最多保留 5 条', () => {
    const blocks: string[] = []
    for (let i = 0; i < 8; i++) {
      blocks.push(
        [
          '## 入门岛',
          '',
          '### 初识 Python · 概念选择',
          '',
          '答错 1 次',
          '',
          `不存在的 prompt ${i}`,
        ].join('\n'),
      )
    }
    const res = importWrongBookFromMarkdown(blocks.join('\n---\n'), COURSE, new Set(), NOW)
    expect(res.unrecognized).toBe(8)
    expect(res.unrecognizedSamples).toHaveLength(5)
  })

  it('prompt 跨越多行（带换行/空行）仍能匹配', () => {
    const md = [
      '## 入门岛',
      '',
      '### 初识 Python · 概念选择',
      '',
      '答错 1 次 · 2025-01-01',
      '',
      '下面哪个是 Python',
      '',
      '的关键字？', // 空行后接续
      '',
    ].join('\n')
    const res = importWrongBookFromMarkdown(md, COURSE, new Set(), NOW)
    expect(res.added).toBe(1)
    expect(res.records[0].questionKey).toBe('r1:1-1:0')
  })
})