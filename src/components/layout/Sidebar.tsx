import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'

// ── Grupos de navegação ───────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard',            icon: 'space_dashboard', label: 'Dashboard'       },
      { to: '/dashboard/pacientes',  icon: 'groups',          label: 'Pacientes'       },
      { to: '/dashboard/agenda',     icon: 'calendar_month',  label: 'Agenda'          },
    ]
  },
  {
    label: 'Clínico',
    items: [
      { to: '/dashboard/sessao',             icon: 'mic',              label: 'Sessão ao Vivo'     },
      { to: '/dashboard/prontuario',         icon: 'clinical_notes',   label: 'Prontuário'         },
      { to: '/dashboard/plano-terapeutico',  icon: 'target',           label: 'Plano Terapêutico'  },
      { to: '/dashboard/linha-do-tempo',     icon: 'timeline',         label: 'Linha do Tempo'     },
      { to: '/dashboard/teleconsulta',       icon: 'video_call',       label: 'Teleconsulta'       },
      { to: '/dashboard/exercicios',         icon: 'fitness_center',   label: 'Exercícios'         },
      { to: '/dashboard/laudos',             icon: 'verified',         label: 'Laudos'             },
      { to: '/dashboard/encaminhamentos',    icon: 'send',             label: 'Encaminhamentos'    },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { to: '/dashboard/financeiro',  icon: 'payments',         label: 'Financeiro'      },
      { to: '/dashboard/relatorios',  icon: 'description',      label: 'Relatórios'      },
      { to: '/dashboard/analytics',   icon: 'bar_chart',        label: 'Analytics'       },
      { to: '/dashboard/whatsapp',    icon: 'chat',             label: 'WhatsApp'        },
      { to: '/dashboard/tarefas',     icon: 'task_alt',         label: 'Tarefas'         },
    ]
  },
  {
    label: 'Recursos',
    items: [
      { to: '/dashboard/caa',         icon: 'grid_view',        label: 'CAA'             },
      { to: '/dashboard/materiais',   icon: 'article',          label: 'Materiais'       },
      { to: '/dashboard/biblioteca',  icon: 'local_library',    label: 'Biblioteca'      },
      { to: '/dashboard/marketing',   icon: 'campaign',         label: 'Marketing'       },
    ]
  },
]

const NAV_BOTTOM = [
  { to: '/dashboard/configuracoes', icon: 'settings', label: 'Configurações' },
  { to: '/dashboard/perfil',        icon: 'person',   label: 'Meu Perfil'   },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { location } = useRouterState()
  const path = location.pathname

  const isActive = (to: string) =>
    to === '/dashboard' ? path === '/dashboard' : path.startsWith(to)

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-surface border-r border-border-soft transition-all duration-300 shrink-0 ${
        collapsed ? 'w-[60px]' : 'w-56'
      }`}
    >
      {/* ── Logo ── */}
      <div className={`flex items-center border-b border-border-soft shrink-0 h-[57px] ${collapsed ? 'justify-center px-0' : 'px-4 gap-2.5'}`}>
        <span
          className="material-symbols-outlined text-primary shrink-0"
          style={{ fontSize: '24px', fontVariationSettings: '"FILL" 1, "wght" 600' }}
          aria-label="Evolua"
        >
          graphic_eq
        </span>
        {!collapsed && (
          <span className="font-display font-bold text-sm tracking-[0.12em] text-primary uppercase flex-1 leading-none">
            EVOLUA
          </span>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="btn-ghost p-1 shrink-0" title="Recolher menu">
            <span className="material-symbols-outlined text-base text-text-secondary">chevron_left</span>
          </button>
        )}
      </div>

      {/* Botão expandir collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="btn-ghost p-2 mx-auto mt-2" title="Expandir menu">
          <span className="material-symbols-outlined text-base text-text-secondary">chevron_right</span>
        </button>
      )}

      {/* ── Nav grupos ── */}
      <nav className="flex-1 flex flex-col py-3 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="flex flex-col gap-px mb-3">
            {!collapsed && (
              <p className="section-label px-4 mb-1">{group.label}</p>
            )}
            {group.items.map(({ to, icon, label }) => {
              const active = isActive(to)
              return (
                <Link
                  key={to}
                  to={to}
                  title={collapsed ? label : undefined}
                  className={`relative flex items-center gap-3 transition-all duration-150 group ${
                    collapsed ? 'justify-center px-0 py-3 mx-2' : 'px-4 py-2'
                  } ${
                    active
                      ? 'bg-surface-low text-text-primary'
                      : 'text-text-tertiary hover:bg-surface-low hover:text-text-secondary'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-dark" />
                  )}
                  <span
                    className={`material-symbols-outlined text-lg shrink-0 transition-colors ${
                      active ? 'text-dark' : 'text-text-tertiary group-hover:text-text-secondary'
                    }`}
                    style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
                  >
                    {icon}
                  </span>
                  {!collapsed && (
                    <span className={`text-xs leading-none ${active ? 'font-semibold text-text-primary' : 'font-medium'}`}>
                      {label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Nav bottom ── */}
      <div className="border-t border-border-soft py-3 flex flex-col gap-px">
        {!collapsed && (
          <p className="section-label px-4 mb-1">Conta</p>
        )}
        {NAV_BOTTOM.map(({ to, icon, label }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 transition-all duration-150 group ${
                collapsed ? 'justify-center px-0 py-3 mx-2' : 'px-4 py-2.5'
              } ${
                active
                  ? 'bg-surface-low text-text-primary'
                  : 'text-text-tertiary hover:bg-surface-low hover:text-text-secondary'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-dark" />
              )}
              <span
                className={`material-symbols-outlined text-lg shrink-0 ${
                  active ? 'text-dark' : 'text-text-tertiary group-hover:text-text-secondary'
                }`}
                style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
              >
                {icon}
              </span>
              {!collapsed && (
                <span className={`text-xs leading-none ${active ? 'font-semibold text-text-primary' : 'font-medium'}`}>
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
