import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { usePatients, useCreatePatient } from '@/hooks/use-patients'
import { patientToVM, type PatientVM as Patient } from '@/lib/view-models'

export const Route = createFileRoute('/dashboard/pacientes')({
  component: PacientesPage,
})

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  ativo:      { label: 'Ativo',      cls: 'badge badge-brand' },
  aguardando: { label: 'Aguardando', cls: 'badge badge-warning' },
  inativo:    { label: 'Inativo',    cls: 'badge' },
}

// ── Modal Novo Paciente ────────────────────────────────────────────────────────

function NewPatientModal({ onClose, onSave }: { onClose: () => void; onSave: (p: { name: string; age?: number; diagnosis?: string; phone?: string; email?: string }) => void }) {
  const [form, setForm] = useState({
    name: '', age: '', diagnosis: 'Dislalia', phone: '', guardian: '', email: '', notes: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const DIAGNOSES = ['Dislalia','Atraso de Fala','Atraso de Linguagem','Gagueira','TEA','Disfonia','Deglutição','Dislexia','Voz','Outro']

  function handleSave() {
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      age: parseInt(form.age) || undefined,
      diagnosis: form.diagnosis,
      phone: form.phone || undefined,
      email: form.email || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface w-full max-w-lg shadow-[var(--shadow-dark)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border">
          <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Novo Paciente</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
          <div>
            <label className="section-label block mb-1.5">Nome completo *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do paciente" className="input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Idade</label>
              <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="0" min="0" max="120" className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Diagnóstico</label>
              <select value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} className="input w-full">
                {DIAGNOSES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Responsável</label>
            <input value={form.guardian} onChange={e => set('guardian', e.target.value)} placeholder="Nome do responsável" className="input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Telefone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(00) 00000-0000" className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">E-mail</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" className="input w-full" />
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Observações iniciais</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Queixa principal, histórico relevante..." rows={3} className="input w-full resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline">Cancelar</button>
            <button onClick={handleSave} className="flex-1 btn-primary" disabled={!form.name.trim()}>
              Cadastrar Paciente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Drawer de detalhes ─────────────────────────────────────────────────────────

function PatientDrawer({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'historico' | 'evolucao'>('info')

  const TABS = [
    { id: 'info' as const,     label: 'Informações' },
    { id: 'historico' as const,label: 'Histórico'   },
    { id: 'evolucao' as const, label: 'Evolução'    },
  ]

  const sessions: { date: string; type: string; duration: string; status: string }[] = []

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-surface shadow-[var(--shadow-dark)] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-start gap-4 px-6 py-5 bg-dark border-b border-dark-border flex-shrink-0">
          <div className={`avatar w-12 h-12 text-sm ${patient.color}`}>{patient.avatar}</div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-lg text-white leading-tight">{patient.name}</p>
            <p className="text-sm text-white/50 mt-0.5">{patient.age} anos · {patient.diagnosis}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={STATUS_LABELS[patient.status].cls}>{STATUS_LABELS[patient.status].label}</span>
              <span className="text-[10px] text-white/40">{patient.sessions} sessões realizadas</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Ações rápidas */}
        <div className="flex border-b border-border-soft flex-shrink-0">
          {[
            { icon: 'mic',         label: 'Sessão',   action: () => {} },
            { icon: 'event',       label: 'Agendar',  action: () => {} },
            { icon: 'description', label: 'Relatório',action: () => {} },
            { icon: 'chat',        label: 'WhatsApp', action: () => window.open(`https://wa.me/55${patient.phone.replace(/\D/g,'')}`) },
          ].map(a => (
            <button key={a.label} onClick={a.action}
              className="flex-1 flex flex-col items-center gap-1 py-3 hover:bg-surface-low transition-colors text-text-secondary hover:text-text-primary">
              <span className="material-symbols-outlined text-base">{a.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-soft flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                tab === t.id ? 'border-b-2 border-olive text-olive' : 'text-text-tertiary hover:text-text-primary'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das tabs */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              {[
                { icon: 'person',    label: 'Responsável', value: patient.guardian || '—' },
                { icon: 'phone',     label: 'Telefone',    value: patient.phone || '—' },
                { icon: 'email',     label: 'E-mail',      value: patient.email || '—' },
                { icon: 'calendar_month', label: 'Desde', value: patient.since ? new Date(patient.since + 'T00:00:00').toLocaleDateString('pt-BR') : '—' },
                { icon: 'event',     label: 'Próx. sessão',value: patient.next },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-base text-text-secondary mt-0.5">{row.icon}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{row.label}</p>
                    <p className="text-sm text-text-primary mt-0.5">{row.value}</p>
                  </div>
                </div>
              ))}
              {patient.notes && (
                <div className="mt-2 p-3 bg-surface-low border border-border-soft rounded">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary mb-1">Observações</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{patient.notes}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'historico' && (
            <div className="flex flex-col gap-2">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-low border border-border-soft rounded hover:bg-surface-high transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'Concluída' ? 'bg-success' : 'bg-danger'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{s.type}</p>
                    <p className="text-xs text-text-tertiary">{s.date} · {s.duration}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                    s.status === 'Concluída' ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger'
                  }`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'evolucao' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sessões', value: String(patient.sessions) },
                  { label: 'Meses',   value: String(Math.round(patient.sessions / 4)) },
                  { label: 'Assiduidade', value: '87%' },
                ].map(s => (
                  <div key={s.label} className="card p-3 text-center">
                    <p className="font-display font-bold text-xl text-text-primary">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-text-tertiary">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="card p-4">
                <p className="section-label mb-2">Últimas anotações clínicas</p>
                <p className="text-sm text-text-secondary leading-relaxed">{patient.notes || 'Sem anotações registradas.'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-border-soft flex-shrink-0">
          <button onClick={onClose} className="flex-1 btn-outline">Fechar</button>
          <button className="flex-1 btn-primary">Editar Paciente</button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────

function PacientesPage() {
  const { data, isLoading, error } = usePatients({ pageSize: 100 })
  const createPatient = useCreatePatient()
  const patients: Patient[] = useMemo(
    () => (data?.data ?? []).map(patientToVM),
    [data],
  )
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<'todos' | 'ativo' | 'aguardando' | 'inativo'>('todos')
  const [view, setView]         = useState<'grid' | 'list'>('list')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [showNew, setShowNew]   = useState(false)

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'todos' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 space-y-6">
      {selected && <PatientDrawer patient={selected} onClose={() => setSelected(null)} />}
      {showNew   && <NewPatientModal
        onClose={() => setShowNew(false)}
        onSave={p => createPatient.mutate({
          name: p.name,
          email: p.email,
          phone: p.phone,
          age: p.age,
          diagnosis: p.diagnosis,
          status: 'active',
        })}
      />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary uppercase tracking-tight">Pacientes</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {isLoading ? 'Carregando…' : error ? 'Backend indisponível' : `${patients.length} pacientes cadastrados`}
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="cta-dark flex items-center gap-2 px-4 py-2 rounded-md font-display font-bold text-sm uppercase tracking-wide transition-all">
          <span className="material-symbols-outlined text-base">person_add</span>
          Novo Paciente
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[13px] leading-none">search</span>
          <input className="input pl-9 text-sm" placeholder="Buscar por nome ou diagnóstico…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 bg-surface border border-border-soft rounded-md p-1">
          {(['todos', 'ativo', 'aguardando', 'inativo'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                filter === f ? 'bg-dark text-neon' : 'text-text-secondary hover:text-text-primary'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-surface border border-border-soft rounded-md p-1">
          <button onClick={() => setView('list')} className={`p-1.5 rounded transition-all ${view === 'list' ? 'bg-dark text-neon' : 'text-text-tertiary hover:text-text-primary'}`}>
            <span className="material-symbols-outlined text-base">list</span>
          </button>
          <button onClick={() => setView('grid')} className={`p-1.5 rounded transition-all ${view === 'grid' ? 'bg-dark text-neon' : 'text-text-tertiary hover:text-text-primary'}`}>
            <span className="material-symbols-outlined text-base">grid_view</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',      value: patients.length,                                       icon: 'group' },
          { label: 'Ativos',     value: patients.filter(p => p.status === 'ativo').length,     icon: 'check_circle' },
          { label: 'Aguardando', value: patients.filter(p => p.status === 'aguardando').length,icon: 'schedule' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3 py-3">
            <span className="material-symbols-outlined text-olive text-xl">{s.icon}</span>
            <div>
              <p className="font-display font-bold text-xl text-text-primary">{s.value}</p>
              <p className="text-xs text-text-tertiary uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Patient list */}
      {view === 'list' ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft bg-surface-low">
                <th className="text-left px-4 py-3 section-label">Paciente</th>
                <th className="text-left px-4 py-3 section-label">Idade</th>
                <th className="text-left px-4 py-3 section-label hidden md:table-cell">Diagnóstico</th>
                <th className="text-left px-4 py-3 section-label hidden lg:table-cell">Sessões</th>
                <th className="text-left px-4 py-3 section-label hidden lg:table-cell">Próxima Sessão</th>
                <th className="text-left px-4 py-3 section-label">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} onClick={() => setSelected(p)}
                  className={`border-b border-border-soft last:border-0 hover:bg-surface-low transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-canvas'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`avatar w-8 h-8 text-xs ${p.color}`}>{p.avatar}</div>
                      <span className="font-medium text-text-primary">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{p.age} anos</td>
                  <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{p.diagnosis}</td>
                  <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{p.sessions}</td>
                  <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{p.next}</td>
                  <td className="px-4 py-3">
                    <span className={STATUS_LABELS[p.status].cls}>{STATUS_LABELS[p.status].label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn-ghost p-1.5">
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16">
                    <div className="empty-state border-0">
                      <div className="empty-state__icon">
                        <span className="material-symbols-outlined">person_search</span>
                      </div>
                      <p className="empty-state__title">Nenhum paciente encontrado</p>
                      <p className="empty-state__desc">Ajuste a busca ou cadastre um novo paciente para começar.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} className="card hover:shadow-card cursor-pointer transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={`avatar w-12 h-12 text-sm ${p.color}`}>{p.avatar}</div>
                <span className={STATUS_LABELS[p.status].cls}>{STATUS_LABELS[p.status].label}</span>
              </div>
              <p className="font-display font-bold text-text-primary group-hover:text-olive transition-colors">{p.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{p.age} anos · {p.diagnosis}</p>
              <hr className="divider my-3" />
              <div className="flex justify-between text-xs text-text-secondary">
                <span>{p.sessions} sessões</span>
                <span>{p.next}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full">
              <div className="empty-state">
                <div className="empty-state__icon">
                  <span className="material-symbols-outlined">person_search</span>
                </div>
                <p className="empty-state__title">Nenhum paciente encontrado</p>
                <p className="empty-state__desc">Ajuste a busca ou cadastre um novo paciente para começar.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
