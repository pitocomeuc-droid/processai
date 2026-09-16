import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Phone, ArrowLeft, TrendingUp, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import toast from 'react-hot-toast'

interface AuthProps {
  mode: 'login' | 'cadastro'
}

function EmailSentScreen({ email, onResend }: { email: string; onResend: () => void }) {
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    setResending(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) toast.error('Erro ao reenviar. Tente em instantes.')
    else toast.success('E-mail reenviado!')
    setResending(false)
  }

  return (
    <div className="min-h-dvh bg-[#080C14] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
        <Mail size={32} className="text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Verifique seu e-mail</h2>
      <p className="text-slate-400 text-sm mb-1">Enviamos um link de confirmação para</p>
      <p className="text-indigo-300 font-medium text-sm mb-6 break-all">{email}</p>

      <div className="bg-[#0F1422] border border-white/8 rounded-2xl p-4 mb-6 text-left space-y-3 w-full max-w-sm">
        {[
          'Abra o e-mail que enviamos',
          'Clique no botão "Confirmar cadastro"',
          'Você será redirecionado de volta ao app',
          'Depois configure sua empresa',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-slate-300">{step}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mb-3">Não recebeu? Verifique a pasta de spam.</p>
      <button
        onClick={handleResend}
        disabled={resending}
        className="flex items-center gap-2 text-indigo-400 text-sm font-medium disabled:opacity-50"
      >
        <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
        {resending ? 'Reenviando...' : 'Reenviar e-mail'}
      </button>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-600">
        <CheckCircle2 size={12} />
        Conta criada. Aguardando confirmação.
      </div>
    </div>
  )
}

export function Auth({ mode }: AuthProps) {
  const navigate = useNavigate()
  const { setUser, setCompany } = useStore()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState('')
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (mode === 'cadastro') {
      if (!form.name.trim()) e.name = 'Informe seu nome completo'
      const digits = form.whatsapp.replace(/\D/g, '')
      if (digits.length < 10) e.whatsapp = 'WhatsApp inválido (ex: 11 99999-9999)'
    }
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'E-mail inválido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const loadCompanyAndRedirect = async (userId: string, userName: string, email: string) => {
    if (email.toLowerCase() === 'pitocomeuc@gmail.com') {
      setUser({ id: userId, email, name: userName, company_id: null })
      navigate('/admin')
      return
    }

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle()

    if (company) {
      setCompany(company)
      setUser({ id: userId, email, name: userName, company_id: company.id })
      navigate('/dashboard')
    } else {
      setUser({ id: userId, email, name: userName, company_id: null })
      navigate('/onboarding')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'cadastro') {
        const digits = form.whatsapp.replace(/\D/g, '')
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: form.name,
              whatsapp: digits,
              whatsapp_formatted: form.whatsapp,
            },
            emailRedirectTo: 'https://processai-br.vercel.app/auth/callback',
          },
        })
        if (error) throw error

        if (data.user) {
          // Enviar e-mail de boas-vindas via Resend (não bloqueante)
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: form.email, name: form.name, type: 'welcome' }),
          }).catch(() => {})

          if (data.session) {
            // Sessão ativa — usuário confirmado automaticamente (confirmação desabilitada no Supabase)
            toast.success('Conta criada! Vamos configurar sua empresa.')
            await loadCompanyAndRedirect(data.user.id, form.name, data.user.email ?? form.email)
          } else {
            // Supabase exige confirmação por e-mail
            setEmailSent(form.email)
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error
        if (data.user) {
          const email = data.user.email ?? form.email
          const name = data.user.user_metadata?.name || email.split('@')[0]
          toast.success(`Bem-vindo, ${name.split(' ')[0]}!`)
          await loadCompanyAndRedirect(data.user.id, name, email)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao autenticar'
      const translated =
        msg.includes('Invalid login credentials') ? 'E-mail ou senha incorretos' :
        msg.includes('User already registered') ? 'E-mail já cadastrado. Faça login.' :
        msg.includes('Email not confirmed') ? 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' :
        msg.includes('Password should be') ? 'Senha fraca. Use letras, números e símbolos.' :
        msg
      toast.error(translated)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return <EmailSentScreen email={emailSent} onResend={() => {}} />
  }

  return (
    <div className="min-h-dvh bg-[#080C14] flex flex-col px-5 py-6 max-w-lg mx-auto">
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
          <>
            <Input
              label="Nome completo"
              placeholder="João Silva"
              icon={<User size={16} />}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              label="WhatsApp"
              placeholder="(11) 99999-9999"
              icon={<Phone size={16} />}
              type="tel"
              inputMode="numeric"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: formatWhatsApp(e.target.value) })}
              error={errors.whatsapp}
              autoComplete="tel"
            />
          </>
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

        {mode === 'cadastro' && (
          <p className="text-[11px] text-slate-500 -mt-1 px-1">
            Ao se cadastrar, você concorda que poderemos entrar em contato pelo WhatsApp informado para suporte e novidades.
          </p>
        )}

        <Button type="submit" fullWidth loading={loading} className="mt-2">
          {mode === 'login' ? 'Entrar' : 'Criar conta grátis'}
        </Button>

        {mode === 'login' && (
          <div className="text-center -mt-1">
            <Link to="/forgot-password" className="text-slate-400 text-sm hover:text-indigo-400 transition-colors">
              Esqueceu sua senha?
            </Link>
          </div>
        )}

        <p className="text-center text-sm text-slate-400 mt-1">
          {mode === 'login' ? (
            <>Não tem conta?{' '}
              <Link to="/cadastro" className="text-indigo-400 font-medium">Cadastre-se grátis</Link>
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
