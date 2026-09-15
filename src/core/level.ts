/**
 * 升级曲线：升到 L 级累计需要 60 × (L-1)² 点 XP。
 * L2=60、L3=240、L4=540 —— 按"一关 20~40 XP"设计，前期两三关升一级，节奏先快后慢。
 */
export function totalXpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level)) - 1
  return 60 * n * n
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (totalXpForLevel(level + 1) <= xp) level += 1
  return level
}
