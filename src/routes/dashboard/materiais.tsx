import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  useMaterials,
  useCreateMaterial,
  useDeleteMaterial,
  useGenerateMaterial,
  type AgeGroup,
  type GeneratedMaterial,
  type Material,
  type MaterialFormat,
  type TherapyArea,
} from '@/hooks/use-materials'

export const Route = createFileRoute('/dashboard/materiais')({
  component: MateriaisPage,
})

// ── Configs UI ────────────────────────────────────────────────────────────────

const FORMAT_CFG: Record<MaterialFormat, { label: string; icon: string; color: string }> = {
  atividade:   { label: 'Atividade',    icon: 'edit_note',      color: 'text-olive   bg-neon-surface'    },
  brincadeira: { label: 'Brincadeira',  icon: 'toys',           color: 'text-warning bg-warning-surface' },
  jogo:        { label: 'Jogo',         icon: 'sports_esports', color: 'text-info    bg-info-surface'    },
  historia:    { label: 'História',     icon: 'auto_stories',   color: 'text-success bg-success-surface' },
  exercicio:   { label: 'Exercício',    icon: 'fitness_center', color: 'text-danger  bg-danger-surface'  },
  roteiro:     { label: 'Roteiro',      icon: 'assignment',     color: 'text-text-secondary bg-surface-high' },
}

const AGE_CFG: Record<AgeGroup, { label: string; icon: string }> = {
  bebe:        { label: '0–2 anos',   icon: 'baby_changing_station' },
  infantil:    { label: '3–6 anos',   icon: 'child_care'            },
  escolar:     { label: '7–12 anos',  icon: 'school'                },
  adolescente: { label: '13–17 anos', icon: 'person'                },
  adulto:      { label: 'Adulto',     icon: 'person_4'              },
}

const AREA_CFG: Record<TherapyArea, { label: string; icon: string }> = {
  linguagem:  { label: 'Linguagem',        icon: 'record_voice_over' },
  fala:       { label: 'Fala',             icon: 'mic'               },
  fluencia:   { label: 'Fluência',         icon: 'waves'             },
  voz:        { label: 'Voz',              icon: 'graphic_eq'        },
  degluticao: { label: 'Deglutição',       icon: 'water_drop'        },
  fonologia:  { label: 'Fonologia',        icon: 'abc'               },
  mof:        { label: 'Motricidade Oral', icon: 'face'              },
  tea:        { label: 'TEA',              icon: 'neurology'         },
  caa:        { label: 'CAA',              icon: 'grid_view'         },
}

const FORMAT_KEYS = Object.keys(FORMAT_CFG) as MaterialFormat[]

function formatDuration(min: number | null): string {
  if (!min) return '—'
  return `${min} min`
}

// ── Modal gerador (IA) ────────────────────────────────────────────────────────

interface DraftMaterial {
  area: TherapyArea
  format: MaterialFormat
  age: AgeGroup
  title: string
  content: string
  objectives: string[]
  materialsNeeded: string[]
  durationMinutes: number | null
  instructions: string
}

function GeneratorModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: (m: Material) => void
}) {
  const [area, setArea]       = useState<TherapyArea>('linguagem')
  const [format, setFormat]   = useState<MaterialFormat>('brincadeira')
  const [age, setAge]         = useState<AgeGroup>('infantil')
  const [context, setContext] = useState('')
  const [step, setStep]       = useState<'form' | 'loading' | 'result'>('form')
  const [draft, setDraft]     = useState<DraftMaterial | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const generate = useGenerateMaterial()
  const save     = useCreateMaterial()

  async function handleGenerate() {
    setError(null)
    setStep('loading')
    try {
      const result: GeneratedMaterial = await generate.mutateAsync({
        area,
        format,
        age,
        context: context.trim() || undefined,
      })
      setDraft({
        area,
        format,
        age,
        title: result.title,
        content: result.content,
        objectives: result.objectives,
        materialsNeeded: result.materialsNeeded,
        durationMinutes: result.durationMinutes,
        instructions: result.instructions,
      })
      setStep('result')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao gerar material'
      setError(msg)
      setStep('form')
    }
  }

  async function handleSave() {
    if (!draft) return
    try {
      const saved = await save.mutateAsync({
        title: draft.title,
        area: draft.area,
        format: draft.format,
        ageGroup: draft.age,
        content: draft.content,
        objectives: draft.objectives,
        materialsNeeded: draft.materialsNeeded,
        durationMinutes: draft.durationMinutes ?? undefined,
        description: draft.instructions || undefined,
        isAiGenerated: true,
      })
      onSaved(saved)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar material')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-lg shadow-[var(--shadow-dark)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neon" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
            <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Gerar Material com IA</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && step === 'form' && (
          <div className="px-6 py-3 bg-danger-surface border-b border-danger/30 text-xs text-danger flex items-center gap-2 flex-shrink-0">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
            <div className="w-16 h-16 rounded-full bg-neon-surface border border-border-neon flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-olive animate-spin">progress_activity</span>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-text-primary">IA criando o material...</p>
              <p className="text-sm text-text-secondary mt-1">
                Gerando {FORMAT_CFG[format].label.toLowerCase()} de {AREA_CFG[area].label.toLowerCase()} para {AGE_CFG[age].label}
              </p>
            </div>
            <div className="w-full max-w-xs flex flex-col gap-2">
              {['Selecionando abordagem terapêutica', 'Estruturando atividade', 'Adicionando objetivos e materiais'].map(s => (
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

            <div>
              <label className="section-label block mb-2">Tipo de material</label>
              <div className="grid grid-cols-3 gap-2">
                {FORMAT_KEYS.map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${
                      format === f ? 'bg-dark text-neon border-dark' : 'border-border-soft text-text-tertiary hover:text-text-primary'
                    }`}>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `"FILL" ${format === f ? 1 : 0}` }}>
                      {FORMAT_CFG[f].icon}
                    </span>
                    {FORMAT_CFG[f].label}
                  </button>
                ))}
              </div>
            </div>

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

            <div>
              <label className="section-label block mb-1.5">Contexto adicional (opcional)</label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="Ex: paciente com baixo tônus labial, prefere brinquedos de montar, nível de fala em 2 palavras..."
                rows={3}
                className="input w-full resize-none"
                maxLength={1500}
              />
              <p className="text-[10px] text-text-tertiary mt-1">Quanto mais contexto, mais personalizado o material.</p>
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && draft && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="px-6 py-4 border-b border-border-soft bg-surface-low flex items-center gap-3 flex-wrap flex-shrink-0">
              <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded ${FORMAT_CFG[draft.format].color}`}>
                <span className="material-symbols-outlined text-[12px]">{FORMAT_CFG[draft.format].icon}</span>
                {FORMAT_CFG[draft.format].label}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary bg-surface-high px-2 py-1 rounded">
                {AREA_CFG[draft.area].label}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary bg-surface-high px-2 py-1 rounded">
                {AGE_CFG[draft.age].label}
              </span>
              <span className="text-[9px] text-text-tertiary ml-auto flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                {formatDuration(draft.durationMinutes)}
              </span>
            </div>

            <div className="px-6 pt-4">
              <label className="section-label block mb-1.5">Título</label>
              <input value={draft.title}
                onChange={e => setDraft({ ...draft, title: e.target.value })}
                className="input w-full" maxLength={160} />
            </div>

            {(draft.objectives.length > 0 || draft.materialsNeeded.length > 0) && (
              <div className="grid grid-cols-2 gap-px border-b border-border-soft flex-shrink-0 mt-4">
                <div className="p-4 bg-neon-surface/30">
                  <p className="section-label mb-2">Objetivos</p>
                  {draft.objectives.length === 0 ? (
                    <p className="text-xs text-text-tertiary italic">Nenhum objetivo gerado</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {draft.objectives.map((o, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="material-symbols-outlined text-[12px] text-olive mt-0.5 flex-shrink-0">check_circle</span>
                          {o}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="p-4">
                  <p className="section-label mb-2">Materiais necessários</p>
                  {draft.materialsNeeded.length === 0 ? (
                    <p className="text-xs text-text-tertiary italic">Não especificado</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {draft.materialsNeeded.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="material-symbols-outlined text-[12px] text-text-tertiary mt-0.5 flex-shrink-0">fiber_manual_record</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 p-6 overflow-y-auto">
              <p className="section-label mb-2">Conteúdo</p>
              <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
                {draft.content}
              </pre>
              {draft.instructions && (
                <>
                  <p className="section-label mt-4 mb-2">Instruções ao terapeuta</p>
                  <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
                    {draft.instructions}
                  </pre>
                </>
              )}
            </div>
            {error && (
              <div className="px-6 py-2 bg-danger-surface border-t border-danger/30 text-xs text-danger flex items-center gap-2 flex-shrink-0">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-soft flex-shrink-0 bg-surface">
          {step === 'form' && (
            <>
              <button onClick={onClose} className="btn-outline flex-1">Cancelar</button>
              <button onClick={handleGenerate} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
                Gerar material
              </button>
            </>
          )}
          {step === 'result' && draft && (
            <>
              <button onClick={() => { setStep('form'); setDraft(null); setError(null) }} className="btn-outline flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Refazer
              </button>
              <button onClick={() => window.print()} className="btn-outline flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">print</span>
                Imprimir
              </button>
              <button onClick={handleSave} disabled={save.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">save</span>
                {save.isPending ? 'Salvando...' : 'Salvar na biblioteca'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Drawer de visualização ────────────────────────────────────────────────────

function MaterialDrawer({ material, onClose }: { material: Material; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-surface shadow-[var(--shadow-dark)] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neon/60">
              {material.isAiGenerated ? 'Material Gerado por IA' : 'Material'}
            </p>
            <p className="font-display font-bold text-sm text-white">{material.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neon/10 border border-neon/20 rounded text-xs font-bold text-neon hover:bg-neon/20 transition-colors">
              <span className="material-symbols-outlined text-sm">print</span>
              Imprimir
            </button>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div className="px-6 py-3 border-b border-border-soft bg-surface-low flex items-center gap-2 flex-wrap flex-shrink-0">
          <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${FORMAT_CFG[material.format].color}`}>
            {FORMAT_CFG[material.format].label}
          </span>
          <span className="text-[9px] text-text-tertiary bg-surface-high px-2 py-0.5 rounded font-bold uppercase tracking-wide">
            {AREA_CFG[material.area].label}
          </span>
          {material.ageGroup && (
            <span className="text-[9px] text-text-tertiary bg-surface-high px-2 py-0.5 rounded font-bold uppercase tracking-wide">
              {AGE_CFG[material.ageGroup].label}
            </span>
          )}
          <span className="text-[9px] text-text-tertiary ml-auto">{formatDuration(material.durationMinutes)}</span>
        </div>
        {(material.objectives.length > 0 || material.materialsNeeded.length > 0) && (
          <div className="grid grid-cols-2 gap-px border-b border-border-soft flex-shrink-0">
            <div className="p-4 bg-neon-surface/30">
              <p className="section-label mb-2">Objetivos</p>
              {material.objectives.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">—</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {material.objectives.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="material-symbols-outlined text-[12px] text-olive mt-0.5 flex-shrink-0">check_circle</span>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4">
              <p className="section-label mb-2">Materiais necessários</p>
              {material.materialsNeeded.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">—</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {material.materialsNeeded.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="material-symbols-outlined text-[12px] text-text-tertiary mt-0.5 flex-shrink-0">fiber_manual_record</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">{material.content}</pre>
          {material.description && (
            <>
              <p className="section-label mt-4 mb-2">Instruções</p>
              <pre className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">{material.description}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

type FilterMode = 'all' | MaterialFormat | 'ai'

function MateriaisPage() {
  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')
  const [showGen, setShowGen] = useState(false)
  const [viewing, setViewing] = useState<Material | null>(null)

  const params = useMemo(() => {
    const p: { search?: string; format?: MaterialFormat; aiOnly?: boolean; pageSize: number } = {
      pageSize: 100,
    }
    if (search.trim()) p.search = search.trim()
    if (filter === 'ai') p.aiOnly = true
    else if (filter !== 'all') p.format = filter
    return p
  }, [search, filter])

  const { data, isLoading, error } = useMaterials(params)
  const remove = useDeleteMaterial()

  const materials = data?.data ?? []
  const total = data?.pagination.total ?? 0

  // Stats por formato — usa lista carregada (rápido o suficiente para pageSize=100)
  const formatCounts = useMemo(() => {
    const c: Record<MaterialFormat, number> = {
      atividade: 0, brincadeira: 0, jogo: 0, historia: 0, exercicio: 0, roteiro: 0,
    }
    for (const m of materials) c[m.format] = (c[m.format] ?? 0) + 1
    return c
  }, [materials])

  async function handleDelete(id: string) {
    if (!confirm('Excluir este material? Esta ação não pode ser desfeita.')) return
    await remove.mutateAsync(id)
    if (viewing?.id === id) setViewing(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {showGen && (
        <GeneratorModal
          onClose={() => setShowGen(false)}
          onSaved={(m) => setViewing(m)}
        />
      )}
      {viewing && <MaterialDrawer material={viewing} onClose={() => setViewing(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Materiais</h1>
          <p className="text-sm text-text-secondary mt-0.5">Biblioteca de recursos e gerador de atividades com IA</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowGen(true)} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
            Gerar com IA
          </button>
        </div>
      </div>

      {/* Banner gerador */}
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch">
          <div className="flex-shrink-0 flex flex-col justify-center gap-3 p-6 bg-dark sm:w-64">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-neon text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
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
              {FORMAT_KEYS.map(f => (
                <button key={f} onClick={() => setShowGen(true)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded border border-border-soft hover:border-border hover:shadow-[var(--shadow-card)] transition-all text-left group">
                  <span className={`material-symbols-outlined text-sm ${FORMAT_CFG[f].color.split(' ')[0]}`} style={{ fontVariationSettings: '"FILL" 1' }}>
                    {FORMAT_CFG[f].icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-text-primary group-hover:text-olive transition-colors">{FORMAT_CFG[f].label}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-text-tertiary">
              <span className="font-bold text-olive">{total}</span> material{total === 1 ? '' : 'is'} na biblioteca
            </p>
          </div>
        </div>
      </div>

      {/* Stats por formato */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FORMAT_KEYS.map(f => {
          const count = formatCounts[f]
          const cfg = FORMAT_CFG[f]
          return (
            <button key={f}
              onClick={() => setFilter(prev => (prev === f ? 'all' : f))}
              className={`card p-4 flex flex-col gap-2 text-left transition-all ${filter === f ? 'ring-2 ring-olive' : ''}`}>
              <span className={`material-symbols-outlined ${cfg.color.split(' ')[0]}`} style={{ fontVariationSettings: '"FILL" 1' }}>{cfg.icon}</span>
              <p className="font-display font-bold text-xl text-text-primary">{count}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="input w-full pl-9" />
        </div>
        <div className="flex rounded border border-border-soft overflow-hidden flex-shrink-0">
          {([['all', 'Todos'], ['ai', 'Gerados por IA']] as const).map(([v, l]) => (
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
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-3xl text-olive animate-spin">progress_activity</span>
        </div>
      ) : error ? (
        <div className="empty-state mt-6">
          <div className="empty-state__icon"><span className="material-symbols-outlined">error</span></div>
          <p className="empty-state__title">Erro ao carregar materiais</p>
          <p className="empty-state__desc">{error instanceof Error ? error.message : 'Tente novamente em instantes.'}</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="empty-state mt-6">
          <div className="empty-state__icon"><span className="material-symbols-outlined">folder_open</span></div>
          <p className="empty-state__title">Nenhum material encontrado</p>
          <p className="empty-state__desc">Ajuste os filtros ou gere um novo material com IA para começar sua biblioteca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map(m => {
            const fcfg = FORMAT_CFG[m.format]
            return (
              <div key={m.id} className="card p-0 overflow-hidden flex flex-col hover:shadow-[var(--shadow-card)] transition-shadow">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-soft">
                  <span className={`material-symbols-outlined text-lg ${fcfg.color.split(' ')[0]}`} style={{ fontVariationSettings: '"FILL" 1' }}>
                    {fcfg.icon}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${fcfg.color}`}>
                    {fcfg.label}
                  </span>
                  {m.isAiGenerated && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-neon flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                      IA
                    </span>
                  )}
                  <button onClick={() => handleDelete(m.id)}
                    className="ml-auto text-text-tertiary hover:text-danger transition-colors" title="Excluir">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                <button onClick={() => setViewing(m)} className="flex-1 p-4 flex flex-col gap-2 text-left">
                  <p className="font-bold text-sm text-text-primary leading-snug">{m.title}</p>
                  <p className="text-xs text-text-tertiary leading-relaxed flex-1 line-clamp-3">
                    {m.description || m.content.slice(0, 140) + (m.content.length > 140 ? '…' : '')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-wide bg-surface-low text-text-tertiary px-2 py-0.5 rounded">
                      {AREA_CFG[m.area].label}
                    </span>
                    {m.ageGroup && (
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-surface-low text-text-tertiary px-2 py-0.5 rounded">
                        {AGE_CFG[m.ageGroup].label}
                      </span>
                    )}
                  </div>
                </button>
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-soft bg-surface-low">
                  <p className="text-[10px] text-text-tertiary">
                    {formatDuration(m.durationMinutes)} · {new Date(m.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                  <button onClick={() => setViewing(m)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-olive hover:text-olive/80 transition-colors">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Abrir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
