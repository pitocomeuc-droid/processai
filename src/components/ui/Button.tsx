import { cn } from '@/lib/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none'

  const variants = {
    primary: 'bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40',
    secondary: 'bg-[#2A2A3E] text-white border border-white/10 hover:bg-[#333350]',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
  }

  const sizes = {
    sm: 'text-sm px-4 py-2 min-h-[36px]',
    md: 'text-base px-5 py-3 min-h-[48px]',
    lg: 'text-lg px-6 py-4 min-h-[56px]',
  }

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
