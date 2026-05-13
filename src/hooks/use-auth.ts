import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { setSentryUser } from '@/lib/sentry'
import { useRouter } from '@tanstack/react-router'
import type { User } from '@supabase/supabase-js'

// ── useUser ───────────────────────────────────────────────────────────────────
// Retorna o usuário autenticado com validação server-side (getUser),
// com error handling completo para evitar loading infinito.

export function useUser() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    // getUser() faz chamada autenticada ao servidor — mais confiável que
    // getSession() que apenas lê o storage local (sujeito a tokens obsoletos)
    supabase.auth.getUser()
      .then(({ data: { user }, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          setUser(null)
        } else {
          setUser(user)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Rede offline, timeout, etc. — não travar a UI
        setError(err instanceof Error ? err.message : 'Erro ao verificar autenticação')
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // Escuta mudanças de sessão em tempo real (login em outra aba, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      const u = session?.user ?? null
      setUser(u)
      setSentryUser(u ? { id: u.id } : null)
      setLoading(false)
      if (!session) setError(null) // limpa erro ao fazer logout
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}

// ── useAuth ───────────────────────────────────────────────────────────────────
// Expõe logout com navegação correta via TanStack Router (sem full page reload).

export function useAuth() {
  const router = useRouter()

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    // Invalida o cache do router (limpa dados em memória de rotas protegidas)
    // antes de navegar — previne flash de conteúdo autenticado
    await router.invalidate()
    await router.navigate({ to: '/entrar' })
  }, [router])

  return { logout }
}
