import { Link, useRouterState } from '@tanstack/react-router'

const ITEMS = [
  { to: '/dashboard',           icon: 'space_dashboard', label: 'Início'    },
  { to: '/dashboard/pacientes', icon: 'groups',          label: 'Pacientes' },
  { to: '/dashboard/sessao',    icon: 'mic',             label: 'Sessão',   cta: true },
  { to: '/dashboard/agenda',    icon: 'calendar_month',  label: 'Agenda'    },
  { to: '/dashboard/mais',      icon: 'more_horiz',      label: 'Mais'      },
] as const

export function MobileNav() {
  const { location } = useRouterState()
  const path = location.pathname

  const isActive = (to: string) =>
    to === '/dashboard' ? path === '/dashboard' : path.startsWith(to)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-border-soft"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-1">
        {ITEMS.map(({ to, icon, label, ...rest }) => {
          const isCta  = 'cta' in rest && rest.cta
          const active = isActive(to)

          if (isCta) {
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-0.5 px-5 py-3 bg-dark text-neon -mt-3 mb-0.5 shadow-[var(--shadow-dark)] shrink-0"
              >
                <span
                  className="material-symbols-outlined text-xl text-neon"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-neon/80">{label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-3 transition-colors ${
                active ? 'text-dark' : 'text-text-tertiary'
              }`}
            >
              {/* Indicador superior */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-dark" />
              )}
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
              >
                {icon}
              </span>
              <span className={`text-[10px] font-semibold leading-tight ${active ? 'text-dark' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
