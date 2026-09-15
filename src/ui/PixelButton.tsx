import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'md' | 'lg'
}

export function PixelButton({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return <button className={`pixel-btn pixel-btn--${variant} pixel-btn--${size} ${className}`} {...rest} />
}
