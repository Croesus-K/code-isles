#!/usr/bin/env node
/**
 * 隐藏岛屿密钥发卡脚本（仓主本地工具）。
 *
 * 用法：
 *   node tools/mint-key.mjs          # 发 1 枚
 *   node tools/mint-key.mjs 5        # 发 5 枚
 *   node tools/mint-key.mjs 5 --append   # 追加写入 tools/minted-keys.txt
 *
 * 盐的明文从 tools/.secret 读取（该文件已 gitignore，绝不入库）。
 * 首次使用：把发卡盐写进 tools/.secret（一行纯文本即可）。
 * 注意：脚本里的算法必须与 src/core/secret-key.ts 严格一致——
 * 改动任何一边都要同步另一边，并重新构建部署。
 */
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const secretPath = join(here, '.secret')
if (!existsSync(secretPath)) {
  console.error('缺少 tools/.secret（发卡盐）。把盐的明文写进去再用。')
  process.exit(1)
}
const SECRET = readFileSync(secretPath, 'utf8').trim()
if (!SECRET) {
  console.error('tools/.secret 是空的。')
  process.exit(1)
}

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const PAYLOAD_LEN = 8
const CHECK_LEN = 4
const KEY_VERSION = 1
const CHECK_MASK = 0xfffff

function fnv1a32(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

function mintOne() {
  // 5 字节 = 40 bit 随机；留低 35 bit 作随机段，高 5 bit 固定为版本号
  const bytes = randomBytes(5)
  let rand = 0
  for (let i = 0; i < 5; i++) rand = rand * 256 + bytes[i]
  rand = rand % 2 ** 35
  const payload = KEY_VERSION * 2 ** 35 + rand

  let payloadChars = ''
  for (let i = 0; i < PAYLOAD_LEN; i++) {
    payloadChars += ALPHABET[Math.floor(payload / 32 ** i) % 32]
  }
  const check = fnv1a32(payloadChars + '|' + SECRET) & CHECK_MASK
  let checkChars = ''
  for (let i = 0; i < CHECK_LEN; i++) {
    checkChars += ALPHABET[Math.floor(check / 32 ** i) % 32]
  }
  return `ISLE-${payloadChars.slice(0, 4)}-${payloadChars.slice(4)}-${checkChars}`
}

const count = Math.max(1, Math.min(50, Number(process.argv[2]) || 1))
const append = process.argv.includes('--append')
const keys = Array.from({ length: count }, mintOne)

console.log(keys.join('\n'))

if (append) {
  const outPath = join(here, 'minted-keys.txt')
  const stamp = new Date().toISOString().slice(0, 10)
  writeFileSync(outPath, `# ${stamp}\n${keys.join('\n')}\n`, {
    flag: append && existsSync(outPath) ? 'a' : 'w',
  })
  console.log(`\n已写入 ${outPath}`)
}
