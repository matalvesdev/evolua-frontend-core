import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useWeekAppointments } from '@/hooks/use-dashboard'

const DAY_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const

const TYPE_LABELS: Record<string, string> = {
  evaluation:     'Avaliação',
  session:        'Sessão',
  follow_up:      'Retorno',
  reevaluation:   'Reavaliação',
  parent_meeting: 'Reunião',
  regular:        'Terapia',
}

const MODALITY_ICON: Record<string, string> = {
  teleconsult: 'videocam',
  presential:  'location_on',
}

const STATUS_BAR: Record<string, string> = {
  completed:  'bg-success',
  cancelled:  'bg-danger',
  confirmed:  'bg-info',
  scheduled:  'bg-warning',
}

function getWeekStart(d: Date) {
  const r = new Date(d)
  r.setDate(r.getDate() - r.getDay())
  r.setHours(0, 0, 0, 0)
  return r
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function WeeklyCalendar() {
  const today = useMemo(() => new Date(), [])
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today))
  const [selectedDay, setSelectedDay] = useState(today)

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    }),
    [weekStart],
  )

  const monthLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const [first, last] = [weekDays[0], weekDays[6]]
    return first.getMonth() === last.getMonth()
      ? fmt(first)
      : `${fmt(first)} – ${fmt(last)}`
  }, [weekDays])

  const { data: appointments = [] } = useWeekAppointments()

  const dayAppointments = useMemo(() =>
    appointments
      .filter((a) => sameDay(new Date(a.dateTime), selectedDay))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [appointments, selectedDay],
  )

  const hasEvent = (d: Date) =>
    appointments.some((a) => sameDay(new Date(a.dateTime), d))

  const shift = (delta: number) => {
    setWeekStart((p) => {
      const n = new Date(p)
      n.setDate(n.getDate() + delta * 7)
      return n
    })
  }

  return (
    <div className="glass card flex flex-col gap-5 h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-lg p-1.5 rounded-lg bg-info-surface text-info"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            calendar_month
          </span>
          <h3 className="font-display font-bold text-text-primary">Minha Agenda</h3>
        </div>

        {/* Navegação de semana */}
        <div className="flex items-center gap-0.5 glass-light border border-border rounded-full px-2 py-1">
          <button onClick={() => shift(-1)} className="btn-ghost p-0.5 rounded-full">
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <span className="text-xs font-semibold text-text-secondary capitalize px-1">
            {monthLabel}
          </span>
          <button onClick={() => shift(1)} className="btn-ghost p-0.5 rounded-full">
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </div>

      {/* ── Tira da semana ── */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => {
          const isToday    = sameDay(d, today)
          const isSelected = sameDay(d, selectedDay)
          const isWeekend  = d.getDay() === 0 || d.getDay() === 6
          const hasDot     = hasEvent(d)

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(d)}
              className={`flex flex-col items-center gap-1.5 py-2.5 transition-all ${
                isToday
                  ? 'bg-dark text-neon shadow-[var(--shadow-dark)]'
                  : isSelected
                  ? 'bg-neon-surface text-olive border border-border-neon'
                  : isWeekend
                  ? 'opacity-40 hover:opacity-70 hover:bg-surface-overlay'
                  : 'hover:bg-surface-overlay text-text-secondary'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase ${
                isToday ? 'text-neon/60' : 'text-text-tertiary'
              }`}>
                {isToday ? 'HOJE' : DAY_LABELS[d.getDay()]}
              </span>
              <span className={`text-base font-bold ${
                isToday ? 'text-neon' : isSelected ? 'text-olive' : 'text-text-primary'
              }`}>
                {d.getDate()}
              </span>
              {hasDot && (
                <span className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-neon' : 'bg-olive'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Sessões do dia ── */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar min-h-0">
        {dayAppointments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-text-tertiary py-6">
            <span className="material-symbols-outlined text-3xl">event_available</span>
            <p className="text-sm">
              Nenhuma sessão {sameDay(selectedDay, today) ? 'hoje' : 'neste dia'}
            </p>
            <Link to="/dashboard/agenda" className="link-brand text-xs uppercase tracking-wider">
              Agendar sessão
            </Link>
          </div>
        ) : (
          dayAppointments.map((appt) => {
            const time = new Date(appt.dateTime).toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit',
            })
            const icon   = MODALITY_ICON[appt.modality ?? 'presential'] ?? 'location_on'
            const barClr = STATUS_BAR[appt.status] ?? 'bg-border-soft'

            return (
              <Link
                key={appt.id}
                to="/dashboard/agenda"
                className="flex items-center gap-3 p-3.5 bg-surface-overlay rounded-xl border border-border hover:bg-surface hover:shadow-[var(--shadow-card)] transition-all group"
              >
                <div className={`w-1 h-10 rounded-full shrink-0 ${barClr}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {appt.patientName}
                  </p>
                  <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs">{icon}</span>
                    {TYPE_LABELS[appt.type] ?? 'Sessão'} · {time}
                  </p>
                </div>
                <span className="material-symbols-outlined text-border group-hover:text-olive transition-colors text-lg">
                  chevron_right
                </span>
              </Link>
            )
          })
        )}
      </div>

      <Link
        to="/dashboard/agenda"
        className="link-brand text-center text-xs uppercase tracking-widest"
      >
        Ver agenda completa
      </Link>
    </div>
  )
}
