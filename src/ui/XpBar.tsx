import { levelFromXp, totalXpForLevel } from '../core/level'

export function XpBar({ xp }: { xp: number }) {
  const level = levelFromXp(xp)
  const base = totalXpForLevel(level)
  const next = totalXpForLevel(level + 1)
  const pct = Math.round(((xp - base) / (next - base)) * 100)
  return (
    <div className="xpbar">
      <span className="xpbar__level">Lv.{level}</span>
      <div
        className="xpbar__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="xpbar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="xpbar__text">
        {xp}/{next} XP
      </span>
    </div>
  )
}
