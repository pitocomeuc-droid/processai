import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowLeft, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import toast from 'react-hot-toast'

interface AuthProps {
  mode: 'login' | 'cadastro'
}

export function Auth({ mode }: AuthProps) {
  const navigate = useNavigate()
  const setUser = useStore((s) => s.setUser)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (mode === 'cadastro' && !form.name.trim()) e.name = 'Informe seu nome'
    if (!form.email.includes('@')) e.email = 'E-mail inválido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'cadastro') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name } },
        })
        if (error) throw error
        if (data.user) {
          setUser({ id: data.user.id, email: form.email, name: form.name, company_id: null })
          toast.success('Conta criada! Vamos configurar sua empresa.')
          navigate('/onboarding')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error
        if (data.user) {
          const name = data.user.user_metadata?.name || form.email
          setUser({ id: data.user.id, email: form.email, name, company_id: null })
          toast.success(`Bem-vindo de volta, ${name}!`)
          navigate('/dashboard')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao autenticar'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 self-start"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <TrendingUp size={18} className="text-white" />
        </div>
        <span className="font-bold text-white text-xl">ProcessAI</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">
        {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        {mode === 'login'
          ? 'Acesse seu painel de processos'
          : 'Comece a otimizar sua empresa hoje'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {mode === 'cadastro' && (
          <Input
            label="Seu nome"
            placeholder="João Silva"
            icon={<User size={16} />}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            autoComplete="name"
          />
        )}

        <Input
          label="E-mail"
          type="email"
          placeholder="joao@empresa.com"
          icon={<Mail size={16} />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        <Button type="submit" fullWidth loading={loading} className="mt-4">
          {mode === 'login' ? 'Entrar' : 'Criar conta grátis'}
        </Button>

        <p className="text-center text-sm text-slate-400 mt-2">
          {mode === 'login' ? (
            <>Não tem conta?{' '}
              <Link to="/cadastro" className="text-indigo-400 font-medium">Cadastre-se</Link>
            </>
          ) : (
            <>Já tem conta?{' '}
              <Link to="/login" className="text-indigo-400 font-medium">Entrar</Link>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
