import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('E-mail inválido'); return }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://processai-two.vercel.app/auth/reset-password',
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar e-mail')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-[#0F0F1A] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">E-mail enviado!</h2>
        <p className="text-slate-400 text-sm mb-2">Enviamos o link de recuperação para</p>
        <p className="text-indigo-300 font-medium text-sm mb-8 break-all">{email}</p>
        <p className="text-slate-500 text-xs mb-6">Verifique também a pasta de spam.<br/>O link expira em 1 hora.</p>
        <button onClick={() => navigate('/login')} className="text-indigo-400 font-medium text-sm">
          Voltar ao login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0F0F1A] flex flex-col px-5 py-6 max-w-lg mx-auto">
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 self-start"
      >
        <ArrowLeft size={18} /> Voltar ao login
      </button>

      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <TrendingUp size={18} className="text-white" />
        </div>
        <span className="font-bold text-white text-xl">ProcessAI</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">Recuperar senha</h1>
      <p className="text-slate-400 text-sm mb-8">
        Digite seu e-mail e enviaremos um link para criar uma nova senha.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail cadastrado"
          type="email"
          placeholder="joao@empresa.com"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoComplete="email"
          inputMode="email"
        />
        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Enviar link de recuperação
        </Button>
      </form>
    </div>
  )
}
