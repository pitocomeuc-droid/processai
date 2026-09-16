import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { Onboarding } from '@/pages/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { Chat } from '@/pages/Chat'
import { Processos } from '@/pages/Processos'
import { Melhorias } from '@/pages/Melhorias'
import { Perfil } from '@/pages/Perfil'
import { AuthCallback } from '@/pages/AuthCallback'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { Admin } from '@/pages/Admin'
import { Solucoes } from '@/pages/Solucoes'
import { Oportunidades } from '@/pages/Oportunidades'
import { Biblioteca } from '@/pages/Biblioteca'
import { AppLayout } from '@/components/layout/AppLayout'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { setUser, setCompany, reset } = useStore()

  useEffect(() => {
    // Restaurar sessão ao iniciar e escutar mudanças de auth
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return

      const u = session.user
      const name = u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário'

      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', u.id)
        .maybeSingle()

      setUser({ id: u.id, email: u.email ?? '', name, company_id: company?.id ?? null })
      if (company) setCompany(company)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        reset()
        return
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const u = session.user
        const name = u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário'
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', u.id)
          .maybeSingle()
        setUser({ id: u.id, email: u.email ?? '', name, company_id: company?.id ?? null })
        if (company) setCompany(company)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setCompany, reset])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/cadastro" element={<Auth mode="cadastro" />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/solucoes" element={<Solucoes />} />
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/processos" element={<Processos />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/melhorias" element={<Melhorias />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1E1E2E',
            color: '#E2E8F0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  )
}
