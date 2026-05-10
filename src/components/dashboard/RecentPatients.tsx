import { Link } from '@tanstack/react-router'
import { useActivePatients } from '@/hooks/use-dashboard'

const AVATAR_COLORS = [
  'bg-neon-surface text-olive',
  'bg-info-surface text-info',
  'bg-success-surface text-success',
  'bg-warning-surface text-warning',
  'bg-dark text-neon',
  'bg-danger-surface text-danger',
]

interface RichPatient {
  id: string
  name: string
  diagnosis: string
  lastSession: string
  nextSession: string | null
  adherence: number
  sessions: number
  alert: string | null
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// Gráfico de adesão inline
function AdherenceBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-danger'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1 bg-surface-high rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-[10px] font-bold tabular-nums ${
        value >= 80 ? 'text-success' : value >= 60 ? 'text-warning' : 'text-danger'
      }`}>{value}%</span>
    </div>
  )
}

export function RecentPatients() {
  const { data: apiPatients = [] } = useActivePatients()

  const patients: RichPatient[] = apiPatients.slice(0, 6).map(p => ({
    id: String(p.id),
    name: p.name,
    diagnosis: (p as { diagnosis?: string }).diagnosis ?? '—',
    lastSession: '—',
    nextSession: null,
    adherence: 0,
    sessions: 0,
    alert: null,
  }))

  const noReturn = patients.filter(p => p.alert === 'Sem retorno').length

  return (
    <div className="card p-0 overflow-hidden flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-soft">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-neon-surface rounded-md">
            <span
              className="material-symbols-outlined text-olive text-base"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              groups
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide leading-none">
              Pacientes Ativos
            </h3>
            <p className="text-[10px] text-text-tertiary mt-0.5">{patients.length} em acompanhamento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {noReturn > 0 && (
            <span className="badge badge-warning">
              <span className="material-symbols-outlined text-[10px]">warning</span>
              {noReturn} sem retorno
            </span>
          )}
          <Link to="/dashboard/pacientes" className="link-brand text-xs uppercase tracking-wider">
            Ver todos
          </Link>
        </div>
      </div>

      {/* ── Cabeçalho da tabela ── */}
      <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-surface-low border-b border-border-soft">
        <span className="col-span-4 section-label">Paciente</span>
        <span className="col-span-3 section-label hidden md:block">Última sessão</span>
        <span className="col-span-3 section-label hidden lg:block">Adesão</span>
        <span className="col-span-2 section-label hidden md:block text-right">Sessões</span>
      </div>

      {/* ── Lista ── */}
      {patients.length === 0 ? (
        <div className="empty-state border-0">
          <span className="material-symbols-outlined empty-state__icon">groups</span>
          <p className="empty-state__title">Nenhum paciente ativo</p>
          <p className="empty-state__desc">Cadastre seu primeiro paciente para começar.</p>
          <div className="empty-state__actions">
            <Link to="/dashboard/pacientes" className="btn-primary">
              <span className="material-symbols-outlined text-base">person_add</span>
              Cadastrar paciente
            </Link>
          </div>
        </div>
      ) : (
        <ul className="flex-1 flex flex-col divide-y divide-border-soft overflow-y-auto no-scrollbar">
          {patients.map(p => (
            <li key={p.id}>
              <Link
                to="/dashboard/pacientes"
                className="grid grid-cols-12 gap-2 items-center px-5 py-3 hover:bg-surface-low transition-colors group"
              >
                {/* Paciente */}
                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  <div className={`avatar w-8 h-8 text-xs flex-shrink-0 ${avatarColor(p.name)}`}>
                    {initials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate group-hover:text-olive transition-colors leading-tight">
                      {p.name.split(' ')[0]} {p.name.split(' ').slice(-1)[0]}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] text-text-tertiary truncate">{p.diagnosis}</p>
                      {p.alert && (
                        <span className="badge badge-warning text-[8px] py-0">{p.alert}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Última sessão */}
                <div className="col-span-3 hidden md:flex items-center gap-1 min-w-0">
                  <span className="material-symbols-outlined text-[11px] text-text-tertiary">schedule</span>
                  <span className="text-xs text-text-secondary truncate">{p.lastSession}</span>
                </div>

                {/* Adesão */}
                <div className="col-span-3 hidden lg:block">
                  <AdherenceBar value={p.adherence} />
                </div>

                {/* Total sessões */}
                <div className="col-span-2 hidden md:flex justify-end items-center gap-1">
                  <span className="font-display font-bold text-sm text-text-primary tabular-nums">{p.sessions}</span>
                  <span className="text-[10px] text-text-tertiary">sess.</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-border-soft bg-surface-low flex items-center justify-between">
        <p className="text-[10px] text-text-tertiary">Ordenado por última atividade</p>
        <Link to="/dashboard/pacientes" className="link-brand text-[10px] uppercase tracking-wider">
          Cadastrar paciente →
        </Link>
      </div>
    </div>
  )
}
