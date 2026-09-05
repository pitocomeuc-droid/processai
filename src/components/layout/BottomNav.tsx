import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, GitBranch, CheckSquare, User } from 'lucide-react'
import { cn } from '@/lib/cn'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { to: '/processos', icon: GitBranch, label: 'Processos' },
  { to: '/chat', icon: MessageSquare, label: 'IA' },
  { to: '/melhorias', icon: CheckSquare, label: 'Melhorias' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom glass border-t border-white/6">
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 min-w-[56px] py-1 px-2 rounded-xl transition-all',
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive && 'bg-indigo-500/15'
                )}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
