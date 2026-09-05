import { useStore } from '@/store/useStore'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { User, Building2, LogOut, ChevronRight, TrendingUp, Bell, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const sectorLabels: Record<string, string> = {
  restaurante: '🍽️ Restaurante', bar: '🍺 Bar', loja_fisica: '🏪 Loja Física',
  loja_online: '🛒 E-commerce', clinica: '🏥 Clínica', oficina: '🔧 Oficina',
  escritorio: '💼 Escritório', outro: '🏢 Outro',
}

const menuItems = [
  { icon: Building2, label: 'Dados da empresa', sub: 'Editar informações' },
  { icon: Bell, label: 'Notificações', sub: 'Alertas e lembretes' },
  { icon: Shield, label: 'Segurança', sub: 'Senha e privacidade' },
  { icon: TrendingUp, label: 'Histórico de melhorias', sub: 'Ver progresso completo' },
]

export function Perfil() {
  const { user, company, reset } = useStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    toast.success('Sessão encerrada')
    navigate('/')
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold text-white">Perfil</h1>

      {/* User Card */}
      <Card glow>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{user?.name}</p>
            <p className="text-slate-400 text-sm truncate">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Company Card */}
      {company && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Empresa</p>
              <p className="text-white font-medium">{company.name}</p>
              <p className="text-sm text-slate-400">{sectorLabels[company.sector]}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Score</p>
              <p className="text-2xl font-bold text-indigo-400">{company.health_score}</p>
              <p className="text-[10px] text-slate-500">/ 100</p>
            </div>
          </div>
        </Card>
      )}

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map(({ icon: Icon, label, sub }) => (
          <Card key={label} onClick={() => {}} className="cursor-pointer active:scale-98 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2A2A3E] flex items-center justify-center">
                <Icon size={16} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </div>
          </Card>
        ))}
      </div>

      {/* Logout */}
      <Button variant="danger" fullWidth onClick={handleLogout}>
        <LogOut size={16} /> Sair da conta
      </Button>

      <p className="text-center text-[10px] text-slate-600 pb-2">ProcessAI v1.0 · Desenvolvido com IA</p>
    </div>
  )
}
