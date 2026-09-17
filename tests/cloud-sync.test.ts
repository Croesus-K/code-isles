import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildGistFiles,
  extractSaveFromGist,
  compareWithLocal,
  findOrCreateSaveGist,
  ghApi,
  GIST_DESCRIPTION,
} from '../src/core/cloud-sync'
import { SAVE_GIST_FILE, defaultSave, parseSave } from '../src/core/save/schema'

describe('buildGistFiles / extractSaveFromGist', () => {
  it('序列化 → 反解 roundtrip 保真', () => {
    const save = defaultSave()
    save.player.xp = 123
    save.updatedAt = '2026-09-17T00:00:00Z'
    const files = buildGistFiles(save)
    expect(Object.keys(files)).toEqual([SAVE_GIST_FILE])

    const gist = {
      updated_at: '2026-09-17T01:00:00Z',
      files: { [SAVE_GIST_FILE]: { content: files[SAVE_GIST_FILE]!.content } },
    }
    const out = extractSaveFromGist(gist)
    expect(out).not.toBeNull()
    expect(out!.save.player.xp).toBe(123)
    expect(out!.updatedAt).toBe('2026-09-17T01:00:00Z')
  })

  it('文件缺失 / 内容损坏 → null（不抛错）', () => {
    expect(extractSaveFromGist({ files: {} })).toBeNull()
    expect(extractSaveFromGist({ files: { [SAVE_GIST_FILE]: { content: 'not-json' } } })).toBeNull()
    expect(extractSaveFromGist(null)).toBeNull()
  })
})

describe('compareWithLocal', () => {
  it('按 updatedAt 比较先后', () => {
    const remote = defaultSave()
    remote.updatedAt = '2026-09-17T02:00:00Z'
    const older = defaultSave()
    older.updatedAt = '2026-09-17T01:00:00Z'
    expect(compareWithLocal(remote, older)).toBe('remote-newer')
    expect(compareWithLocal(older, remote)).toBe('remote-older')
    expect(compareWithLocal(remote, remote)).toBe('same')
    expect(compareWithLocal(remote, null)).toBe('local-empty')
  })
})

describe('ghApi（fetch 注入）', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('401 → 友好中文错误', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"message":"Bad credentials"}', { status: 401 })))
    await expect(ghApi('bad-token', '/user')).rejects.toThrow('Token 无效')
  })

  it('网络异常 → 提示连不上', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('dns fail')
    }))
    await expect(ghApi('t', '/user')).rejects.toThrow('网络错误')
  })

  it('正常响应 → JSON 解析', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"login":"octocat"}', { status: 200 })))
    const r = await ghApi<{ login: string }>('t', '/user')
    expect(r.login).toBe('octocat')
  })
})

describe('findOrCreateSaveGist', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('已有同名 gist → 直接返回其 id（不再创建）', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal('fetch', vi.fn(async (url: string | URL, init?: RequestInit) => {
      calls.push({ url: String(url), init })
      if (String(url).includes('/gists?')) {
        return new Response(
          JSON.stringify([{ id: 'gist123', description: GIST_DESCRIPTION, files: { [SAVE_GIST_FILE]: { content: '{}' } } }]),
          { status: 200 },
        )
      }
      throw new Error('unexpected call ' + String(url))
    }))
    const id = await findOrCreateSaveGist('tok')
    expect(id).toBe('gist123')
    expect(calls).toHaveLength(1) // 只 list，未 POST
  })

  it('没有 → 创建私有 gist 并返回新 id', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url).includes('/gists?')) {
        return new Response(JSON.stringify([{ id: 'other', description: 'unrelated' }]), { status: 200 })
      }
      expect(init?.method).toBe('POST')
      const body = JSON.parse(String(init?.body))
      expect(body.public).toBe(false)
      expect(body.description).toBe(GIST_DESCRIPTION)
      return new Response(JSON.stringify({ id: 'new-gist-9' }), { status: 201 })
    }))
    const id = await findOrCreateSaveGist('tok')
    expect(id).toBe('new-gist-9')
  })
})

describe('gist 内容与本地序列化互通', () => {
  it('serializeSave 的输出能被 parseSave 接受（云端下载路径）', () => {
    const save = defaultSave()
    save.wrongAnswers = [{ questionKey: 'j1:j1-1:0', wrongAt: '2026-09-17T00:00:00Z', attempts: 1 }]
    const raw = buildGistFiles(save)[SAVE_GIST_FILE]!.content
    expect(parseSave(raw)).not.toBeNull()
  })
})
