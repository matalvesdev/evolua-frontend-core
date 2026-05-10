import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/entrar')({
  validateSearch: searchSchema,
  component: EntrarPage,
})

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function EntrarPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [erro, setErro] = useState('')
  const [googleToast, setGoogleToast] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !senha) {
      setErro('Preencha email e senha.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setStatus('error')
      setErro('Credenciais inválidas. Verifique seu email e senha.')
      return
    }
    navigate({ to: search.redirect ?? '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Minimal header */}
      <header className="px-5 md:px-12 py-5 flex items-center justify-between border-b border-border-soft">
        <Link to="/" className="hover:opacity-70 transition-opacity">
          <Logo variant="primary" size="sm" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar ao site
        </Link>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Painel esquerdo — marca + social proof (deep + neon) */}
        <div className="hidden md:flex md:w-[45%] lg:w-[42%] bg-dark text-white flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
          {/* Fundo decorativo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-neon/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10">
            <span className="font-label text-[9px] font-bold tracking-[0.4em] uppercase text-neon/60 block mb-10">
              Bem-vinda de volta
            </span>
            <h2 className="font-headline font-black text-4xl lg:text-5xl xl:text-6xl uppercase tracking-tighter leading-[0.88] mb-6">
              Sua clínica<br />te espera<span className="text-neon">.</span>
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-xs">
              Prontuários, agenda, financeiro, IA — tudo em um lugar. Acesse e continue de onde parou.
            </p>
          </div>

          {/* Depoimento */}
          <div className="relative z-10 border-l-2 border-neon pl-5">
            <p className="text-white/85 text-sm leading-relaxed italic mb-3">
              "Nunca mais fiquei até meia-noite escrevendo evolução. O Evolua mudou minha prática completamente."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neon/20 flex items-center justify-center">
                <span className="font-headline font-black text-xs text-neon">MP</span>
              </div>
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-wide">Mariana P.</p>
                <p className="text-white/55 text-[10px] uppercase tracking-wide">Fonoaudióloga · São Paulo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Painel direito — formulário */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
          <div className="w-full max-w-sm">

            {/* Cabeçalho */}
            <div className="mb-10">
              <h1 className="font-headline font-black text-3xl uppercase tracking-tighter leading-[0.9] mb-2">
                Acessar conta
              </h1>
              <p className="text-on-surface-variant text-sm">
                Não tem conta?{' '}
                <Link to="/cadastro" className="text-primary font-bold hover:underline">
                  Crie grátis agora
                </Link>
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => { setGoogleToast(true); setTimeout(() => setGoogleToast(false), 3000) }}
              className="w-full flex items-center justify-center gap-3 border-2 border-border hover:border-border-bright bg-surface hover:bg-surface-low py-3.5 transition-all duration-200 mb-6 group relative"
            >
              <GoogleIcon />
              <span className="font-headline font-bold text-xs uppercase tracking-wide text-text-primary">
                Continuar com Google
              </span>
              {googleToast && (
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dark text-neon text-[10px] font-bold px-3 py-1.5 rounded shadow-lg">
                  Google OAuth em breve
                </span>
              )}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">ou</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant block mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com.br"
                  className="w-full px-4 py-3.5 border-2 border-border bg-surface font-body text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="senha" className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant">
                    Senha
                  </label>
                  <Link
                    to="/recuperar-senha"
                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    Esqueci a senha
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="senha"
                    type={senhaVisivel ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 pr-12 border-2 border-border bg-surface font-body text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setSenhaVisivel(!senhaVisivel)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {senhaVisivel ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Erro */}
              {status === 'error' && erro && (
                <div role="alert" className="flex items-center gap-2 p-3 bg-error-container border border-error/20 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-base text-error shrink-0">error</span>
                  {erro}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-dark text-neon py-4 btn-text text-sm hover:bg-ink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Rodapé */}
            <p className="mt-8 text-center text-[10px] text-on-surface-variant leading-relaxed">
              Ao acessar, você concorda com os{' '}
              <Link to="/termos" className="underline hover:text-primary">Termos de Uso</Link>
              {' '}e a{' '}
              <Link to="/privacidade" className="underline hover:text-primary">Política de Privacidade</Link>
              {' '}do Evolua.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
