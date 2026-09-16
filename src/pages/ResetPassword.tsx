import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase processa o token do hash da URL automaticamente
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Verificar se já há sessão ativa (token já processado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Senha redefinida!</h2>
        <p className="text-slate-400 text-sm">Redirecionando para o login...</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Verificando link...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-10 mt-4">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <TrendingUp size={18} className="text-white" />
        </div>
        <span className="font-bold text-white text-xl">ProcessAI</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">Nova senha</h1>
      <p className="text-slate-400 text-sm mb-8">Escolha uma senha segura para sua conta.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nova senha"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={error}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Redefinir senha
        </Button>
      </form>
    </div>
  )
}
