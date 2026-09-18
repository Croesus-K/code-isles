/**
 * 隐藏岛屿专属密钥：离线校验（无后端，纯前端静态站）。
 *
 * 密钥形态：ISLE-XXXX-XXXX-XXXX（前缀可省、大小写不敏感、连字符可省）。
 * 结构 = 8 字符载荷（5 bit 版本号 + 35 bit 随机数）+ 4 字符校验段。
 * 校验段 = FNV-1a(载荷字符 + 盐) 的低 20 bit。盐以异或混淆形式内嵌在
 * 打包产物里——能挡住随手伪造 / 撞格式，但挡不住决心逆向的玩家；
 * 这是荣誉制打赏门，不是安全边界。
 *
 * 发卡：仓主在本地跑 node tools/mint-key.mjs（盐的明文在 tools/.secret，
 * 已 gitignore，不进仓库）。随机空间 2^35，瞎猜命中率 ≈ 1/343 亿；
 * 校验段再叠 1/2^20，暴力瞎编基本不可行。
 *
 * 版本号：载荷最高 5 bit，当前为 1。以后换算法/换盐可以升版本，
 * 旧密钥自然失效，用 tools/mint-key.mjs 重新发卡即可。
 */

/** 32 个易读字符（去掉 0/O/1/I/L，防止手抄混淆） */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

const PREFIX = 'ISLE'
/** 载荷字符数（8 × 5 bit = 40 bit = 5 bit 版本 + 35 bit 随机） */
const PAYLOAD_LEN = 8
/** 校验段字符数（4 × 5 bit = 20 bit） */
const CHECK_LEN = 4
/** 当前密钥版本（1~31） */
const KEY_VERSION = 1
/** 校验段掩码：20 bit */
const CHECK_MASK = 0xfffff

/**
 * 盐的明文绝不直接出现在源码里。这里存的是逐字符异或后的字节流，
 * 还原流 k(i) = (i*37+11) & 0xFF，与 tools/mint-key.mjs 保持一致。
 * 明文只存在于仓主本地的 tools/.secret（gitignore）。
 */
const SECRET_OBFUSCATED = [60, 85, 96, 77, 171, 246, 140, 111, 5, 57, 73, 149, 162, 216, 36, 4, 104, 228, 192, 243]

function secret(): string {
  return String.fromCharCode(
    ...SECRET_OBFUSCATED.map((c, i) => c ^ (((i * 37 + 11) & 0xff))),
  )
}

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
 * 归一化 + 校验密钥。
 * 合法 → 返回规范形态（ISLE-XXXX-XXXX-XXXX）；非法 → null。
 * 接受：带/不带 ISLE 前缀、带/不带连字符与空格、小写输入。
 */
export function checkKey(raw: string): string | null {
  if (typeof raw !== 'string') return null
  let norm = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (norm.startsWith(PREFIX)) norm = norm.slice(PREFIX.length)
  if (norm.length !== PAYLOAD_LEN + CHECK_LEN) return null
  for (const ch of norm) {
    if (!ALPHABET.includes(ch)) return null
  }
  const payloadChars = norm.slice(0, PAYLOAD_LEN)
  const checkChars = norm.slice(PAYLOAD_LEN)

  // 解码 40 bit 载荷（< 2^40，double 精度无损）
  let payload = 0
  for (let i = 0; i < PAYLOAD_LEN; i++) {
    payload += ALPHABET.indexOf(payloadChars[i]) * 32 ** i
  }
  const version = Math.floor(payload / 2 ** 35)
  if (version !== KEY_VERSION) return null

  // 解码 20 bit 校验值并重算比对
  let check = 0
  for (let i = 0; i < CHECK_LEN; i++) {
    check += ALPHABET.indexOf(checkChars[i]) * 32 ** i
  }
  const expected = fnv1a32(payloadChars + '|' + secret()) & CHECK_MASK
  if (check !== expected) return null

  return `${PREFIX}-${payloadChars.slice(0, 4)}-${payloadChars.slice(4)}-${checkChars}`
}

/** 便捷判定：这串输入是不是有效密钥 */
export function verifyKey(raw: string): boolean {
  return checkKey(raw) !== null
}

/** 给 UI 展示用的掩码形态：ISLE-XXXX-XXXX-••••（只露前 8 位） */
export function maskKey(raw: string): string {
  const norm = checkKey(raw)
  if (!norm) return '—'
  return `${norm.slice(0, 14)}-••••`
}
