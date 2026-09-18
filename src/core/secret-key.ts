/**
 * 隐藏岛屿专属密钥：格式与归一化（2026-09-18 起为「在册制」）。
 *
 * 形态：ISLE-XXXX-XXXX-XXXX（前缀可省、大小写不敏感、连字符/空格可省）。
 * 结构 = 8 字符随机载荷 + 4 字符校验段（FNV-1a(载荷) 低 20 bit）。
 *
 * 安全模型（相比旧版盐混淆方案的升级）：
 *  - 客户端只做格式与校验段检查（挡手滑打错字），不再持有任何秘密
 *  - 密钥是否「在册」由服务端 /api/secret/unlock 查 D1 决定（只存哈希）
 *  - 秘境岛题目也只由服务端下发——bundle 里连题目都没有
 *
 * 三处算法必须严格一致：本文件、code-isles tools/mint-key.mjs、
 * counter-worker/src/index.js 的 normalizeSecretKey。
 */

/** 32 个易读字符（去掉 0/O/1/I/L，防止手抄混淆） */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

const PREFIX = 'ISLE'
/** 载荷字符数（8 随机） */
const PAYLOAD_LEN = 8
/** 校验段字符数（4 × 5 bit = 20 bit） */
const CHECK_LEN = 4
/** 校验段掩码：20 bit */
const CHECK_MASK = 0xfffff

/** FNV-1a 32 位；Math.imul 保证 32 位乘法语义 */
function fnv1a32(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/**
 * 归一化 + 格式校验。
 * 格式合法 → 返回规范形态（ISLE-XXXX-XXXX-XXXX）；非法 → null。
 * 注意：格式合法 ≠ 在册有效——是否真的能解锁由服务端判定。
 */
export function checkKey(raw: string): string | null {
  if (typeof raw !== 'string') return null
  let norm = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (norm.startsWith(PREFIX)) norm = norm.slice(PREFIX.length)
  if (norm.length !== PAYLOAD_LEN + CHECK_LEN) return null
  for (const ch of norm) {
    if (!ALPHABET.includes(ch)) return null
  }
  const payload = norm.slice(0, PAYLOAD_LEN)
  let check = 0
  for (let i = 0; i < CHECK_LEN; i++) {
    check += ALPHABET.indexOf(norm[PAYLOAD_LEN + i]) * 32 ** i
  }
  if ((fnv1a32(payload) & CHECK_MASK) !== check) return null
  return `${PREFIX}-${payload.slice(0, 4)}-${payload.slice(4)}-${norm.slice(PAYLOAD_LEN)}`
}

/** 便捷判定：这串输入格式上是不是一把合法钥匙 */
export function verifyKey(raw: string): boolean {
  return checkKey(raw) !== null
}

/** 给 UI 展示用的掩码形态：ISLE-XXXX-XXXX-••••（只露前 8 位） */
export function maskKey(raw: string): string {
  const norm = checkKey(raw)
  if (!norm) return '—'
  return `${norm.slice(0, 14)}-••••`
}
