import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setUser, setCompany } = useStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Confirmando seu e-mail...')

  useEffect(() => {
    const process = async () => {
      try {
        // getSession processa automaticamente o hash/token da URL
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (!session) {
          // Pode ter chegado sem hash ainda — aguardar onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
            if (event === 'SIGNED_IN' && s) {
              subscription.unsubscribe()
              const email = s.user.email ?? ''
              await finalize(s.user.id, s.user.user_metadata?.name || email.split('@')[0] || 'Usuário', email)
            } else if (event === 'USER_UPDATED' && s) {
              subscription.unsubscribe()
              const email = s.user.email ?? ''
              await finalize(s.user.id, s.user.user_metadata?.name || email.split('@')[0] || 'Usuário', email)
            }
          })
          // Timeout de segurança
          setTimeout(() => {
            setStatus('error')
            setMessage('Link expirado ou inválido. Tente se cadastrar novamente.')
          }, 8000)
          return
        }

        await finalize(session.user.id, session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário', session.user.email ?? '')
      } catch {
        setStatus('error')
        setMessage('Erro ao confirmar. Tente novamente ou entre em contato.')
      }
    }

    const finalize = async (userId: string, name: string, email: string) => {
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle()

      setUser({ id: userId, email, name, company_id: company?.id ?? null })
      if (company) setCompany(company)

      setStatus('success')
      setMessage('E-mail confirmado com sucesso!')

      const dest = email.toLowerCase() === 'pitocomeuc@gmail.com'
        ? '/admin'
        : company ? '/dashboard' : '/onboarding'

      setTimeout(() => {
        navigate(dest, { replace: true })
      }, 1500)
    }

    process()
  }, [navigate, setUser, setCompany])

  return (
    <div className="min-h-dvh bg-[#0F0F1A] flex flex-col items-center justify-center px-6 text-center">
      {status === 'loading' && (
        <>
          <Loader2 size={40} className="text-indigo-400 animate-spin mb-4" />
          <p className="text-white font-semibold text-lg mb-1">{message}</p>
          <p className="text-slate-500 text-sm">Aguarde um momento...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <p className="text-white font-semibold text-lg mb-1">{message}</p>
          <p className="text-slate-400 text-sm">Redirecionando...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <XCircle size={36} className="text-red-400" />
          </div>
          <p className="text-white font-semibold text-lg mb-2">Erro na confirmação</p>
          <p className="text-slate-400 text-sm mb-6">{message}</p>
          <button
            onClick={() => navigate('/cadastro')}
            className="text-indigo-400 font-medium text-sm"
          >
            Voltar ao cadastro
          </button>
        </>
      )}
    </div>
  )
}
