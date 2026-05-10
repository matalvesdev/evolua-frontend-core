import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  useTodayAppointments,
  useWeekAppointments,
  useActivePatients,
  usePendingReports,
  usePendingTasks,
} from '@/hooks/use-dashboard'

interface Reminder {
  id:       string
  icon:     string
  iconCls:  string
  title:    string
  urgency:  'high' | 'medium' | 'low'
  action:   string
  actionTo: string
}

const URGENCY_LEFT: Record<Reminder['urgency'], string> = {
  high:   'bg-danger',
  medium: 'bg-warning',
  low:    'bg-success',
}

const URGENCY_LABEL: Record<Reminder['urgency'], string> = {
  high:   'Urgente',
  medium: 'Atenção',
  low:    'Info',
}

const URGENCY_LABEL_CLS: Record<Reminder['urgency'], string> = {
  high:   'text-danger',
  medium: 'text-warning',
  low:    'text-success',
}

export function SmartReminders() {
  const { data: todayAppts    = [] } = useTodayAppointments()
  const { data: weekAppts     = [] } = useWeekAppointments()
  const { data: patients      = [] } = useActivePatients()
  const { data: pendingReports = [] } = usePendingReports()
  const { data: pendingTasks  = [] } = usePendingTasks()

  const reminders = useMemo<Reminder[]>(() => {
    const now   = new Date()
    const items: Reminder[] = []

    // 1. Sessão em até 60 min — urgência máxima
    const upcoming = todayAppts.find(a => {
      const diff = (new Date(a.dateTime).getTime() - now.getTime()) / 60_000
      return diff > 0 && diff <= 60 && (a.status === 'scheduled' || a.status === 'confirmed')
    })
    if (upcoming) {
      const mins = Math.round((new Date(upcoming.dateTime).getTime() - now.getTime()) / 60_000)
      items.push({
        id:       'upcoming',
        icon:     'notifications_active',
        iconCls:  'bg-danger-surface text-danger',
        title:    `${upcoming.patientName.split(' ')[0]} em ${mins} min`,
        urgency:  'high',
        action:   'Iniciar',
        actionTo: '/dashboard/sessao',
      })
    }

    // 2. Relatórios IA pendentes
    if (pendingReports.length > 0) {
      items.push({
        id:       'reports',
        icon:     'rate_review',
        iconCls:  'bg-warning-surface text-warning',
        title:    `${pendingReports.length} relatório${pendingReports.length > 1 ? 's' : ''} p/ revisar`,
        urgency:  'high',
        action:   'Revisar',
        actionTo: '/dashboard/relatorios',
      })
    }

    // 3. Pacientes sem sessão esta semana
    const withAppt       = new Set(weekAppts.map(a => a.patientId))
    const withoutSession = patients.filter(p => !withAppt.has(p.id))
    if (withoutSession.length > 0) {
      items.push({
        id:       'no-session',
        icon:     'person_alert',
        iconCls:  'bg-warning-surface text-warning',
        title:    `${withoutSession.length} paciente${withoutSession.length > 1 ? 's' : ''} sem sessão`,
        urgency:  'medium',
        action:   'Agendar',
        actionTo: '/dashboard/agenda',
      })
    }

    // 4. Fim do dia — registrar evoluções
    const hour           = now.getHours()
    const completedToday = todayAppts.filter(a => a.status === 'completed')
    if (hour >= 17 && completedToday.length > 0) {
      items.push({
        id:       'eoday',
        icon:     'edit_note',
        iconCls:  'bg-neon-surface text-olive',
        title:    `${completedToday.length} evolução${completedToday.length > 1 ? 'ões' : ''} p/ registrar`,
        urgency:  'medium',
        action:   'Registrar',
        actionTo: '/dashboard/relatorios',
      })
    }

    // 5. Tarefas vencidas
    const overdue = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < now)
    if (overdue.length > 0) {
      items.push({
        id:       'overdue',
        icon:     'alarm',
        iconCls:  'bg-danger-surface text-danger',
        title:    `${overdue.length} tarefa${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}`,
        urgency:  'high',
        action:   'Resolver',
        actionTo: '/dashboard/tarefas',
      })
    }

    // Usa mock quando backend não retornar nada
    return items.slice(0, 5)
  }, [todayAppts, weekAppts, patients, pendingReports, pendingTasks])

  const highCount = reminders.filter(r => r.urgency === 'high').length

  return (
    <div className="card p-0 overflow-hidden flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-soft">
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-8 h-8 rounded-md ${highCount > 0 ? 'bg-danger-surface' : 'bg-success-surface'}`}>
            <span
              className={`material-symbols-outlined text-base ${highCount > 0 ? 'text-danger' : 'text-success'}`}
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {highCount > 0 ? 'notifications_active' : 'notifications'}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide leading-none">
              Lembretes
            </h3>
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {highCount > 0 ? `${highCount} urgente${highCount > 1 ? 's' : ''}` : 'Tudo em dia'}
            </p>
          </div>
        </div>
        {highCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold">
            {highCount}
          </span>
        )}
      </div>

      {/* ── Lista de alertas ── */}
      <ul className="flex flex-col divide-y divide-border-soft flex-1 overflow-y-auto no-scrollbar">
        {reminders.map(r => (
          <li key={r.id}>
            <Link
              to={r.actionTo}
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-low transition-colors group"
            >
              {/* Barra lateral de urgência */}
              <div className={`w-[3px] self-stretch rounded-full flex-shrink-0 ${URGENCY_LEFT[r.urgency]}`} />

              {/* Ícone */}
              <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md ${r.iconCls}`}>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {r.icon}
                </span>
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary leading-snug truncate">
                  {r.title}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${URGENCY_LABEL_CLS[r.urgency]}`}>
                  {URGENCY_LABEL[r.urgency]}
                </p>
              </div>

              {/* CTA inline */}
              <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-text-tertiary group-hover:text-olive transition-colors">
                {r.action} →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Footer ── */}
      <div className="px-5 py-2.5 border-t border-border-soft bg-surface-low">
        <p className="text-[10px] text-text-tertiary">Atualizado em tempo real</p>
      </div>
    </div>
  )
}
