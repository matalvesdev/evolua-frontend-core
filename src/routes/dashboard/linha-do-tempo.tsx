import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/linha-do-tempo')({
  component: LinhaDoTempoPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType =
  | 'avaliacao'
  | 'sessao'
  | 'alta'
  | 'marco'
  | 'laudo'
  | 'falta'
  | 'encaminhamento'

interface TimelineEvent {
  id: string
  date: string
  type: EventType
  title: string
  description: string
  score?: number       // para sessões: 1–5
  area?: string
  tag?: string         // destaque manual (ex: "Critério atingido!")
}

interface Patient {
  id: string
  name: string
  age: number
  diagnosis: string
  startDate: string    // início do acompanhamento
  sessionCount: number
  avatar: string
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const INITIAL_PATIENTS: Patient[] = []

const INITIAL_EVENTS: Record<string, TimelineEvent[]> = {}

// ── Config ────────────────────────────────────────────────────────────────────

const EVENT_CFG: Record<EventType, { label: string; color: string; dot: string; icon: string }> = {
  avaliacao:       { label: 'Avaliação',        color: 'border-info    bg-info/10',    dot: 'bg-info',              icon: 'assignment'        },
  sessao:          { label: 'Sessão',           color: 'border-border  bg-surface',    dot: 'bg-olive',             icon: 'mic'               },
  alta:            { label: 'Alta',             color: 'border-success bg-success/10', dot: 'bg-success',           icon: 'verified'          },
  marco:           { label: 'Marco clínico',    color: 'border-neon    bg-neon/10',    dot: 'bg-neon border border-olive', icon: 'star'       },
  laudo:           { label: 'Laudo/Relatório',  color: 'border-warning bg-warning/10', dot: 'bg-warning',           icon: 'description'       },
  falta:           { label: 'Falta',            color: 'border-danger  bg-danger/10',  dot: 'bg-danger',            icon: 'event_busy'        },
  encaminhamento:  { label: 'Encaminhamento',   color: 'border-text-tertiary bg-surface-low', dot: 'bg-text-tertiary', icon: 'send'          },
}

const SCORE_COLORS: Record<number, string> = {
  1: 'bg-danger/20 text-danger',
  2: 'bg-warning/20 text-warning',
  3: 'bg-info/20 text-info',
  4: 'bg-olive/20 text-olive',
  5: 'bg-success/20 text-success',
}
const SCORE_LABELS: Record<number, string> = {
  1: 'Iniciando', 2: 'Desenvolvendo', 3: 'Consistente', 4: 'Quase lá', 5: 'Atingido',
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function fmtShort(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function monthsBetween(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30))
}

// ── Componente de evento na linha do tempo ────────────────────────────────────

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const [expanded, setExpanded] = useState(event.type === 'marco' || event.type === 'avaliacao')
  const cfg = EVENT_CFG[event.type]

  return (
    <div className="flex gap-3 group">
      {/* Coluna do trilho */}
      <div className="flex flex-col items-center shrink-0 w-6">
        <div className={`w-3 h-3 rounded-full border-2 border-surface mt-1 shrink-0 ${cfg.dot}`} />
        {!isLast && <div className="flex-1 w-px bg-border-soft mt-1" />}
      </div>

      {/* Card do evento */}
      <div className={`flex-1 mb-4 border rounded overflow-hidden transition-shadow hover:shadow-sm ${cfg.color}`}>
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full text-left p-3 flex items-start gap-3"
        >
          <span
            className="material-symbols-outlined text-sm mt-0.5 shrink-0 text-text-secondary"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {cfg.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
                {fmtShort(event.date)}
              </span>
              {event.area && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-olive bg-neon/10 px-1.5 py-0.5 rounded">
                  {event.area}
                </span>
              )}
              {event.score && (
                <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${SCORE_COLORS[event.score]}`}>
                  {SCORE_LABELS[event.score]}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-text-primary mt-0.5 leading-snug">{event.title}</p>
            {event.tag && (
              <p className="text-[11px] font-bold text-olive mt-0.5">{event.tag}</p>
            )}
          </div>
          <span className="material-symbols-outlined text-xs text-text-tertiary shrink-0 mt-0.5">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {expanded && (
          <div className="px-3 pb-3 pt-0 border-t border-current border-opacity-10">
            <p className="text-xs text-text-secondary leading-relaxed mt-2">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function LinhaDoTempoPage() {
  const [selectedPatient, setSelectedPatient] = useState<string>(INITIAL_PATIENTS[0]?.id ?? '')
  const [filterType, setFilterType] = useState<string>('all')

  const patient = INITIAL_PATIENTS.find(p => p.id === selectedPatient)
  const allEvents = INITIAL_EVENTS[selectedPatient] ?? []

  const filtered = filterType === 'all'
    ? allEvents
    : allEvents.filter(e => e.type === filterType)

  // Agrupar por mês
  const grouped: Record<string, TimelineEvent[]> = {}
  for (const ev of filtered) {
    const key = ev.date.slice(0, 7) // YYYY-MM
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(ev)
  }

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a)) // mais recente primeiro

  function monthLabel(ym: string) {
    const [y, m] = ym.split('-')
    const d = new Date(Number(y), Number(m) - 1, 1)
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const sessionEvts   = allEvents.filter(e => e.type === 'sessao')
  const marcoEvts     = allEvents.filter(e => e.type === 'marco')
  const mesesAcomp    = patient ? monthsBetween(patient.startDate, new Date().toISOString().split('T')[0]) : 0

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">
          Linha do Tempo Clínica
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Histórico completo do acompanhamento — sessões, marcos, laudos e encaminhamentos
        </p>
      </div>

      {/* Seletor de paciente */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="section-label block mb-1.5">Paciente</label>
          <select
            value={selectedPatient}
            onChange={e => { setSelectedPatient(e.target.value); setFilterType('all') }}
            className="input w-full"
          >
            {INITIAL_PATIENTS.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.diagnosis}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="section-label block mb-1.5">Filtrar por tipo</label>
          <div className="flex rounded border border-border-soft overflow-hidden">
            {([
              ['all', 'Todos'],
              ['avaliacao', 'Avaliações'],
              ['sessao', 'Sessões'],
              ['marco', 'Marcos'],
              ['laudo', 'Laudos'],
              ['falta', 'Faltas'],
            ] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFilterType(v)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors border-r border-border-soft last:border-r-0 ${
                  filterType === v ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card do paciente */}
      {patient && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-lg bg-neon-surface flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-lg text-olive">{patient.avatar}</span>
          </div>
          {/* Info */}
          <div className="flex-1">
            <p className="font-display font-bold text-base text-text-primary">{patient.name}</p>
            <p className="text-xs text-text-tertiary">{patient.age} anos · {patient.diagnosis}</p>
            <p className="text-xs text-text-tertiary">Em acompanhamento desde {fmtDate(patient.startDate)}</p>
          </div>
          {/* Stats */}
          <div className="flex gap-6 sm:gap-8">
            {[
              { label: 'Meses', value: mesesAcomp },
              { label: 'Sessões', value: patient.sessionCount },
              { label: 'Marcos', value: marcoEvts.length },
              { label: 'Score atual', value: sessionEvts.length > 0 && sessionEvts[sessionEvts.length-1].score != null ? `${sessionEvts[sessionEvts.length-1].score}/5` : '—' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="font-display font-bold text-xl text-text-primary">{s.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline por mês */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">timeline</span>
          </div>
          <p className="empty-state__title">Nenhum evento neste filtro</p>
          <p className="empty-state__desc">Ajuste os filtros ou aguarde novas sessões para visualizar a evolução do paciente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {months.map(month => (
            <div key={month} className="flex flex-col gap-0">
              {/* Cabeçalho do mês */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-border-soft" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary whitespace-nowrap">
                  {monthLabel(month)}
                </span>
                <div className="h-px flex-1 bg-border-soft" />
              </div>
              {/* Eventos do mês (mais recente primeiro) */}
              <div>
                {[...grouped[month]].sort((a, b) => b.date.localeCompare(a.date)).map((ev, i, arr) => (
                  <TimelineItem key={ev.id} event={ev} isLast={i === arr.length - 1 && month === months[months.length - 1]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legenda */}
      <div className="card p-4 flex flex-col gap-2">
        <p className="section-label">Legenda</p>
        <div className="flex flex-wrap gap-4">
          {(Object.entries(EVENT_CFG) as [EventType, typeof EVENT_CFG[EventType]][]).map(([, cfg]) => (
            <div key={cfg.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-text-secondary">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
