#!/usr/bin/env node
/**
 * 隐藏岛屿密钥发卡脚本（仓主本地工具）。
 *
 * 用法：
 *   node tools/mint-key.mjs                # 发 1 枚
 *   node tools/mint-key.mjs 5              # 发 5 枚
 *   node tools/mint-key.mjs 5 --append     # 追加记录到 tools/minted-keys.txt
 *   node tools/mint-key.mjs 5 --sql        # 额外打印 D1 入库 SQL
 *
 * 密钥校验是「在册制」：只有铸造后写入 D1 secret_keys 表的密钥才有效。
 * 算法与 counter-worker/src/index.js、code-isles src/core/secret-key.ts
 * 严格一致——改动任何一边都要同步其余两边。
 *
 * 完整工作流见 tools/README.md。
 */
import { randomInt, createHash } from 'node:crypto'
import { writeFileSync, existsSync, appendFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const BODY_LEN = 12 // 8 载荷 + 4 校验
const CHECK_MASK = 0xfffff

function fnv1a32(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/** 铸一枚：ISLE-XXXX-XXXX-XXXX（8 随机 + 4 校验段） */
function mintOne() {
  let payload = ''
  for (let i = 0; i < 8; i++) {
    payload += ALPHABET[randomInt(0, 32)]
  }
  const check = fnv1a32(payload) & CHECK_MASK
  let checkChars = ''
  for (let i = 0; i < 4; i++) {
    checkChars += ALPHABET[Math.floor(check / 32 ** i) % 32]
  }
  return `ISLE-${payload.slice(0, 4)}-${payload.slice(4)}-${checkChars}`
}

const count = Math.max(1, Math.min(100, Number(process.argv[2]) || 1))
const append = process.argv.includes('--append')
const showSql = process.argv.includes('--sql')
const here = dirname(fileURLToPath(import.meta.url))
const keys = Array.from({ length: count }, mintOne)

console.log('密钥（发给玩家）：')
console.log(keys.join('\n'))

// 入库用：D1 只存 SHA-256 哈希，不存明文
const sqlValues = keys.map((k) => {
  const hash = createHash('sha256').update(k).digest('hex')
  return `('${hash}', '${new Date().toISOString().slice(0, 10)} 发卡')`
})

if (showSql) {
  console.log('\n入库 SQL（wrangler d1 execute blog-counter --remote --command "..."）：')
  console.log(`INSERT OR IGNORE INTO secret_keys (key_hash, label) VALUES\n  ${sqlValues.join(',\n  ')};`)
} else {
  console.log('\n提示：加 --sql 参数可直接打印 D1 入库 SQL。')
}

if (append) {
  const outPath = join(here, 'minted-keys.txt')
  const stamp = new Date().toISOString().slice(0, 10)
  const hashes = keys.map((k) => createHash('sha256').update(k).digest('hex'))
  const lines = keys.flatMap((k, i) => [`  密钥: ${k}`, `  哈希: ${hashes[i]}`, ''])
  appendFileSync(outPath, `# ${stamp}\n${lines.join('\n')}\n`, {})
  console.log(`\n已追加记录到 ${outPath}（含哈希，方便对账 D1）`)
}
