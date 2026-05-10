import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useUser, useAuth } from '@/hooks/use-auth'
import { createPortal } from 'react-dom'

// ── Título de cada rota ───────────────────────────────────────────────────────
const ROUTE_META: Record<string, { title: string; parent?: string; icon: string }> = {
  '/dashboard':               { title: 'Dashboard',      icon: 'dashboard'          },
  '/dashboard/pacientes':     { title: 'Pacientes',      icon: 'group',             parent: 'Dashboard' },
  '/dashboard/agenda':        { title: 'Agenda',         icon: 'calendar_month',    parent: 'Dashboard' },
  '/dashboard/sessao':        { title: 'Sessão ao Vivo', icon: 'mic',               parent: 'Dashboard' },
  '/dashboard/financeiro':    { title: 'Financeiro',     icon: 'payments',          parent: 'Dashboard' },
  '/dashboard/relatorios':    { title: 'Relatórios',     icon: 'description',       parent: 'Dashboard' },
  '/dashboard/prontuario':    { title: 'Prontuário',     icon: 'clinical_notes',    parent: 'Dashboard' },
  '/dashboard/teleconsulta':  { title: 'Teleconsulta',   icon: 'video_call',        parent: 'Dashboard' },
  '/dashboard/exercicios':    { title: 'Exercícios',     icon: 'fitness_center',    parent: 'Dashboard' },
  '/dashboard/laudos':        { title: 'Laudos',         icon: 'verified',          parent: 'Dashboard' },
  '/dashboard/analytics':     { title: 'Analytics',      icon: 'bar_chart',         parent: 'Dashboard' },
  '/dashboard/whatsapp':      { title: 'WhatsApp',       icon: 'chat',              parent: 'Dashboard' },
  '/dashboard/caa':           { title: 'CAA',            icon: 'communication',     parent: 'Dashboard' },
  '/dashboard/materiais':     { title: 'Materiais',      icon: 'folder',            parent: 'Dashboard' },
  '/dashboard/biblioteca':    { title: 'Biblioteca',     icon: 'menu_book',         parent: 'Dashboard' },
  '/dashboard/marketing':     { title: 'Marketing',      icon: 'campaign',          parent: 'Dashboard' },
  '/dashboard/tarefas':       { title: 'Tarefas',        icon: 'task_alt',          parent: 'Dashboard' },
  '/dashboard/configuracoes': { title: 'Configurações',  icon: 'settings',          parent: 'Dashboard' },
  '/dashboard/perfil':        { title: 'Meu Perfil',     icon: 'person',            parent: 'Dashboard' },
  '/dashboard/mais':          { title: 'Mais',           icon: 'apps',              parent: 'Dashboard' },
}

// ── Command palette links ─────────────────────────────────────────────────────
const QUICK_LINKS = [
  { label: 'Dashboard',        to: '/dashboard',               icon: 'dashboard',      group: 'Páginas'    },
  { label: 'Pacientes',        to: '/dashboard/pacientes',     icon: 'group',          group: 'Páginas'    },
  { label: 'Agenda',           to: '/dashboard/agenda',        icon: 'calendar_month', group: 'Páginas'    },
  { label: 'Nova Sessão',      to: '/dashboard/sessao',        icon: 'mic',            group: 'Ações'      },
  { label: 'Prontuário',       to: '/dashboard/prontuario',    icon: 'clinical_notes', group: 'Páginas'    },
  { label: 'Teleconsulta',     to: '/dashboard/teleconsulta',  icon: 'video_call',     group: 'Páginas'    },
  { label: 'Exercícios',       to: '/dashboard/exercicios',    icon: 'fitness_center', group: 'Páginas'    },
  { label: 'Laudos',           to: '/dashboard/laudos',        icon: 'verified',       group: 'Páginas'    },
  { label: 'Analytics',        to: '/dashboard/analytics',     icon: 'bar_chart',      group: 'Páginas'    },
  { label: 'WhatsApp',         to: '/dashboard/whatsapp',      icon: 'chat',           group: 'Páginas'    },
  { label: 'Relatórios',       to: '/dashboard/relatorios',    icon: 'description',    group: 'Páginas'    },
  { label: 'Financeiro',       to: '/dashboard/financeiro',    icon: 'payments',       group: 'Páginas'    },
  { label: 'Tarefas',          to: '/dashboard/tarefas',       icon: 'task_alt',       group: 'Páginas'    },
  { label: 'CAA',              to: '/dashboard/caa',           icon: 'communication',  group: 'Páginas'    },
  { label: 'Materiais',        to: '/dashboard/materiais',     icon: 'folder',         group: 'Recursos'   },
  { label: 'Biblioteca',       to: '/dashboard/biblioteca',    icon: 'menu_book',      group: 'Recursos'   },
  { label: 'Marketing',        to: '/dashboard/marketing',     icon: 'campaign',       group: 'Recursos'   },
  { label: 'Configurações',    to: '/dashboard/configuracoes', icon: 'settings',       group: 'Sistema'    },
  { label: 'Meu Perfil',       to: '/dashboard/perfil',        icon: 'person',         group: 'Sistema'    },
]

// ── Notificações ─────────────────────────────────────────────────────────────
// Consumir via useNotifications() quando backend estiver disponível.
type Notification = {
  id: string
  unread: boolean
  surface: string
  color: string
  icon: string
  msg: string
  time: string
}
const NOTIFICATIONS: Notification[] = []

// ── Clock hook ────────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

// ── Command Palette (Spotlight) ───────────────────────────────────────────────
function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = query.trim() === ''
    ? QUICK_LINKS
    : QUICK_LINKS.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))

  const go = useCallback((to: string) => {
    navigate({ to })
    onClose()
  }, [navigate, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
      if (e.key === 'Enter' && filtered[active]) { go(filtered[active].to) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [filtered, active, go, onClose])

  // group by group label
  const grouped: Record<string, typeof QUICK_LINKS> = {}
  filtered.forEach(l => {
    if (!grouped[l.group]) grouped[l.group] = []
    grouped[l.group].push(l)
  })

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-surface border border-border-soft shadow-[var(--shadow-dark)] overflow-hidden"
        style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-soft">
          <span className="material-symbols-outlined text-xl text-text-tertiary shrink-0">search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0) }}
            placeholder="Buscar páginas, ações..."
            className="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-tertiary outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setActive(0) }} className="text-text-tertiary hover:text-text-primary transition-colors shrink-0">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
          <kbd className="shrink-0 hidden sm:flex items-center gap-0.5 px-2 py-1 border border-border-soft text-[10px] font-mono text-text-tertiary">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-tertiary gap-2">
              <span className="material-symbols-outlined text-3xl">search_off</span>
              <p className="text-sm">Nenhum resultado para "{query}"</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, links]) => (
              <div key={group}>
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-tertiary bg-surface-low border-b border-border-soft">
                  {group}
                </p>
                {links.map((l) => {
                  const globalIdx = filtered.indexOf(l)
                  return (
                    <button
                      key={l.to}
                      onClick={() => go(l.to)}
                      onMouseEnter={() => setActive(globalIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                        active === globalIdx ? 'bg-neon-surface' : 'hover:bg-surface-low'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-lg shrink-0 ${
                        active === globalIdx ? 'text-olive' : 'text-text-tertiary'
                      }`}>{l.icon}</span>
                      <span className={`text-sm font-medium ${active === globalIdx ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {l.label}
                      </span>
                      {active === globalIdx && (
                        <span className="ml-auto text-[10px] text-text-tertiary font-mono">↵</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border-soft px-4 py-2 flex items-center gap-4 text-[10px] text-text-tertiary">
          <span><kbd className="font-mono border border-border-soft px-1">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono border border-border-soft px-1">↵</kbd> abrir</span>
          <span><kbd className="font-mono border border-border-soft px-1">ESC</kbd> fechar</span>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Header principal ──────────────────────────────────────────────────────────
export function Header() {
  const { user }     = useUser()
  const { logout }   = useAuth()
  const navigate     = useNavigate()
  const { location } = useRouterState()
  const now          = useClock()

  const [profileOpen, setProfileOpen]   = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [paletteOpen, setPaletteOpen]   = useState(false)
  const [notifRead, setNotifRead]       = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef   = useRef<HTMLDivElement>(null)

  // Click-outside para perfil e notif
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ctrl+K abre command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const meta      = ROUTE_META[location.pathname] ?? { title: 'Dashboard', icon: 'dashboard' }
  const name      = ((user?.user_metadata as Record<string,string> | undefined)?.['nome'] ?? user?.user_metadata?.name ?? user?.user_metadata?.full_name ?? 'Profissional') as string
  const firstName = name.split(' ')[0]
  const initial   = name.charAt(0).toUpperCase()

  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })

  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate({ to: '/entrar' })
  }

  return (
    <>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}

      <header className="sticky top-0 z-40 bg-surface border-b border-border-soft shrink-0">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-[57px]">

          {/* ── Breadcrumb / título ── */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {meta.parent && (
              <>
                <Link to="/dashboard" className="hidden sm:block text-xs text-text-tertiary hover:text-text-secondary transition-colors shrink-0">
                  {meta.parent}
                </Link>
                <span className="hidden sm:block text-text-tertiary text-xs shrink-0">/</span>
              </>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-display font-bold text-sm text-text-primary tracking-wide truncate uppercase">
                {meta.title}
              </h2>
            </div>
          </div>

          {/* ── Busca: botão que abre command palette ── */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2.5 pl-3 pr-2 py-1.5 bg-surface-low border border-border-soft hover:border-border text-text-tertiary transition-colors text-xs min-w-[140px] lg:min-w-[200px]"
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 bg-surface border border-border-soft text-[9px] font-mono text-text-tertiary">
              ⌘K
            </kbd>
          </button>

          {/* Busca mobile */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="sm:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Buscar"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>

          {/* ── Data e hora (xl+) ── */}
          <div className="hidden xl:flex flex-col items-end leading-none px-3 border-l border-border-soft">
            <span className="text-xs font-bold text-text-primary tabular-nums">{timeStr}</span>
            <span className="text-[10px] text-text-tertiary capitalize mt-0.5">{dateStr}</span>
          </div>

          {/* ── CTA: Iniciar Sessão ── */}
          <Link
            to="/dashboard/sessao"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-dark text-neon text-xs font-display font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>mic</span>
            <span className="hidden md:block">Sessão</span>
          </Link>

          {/* ── Notificações ── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
              className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Notificações"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {!notifRead && (
                <span className="absolute top-1.5 right-1.5 flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-danger border border-surface" />
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border-soft shadow-[var(--shadow-dark)] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
                  <p className="font-display font-bold text-sm text-text-primary">Notificações</p>
                  <div className="flex items-center gap-3">
                    {!notifRead && <span className="badge badge-brand">{unreadCount}</span>}
                    <button
                      onClick={() => setNotifRead(true)}
                      className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      Marcar lidas
                    </button>
                  </div>
                </div>

                <ul>
                  {NOTIFICATIONS.length === 0 ? (
                    <li className="px-4 py-8 text-center">
                      <span className="material-symbols-outlined text-2xl text-text-tertiary">notifications_off</span>
                      <p className="text-sm text-text-secondary mt-1">Sem notificações</p>
                    </li>
                  ) : (
                    NOTIFICATIONS.map((n, i) => (
                    <li key={i} className={`border-b border-border-soft last:border-0 ${n.unread && !notifRead ? 'bg-surface' : 'bg-canvas'}`}>
                      <button className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-low transition-colors text-left">
                        {n.unread && !notifRead && <div className="w-1.5 h-1.5 bg-info rounded-full mt-1.5 shrink-0" />}
                        <span
                          className={`material-symbols-outlined text-base p-1.5 shrink-0 ${n.surface} ${n.color} ${(n.unread && !notifRead) ? '' : 'ml-4'}`}
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          {n.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary font-medium leading-snug">{n.msg}</p>
                          <p className="text-xs text-text-tertiary mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    </li>
                  ))
                  )}
                </ul>

                <div className="px-4 py-3 border-t border-border-soft">
                  <button className="link-brand text-xs uppercase tracking-widest w-full text-center">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divisor */}
          <div className="w-px h-5 bg-border-soft" />

          {/* ── Perfil ── */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
              className="flex items-center gap-2 py-1 pl-1 pr-2 hover:bg-surface-low transition-colors"
            >
              <div className="avatar w-7 h-7 text-xs">{initial}</div>
              <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
                <span className="text-xs font-semibold text-text-primary">{firstName}</span>
                <span className="text-[10px] text-text-tertiary">Fonoaudióloga</span>
              </div>
              <span className="material-symbols-outlined text-text-tertiary hidden lg:block" style={{ fontSize: '16px' }}>
                expand_more
              </span>
            </button>

            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border-soft shadow-[var(--shadow-dark)] overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border-soft">
                  <div className="flex items-center gap-3">
                    <div className="avatar w-9 h-9 text-sm">{initial}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-display font-bold text-text-primary truncate">{name}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">Fonoaudióloga(o)</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  {[
                    { icon: 'person',       label: 'Meu Perfil',    to: '/dashboard/perfil',        desc: 'Editar informações' },
                    { icon: 'settings',     label: 'Configurações', to: '/dashboard/configuracoes', desc: 'Ajustes do sistema' },
                    { icon: 'help_outline', label: 'Ajuda',         to: '/dashboard',               desc: 'Suporte e tutoriais' },
                  ].map(({ icon, label, to, desc }) => (
                    <button
                      key={label}
                      onClick={() => { setProfileOpen(false); navigate({ to }) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-low transition-colors text-left group"
                    >
                      <span className="material-symbols-outlined text-base text-text-secondary group-hover:text-text-primary transition-colors">{icon}</span>
                      <div>
                        <p className="text-sm text-text-primary">{label}</p>
                        <p className="text-[10px] text-text-tertiary">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-border-soft py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-danger-surface transition-colors text-sm text-danger text-left"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
