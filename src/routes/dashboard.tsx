import { createFileRoute, Outlet, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Sidebar }   from '@/components/layout/Sidebar'
import { Header }    from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { supabase }  from '@/lib/supabase'

export const Route = createFileRoute('/dashboard')({
  // ── Auth guard ────────────────────────────────────────────────────────────
  // Garante que /dashboard/* só é acessível autenticado. Em sessão expirada
  // redireciona para /entrar com `redirect=` para retornar após login.
  beforeLoad: async ({ location }) => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      throw redirect({
        to: '/entrar',
        search: { redirect: location.href },
      })
    }
  },
  component: DashboardLayout,
})

// ── Quick Notes FAB ───────────────────────────────────────────────────────────
// Notas rápidas temporárias — usa sessionStorage (limpo ao fechar a aba).
// LGPD: dados clínicos NUNCA devem ser persistidos em localStorage (acesso
// por scripts de terceiros, extensões e outros usuários do dispositivo).
// Para anotações persistentes, use o Prontuário ou Tarefas.

function QuickNotesFAB() {
  const [open, setOpen]   = useState(false)
  const [notes, setNotes] = useState(() => sessionStorage.getItem('evolua_quick_notes') ?? '')
  const [lgpdHint, setLgpdHint] = useState(() => !sessionStorage.getItem('evolua_notes_hint_seen'))

  function save(val: string) {
    setNotes(val)
    sessionStorage.setItem('evolua_quick_notes', val)
  }

  function dismissHint() {
    sessionStorage.setItem('evolua_notes_hint_seen', '1')
    setLgpdHint(false)
  }

  return (
    <>
      {/* Painel de notas */}
      {open && (
        <div className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-50 w-80 bg-surface border border-border-soft shadow-[var(--shadow-dark)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-dark border-b border-dark-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-neon" style={{ fontVariationSettings:'"FILL" 1' }}>sticky_note_2</span>
              <p className="font-display font-bold text-xs uppercase tracking-widest text-neon">Notas rápidas</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Aviso LGPD — aparece uma vez por sessão */}
          {lgpdHint && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-warning/10 border-b border-warning/20">
              <span className="material-symbols-outlined text-sm text-warning shrink-0 mt-0.5" style={{ fontVariationSettings:'"FILL" 1' }}>info</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-text-secondary leading-snug">
                  <strong>Atenção LGPD:</strong> Não registre dados identificáveis de pacientes aqui. Use o{' '}
                  <a href="/dashboard/prontuario" className="underline text-olive">Prontuário</a> para anotações clínicas.
                </p>
              </div>
              <button onClick={dismissHint} className="text-text-tertiary hover:text-text-primary shrink-0">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          )}

          <textarea
            value={notes}
            onChange={e => save(e.target.value)}
            placeholder="Lembretes rápidos — não inclua dados de pacientes..."
            rows={10}
            className="flex-1 p-4 text-sm text-text-primary bg-surface outline-none resize-none leading-relaxed placeholder:text-text-tertiary"
            autoFocus
          />
          <div className="px-4 py-2 border-t border-border-soft flex items-center justify-between text-[10px] text-text-tertiary">
            <span title="Notas limpas automaticamente ao fechar o navegador">🔒 Sessão apenas · {notes.length} chars</span>
            <button onClick={() => save('')} className="hover:text-danger transition-colors">Limpar</button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-40 w-12 h-12 bg-dark text-neon shadow-[var(--shadow-dark)] flex items-center justify-center hover:opacity-90 transition-opacity"
        style={{ transform: open ? 'translateY(-312px)' : 'none', transition: 'transform 0.2s ease' }}
        aria-label="Notas rápidas"
        title="Notas rápidas (não use para dados de pacientes)"
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings:'"FILL" 1' }}>
          {open ? 'close' : 'edit_note'}
        </span>
      </button>
    </>
  )
}

// ── Onboarding Banner ─────────────────────────────────────────────────────────
// Aparece na primeira semana de uso. Guia para as 3 ações mais importantes.
// Usa sessionStorage — não persiste entre sessões do browser por design.

const ONBOARDING_KEY = 'evolua_onboarding_dismissed'

const ONBOARDING_STEPS = [
  { icon: 'clinical_notes', label: 'Criar prontuário',       to: '/dashboard/prontuario' as const },
  { icon: 'calendar_month', label: 'Agendar sessão',         to: '/dashboard/agenda'     as const },
  { icon: 'mic',            label: 'Iniciar primeira sessão', to: '/dashboard/sessao'    as const },
]

function OnboardingBanner() {
  const [visible, setVisible] = useState(() =>
    typeof window !== 'undefined' && !sessionStorage.getItem(ONBOARDING_KEY)
  )

  function dismiss() {
    sessionStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="border-b border-border-soft bg-neon-surface">
      <div className="flex items-center gap-4 px-5 py-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-olive text-lg" style={{ fontVariationSettings:'"FILL" 1' }}>waving_hand</span>
          <p className="text-sm font-bold text-text-primary">Bem-vinda! Comece por aqui:</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {ONBOARDING_STEPS.map(s => (
            <Link
              key={s.label}
              to={s.to}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dark text-neon text-[10px] font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">{s.icon}</span>
              {s.label}
            </Link>
          ))}
        </div>
        <button onClick={dismiss} className="text-text-tertiary hover:text-text-primary transition-colors shrink-0 text-xs">
          Fechar
        </button>
      </div>
    </div>
  )
}

// ── Layout principal ──────────────────────────────────────────────────────────
function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <OnboardingBanner />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 bg-canvas">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <QuickNotesFAB />
    </div>
  )
}
