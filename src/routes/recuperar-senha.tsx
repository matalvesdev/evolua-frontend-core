import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/recuperar-senha')({
  component: RecuperarSenha,
})

type Step = 'email' | 'enviado'

function RecuperarSenha() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEnviar() {
    if (!email.includes('@')) { setError('Informe um e-mail válido'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setStep('enviado')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-canvas">

      {/* Logo */}
      <div className="mb-10">
        <Logo variant="primary" size="md" />
      </div>

      <div className="card w-full max-w-sm flex flex-col gap-6" style={{ borderRadius: 8 }}>
        {step === 'email' ? (
          <>
            <div>
              <h1
                className="font-display font-bold text-text-primary uppercase mb-1"
                style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}
              >
                Recuperar senha
              </h1>
              <p className="text-sm text-text-secondary">
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="label">E-mail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleEnviar()}
                />
                {error && <p className="text-xs text-danger mt-1">{error}</p>}
              </div>

              <button
                type="button"
                onClick={handleEnviar}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    Enviar link
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate({ to: '/entrar' })}
              className="flex items-center justify-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Voltar ao login
            </button>
          </>
        ) : (
          <>
            {/* Estado: enviado */}
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div
                className="w-14 h-14 flex items-center justify-center bg-dark"
                style={{ borderRadius: 2 }}
              >
                <span className="material-symbols-outlined text-3xl text-neon">mark_email_read</span>
              </div>
              <div>
                <h1
                  className="font-display font-bold text-text-primary uppercase mb-2"
                  style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}
                >
                  Link enviado!
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Verifique <span className="font-semibold text-text-primary">{email}</span> e clique no link para criar uma nova senha.
                </p>
              </div>
              <p className="text-xs text-text-tertiary">Não recebeu? Verifique a caixa de spam.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate({ to: '/entrar' })}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Ir para o login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
