import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/nova-senha')({
  component: NovaSenhaPage,
})

function NovaSenhaPage() {
  const navigate = useNavigate()
  const [senha, setSenha]           = useState('')
  const [confirmar, setConfirmar]   = useState('')
  const [visivel, setVisivel]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  // Supabase injeta a sessão de recuperação via URL hash — aguarda o evento
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasSession(true)
      }
      // Se o usuário fizer logout ou a sessão expirar, bloqueia o formulário
      if (event === 'SIGNED_OUT') {
        setHasSession(false)
      }
    })
    // Verifica sessão ativa com chamada autenticada ao servidor (não via localStorage)
    // Isso evita que tokens forjados/expirados no storage passem a validação
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (user && !error) setHasSession(true)
      // Só marca como false se nenhum evento PASSWORD_RECOVERY chegar em 3s
      else setTimeout(() => setHasSession(s => s === null ? false : s), 3000)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSalvar() {
    if (senha.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return }
    if (senha !== confirmar) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password: senha })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setTimeout(() => navigate({ to: '/dashboard' }), 2500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-canvas">
      <div className="mb-10">
        <Logo variant="primary" size="md" />
      </div>

      <div className="card w-full max-w-sm flex flex-col gap-6" style={{ borderRadius: 8 }}>
        {success ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 flex items-center justify-center bg-dark" style={{ borderRadius: 2 }}>
              <span className="material-symbols-outlined text-3xl text-neon">check_circle</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-text-primary uppercase mb-2" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                Senha atualizada!
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                Redirecionando para o dashboard...
              </p>
            </div>
          </div>
        ) : hasSession === false ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <span className="material-symbols-outlined text-4xl text-danger">link_off</span>
            <div>
              <h1 className="font-display font-bold text-text-primary uppercase mb-2" style={{ fontSize: '1.25rem' }}>
                Link inválido
              </h1>
              <p className="text-sm text-text-secondary">
                Este link de recuperação expirou ou já foi utilizado.
              </p>
            </div>
            <button onClick={() => navigate({ to: '/recuperar-senha' })} className="btn-primary w-full">
              Solicitar novo link
            </button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-display font-bold text-text-primary uppercase mb-1" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                Nova senha
              </h1>
              <p className="text-sm text-text-secondary">
                Escolha uma senha segura com pelo menos 8 caracteres.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="label">Nova senha</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={visivel ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={senha}
                    onChange={e => { setSenha(e.target.value); setError('') }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setVisivel(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}>
                    <span className="material-symbols-outlined text-lg">{visivel ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirmar nova senha</label>
                <input
                  className="input"
                  type={visivel ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={confirmar}
                  onChange={e => { setConfirmar(e.target.value); setError('') }}
                  autoComplete="new-password"
                  onKeyDown={e => e.key === 'Enter' && handleSalvar()}
                />
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <button
                type="button"
                onClick={handleSalvar}
                disabled={loading || !senha || !confirmar}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">lock_reset</span>
                    Salvar nova senha
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
