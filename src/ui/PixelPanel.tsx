import type { ReactNode } from 'react'

interface Props {
  title?: string
  children: ReactNode
  className?: string
}

export function PixelPanel({ title, children, className = '' }: Props) {
  return (
    <section className={`pixel-panel ${className}`}>
      {title ? <h2 className="pixel-panel__title">{title}</h2> : null}
      {children}
    </section>
  )
}
