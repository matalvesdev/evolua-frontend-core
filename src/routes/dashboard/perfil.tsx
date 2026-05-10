import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/perfil')({
  component: PerfilPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type WeekDay = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

interface WorkSlot {
  day: WeekDay
  active: boolean
  start: string
  end: string
}

const WEEK_DAYS: { key: WeekDay; label: string }[] = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça'   },
  { key: 'qua', label: 'Quarta'  },
  { key: 'qui', label: 'Quinta'  },
  { key: 'sex', label: 'Sexta'   },
  { key: 'sab', label: 'Sábado'  },
  { key: 'dom', label: 'Domingo' },
]

const ALL_SPECIALTIES = [
  'Linguagem Infantil',
  'Motricidade Orofacial',
  'Voz',
  'Disfagia',
  'Fluência / Gagueira',
  'Audiologia',
  'TEA',
  'CAA',
  'Linguagem Adulto',
  'Disfunção Temporomandibular',
  'Saúde do Trabalhador',
  'Gerontologia',
]

// ── Page ─────────────────────────────────────────────────────────────────────

function PerfilPage() {
  // ── Dados pessoais ──────────────────────────────────────────────────────────
  const [name,  setName]  = useState('')
  const [crfa,  setCrfa]  = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio,   setBio]   = useState('')
  const [site,  setSite]  = useState('')
  const [cnpj,  setCnpj]  = useState('')

  // ── Especialidades ──────────────────────────────────────────────────────────
  const [specialties, setSpecialties] = useState<string[]>([])

  function toggleSpecialty(s: string) {
    setSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  // ── Horários de atendimento ─────────────────────────────────────────────────
  const [workSlots, setWorkSlots] = useState<WorkSlot[]>([
    { day: 'seg', active: false, start: '08:00', end: '18:00' },
    { day: 'ter', active: false, start: '08:00', end: '18:00' },
    { day: 'qua', active: false, start: '08:00', end: '18:00' },
    { day: 'qui', active: false, start: '08:00', end: '18:00' },
    { day: 'sex', active: false, start: '08:00', end: '18:00' },
    { day: 'sab', active: false, start: '09:00', end: '12:00' },
    { day: 'dom', active: false, start: '09:00', end: '12:00' },
  ])

  function updateSlot(day: WeekDay, patch: Partial<WorkSlot>) {
    setWorkSlots(prev => prev.map(s => s.day === day ? { ...s, ...patch } : s))
  }

  // ── Modo edição ──────────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false)
  const [toast, setToast] = useState(false)

  function handleSave() {
    setEditMode(false)
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Pacientes ativos',    value: '0', icon: 'group'              },
    { label: 'Sessões realizadas',  value: '0', icon: 'mic'                },
    { label: 'Relatórios gerados',  value: '0', icon: 'description'        },
    { label: 'Anos de experiência', value: '—', icon: 'workspace_premium'  },
  ]

  const initials = (name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')) || '—'

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-dark text-neon text-xs font-bold px-4 py-3 rounded shadow-[var(--shadow-dark)] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Perfil salvo com sucesso
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Perfil</h1>
        <button onClick={() => editMode ? handleSave() : setEditMode(true)}
          className={editMode ? 'btn-primary' : 'btn-outline'}>
          {editMode ? 'Salvar perfil' : 'Editar perfil'}
        </button>
      </div>

      {/* ── Card principal ── */}
      <div className="card p-0 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #C4F135 0, #C4F135 1px, transparent 0, transparent 50%)',
            backgroundSize: '8px 8px',
          }} />
        </div>
        {/* Avatar + info */}
        <div className="relative px-6 pb-6 pt-12">
          <div className="absolute -top-10 left-6 w-20 h-20 rounded-lg bg-neon-surface border-4 border-surface flex items-center justify-center shadow-sm">
            <span className="font-display font-bold text-2xl text-olive">{initials}</span>
          </div>
          <div className="ml-24 -mt-10 mb-5 min-w-0">
            <p className="font-display font-bold text-lg text-text-primary truncate">{name || 'Seu nome'}</p>
            <p className="text-sm text-text-secondary truncate">{crfa || 'CRFa não informado'}</p>
          </div>

          {editMode ? (
            /* ── MODO EDIÇÃO ── */
            <div className="flex flex-col gap-5">
              {/* Dados pessoais */}
              <div>
                <p className="section-label mb-3">Dados profissionais</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="section-label block mb-1.5">Nome completo</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="input w-full" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">Registro CRFa</label>
                    <input value={crfa} onChange={e => setCrfa(e.target.value)} className="input w-full" placeholder="CRFa X-XXXXX" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">E-mail profissional</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} className="input w-full" type="email" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">Telefone / WhatsApp</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="input w-full" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">Site / Link Linktree</label>
                    <input value={site} onChange={e => setSite(e.target.value)} className="input w-full" placeholder="www.seusite.com.br" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">CNPJ (opcional)</label>
                    <input value={cnpj} onChange={e => setCnpj(e.target.value)} className="input w-full" placeholder="XX.XXX.XXX/0001-XX" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="section-label block mb-1.5">Biografia / Mini-currículo</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="input w-full resize-none" />
                  </div>
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <p className="section-label mb-2">Especialidades ({specialties.length} selecionadas)</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SPECIALTIES.map(s => {
                    const active = specialties.includes(s)
                    return (
                      <button key={s} onClick={() => toggleSpecialty(s)}
                        className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded border transition-all ${
                          active
                            ? 'bg-neon-surface border-border-neon text-olive'
                            : 'bg-surface border-border-soft text-text-tertiary hover:border-border'
                        }`}>
                        {active && <span className="mr-1">✓</span>}
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Horários de atendimento */}
              <div>
                <p className="section-label mb-2">Horários de atendimento</p>
                <div className="flex flex-col divide-y divide-border-soft border border-border-soft rounded overflow-hidden">
                  {workSlots.map(slot => {
                    const day = WEEK_DAYS.find(d => d.key === slot.day)!
                    return (
                      <div key={slot.day} className={`flex items-center gap-3 px-4 py-3 transition-colors ${slot.active ? 'bg-surface' : 'bg-surface-low'}`}>
                        {/* Toggle dia */}
                        <button
                          onClick={() => updateSlot(slot.day, { active: !slot.active })}
                          className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${slot.active ? 'bg-olive' : 'bg-border'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${slot.active ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                        {/* Label do dia */}
                        <span className={`text-xs font-bold w-16 shrink-0 ${slot.active ? 'text-text-primary' : 'text-text-tertiary'}`}>
                          {day.label}
                        </span>
                        {slot.active ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={slot.start}
                              onChange={e => updateSlot(slot.day, { start: e.target.value })}
                              className="input text-xs py-1 flex-1 min-w-0" />
                            <span className="text-text-tertiary text-xs shrink-0">até</span>
                            <input type="time" value={slot.end}
                              onChange={e => updateSlot(slot.day, { end: e.target.value })}
                              className="input text-xs py-1 flex-1 min-w-0" />
                          </div>
                        ) : (
                          <span className="text-xs text-text-tertiary">Não atende</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border-soft">
                <button onClick={() => setEditMode(false)} className="btn-outline">Cancelar</button>
                <button onClick={handleSave} className="btn-primary">Salvar perfil</button>
              </div>
            </div>
          ) : (
            /* ── MODO VISUALIZAÇÃO ── */
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-secondary leading-relaxed">{bio}</p>

              {/* Contato */}
              <div className="flex flex-col gap-2">
                {[
                  { icon: 'email', value: email },
                  { icon: 'phone', value: phone },
                  { icon: 'language', value: site },
                  { icon: 'business', value: cnpj ? `CNPJ: ${cnpj}` : null },
                ].filter(f => f.value).map(f => (
                  <div key={f.icon} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-text-secondary">{f.icon}</span>
                    <span className="text-sm text-text-secondary">{f.value}</span>
                  </div>
                ))}
              </div>

              {/* Especialidades */}
              <div className="flex flex-wrap gap-2">
                {specialties.map(s => (
                  <span key={s} className="text-[10px] font-bold uppercase tracking-wide text-olive bg-neon-surface border border-border-neon px-2 py-1 rounded">
                    {s}
                  </span>
                ))}
              </div>

              {/* Horários resumidos */}
              <div className="flex flex-col gap-1">
                <p className="section-label">Horários de atendimento</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {workSlots.filter(s => s.active).map(slot => {
                    const day = WEEK_DAYS.find(d => d.key === slot.day)!
                    return (
                      <div key={slot.day} className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-text-primary w-16">{day.label}:</span>
                        <span className="text-text-secondary">{slot.start} – {slot.end}</span>
                      </div>
                    )
                  })}
                  {workSlots.filter(s => s.active).length === 0 && (
                    <p className="text-xs text-text-tertiary">Horários não configurados</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="card p-4 flex flex-col gap-2">
            <span className="material-symbols-outlined text-olive" style={{ fontVariationSettings: '"FILL" 1' }}>{s.icon}</span>
            <p className="font-display font-bold text-2xl text-text-primary">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Segurança ── */}
      <div className="card p-6 flex flex-col gap-4">
        <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">Segurança</h2>
        <div className="flex flex-col gap-0 divide-y divide-border-soft">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-bold text-text-primary">Senha</p>
              <p className="text-xs text-text-tertiary">Mantenha sua senha atualizada periodicamente</p>
            </div>
            <button className="btn-outline text-xs">Alterar senha</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-bold text-text-primary">Autenticação em dois fatores</p>
              <p className="text-xs text-text-tertiary">Adicione uma camada extra de segurança</p>
            </div>
            <button className="btn-outline text-xs">Ativar 2FA</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-bold text-text-primary">LGPD — Exportar meus dados</p>
              <p className="text-xs text-text-tertiary">Baixe todos os seus dados em formato JSON</p>
            </div>
            <button className="btn-outline text-xs">Exportar</button>
          </div>
        </div>
      </div>

      {/* ── Assinatura do plano ── */}
      <div className="card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark rounded flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-neon" style={{ fontVariationSettings: '"FILL" 1' }}>workspace_premium</span>
          </div>
          <div>
            <p className="font-bold text-sm text-text-primary">Plano da Evolua</p>
            <p className="text-xs text-text-tertiary">Sem assinatura ativa</p>
          </div>
        </div>
        <button className="btn-outline text-xs shrink-0">Gerenciar plano</button>
      </div>
    </div>
  )
}
