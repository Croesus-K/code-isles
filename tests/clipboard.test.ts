import { describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard } from '../src/core/clipboard'

describe('copyTextToClipboard', () => {
  it('navigator.clipboard.writeText 成功时返回 true', async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal(
      'navigator',
      { clipboard: { writeText } },
    )
    const ok = await copyTextToClipboard('hello')
    expect(ok).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('clipboard 抛错时降级到 execCommand 路径', async () => {
    const writeText = vi.fn(async () => {
      throw new Error('denied')
    })
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const fakeDoc = {
      createElement: vi.fn(() => ({
        value: '',
        style: {},
        setAttribute: vi.fn(),
        select: vi.fn(),
      })),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      execCommand: vi.fn(() => true),
    }
    vi.stubGlobal('document', fakeDoc)
    const ok = await copyTextToClipboard('hi')
    expect(ok).toBe(true)
    expect(fakeDoc.execCommand).toHaveBeenCalledWith('copy')
  })

  it('两条路径都失败时返回 false', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn(async () => { throw new Error('x') }) } })
    const fakeDoc = {
      createElement: vi.fn(() => ({
        value: '',
        style: {},
        setAttribute: vi.fn(),
        select: vi.fn(),
      })),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      execCommand: vi.fn(() => false),
    }
    vi.stubGlobal('document', fakeDoc)
    const ok = await copyTextToClipboard('x')
    expect(ok).toBe(false)
  })

  it('无 navigator / 无 clipboard / 无 document → false', async () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('document', undefined)
    const ok = await copyTextToClipboard('x')
    expect(ok).toBe(false)
  })

  it('clipboard API 不可用时直接走 execCommand', async () => {
    // 无 navigator.clipboard
    vi.stubGlobal('navigator', {})
    const fakeDoc = {
      createElement: vi.fn(() => ({
        value: '',
        style: {},
        setAttribute: vi.fn(),
        select: vi.fn(),
      })),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      execCommand: vi.fn(() => true),
    }
    vi.stubGlobal('document', fakeDoc)
    const ok = await copyTextToClipboard('plain')
    expect(ok).toBe(true)
    expect(fakeDoc.execCommand).toHaveBeenCalledWith('copy')
  })
})
