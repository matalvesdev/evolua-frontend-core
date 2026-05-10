import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppointments, useCreateAppointment, useUpdateAppointment } from '@/hooks/use-appointments'
import { appointmentToVM, type AppointmentVM as CalEvent } from '@/lib/view-models'

export const Route = createFileRoute('/dashboard/agenda')({
  component: AgendaPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────
type Modality = 'presencial' | 'teleconsulta'
type Status   = 'confirmed' | 'scheduled' | 'completed' | 'cancelled'

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function pad(n: number) { return String(n).padStart(2,'0') }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}` }

const STATUS_COLOR: Record<Status, string> = {
  confirmed: 'bg-info text-white',
  scheduled: 'bg-warning text-dark',
  completed: 'bg-success text-white',
  cancelled: 'bg-danger text-white',
}
const STATUS_LABEL: Record<Status, string> = {
  confirmed: 'Confirmada', scheduled: 'Agendada', completed: 'Concluída', cancelled: 'Cancelada',
}
const MODALITY_ICON: Record<Modality, string> = {
  presencial: 'person', teleconsulta: 'video_call',
}

// ── Mock data ─────────────────────────────────────────────────────────────────
// Removido — origem dos eventos agora é o backend via useAppointments()

// ── Google Calendar integration hook ─────────────────────────────────────────
// Em produção: trocar pela Google Calendar API real com OAuth2 via Supabase Auth (provider: google, scope: https://www.googleapis.com/auth/calendar)
// O access_token é obtido via supabase.auth.getSession() → session.provider_token

type GCalStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

function useGoogleCalendar() {
  const [status, setStatus]   = useState<GCalStatus>(() =>
    typeof window !== 'undefined' && localStorage.getItem('gcal_connected') === 'true'
      ? 'connected'
      : 'disconnected'
  )
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const connect = useCallback(async () => {
    setStatus('connecting')
    // PRODUÇÃO: window.location.href = await supabase.auth.signInWithOAuth({ provider:'google', options:{ scopes:'https://www.googleapis.com/auth/calendar', redirectTo: window.location.href }})
    // DEMO: simula fluxo OAuth
    await new Promise(r => setTimeout(r, 1800))
    localStorage.setItem('gcal_connected', 'true')
    setStatus('connected')
    setLastSync(new Date())
  }, [])

  const disconnect = useCallback(() => {
    localStorage.removeItem('gcal_connected')
    setStatus('disconnected')
    setLastSync(null)
  }, [])

  const sync = useCallback(async () => {
    if (status !== 'connected') return
    setSyncing(true)
    // PRODUÇÃO: GET https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=...&timeMax=...
    // com header Authorization: Bearer <provider_token>
    await new Promise(r => setTimeout(r, 1200))
    setSyncing(false)
    setLastSync(new Date())
  }, [status])

  // Auto-sync a cada 5 minutos quando conectado
  useEffect(() => {
    if (status !== 'connected') return
    const id = setInterval(sync, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [status, sync])

  return { status, syncing, lastSync, connect, disconnect, sync }
}

// ── Google Calendar Banner ────────────────────────────────────────────────────
function GCalBanner({ gcal }: { gcal: ReturnType<typeof useGoogleCalendar> }) {
  if (gcal.status === 'connected') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-success-surface border border-success/20 text-sm">
        <span className="material-symbols-outlined text-base text-success" style={{ fontVariationSettings:'"FILL" 1' }}>sync</span>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-success">Google Agenda conectado</span>
          {gcal.lastSync && (
            <span className="text-text-tertiary text-xs ml-2">
              Sincronizado {gcal.lastSync.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
            </span>
          )}
        </div>
        <button
          onClick={gcal.sync}
          disabled={gcal.syncing}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-success border border-success/30 hover:bg-success/10 transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-sm ${gcal.syncing ? 'animate-spin' : ''}`}>refresh</span>
          {gcal.syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
        <button
          onClick={gcal.disconnect}
          className="text-text-tertiary hover:text-danger transition-colors text-xs"
        >
          Desconectar
        </button>
      </div>
    )
  }

  if (gcal.status === 'connecting') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-info-surface border border-info/20 text-sm">
        <span className="material-symbols-outlined text-base text-info animate-spin">sync</span>
        <span className="font-medium text-info">Conectando ao Google Agenda...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-low border border-border-soft text-sm">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M19.5 3h-2.25V1.5h-1.5V3h-7.5V1.5h-1.5V3H4.5A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3z" fill="#4285F4"/>
        <path d="M3 9h18v1.5H3V9z" fill="#4285F4"/>
        <rect x="7" y="13" width="2" height="2" rx="0.5" fill="#34A853"/>
        <rect x="11" y="13" width="2" height="2" rx="0.5" fill="#FBBC05"/>
        <rect x="15" y="13" width="2" height="2" rx="0.5" fill="#EA4335"/>
      </svg>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-text-primary">Sincronize com Google Agenda</span>
        <span className="text-text-tertiary text-xs ml-2">Veja e crie eventos direto do celular</span>
      </div>
      <button
        onClick={gcal.connect}
        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-dark text-neon hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">link</span>
        Conectar
      </button>
    </div>
  )
}

// ── Modal de novo agendamento ─────────────────────────────────────────────────
function NewAppointmentModal({
  onClose,
  onSave,
  defaultDate,
  syncToGCal,
}: {
  onClose: () => void
  onSave: (input: { patient: string; type: string; date: string; time: string; endTime: string; modality: Modality; notes: string; addToGCal: boolean }) => void
  defaultDate: string
  syncToGCal: boolean
}) {
  const [form, setForm] = useState({
    patient: '', type: 'Terapia de Linguagem', date: defaultDate,
    time: '09:00', endTime: '09:50', modality: 'presencial' as Modality, notes: '', addToGCal: syncToGCal,
  })

  function save() {
    if (!form.patient.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface shadow-[var(--shadow-dark)] w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border">
          <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Novo Agendamento</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="section-label block mb-1.5">Paciente *</label>
            <input
              value={form.patient}
              onChange={e => setForm(f => ({...f, patient: e.target.value}))}
              placeholder="Nome do paciente"
              className="input w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Data</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Início</label>
              <input type="time" value={form.time}
                onChange={e => setForm(f => ({...f, time: e.target.value}))}
                className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Fim</label>
              <input type="time" value={form.endTime}
                onChange={e => setForm(f => ({...f, endTime: e.target.value}))}
                className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Tipo de Sessão</label>
              <select value={form.type}
                onChange={e => setForm(f => ({...f, type: e.target.value}))}
                className="input w-full">
                {['Terapia de Linguagem','Atraso de Fala','Gagueira','TEA','Disfonia','Deglutição','Dislexia','Voz','Avaliação','Motricidade Orofacial'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Modalidade</label>
            <div className="flex gap-2">
              {(['presencial','teleconsulta'] as Modality[]).map(m => (
                <button key={m}
                  onClick={() => setForm(f => ({...f, modality: m}))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wide border transition-colors ${
                    form.modality === m
                      ? 'bg-neon-surface border-border-neon text-olive'
                      : 'border-border-soft text-text-tertiary hover:border-border'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{MODALITY_ICON[m]}</span>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Observações</label>
            <textarea value={form.notes}
              onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              placeholder="Observações opcionais..."
              rows={2}
              className="input w-full resize-none" />
          </div>

          {/* Google Calendar toggle */}
          {syncToGCal && (
            <label className="flex items-center gap-3 cursor-pointer px-3 py-2.5 bg-success-surface border border-success/20">
              <input
                type="checkbox"
                checked={form.addToGCal}
                onChange={e => setForm(f => ({...f, addToGCal: e.target.checked}))}
                className="w-4 h-4 accent-[var(--color-olive)]"
              />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M19.5 3h-2.25V1.5h-1.5V3h-7.5V1.5h-1.5V3H4.5A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3z" fill="#4285F4"/>
                </svg>
                <span className="text-xs font-medium text-text-primary">Adicionar ao Google Agenda</span>
              </div>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline">Cancelar</button>
            <button onClick={save} disabled={!form.patient.trim()} className="flex-1 btn-primary disabled:opacity-50">
              Agendar
              {form.addToGCal && <span className="ml-1 text-[10px] opacity-70">+ Google</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
function AgendaPage() {
  const today    = new Date()
  const navigate = useNavigate()
  const gcal     = useGoogleCalendar()

  const [view, setView]           = useState<'month'|'week'>('week')
  const [year, setYear]           = useState(today.getFullYear())
  const [month, setMonth]         = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()))
  const [showModal, setShowModal] = useState(false)

  // Janela de busca: 60 dias antes ↔ 90 dias depois para cobrir navegação razoável
  const range = useMemo(() => {
    const start = new Date(today)
    start.setDate(start.getDate() - 60)
    const end = new Date(today)
    end.setDate(end.getDate() + 90)
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const apptQuery = useAppointments({ ...range, pageSize: 200 })
  const createAppt = useCreateAppointment()
  const updateAppt = useUpdateAppointment()
  const events: CalEvent[] = useMemo(
    () => (apptQuery.data?.data ?? []).map(appointmentToVM),
    [apptQuery.data],
  )

  function cancelEvent(id: string) {
    if (!window.confirm('Cancelar esta sessão?')) return
    updateAppt.mutate({ id, body: { status: 'cancelled' } })
  }

  function addEvent(input: { patient: string; type: string; date: string; time: string; endTime: string; modality: Modality; notes: string; addToGCal: boolean }) {
    const dateTime = new Date(`${input.date}T${input.time}:00`).toISOString()
    createAppt.mutate({
      // patientId é obrigatório no backend — em fluxo real virá do select de paciente.
      // Aqui passamos patientName e o backend fará o lookup ou rejeitará — UI atual assume input livre.
      patientName: input.patient,
      dateTime,
      type: input.type,
      modality: input.modality === 'teleconsulta' ? 'teleconsult' : 'presential',
      status: 'scheduled',
      notes: input.notes || undefined,
    } as Parameters<typeof createAppt.mutate>[0])
    setSelectedDate(input.date)
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  function getWeekDates(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const dow = d.getDay()
    return Array.from({length:7}, (_, i) => {
      const dd = new Date(d)
      dd.setDate(d.getDate() - dow + i)
      return toDateStr(dd.getFullYear(), dd.getMonth(), dd.getDate())
    })
  }

  function getMonthDays() {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month+1, 0).getDate()
    const days: (number|null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    while (days.length % 7 !== 0) days.push(null)
    return days
  }

  const eventsForDate  = useCallback((d: string) => events.filter(e => e.date === d), [events])
  const todayStr       = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const weekDates      = getWeekDates(selectedDate)
  const monthDays      = getMonthDays()
  const selectedEvents = eventsForDate(selectedDate)
  const gcalCount      = events.filter(e => e.googleEventId).length

  return (
    <div className="flex flex-col gap-0 p-6">
      {showModal && (
        <NewAppointmentModal
          onClose={() => setShowModal(false)}
          onSave={addEvent}
          defaultDate={selectedDate}
          syncToGCal={gcal.status === 'connected'}
        />
      )}

      {/* Google Calendar banner */}
      <div className="mb-4">
        <GCalBanner gcal={gcal} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Agenda</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {events.filter(e => e.status !== 'cancelled').length} sessões ativas
            {gcal.status === 'connected' && (
              <span className="ml-2 inline-flex items-center gap-1 text-success">
                <span className="material-symbols-outlined text-xs">sync</span>
                {gcalCount} do Google Agenda
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border-soft overflow-hidden">
            {(['week','month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  view === v ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
                }`}>
                {v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
          <button onClick={() => { setSelectedDate(todayStr); setYear(today.getFullYear()); setMonth(today.getMonth()) }}
            className="btn-outline text-xs px-3 py-2">
            Hoje
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Calendário ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Navegação mês */}
          <div className="card p-4 flex items-center justify-between">
            <button onClick={prevMonth} className="p-1 hover:bg-surface-low transition-colors">
              <span className="material-symbols-outlined text-text-tertiary">chevron_left</span>
            </button>
            <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1 hover:bg-surface-low transition-colors">
              <span className="material-symbols-outlined text-text-tertiary">chevron_right</span>
            </button>
          </div>

          {view === 'month' ? (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border-soft">
                {DAYS.map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day, i) => {
                  const dateStr = day ? toDateStr(year, month, day) : ''
                  const dayEvs  = day ? eventsForDate(dateStr) : []
                  const isToday = dateStr === todayStr
                  const isSel   = dateStr === selectedDate
                  return (
                    <button key={i} disabled={!day}
                      onClick={() => day && setSelectedDate(dateStr)}
                      className={`min-h-[72px] p-1.5 text-left border-b border-r border-border-soft transition-colors ${
                        !day ? 'bg-surface-low' :
                        isSel ? 'bg-neon-surface' :
                        isToday ? 'bg-dark/5' :
                        'hover:bg-surface-low'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-bold leading-none ${
                              isToday ? 'inline-flex items-center justify-center w-5 h-5 bg-dark text-neon rounded-full' :
                              isSel ? 'text-olive' : 'text-text-secondary'
                            }`}>{day}</span>
                            {dayEvs.some(e => e.googleEventId) && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Sincronizado com Google Agenda" />
                            )}
                          </div>
                          <div className="mt-1 flex flex-col gap-0.5">
                            {dayEvs.slice(0,2).map(ev => (
                              <div key={ev.id} className={`text-[9px] px-1 py-px truncate font-bold ${
                                ev.status === 'completed' ? 'bg-success/20 text-success' :
                                ev.status === 'confirmed' ? 'bg-info/20 text-info' :
                                ev.status === 'cancelled' ? 'bg-danger/20 text-danger' :
                                'bg-warning/20 text-warning'
                              }`}>
                                {ev.time} {ev.patient.split(' ')[0]}
                              </div>
                            ))}
                            {dayEvs.length > 2 && (
                              <div className="text-[9px] text-text-tertiary px-1">+{dayEvs.length-2}</div>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Vista semanal */
            <div className="card overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border-soft">
                {weekDates.map(dateStr => {
                  const d      = new Date(dateStr + 'T00:00:00')
                  const isToday = dateStr === todayStr
                  const isSel   = dateStr === selectedDate
                  const hasGcal = eventsForDate(dateStr).some(e => e.googleEventId)
                  return (
                    <button key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`py-3 flex flex-col items-center gap-1 transition-colors ${isSel ? 'bg-dark' : 'hover:bg-surface-low'}`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSel ? 'text-neon/60' : 'text-text-tertiary'}`}>
                        {DAYS[d.getDay()]}
                      </span>
                      <span className={`flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full ${
                        isToday && isSel ? 'bg-neon text-dark' :
                        isToday ? 'bg-dark text-neon' :
                        isSel ? 'bg-neon/20 text-neon' :
                        'text-text-primary'
                      }`}>{d.getDate()}</span>
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {eventsForDate(dateStr).map(ev => (
                          <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${
                            ev.status === 'completed' ? 'bg-success' :
                            ev.status === 'confirmed' ? 'bg-info' :
                            ev.status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                          }`} />
                        ))}
                        {hasGcal && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 border border-blue-600" title="Google Agenda" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="overflow-y-auto max-h-[480px]">
                {Array.from({length: 12}, (_, i) => {
                  const hour = i + 7
                  const timeStr = `${pad(hour)}:00`
                  return (
                    <div key={hour} className="grid grid-cols-[3rem_1fr] border-b border-border-soft min-h-[56px]">
                      <div className="flex items-start justify-end pr-2 pt-1">
                        <span className="text-[10px] text-text-tertiary">{timeStr}</span>
                      </div>
                      <div className="grid grid-cols-7 border-l border-border-soft">
                        {weekDates.map(dateStr => {
                          const ev = events.find(e => e.date === dateStr && e.time.startsWith(pad(hour)))
                          return (
                            <div key={dateStr}
                              className={`border-r border-border-soft last:border-r-0 p-0.5 cursor-pointer ${
                                dateStr === selectedDate ? 'bg-neon-surface/50' : 'hover:bg-surface-low'
                              }`}
                              onClick={() => { setSelectedDate(dateStr); if (!ev) setShowModal(true) }}
                            >
                              {ev && (
                                <div className={`w-full text-left p-1 text-[9px] font-bold leading-tight ${
                                  ev.status === 'completed' ? 'bg-success/20 text-success' :
                                  ev.status === 'confirmed' ? 'bg-info/20 text-info' :
                                  ev.status === 'cancelled' ? 'bg-danger/20 text-danger' :
                                  'bg-warning/20 text-warning'
                                }`}>
                                  <p className="truncate">{ev.patient.split(' ')[0]}</p>
                                  <p className="font-normal opacity-70 truncate">{ev.type}</p>
                                  {ev.googleEventId && (
                                    <div className="flex items-center gap-0.5 mt-0.5 opacity-60">
                                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Painel direito ── */}
        <div className="flex flex-col gap-4">

          {/* Sessões do dia */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-dark flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neon/60">Sessões do dia</p>
                <p className="font-display font-bold text-sm text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {weekday:'long',day:'numeric',month:'short'})}
                </p>
              </div>
              <span className="flex items-center justify-center w-7 h-7 bg-neon/10 border border-neon/20 font-display font-bold text-sm text-neon">
                {selectedEvents.length}
              </span>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <p className="empty-state__title">Nenhuma sessão neste dia</p>
                <p className="empty-state__desc">Aproveite para agendar um novo atendimento ou bloquear o horário.</p>
                <div className="empty-state__actions">
                  <button onClick={() => setShowModal(true)} className="bk-btn bk-btn-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Agendar sessão
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border-soft">
                {selectedEvents.map((ev, idx) => (
                  <div key={ev.id} className="flex items-start gap-3 p-4 hover:bg-surface-low transition-colors">
                    <div className="flex flex-col items-center min-w-[2.5rem]">
                      <span className="font-display font-bold text-xs text-text-primary">{ev.time}</span>
                      <div className="w-px flex-1 bg-border-soft my-1 min-h-[20px]" />
                      <span className="text-[9px] text-text-tertiary">{ev.endTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 ${STATUS_COLOR[ev.status]}`}>
                          {STATUS_LABEL[ev.status]}
                        </span>
                        <span className="material-symbols-outlined text-sm text-text-secondary" title={ev.modality}>
                          {MODALITY_ICON[ev.modality]}
                        </span>
                        {ev.googleEventId && (
                          <span title="Sincronizado com Google Agenda" className="text-[9px] text-blue-500 flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            GCal
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-text-primary truncate">{ev.patient}</p>
                      <p className="text-xs text-text-tertiary truncate">{ev.type}</p>
                      {ev.notes && <p className="text-xs text-text-tertiary italic truncate mt-0.5">{ev.notes}</p>}
                      {ev.status !== 'completed' && ev.status !== 'cancelled' && (
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => navigate({ to: '/dashboard/sessao' })}
                            className="text-[10px] font-bold text-olive hover:underline">
                            Iniciar
                          </button>
                          {ev.modality === 'teleconsulta' && (
                            <button
                              onClick={() => navigate({ to: '/dashboard/teleconsulta' })}
                              className="text-[10px] font-bold text-info hover:underline">
                              Link
                            </button>
                          )}
                          <button
                            onClick={() => cancelEvent(ev.id)}
                            className="text-[10px] text-text-tertiary hover:text-danger transition-colors">
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-text-tertiary">{String(idx+1).padStart(2,'0')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats do dia */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Concluídas', value: selectedEvents.filter(e=>e.status==='completed').length, icon:'task_alt',    color:'text-success' },
              { label:'Confirmadas', value: selectedEvents.filter(e=>e.status==='confirmed').length, icon:'check_circle', color:'text-info' },
              { label:'Aguardando', value: selectedEvents.filter(e=>e.status==='scheduled').length, icon:'schedule',    color:'text-warning' },
              { label:'Canceladas', value: selectedEvents.filter(e=>e.status==='cancelled').length, icon:'cancel',      color:'text-danger' },
            ].map(stat => (
              <div key={stat.label} className="card p-3 flex flex-col gap-1">
                <span className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
                <p className="font-display font-bold text-xl text-text-primary">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Legenda Google Calendar */}
          {gcal.status === 'connected' && (
            <div className="card p-3">
              <p className="section-label mb-2">Legenda</p>
              <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Evento do Google Agenda</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Sessão concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-info rounded-full" />
                  <span>Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span>Aguardando confirmação</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
