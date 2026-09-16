import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, TrendingUp, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/cn'

const tabs = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Início' },
  { to: '/oportunidades', icon: TrendingUp,       label: 'Oport.' },
  { to: '/chat',          icon: MessageSquare,    label: 'IA' },
  { to: '/biblioteca',    icon: BookOpen,         label: 'Biblioteca' },
  { to: '/perfil',        icon: User,             label: 'Perfil' },
]

export function BottomNav() {
  return (
    <nav
      className="shrink-0 bg-[#080C14] border-t border-white/6"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="flex items-stretch justify-around px-1 pt-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 flex-1 py-2 px-1 rounded-xl transition-all duration-150',
                isActive ? 'text-indigo-400' : 'text-slate-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'w-10 h-7 flex items-center justify-center rounded-xl transition-all duration-150',
                  isActive ? 'bg-indigo-500/15' : ''
                )}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-all duration-150',
                  isActive ? 'text-indigo-400' : 'text-slate-600'
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
