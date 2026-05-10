import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/materiais')({
  component: MateriaisPage,
})

// ── Tipos ─────────────────────────────────────────────────────────────────────

type MaterialType = 'atividade' | 'protocolo' | 'escala' | 'referencia'

interface Material {
  id: string
  title: string
  description: string
  type: MaterialType
  tags: string[]
  fileType: 'pdf' | 'docx' | 'pptx' | 'link'
  size?: string
  updatedAt: string
  favorite: boolean
}

// ── IA Generator ──────────────────────────────────────────────────────────────

type MaterialFormat = 'atividade' | 'brincadeira' | 'jogo' | 'historia' | 'exercicio' | 'roteiro'
type AgeGroup = 'bebe' | 'infantil' | 'escolar' | 'adolescente' | 'adulto'
type TherapyArea =
  | 'linguagem'   | 'fala'       | 'fluencia'  | 'voz'
  | 'degluticao'  | 'fonologia'  | 'mof'       | 'tea' | 'caa'

interface GeneratedMaterial {
  id: string
  title: string
  area: TherapyArea
  format: MaterialFormat
  age: AgeGroup
  content: string
  objectives: string[]
  materials: string[]
  duration: string
  createdAt: string
}

const FORMAT_CFG: Record<MaterialFormat, { label: string; icon: string; color: string }> = {
  atividade:  { label: 'Atividade',    icon: 'edit_note',        color: 'text-olive   bg-neon-surface'    },
  brincadeira:{ label: 'Brincadeira',  icon: 'toys',             color: 'text-warning bg-warning-surface' },
  jogo:       { label: 'Jogo',         icon: 'sports_esports',   color: 'text-info    bg-info-surface'    },
  historia:   { label: 'História',     icon: 'auto_stories',     color: 'text-success bg-success-surface' },
  exercicio:  { label: 'Exercício',    icon: 'fitness_center',   color: 'text-danger  bg-danger-surface'  },
  roteiro:    { label: 'Roteiro',      icon: 'assignment',       color: 'text-text-secondary bg-surface-high' },
}

const AGE_CFG: Record<AgeGroup, { label: string; icon: string }> = {
  bebe:        { label: '0–2 anos',    icon: 'baby_changing_station' },
  infantil:    { label: '3–6 anos',    icon: 'child_care'            },
  escolar:     { label: '7–12 anos',   icon: 'school'                },
  adolescente: { label: '13–17 anos',  icon: 'person'                },
  adulto:      { label: 'Adulto',      icon: 'person_4'              },
}

const AREA_CFG: Record<TherapyArea, { label: string; icon: string }> = {
  linguagem:  { label: 'Linguagem',          icon: 'record_voice_over' },
  fala:       { label: 'Fala',               icon: 'mic'               },
  fluencia:   { label: 'Fluência',           icon: 'waves'             },
  voz:        { label: 'Voz',               icon: 'graphic_eq'        },
  degluticao: { label: 'Deglutição',         icon: 'water_drop'        },
  fonologia:  { label: 'Fonologia',          icon: 'abc'               },
  mof:        { label: 'Motricidade Oral',   icon: 'face'              },
  tea:        { label: 'TEA',               icon: 'neurology'         },
  caa:        { label: 'CAA',               icon: 'grid_view'         },
}

// ── Mock biblioteca ────────────────────────────────────────────────────────────

const TYPE_CFG: Record<MaterialType, { label:string; color:string; icon:string }> = {
  atividade:  { label:'Atividade',  color:'text-olive   bg-neon-surface',     icon:'sports_esports' },
  protocolo:  { label:'Protocolo',  color:'text-info    bg-info-surface',     icon:'checklist'      },
  escala:     { label:'Escala',     color:'text-warning bg-warning-surface',  icon:'bar_chart'      },
  referencia: { label:'Referência', color:'text-success bg-success-surface',  icon:'menu_book'      },
}

const FILE_ICON: Record<string, string> = {
  pdf:'picture_as_pdf', docx:'description', pptx:'slideshow', link:'open_in_new',
}
const FILE_COLOR: Record<string, string> = {
  pdf:'text-danger', docx:'text-info', pptx:'text-warning', link:'text-olive',
}

const MATERIALS: Material[] = []

// ── Modal gerador ─────────────────────────────────────────────────────────────

function GeneratorModal({ onClose, onSave }: { onClose: () => void; onSave: (m: GeneratedMaterial) => void }) {
  const [area, setArea]     = useState<TherapyArea>('linguagem')
  const [format, setFormat] = useState<MaterialFormat>('brincadeira')
  const [age, setAge]       = useState<AgeGroup>('infantil')
  const [context, setContext] = useState('')
  const [step, setStep]     = useState<'form'|'loading'|'result'>('form')
  const [result, setResult] = useState<GeneratedMaterial | null>(null)

  function generate() {
    // TODO: substituir por chamada real ao endpoint de geração de materiais (IA).
    const stub: GeneratedMaterial = {
      id: String(Date.now()),
      title: `${FORMAT_CFG[format].label} de ${AREA_CFG[area].label}`,
      area,
      format,
      age,
      content: 'A geração de materiais com IA estará disponível em breve. As informações da sua solicitação foram registradas para uso futuro.',
      objectives: [],
      materials: [],
      duration: '',
      createdAt: new Date().toISOString(),
    }
    if (context.trim()) stub.content += `\n\n### Contexto adicional informado\n${context}`
    setResult(stub)
    setStep('result')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-lg shadow-[var(--shadow-dark)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neon" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
            <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Gerar Material com IA</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Loading */}
        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
            <div className="w-16 h-16 rounded-full bg-neon-surface border border-border-neon flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-olive animate-spin">progress_activity</span>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-text-primary">IA criando o material...</p>
              <p className="text-sm text-text-secondary mt-1">Gerando {FORMAT_CFG[format].label.toLowerCase()} de {AREA_CFG[area].label.toLowerCase()} para {AGE_CFG[age].label}</p>
            </div>
            <div className="w-full max-w-xs flex flex-col gap-2">
              {['Selecionando abordagem terapêutica','Estruturando atividade','Adicionando objetivos e materiais'].map(s => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-neon-surface border border-border-neon flex-shrink-0" />
                  <p className="text-xs text-text-secondary">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

            {/* Área clínica */}
            <div>
              <label className="section-label block mb-2">Área clínica</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(AREA_CFG) as TherapyArea[]).map(a => (
                  <button key={a} onClick={() => setArea(a)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${
                      area === a ? 'bg-dark text-neon border-dark' : 'border-border-soft text-text-tertiary hover:text-text-primary'
                    }`}>
                    <span className="material-symbols-outlined text-sm">{AREA_CFG[a].icon}</span>
                    {AREA_CFG[a].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formato */}
            <div>
              <label className="section-label block mb-2">Tipo de material</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(FORMAT_CFG) as MaterialFormat[]).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${
                      format === f ? 'bg-dark text-neon border-dark' : 'border-border-soft text-text-tertiary hover:text-text-primary'
                    }`}>
                    <span className="material-symbols-outlined text-lg" style={{fontVariationSettings:`"FILL" ${format === f ? 1 : 0}`}}>{FORMAT_CFG[f].icon}</span>
                    {FORMAT_CFG[f].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Faixa etária */}
            <div>
              <label className="section-label block mb-2">Faixa etária</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(AGE_CFG) as AgeGroup[]).map(a => (
                  <button key={a} onClick={() => setAge(a)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${
                      age === a ? 'bg-dark text-neon border-dark' : 'border-border-soft text-text-tertiary hover:text-text-primary'
                    }`}>
                    <span className="material-symbols-outlined text-sm">{AGE_CFG[a].icon}</span>
                    {AGE_CFG[a].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contexto adicional */}
            <div>
              <label className="section-label block mb-1.5">Contexto adicional (opcional)</label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="Ex: paciente com baixo tônus labial, prefere brinquedos de montar, nível de fala em 2 palavras..."
                rows={3}
                className="input w-full resize-none"
              />
              <p className="text-[10px] text-text-tertiary mt-1">Quanto mais contexto, mais personalizado o material.</p>
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Meta */}
            <div className="px-6 py-4 border-b border-border-soft bg-surface-low flex items-center gap-3 flex-wrap flex-shrink-0">
              <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded ${FORMAT_CFG[result.format].color}`}>
                <span className="material-symbols-outlined text-[12px]">{FORMAT_CFG[result.format].icon}</span>
                {FORMAT_CFG[result.format].label}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary bg-surface-high px-2 py-1 rounded">
                {AREA_CFG[result.area].label}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary bg-surface-high px-2 py-1 rounded">
                {AGE_CFG[result.age].label}
              </span>
              <span className="text-[9px] text-text-tertiary ml-auto flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                {result.duration}
              </span>
            </div>

            {/* Objetivos e materiais */}
            <div className="grid grid-cols-2 gap-px border-b border-border-soft flex-shrink-0">
              <div className="p-4 bg-neon-surface/30">
                <p className="section-label mb-2">Objetivos</p>
                <ul className="flex flex-col gap-1">
                  {result.objectives.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="material-symbols-outlined text-[12px] text-olive mt-0.5 flex-shrink-0">check_circle</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4">
                <p className="section-label mb-2">Materiais necessários</p>
                <ul className="flex flex-col gap-1">
                  {result.materials.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="material-symbols-outlined text-[12px] text-text-tertiary mt-0.5 flex-shrink-0">fiber_manual_record</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-6 overflow-y-auto">
              <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
                {result.content}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-soft flex-shrink-0 bg-surface">
          {step === 'form' && (
            <>
              <button onClick={onClose} className="btn-outline flex-1">Cancelar</button>
              <button onClick={generate} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
                Gerar material
              </button>
            </>
          )}
          {step === 'result' && result && (
            <>
              <button onClick={() => setStep('form')} className="btn-outline flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Refazer
              </button>
              <button className="btn-outline flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">print</span>
                Imprimir
              </button>
              <button onClick={() => { onSave(result); onClose() }}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">save</span>
                Salvar na biblioteca
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function MateriaisPage() {
  const [filter, setFilter]       = useState<'all'|MaterialType|'favorites'|'gerados'>('all')
  const [search, setSearch]       = useState('')
  const [showGen, setShowGen]     = useState(false)
  const [generated, setGenerated] = useState<GeneratedMaterial[]>([])
  const [viewGen, setViewGen]     = useState<GeneratedMaterial | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(MATERIALS.filter(m => m.favorite).map(m => m.id))
  )

  const filtered = MATERIALS.filter(m => {
    const matchFilter = filter === 'all' || filter === 'gerados'
      || (filter === 'favorites' ? favorites.has(m.id) : m.type === filter)
    const matchSearch = search === '' ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some(t => t.includes(search.toLowerCase()))
    return matchFilter && matchSearch && filter !== 'gerados'
  })

  function toggleFav(id: string) {
    setFavorites(f => {
      const next = new Set(f)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {showGen && (
        <GeneratorModal
          onClose={() => setShowGen(false)}
          onSave={m => setGenerated(g => [m, ...g])}
        />
      )}

      {/* Drawer do material gerado */}
      {viewGen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setViewGen(null)} />
          <div className="w-full max-w-2xl bg-surface shadow-[var(--shadow-dark)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border flex-shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neon/60">Material Gerado por IA</p>
                <p className="font-display font-bold text-sm text-white">{viewGen.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neon/10 border border-neon/20 rounded text-xs font-bold text-neon hover:bg-neon/20 transition-colors">
                  <span className="material-symbols-outlined text-sm">print</span>
                  Imprimir
                </button>
                <button onClick={() => setViewGen(null)} className="text-white/50 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-3 border-b border-border-soft bg-surface-low flex items-center gap-2 flex-wrap flex-shrink-0">
              <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${FORMAT_CFG[viewGen.format].color}`}>
                {FORMAT_CFG[viewGen.format].label}
              </span>
              <span className="text-[9px] text-text-tertiary bg-surface-high px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                {AREA_CFG[viewGen.area].label}
              </span>
              <span className="text-[9px] text-text-tertiary bg-surface-high px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                {AGE_CFG[viewGen.age].label}
              </span>
              <span className="text-[9px] text-text-tertiary ml-auto">{viewGen.duration}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">{viewGen.content}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Materiais</h1>
          <p className="text-sm text-text-secondary mt-0.5">Biblioteca de recursos e gerador de atividades com IA</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowGen(true)}
            className="btn-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
            Gerar com IA
          </button>
          <button className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">upload</span>
            Enviar material
          </button>
        </div>
      </div>

      {/* Banner gerador */}
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch">
          <div className="flex-shrink-0 flex flex-col justify-center gap-3 p-6 bg-dark sm:w-64">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-neon text-2xl" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
              <p className="font-display font-bold text-sm uppercase tracking-widest text-neon">IA Geradora</p>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Gere atividades, brincadeiras, jogos e exercícios terapêuticos personalizados para cada paciente em segundos.
            </p>
            <button onClick={() => setShowGen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neon text-dark font-display font-bold text-xs uppercase tracking-wide hover:bg-neon-dark transition-colors rounded-sm self-start">
              <span className="material-symbols-outlined text-sm">add</span>
              Gerar agora
            </button>
          </div>
          <div className="flex-1 p-5 flex flex-col gap-3">
            <p className="section-label">O que você pode gerar</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(FORMAT_CFG) as MaterialFormat[]).map(f => (
                <button key={f} onClick={() => setShowGen(true)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded border border-border-soft hover:border-border hover:shadow-[var(--shadow-card)] transition-all text-left group`}>
                  <span className={`material-symbols-outlined text-sm ${FORMAT_CFG[f].color.split(' ')[0]}`} style={{fontVariationSettings:'"FILL" 1'}}>
                    {FORMAT_CFG[f].icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-text-primary group-hover:text-olive transition-colors">{FORMAT_CFG[f].label}</p>
                  </div>
                </button>
              ))}
            </div>
            {generated.length > 0 && (
              <p className="text-[10px] text-text-tertiary">
                <span className="font-bold text-olive">{generated.length}</span> material{generated.length > 1 ? 'is' : ''} gerado{generated.length > 1 ? 's' : ''} nesta sessão
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Materiais gerados por IA */}
      {generated.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Gerados por IA nesta sessão</p>
            <button onClick={() => setFilter('gerados')}
              className="text-[10px] font-bold uppercase tracking-wide text-olive hover:underline">
              Ver todos ({generated.length})
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {generated.slice(0, 3).map(m => (
              <button key={m.id} onClick={() => setViewGen(m)}
                className="card p-4 flex flex-col gap-3 text-left hover:shadow-[var(--shadow-card)] transition-shadow">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${FORMAT_CFG[m.format].color}`}>
                    <span className="material-symbols-outlined text-[10px]">{FORMAT_CFG[m.format].icon}</span>
                    {FORMAT_CFG[m.format].label}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary bg-surface-low px-2 py-0.5 rounded">
                    {AREA_CFG[m.area].label}
                  </span>
                  <span className="ml-auto text-[9px] text-text-tertiary flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                    IA
                  </span>
                </div>
                <p className="font-bold text-sm text-text-primary">{m.title}</p>
                <p className="text-xs text-text-tertiary">{AGE_CFG[m.age].label} · {m.duration}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visão de todos os materiais gerados */}
      {filter === 'gerados' && generated.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Todos os materiais gerados ({generated.length})</p>
            <button onClick={() => setFilter('all')} className="text-[10px] font-bold text-text-tertiary hover:text-text-primary uppercase tracking-wide">
              ← Voltar à biblioteca
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {generated.map(m => (
              <button key={m.id} onClick={() => setViewGen(m)}
                className="card p-4 flex flex-col gap-3 text-left hover:shadow-[var(--shadow-card)] transition-shadow">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${FORMAT_CFG[m.format].color}`}>
                    <span className="material-symbols-outlined text-[10px]">{FORMAT_CFG[m.format].icon}</span>
                    {FORMAT_CFG[m.format].label}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary bg-surface-low px-2 py-0.5 rounded">
                    {AREA_CFG[m.area].label}
                  </span>
                </div>
                <p className="font-bold text-sm text-text-primary">{m.title}</p>
                <p className="text-xs text-text-tertiary">{AGE_CFG[m.age].label} · {m.duration}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Biblioteca existente ── */}
      {filter !== 'gerados' && (
        <>
          {/* Stats por tipo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(TYPE_CFG) as MaterialType[]).map(type => {
              const count = MATERIALS.filter(m => m.type === type).length
              const cfg   = TYPE_CFG[type]
              return (
                <button key={type}
                  onClick={() => setFilter(f => f === type ? 'all' : type)}
                  className={`card p-4 flex flex-col gap-2 text-left transition-all ${filter === type ? 'ring-2 ring-olive' : ''}`}
                >
                  <span className={`material-symbols-outlined ${cfg.color.split(' ')[0]}`} style={{fontVariationSettings:'"FILL" 1'}}>{cfg.icon}</span>
                  <p className="font-display font-bold text-xl text-text-primary">{count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{cfg.label}s</p>
                </button>
              )
            })}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título ou tag..."
                className="input w-full pl-9" />
            </div>
            <div className="flex rounded border border-border-soft overflow-hidden flex-shrink-0">
              {([['all','Todos'],['favorites','Favoritos'],['atividade','Atividades'],['protocolo','Protocolos'],['escala','Escalas'],['referencia','Referências']] as const).map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors border-r border-border-soft last:border-r-0 whitespace-nowrap ${
                    filter === v ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(m => (
              <div key={m.id} className="card p-0 overflow-hidden flex flex-col hover:shadow-[var(--shadow-card)] transition-shadow">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border-soft">
                  <span className={`material-symbols-outlined text-lg ${FILE_COLOR[m.fileType]}`} style={{fontVariationSettings:'"FILL" 1'}}>
                    {FILE_ICON[m.fileType]}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${TYPE_CFG[m.type].color}`}>
                    {TYPE_CFG[m.type].label}
                  </span>
                  <button onClick={() => toggleFav(m.id)}
                    className="ml-auto text-text-tertiary hover:text-warning transition-colors">
                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:`"FILL" ${favorites.has(m.id) ? 1 : 0}`}}>star</span>
                  </button>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-2">
                  <p className="font-bold text-sm text-text-primary leading-snug">{m.title}</p>
                  <p className="text-xs text-text-tertiary leading-relaxed flex-1">{m.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-wide bg-surface-low text-text-tertiary px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-soft bg-surface-low">
                  <p className="text-[10px] text-text-tertiary">
                    {m.size ?? 'Link externo'} · {new Date(m.updatedAt + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'short'})}
                  </p>
                  <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-olive hover:text-olive/80 transition-colors">
                    <span className="material-symbols-outlined text-sm">{m.fileType === 'link' ? 'open_in_new' : 'download'}</span>
                    {m.fileType === 'link' ? 'Acessar' : 'Baixar'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state mt-6">
              <div className="empty-state__icon">
                <span className="material-symbols-outlined">folder_open</span>
              </div>
              <p className="empty-state__title">Nenhum material encontrado</p>
              <p className="empty-state__desc">Ajuste os filtros ou gere um novo material com IA para começar sua biblioteca.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
