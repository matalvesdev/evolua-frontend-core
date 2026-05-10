import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/prontuario')({
  component: ProntuarioPage,
})

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Area = 'linguagem' | 'voz' | 'disfagia' | 'motricidade' | 'gagueira' | 'tea'

interface Prontuario {
  id: string
  patient: string
  dob: string
  area: Area
  diagnosis: string
  created: string
  lastSession: string
  sessions: number
  scales: Record<string, string | number>
  anamnese: string
  objectives: string[]
  evolution: string
}

// ── Escalas por área ──────────────────────────────────────────────────────────
const SCALES: Record<Area, { name: string; fields: { key: string; label: string; type: 'select' | 'number'; options?: string[] }[] }[]> = {
  voz: [
    {
      name: 'GRBAS',
      fields: [
        { key:'G', label:'G — Grau geral (0-3)', type:'select', options:['0','1','2','3'] },
        { key:'R', label:'R — Rugosidade (0-3)', type:'select', options:['0','1','2','3'] },
        { key:'B', label:'B — Soprosidade (0-3)', type:'select', options:['0','1','2','3'] },
        { key:'A', label:'A — Astenia (0-3)', type:'select', options:['0','1','2','3'] },
        { key:'S', label:'S — Tensão (0-3)', type:'select', options:['0','1','2','3'] },
      ]
    },
    {
      name: 'VHI-10',
      fields: Array.from({length:10}, (_, i) => ({
        key: `VHI${i+1}`, label: `Item ${i+1}`, type: 'select' as const,
        options: ['0 - Nunca','1 - Quase nunca','2 - Às vezes','3 - Quase sempre','4 - Sempre']
      }))
    }
  ],
  disfagia: [
    {
      name: 'DOSS',
      fields: [
        { key:'doss', label:'Nível DOSS (1-7)', type:'select', options:[
          '1 - Dependência total','2 - Máx. assistência','3 - Mod. assistência',
          '4 - Mín. assistência','5 - Supervisão','6 - Mod. independência','7 - Independência total'
        ]}
      ]
    },
    {
      name: 'FOIS',
      fields: [
        { key:'fois', label:'Nível FOIS (1-7)', type:'select', options:[
          '1 - Nada por via oral','2 - NPO c/ suplemento','3 - NPO consistente',
          '4 - VO com restrições','5 - VO múltiplas consistências','6 - VO independente c/ restrições','7 - VO independente total'
        ]}
      ]
    },
    {
      name: 'MBGR',
      fields: [
        { key:'mbgr_estrutura', label:'Estruturas (0-24)', type:'number' },
        { key:'mbgr_mobilidade', label:'Mobilidade (0-40)', type:'number' },
        { key:'mbgr_deglutição', label:'Deglutição (0-30)', type:'number' },
      ]
    }
  ],
  linguagem: [
    {
      name: 'Perfil comunicativo',
      fields: [
        { key:'compreensao', label:'Compreensão', type:'select', options:['Adequada','Levemente alterada','Moderadamente alterada','Gravemente alterada'] },
        { key:'expressao', label:'Expressão', type:'select', options:['Adequada','Levemente alterada','Moderadamente alterada','Gravemente alterada'] },
        { key:'pragmatica', label:'Pragmática', type:'select', options:['Adequada','Levemente alterada','Moderadamente alterada','Gravemente alterada'] },
      ]
    }
  ],
  motricidade: [
    {
      name: 'Avaliação miofuncional',
      fields: [
        { key:'labios', label:'Lábios', type:'select', options:['Normal','Hipotonia','Hipertonia','Assimetria'] },
        { key:'lingua', label:'Língua', type:'select', options:['Normal','Hipotonia','Hipertonia','Protrusão','Desvio'] },
        { key:'mastigacao', label:'Mastigação', type:'select', options:['Bilateral alternada','Unilateral','Anterior'] },
        { key:'degluticao', label:'Deglutição', type:'select', options:['Adequada','Interposição lingual','Contração perioral'] },
      ]
    }
  ],
  gagueira: [
    {
      name: 'SSI-4',
      fields: [
        { key:'frequencia', label:'Frequência (%SS)', type:'number' },
        { key:'duracao', label:'Duração média (s)', type:'number' },
        { key:'comportamentos', label:'Comportamentos físicos (0-20)', type:'number' },
        { key:'total', label:'Total SSI-4', type:'number' },
        { key:'severidade', label:'Severidade', type:'select', options:['Muito suave','Suave','Moderado','Severo','Muito severo'] },
      ]
    }
  ],
  tea: [
    {
      name: 'Perfil comunicativo TEA',
      fields: [
        { key:'comunicacao', label:'Comunicação', type:'select', options:['Verbal','Verbal com suporte','CAA','Pré-simbólico'] },
        { key:'contato_visual', label:'Contato visual', type:'select', options:['Adequado','Reduzido','Ausente'] },
        { key:'atenção_conjunta', label:'Atenção conjunta', type:'select', options:['Presente','Emergente','Ausente'] },
        { key:'flexibilidade', label:'Flexibilidade', type:'select', options:['Adequada','Levemente rígida','Muito rígida'] },
      ]
    }
  ]
}

const AREA_LABELS: Record<Area, string> = {
  linguagem: 'Linguagem', voz: 'Voz', disfagia: 'Disfagia',
  motricidade: 'Motricidade Orofacial', gagueira: 'Gagueira', tea: 'TEA'
}
const AREA_ICONS: Record<Area, string> = {
  linguagem: 'record_voice_over', voz: 'mic', disfagia: 'restaurant',
  motricidade: 'face', gagueira: 'hearing', tea: 'psychology'
}

// ── Mock prontuários ──────────────────────────────────────────────────────────
const MOCK: Prontuario[] = []

// ── ScaleForm ─────────────────────────────────────────────────────────────────
function ScaleForm({ area, values, onChange }: {
  area: Area
  values: Record<string, string | number>
  onChange: (key: string, val: string | number) => void
}) {
  const areaScales = SCALES[area] ?? []
  if (!areaScales.length) return <p className="text-sm text-text-secondary">Sem escalas para esta área.</p>
  return (
    <div className="flex flex-col gap-6">
      {areaScales.map(scale => (
        <div key={scale.name}>
          <p className="font-display font-bold text-sm text-text-primary uppercase tracking-wide mb-3">{scale.name}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scale.fields.map(f => (
              <div key={f.key}>
                <label className="section-label block mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={String(values[f.key] ?? '')}
                    onChange={e => onChange(f.key, e.target.value)}
                    className="input w-full text-sm"
                  >
                    <option value="">— selecionar —</option>
                    {f.options!.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={String(values[f.key] ?? '')}
                    onChange={e => onChange(f.key, Number(e.target.value))}
                    className="input w-full text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
function ProntuarioPage() {
  const [selected, setSelected] = useState<Prontuario | null>(MOCK[0] ?? null)
  const [tab, setTab] = useState<'anamnese'|'escalas'|'evolucao'|'objetivos'>('escalas')
  const [scales, setScales] = useState<Record<string, string|number>>(MOCK[0]?.scales ?? {})
  const [saved, setSaved] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ patient:'', dob:'', area:'linguagem' as Area, diagnosis:'' })

  function selectProntuario(p: Prontuario) {
    setSelected(p); setScales(p.scales); setTab('escalas'); setSaved(false)
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Novo prontuário modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface w-full max-w-md shadow-[var(--shadow-dark)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-dark">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Novo Prontuário</h2>
              <button onClick={() => setShowNew(false)} className="text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="section-label block mb-1.5">Paciente *</label>
                <input value={newForm.patient} onChange={e => setNewForm(f=>({...f,patient:e.target.value}))} className="input w-full" placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1.5">Data de nascimento</label>
                  <input type="date" value={newForm.dob} onChange={e => setNewForm(f=>({...f,dob:e.target.value}))} className="input w-full" />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Área</label>
                  <select value={newForm.area} onChange={e => setNewForm(f=>({...f,area:e.target.value as Area}))} className="input w-full">
                    {(Object.entries(AREA_LABELS) as [Area, string][]).map(([k,v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="section-label block mb-1.5">Hipótese diagnóstica</label>
                <input value={newForm.diagnosis} onChange={e => setNewForm(f=>({...f,diagnosis:e.target.value}))} className="input w-full" placeholder="Ex: Atraso de linguagem" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="flex-1 btn-outline">Cancelar</button>
                <button onClick={() => setShowNew(false)} className="flex-1 btn-primary">Criar Prontuário</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Prontuário</h1>
          <p className="text-sm text-text-secondary mt-0.5">Avaliações e escalas clínicas validadas pelo CFFa</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Prontuário
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Lista de pacientes */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <p className="section-label px-1">Pacientes ({MOCK.length})</p>
          {MOCK.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined text-3xl text-text-tertiary">folder_open</span>
              <p className="text-sm text-text-secondary">Nenhum prontuário</p>
            </div>
          ) : (
            MOCK.map(p => (
              <button
                key={p.id}
                onClick={() => selectProntuario(p)}
                className={`w-full text-left p-3 border transition-colors ${
                  selected?.id === p.id
                    ? 'bg-dark border-dark'
                    : 'bg-surface border-border-soft hover:bg-surface-low'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-lg ${selected?.id === p.id ? 'text-neon' : 'text-text-tertiary'}`}>
                    {AREA_ICONS[p.area]}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${selected?.id === p.id ? 'text-white' : 'text-text-primary'}`}>
                      {p.patient.split(' ')[0]} {p.patient.split(' ')[1] ?? ''}
                    </p>
                    <p className={`text-xs truncate ${selected?.id === p.id ? 'text-neon/60' : 'text-text-tertiary'}`}>
                      {AREA_LABELS[p.area]} · {p.sessions} sessões
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Prontuário selecionado */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {!selected ? (
            <div className="card p-12 empty-state">
              <span className="material-symbols-outlined text-5xl text-text-tertiary">medical_information</span>
              <p className="text-base text-text-primary font-bold">Selecione um prontuário</p>
              <p className="text-sm text-text-secondary">Cadastre um paciente para começar</p>
            </div>
          ) : (
          <>
          {/* Header do prontuário */}
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 bg-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neon/60 mb-1">Prontuário clínico</p>
                  <h2 className="font-display font-bold text-lg text-white">{selected.patient}</h2>
                  <p className="text-sm text-white/60 mt-0.5">{selected.diagnosis}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-xs text-white font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings:'"FILL" 1' }}>{AREA_ICONS[selected.area]}</span>
                    {AREA_LABELS[selected.area]}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-surface-low border-b border-border-soft flex items-center gap-6 text-xs text-text-tertiary flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">cake</span>
                {new Date(selected.dob).toLocaleDateString('pt-BR')}
                {' '}({new Date().getFullYear() - new Date(selected.dob).getFullYear()} anos)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">event</span>
                Início: {new Date(selected.created).toLocaleDateString('pt-BR')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">history</span>
                Última sessão: {new Date(selected.lastSession).toLocaleDateString('pt-BR')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">bar_chart</span>
                {selected.sessions} sessões realizadas
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border-soft">
            {([
              { key:'escalas',   label:'Escalas',    icon:'assessment'     },
              { key:'anamnese',  label:'Anamnese',   icon:'description'    },
              { key:'objetivos', label:'Objetivos',  icon:'target'         },
              { key:'evolucao',  label:'Evolução',   icon:'trending_up'    },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-olive text-olive'
                    : 'border-transparent text-text-tertiary hover:text-text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="card p-6">
            {tab === 'escalas' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-sm text-text-primary uppercase tracking-wide">
                    Escalas — {AREA_LABELS[selected.area]}
                  </p>
                  <div className="flex items-center gap-2">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-xs text-success font-bold">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Salvo!
                      </span>
                    )}
                    <button onClick={save} className="btn-primary text-xs px-4 py-2">
                      Salvar avaliação
                    </button>
                  </div>
                </div>
                <ScaleForm
                  area={selected.area}
                  values={scales}
                  onChange={(k, v) => setScales(s => ({...s, [k]: v}))}
                />
              </div>
            )}

            {tab === 'anamnese' && (
              <div className="flex flex-col gap-4">
                <p className="font-display font-bold text-sm text-text-primary uppercase tracking-wide">Anamnese</p>
                <textarea
                  defaultValue={selected.anamnese}
                  rows={8}
                  className="input w-full resize-none text-sm leading-relaxed"
                />
                <button onClick={save} className="btn-primary self-start text-xs px-4 py-2">Salvar anamnese</button>
              </div>
            )}

            {tab === 'objetivos' && (
              <div className="flex flex-col gap-4">
                <p className="font-display font-bold text-sm text-text-primary uppercase tracking-wide">Objetivos terapêuticos</p>
                <div className="flex flex-col gap-2">
                  {selected.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-surface-low border border-border-soft">
                      <span className="flex items-center justify-center w-5 h-5 bg-neon text-dark text-[10px] font-bold rounded-full shrink-0">{i+1}</span>
                      <p className="text-sm text-text-primary flex-1">{obj}</p>
                      <button className="text-text-tertiary hover:text-danger transition-colors">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="input flex-1 text-sm" placeholder="Novo objetivo..." />
                  <button className="btn-primary px-4 py-2 text-xs">Adicionar</button>
                </div>
              </div>
            )}

            {tab === 'evolucao' && (
              <div className="flex flex-col gap-4">
                <p className="font-display font-bold text-sm text-text-primary uppercase tracking-wide">Evolução clínica</p>
                <div className="px-4 py-3 bg-success-surface border border-success/20 text-sm text-text-primary rounded">
                  <p className="font-bold text-success mb-1">Nota da última sessão</p>
                  <p className="leading-relaxed">{selected.evolution}</p>
                </div>
                <div>
                  <label className="section-label block mb-1.5">Nova nota de evolução</label>
                  <textarea rows={5} className="input w-full resize-none text-sm leading-relaxed" placeholder="Descreva a evolução desta sessão..." />
                </div>
                <button onClick={save} className="btn-primary self-start text-xs px-4 py-2">Salvar evolução</button>
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
