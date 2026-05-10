import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/plano-terapeutico')({
  component: PlanoTerapeuticoPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type Area =
  | 'linguagem-infantil'
  | 'voz'
  | 'disfagia'
  | 'motricidade-orofacial'
  | 'fluencia'
  | 'tea'
  | 'audiologia'

type GoalStatus = 'nao-iniciado' | 'em-andamento' | 'atingido' | 'pausado'
type GoalPriority = 'alta' | 'media' | 'baixa'

interface SessionEntry {
  date: string
  score: number        // 0-5: desempenho naquela sessão
  note: string
}

interface Goal {
  id: string
  patientId: string
  area: Area
  objective: string         // ex: "Produzir /r/ em nível de sílaba com 80% de acerto"
  criterion: string         // critério de atingimento
  targetDate: string
  priority: GoalPriority
  status: GoalStatus
  sessionsLog: SessionEntry[]
  createdAt: string
}

interface Patient {
  id: string
  name: string
  age: number
  diagnosis: string
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const INITIAL_PATIENTS: Patient[] = []

const INITIAL_GOALS: Goal[] = []

// ── Config ────────────────────────────────────────────────────────────────────

const AREA_CFG: Record<Area, { label: string; color: string; icon: string }> = {
  'linguagem-infantil':   { label: 'Linguagem Infantil',   color: 'text-info    bg-info/10    border-info/30',    icon: 'child_care'       },
  'voz':                  { label: 'Voz',                   color: 'text-warning bg-warning/10 border-warning/30', icon: 'graphic_eq'       },
  'disfagia':             { label: 'Disfagia',              color: 'text-danger  bg-danger/10  border-danger/30',  icon: 'restaurant'       },
  'motricidade-orofacial':{ label: 'Motricidade Orofacial', color: 'text-olive   bg-neon/10    border-neon/30',    icon: 'face'             },
  'fluencia':             { label: 'Fluência',              color: 'text-success bg-success/10 border-success/30', icon: 'waves'            },
  'tea':                  { label: 'TEA',                   color: 'text-info    bg-info/10    border-info/30',    icon: 'diversity_3'      },
  'audiologia':           { label: 'Audiologia',            color: 'text-text-secondary bg-surface-low border-border', icon: 'hearing' },
}

const STATUS_CFG: Record<GoalStatus, { label: string; color: string }> = {
  'nao-iniciado': { label: 'Não iniciado', color: 'text-text-tertiary bg-surface-low' },
  'em-andamento': { label: 'Em andamento', color: 'text-info bg-info/10'              },
  'atingido':     { label: 'Atingido ✓',   color: 'text-success bg-success-surface'   },
  'pausado':      { label: 'Pausado',       color: 'text-warning bg-warning/10'        },
}

const PRIORITY_CFG: Record<GoalPriority, { label: string; dot: string }> = {
  alta:  { label: 'Alta',  dot: 'bg-danger'  },
  media: { label: 'Média', dot: 'bg-warning' },
  baixa: { label: 'Baixa', dot: 'bg-success' },
}

const SCORE_LABELS = ['—', 'Iniciando', 'Em desenvolvimento', 'Consistente', 'Quase lá', 'Atingido']
const SCORE_COLORS = ['bg-border', 'bg-danger', 'bg-warning', 'bg-info', 'bg-olive', 'bg-success']

// ── Helpers ───────────────────────────────────────────────────────────────────

function progressPercent(goal: Goal): number {
  if (goal.sessionsLog.length === 0) return 0
  const last = goal.sessionsLog[goal.sessionsLog.length - 1].score
  return Math.round((last / 5) * 100)
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ── Gráfico de progresso (mini sparkline de scores) ──────────────────────────

function ScoreChart({ log }: { log: SessionEntry[] }) {
  if (log.length === 0) return <p className="text-xs text-text-secondary">Nenhuma sessão registrada</p>

  const W = 280
  const H = 80
  const PAD = 8
  const chartW = W - PAD * 2
  const chartH = H - PAD * 2

  const points = log.map((entry, i) => {
    const x = PAD + (i / Math.max(log.length - 1, 1)) * chartW
    const y = PAD + (1 - entry.score / 5) * chartH
    return `${x},${y}`
  })

  const linePath = `M ${points.join(' L ')}`
  const areaPath = `M ${points[0]} L ${points.join(' L ')} L ${PAD + chartW},${PAD + chartH} L ${PAD},${PAD + chartH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
      {/* Linhas de grade */}
      {[1, 2, 3, 4, 5].map(v => {
        const y = PAD + (1 - v / 5) * chartH
        return (
          <line key={v} x1={PAD} y1={y} x2={PAD + chartW} y2={y}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" className="text-text-primary" />
        )
      })}
      {/* Área */}
      <path d={areaPath} fill="var(--color-neon)" fillOpacity="0.08" />
      {/* Linha */}
      <path d={linePath} fill="none" stroke="var(--color-olive)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Pontos */}
      {log.map((entry, i) => {
        const x = PAD + (i / Math.max(log.length - 1, 1)) * chartW
        const y = PAD + (1 - entry.score / 5) * chartH
        return (
          <circle key={i} cx={x} cy={y} r="3.5" fill="var(--color-olive)" stroke="var(--color-surface)" strokeWidth="1.5">
            <title>{fmtDate(entry.date)} — {SCORE_LABELS[entry.score]}{entry.note ? `: ${entry.note}` : ''}</title>
          </circle>
        )
      })}
    </svg>
  )
}

// ── Card de Objetivo ─────────────────────────────────────────────────────────

function GoalCard({ goal, patient, onAddSession, onStatusChange }: {
  goal: Goal
  patient: Patient | undefined
  onAddSession: (goalId: string, entry: SessionEntry) => void
  onStatusChange: (goalId: string, status: GoalStatus) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [addingSession, setAddingSession] = useState(false)
  const [sessionForm, setSessionForm] = useState({ date: new Date().toISOString().split('T')[0], score: 3, note: '' })

  const area = AREA_CFG[goal.area]
  const status = STATUS_CFG[goal.status]
  const priority = PRIORITY_CFG[goal.priority]
  const pct = progressPercent(goal)
  const days = daysUntil(goal.targetDate)
  const lastEntry = goal.sessionsLog[goal.sessionsLog.length - 1]

  function handleSaveSession() {
    onAddSession(goal.id, { ...sessionForm, score: Number(sessionForm.score) })
    setAddingSession(false)
    setSessionForm({ date: new Date().toISOString().split('T')[0], score: 3, note: '' })
  }

  return (
    <div className={`card p-0 overflow-hidden transition-all ${goal.status === 'atingido' ? 'opacity-70' : ''}`}>
      {/* Header do card */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Badge de área */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wide shrink-0 ${area.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: '"FILL" 1' }}>{area.icon}</span>
              {area.label}
            </div>
            {/* Priority dot */}
            <div className="flex items-center gap-1 pt-1.5 shrink-0">
              <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
              <span className="text-[10px] text-text-tertiary">{priority.label}</span>
            </div>
          </div>
          {/* Status badge */}
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded shrink-0 ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Objetivo */}
        <div>
          <p className="text-sm font-semibold text-text-primary leading-snug">{goal.objective}</p>
          {patient && <p className="text-xs text-text-tertiary mt-0.5">{patient.name} · {patient.diagnosis}</p>}
        </div>

        {/* Barra de progresso */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Progresso</span>
            <span className="text-xs font-bold text-olive">{pct}%</span>
          </div>
          <div className="h-1.5 bg-surface-low rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${goal.status === 'atingido' ? 'bg-success' : 'bg-olive'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {lastEntry && (
            <p className="text-[10px] text-text-tertiary">
              Última sessão: {fmtDate(lastEntry.date)} — <span className="font-semibold">{SCORE_LABELS[lastEntry.score]}</span>
            </p>
          )}
        </div>

        {/* Footer: prazo + ações */}
        <div className="flex items-center justify-between pt-1 border-t border-border-soft">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-text-tertiary">calendar_today</span>
            <span className={`text-xs ${days < 0 ? 'text-danger font-bold' : days < 14 ? 'text-warning font-semibold' : 'text-text-tertiary'}`}>
              {days < 0 ? `Vencido há ${Math.abs(days)}d` : days === 0 ? 'Vence hoje' : `${days} dias restantes`}
              <span className="text-text-tertiary font-normal"> · Meta: {fmtDate(goal.targetDate)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {goal.status !== 'atingido' && (
              <button
                onClick={() => setAddingSession(true)}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-olive hover:text-dark transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add_circle</span>
                Sessão
              </button>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary hover:text-text-primary transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                {expanded ? 'expand_less' : 'expand_more'}
              </span>
              {goal.sessionsLog.length} sessões
            </button>
          </div>
        </div>
      </div>

      {/* Painel expandido: gráfico + histórico */}
      {expanded && (
        <div className="border-t border-border-soft p-4 flex flex-col gap-4 bg-surface-low">
          {/* Critério */}
          <div className="flex flex-col gap-1">
            <p className="section-label">Critério de atingimento</p>
            <p className="text-xs text-text-secondary">{goal.criterion}</p>
          </div>

          {/* Gráfico */}
          <div className="flex flex-col gap-2">
            <p className="section-label">Curva de progresso</p>
            <div className="bg-surface border border-border-soft p-3 rounded">
              <ScoreChart log={goal.sessionsLog} />
              {/* Escala Y */}
              <div className="flex justify-between mt-1">
                {SCORE_LABELS.slice(1).map((l, i) => (
                  <span key={i} className="text-[8px] text-text-tertiary text-center" style={{ width: '16%' }}>{l.split(' ')[0]}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Histórico de sessões */}
          <div className="flex flex-col gap-2">
            <p className="section-label">Histórico ({goal.sessionsLog.length} sessões)</p>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {[...goal.sessionsLog].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="text-text-tertiary whitespace-nowrap w-16 shrink-0">{fmtDate(entry.date)}</span>
                  <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${SCORE_COLORS[entry.score]}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-text-primary">{SCORE_LABELS[entry.score]}</span>
                    {entry.note && <span className="text-text-tertiary"> — {entry.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mudar status */}
          {goal.status !== 'atingido' && (
            <div className="flex gap-2 pt-2 border-t border-border-soft flex-wrap">
              <span className="text-[10px] text-text-tertiary self-center">Alterar status:</span>
              {(['em-andamento', 'pausado', 'atingido'] as GoalStatus[]).filter(s => s !== goal.status).map(s => (
                <button key={s} onClick={() => onStatusChange(goal.id, s)}
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border transition-colors hover:opacity-80 ${STATUS_CFG[s].color}`}>
                  {STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: registrar sessão */}
      {addingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-sm shadow-[var(--shadow-dark)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-dark border-b border-dark-border">
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-neon">Registrar Sessão</h3>
              <button onClick={() => setAddingSession(false)} className="text-white/50 hover:text-white">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-text-secondary leading-snug">{goal.objective}</p>
              <div>
                <label className="section-label block mb-1.5">Data da sessão</label>
                <input type="date" value={sessionForm.date}
                  onChange={e => setSessionForm(f => ({ ...f, date: e.target.value }))}
                  className="input w-full" />
              </div>
              <div>
                <label className="section-label block mb-2">
                  Desempenho nesta sessão — <span className="text-olive font-bold">{SCORE_LABELS[sessionForm.score]}</span>
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => setSessionForm(f => ({ ...f, score: v }))}
                      className={`flex-1 h-8 rounded text-xs font-bold transition-all ${
                        sessionForm.score >= v ? SCORE_COLORS[v] + ' text-white' : 'bg-surface-low text-text-tertiary hover:bg-border'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-text-tertiary">Iniciando</span>
                  <span className="text-[9px] text-text-tertiary">Critério atingido</span>
                </div>
              </div>
              <div>
                <label className="section-label block mb-1.5">Observações clínicas</label>
                <textarea value={sessionForm.note} rows={2}
                  onChange={e => setSessionForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Descreva a performance, resposta às pistas, contexto..."
                  className="input w-full resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAddingSession(false)} className="flex-1 btn-outline">Cancelar</button>
                <button onClick={handleSaveSession} className="flex-1 btn-primary">Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Modal: Novo Objetivo ──────────────────────────────────────────────────────

function NewGoalModal({ patients, onClose, onSave }: {
  patients: Patient[]
  onClose: () => void
  onSave: (g: Goal) => void
}) {
  const [form, setForm] = useState({
    patientId: patients[0]?.id ?? '',
    area: 'linguagem-infantil' as Area,
    objective: '',
    criterion: '',
    targetDate: '',
    priority: 'media' as GoalPriority,
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.objective.trim() || !form.targetDate) return
    onSave({
      id: String(Date.now()),
      patientId: form.patientId,
      area: form.area,
      objective: form.objective.trim(),
      criterion: form.criterion.trim(),
      targetDate: form.targetDate,
      priority: form.priority,
      status: 'nao-iniciado',
      sessionsLog: [],
      createdAt: new Date().toISOString().split('T')[0],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-surface w-full max-w-lg shadow-[var(--shadow-dark)] overflow-hidden my-4">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border">
          <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Novo Objetivo Terapêutico</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Paciente *</label>
              <select value={form.patientId} onChange={e => set('patientId', e.target.value)} className="input w-full">
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="section-label block mb-1.5">Área clínica *</label>
              <select value={form.area} onChange={e => set('area', e.target.value)} className="input w-full">
                {(Object.entries(AREA_CFG) as [Area, typeof AREA_CFG[Area]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Objetivo terapêutico *</label>
            <textarea value={form.objective} rows={3}
              onChange={e => set('objective', e.target.value)}
              placeholder="Ex: Produzir /r/ em nível de sílaba com 80% de acerto em 3 sessões consecutivas"
              className="input w-full resize-none" />
          </div>
          <div>
            <label className="section-label block mb-1.5">Critério de atingimento</label>
            <input value={form.criterion} onChange={e => set('criterion', e.target.value)}
              placeholder="Ex: ≥ 80% de acerto em produção espontânea, 3 sessões seguidas"
              className="input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Data-alvo *</label>
              <input type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Prioridade</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="input w-full">
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline">Cancelar</button>
            <button onClick={handleSave} disabled={!form.objective.trim() || !form.targetDate} className="flex-1 btn-primary">
              Criar Objetivo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página Principal ──────────────────────────────────────────────────────────

function PlanoTerapeuticoPage() {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS)
  const [patients] = useState<Patient[]>(INITIAL_PATIENTS)
  const [selectedPatient, setSelectedPatient] = useState<string>('all')
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showNew, setShowNew] = useState(false)

  function handleAddSession(goalId: string, entry: SessionEntry) {
    setGoals(prev => prev.map(g => g.id === goalId
      ? { ...g, sessionsLog: [...g.sessionsLog, entry] }
      : g
    ))
  }

  function handleStatusChange(goalId: string, status: GoalStatus) {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g))
  }

  function handleAddGoal(g: Goal) {
    setGoals(prev => [g, ...prev])
  }

  const filtered = goals.filter(g => {
    if (selectedPatient !== 'all' && g.patientId !== selectedPatient) return false
    if (selectedArea !== 'all' && g.area !== selectedArea) return false
    if (selectedStatus !== 'all' && g.status !== selectedStatus) return false
    return true
  })

  // Stats
  const total      = goals.length
  const atingidos  = goals.filter(g => g.status === 'atingido').length
  const emAndamento= goals.filter(g => g.status === 'em-andamento').length
  const vencidos   = goals.filter(g => g.status !== 'atingido' && daysUntil(g.targetDate) < 0).length

  return (
    <div className="flex flex-col gap-6 p-6">
      {showNew && (
        <NewGoalModal patients={patients} onClose={() => setShowNew(false)} onSave={handleAddGoal} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">
            Plano Terapêutico
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Objetivos por área · Tracking session-by-session · Progresso visual
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Objetivo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total de objetivos',  value: total,       icon: 'target',        color: 'text-text-primary', bg: 'bg-surface-low border-border' },
          { label: 'Em andamento',        value: emAndamento, icon: 'trending_up',   color: 'text-info',         bg: 'bg-info/10 border-info/30'    },
          { label: 'Atingidos',           value: atingidos,   icon: 'verified',      color: 'text-success',      bg: 'bg-success/10 border-success/30'},
          { label: 'Prazo vencido',       value: vencidos,    icon: 'warning',       color: 'text-danger',       bg: 'bg-danger/10 border-danger/30' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded border flex items-center justify-center ${s.bg}`}>
              <span className={`material-symbols-outlined text-sm ${s.color}`} style={{ fontVariationSettings: '"FILL" 1' }}>{s.icon}</span>
            </div>
            <p className={`font-display font-bold text-2xl leading-none ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="input flex-1">
          <option value="all">Todos os pacientes</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} className="input flex-1">
          <option value="all">Todas as áreas</option>
          {(Object.entries(AREA_CFG) as [Area, typeof AREA_CFG[Area]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="input flex-1">
          <option value="all">Todos os status</option>
          {(Object.entries(STATUS_CFG) as [GoalStatus, typeof STATUS_CFG[GoalStatus]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Lista de objetivos */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">target</span>
          </div>
          <p className="empty-state__title">Nenhum objetivo encontrado</p>
          <p className="empty-state__desc">Crie objetivos terapêuticos para cada paciente e acompanhe a evolução sessão a sessão.</p>
          <div className="empty-state__actions">
            <button onClick={() => setShowNew(true)} className="bk-btn bk-btn-primary">Criar primeiro objetivo</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              patient={patients.find(p => p.id === g.patientId)}
              onAddSession={handleAddSession}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Legenda de scores */}
      <div className="card p-4 flex flex-col gap-2">
        <p className="section-label">Legenda — Escala de desempenho por sessão</p>
        <div className="flex flex-wrap gap-3">
          {SCORE_LABELS.slice(1).map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${SCORE_COLORS[i + 1]}`} />
              <span className="text-xs text-text-secondary"><span className="font-bold">{i + 1}</span> — {l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
