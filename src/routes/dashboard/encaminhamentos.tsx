import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/encaminhamentos')({
  component: EncaminhamentosPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type DocType =
  | 'encaminhamento-escola'
  | 'encaminhamento-medico'
  | 'encaminhamento-neuropediatra'
  | 'encaminhamento-psicologo'
  | 'parecer-escola'
  | 'relatorio-interdisciplinar'

type DocStatus = 'rascunho' | 'finalizado' | 'enviado'

interface Document {
  id: string
  type: DocType
  patientName: string
  destinatario: string
  date: string
  status: DocStatus
  content: string
}

// ── Templates por tipo ────────────────────────────────────────────────────────

const TEMPLATES: Record<DocType, (patient: string, crfa: string, fono: string) => string> = {
  'encaminhamento-escola': (patient, crfa, fono) =>
`À Coordenação Pedagógica
${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}

Assunto: Encaminhamento fonoaudiológico e orientações de adaptação — ${patient}

Prezada Coordenação,

Encaminho para vosso conhecimento informações pertinentes ao acompanhamento fonoaudiológico do(a) aluno(a) ${patient}, que se encontra em processo terapêutico sob minha responsabilidade.

DIAGNÓSTICO FONOAUDIOLÓGICO:
[Descreva o diagnóstico aqui]

ÁREAS DE COMPROMETIMENTO:
[Liste as áreas comprometidas]

EVOLUÇÃO CLÍNICA:
[Descreva a evolução observada]

RECOMENDAÇÕES PARA O AMBIENTE ESCOLAR:
• Posicionar o(a) aluno(a) próximo(a) ao quadro e ao professor
• Utilizar instruções curtas e objetivas, com suporte visual quando possível
• Evitar situações de exposição que causem constrangimento (leitura oral em voz alta, por exemplo)
• Ampliar o tempo para realização de atividades escritas
• Comunicar ao responsável sobre atividades que demandarem esforço adicional
• [Acrescente recomendações específicas]

PROGNÓSTICO:
[Descreva o prognóstico]

Coloco-me à disposição para reunião multiprofissional sempre que necessário.

Atenciosamente,

${fono}
Fonoaudióloga — ${crfa}`,

  'encaminhamento-medico': (patient, crfa, fono) =>
`ENCAMINHAMENTO MÉDICO
Data: ${new Date().toLocaleDateString('pt-BR')}

Paciente: ${patient}
Data de nascimento: [preencher]

Prezado(a) Doutor(a),

Encaminho o(a) paciente acima identificado(a) para avaliação médica complementar.

MOTIVO DO ENCAMINHAMENTO:
[Descreva o motivo clínico]

HIPÓTESE DIAGNÓSTICA FONOAUDIOLÓGICA:
[Descreva a hipótese]

ACHADOS CLÍNICOS RELEVANTES:
[Descreva os achados]

AVALIAÇÕES JÁ REALIZADAS:
• Avaliação fonoaudiológica — [data]
• [Outras avaliações já realizadas]

SOLICITAÇÕES ESPECÍFICAS:
• [Exames ou avaliações solicitadas]

Agradeço a atenção e coloco-me à disposição para troca de informações.

${fono}
${crfa}
[Telefone / E-mail]`,

  'encaminhamento-neuropediatra': (patient, crfa, fono) =>
`ENCAMINHAMENTO — NEUROPEDIATRIA
Data: ${new Date().toLocaleDateString('pt-BR')}

Paciente: ${patient}
Idade: [preencher] anos

Prezado(a) Neuropediatra,

Solicito avaliação neuropediátrica do(a) paciente ${patient}, acompanhado(a) em fonoaudiologia desde [data].

QUEIXA PRINCIPAL:
[Descreva a queixa]

HISTÓRICO FONOAUDIOLÓGICO:
[Descreva o histórico]

PERFIL COMUNICATIVO ATUAL:
• Compreensão: [descrever]
• Expressão oral: [descrever]
• Linguagem escrita: [descrever]
• Interação social: [descrever]
• Pragmática: [descrever]

HIPÓTESES DIAGNÓSTICAS:
[Liste as hipóteses — ex: TEA, TDAH, Síndrome específica]

INSTRUMENTOS UTILIZADOS NA AVALIAÇÃO:
• [Liste os protocolos/escalas aplicados]

SOLICITAÇÕES:
• Avaliação neurológica completa
• [Solicitações específicas — EEG, neuroimagem, etc.]

Aguardo retorno para elaboração conjunta do plano terapêutico.

${fono}
${crfa}`,

  'encaminhamento-psicologo': (patient, crfa, fono) =>
`ENCAMINHAMENTO — PSICOLOGIA
Data: ${new Date().toLocaleDateString('pt-BR')}

Paciente: ${patient}

Prezado(a) Psicólogo(a),

Encaminho o(a) paciente ${patient} para avaliação e acompanhamento psicológico complementar ao processo fonoaudiológico.

CONTEXTO CLÍNICO:
[Descreva o contexto]

ASPECTOS EMOCIONAIS/COMPORTAMENTAIS OBSERVADOS:
[Descreva os aspectos observados em sessão]

INTERFACE COM A FONOAUDIOLOGIA:
[Descreva como os aspectos psicológicos impactam a comunicação]

OBJETIVO DO ENCAMINHAMENTO:
[Descreva o que se espera da avaliação/acompanhamento]

Proponho trabalho integrado e troca de informações periódica.

${fono}
${crfa}`,

  'parecer-escola': (patient, crfa, fono) =>
`PARECER FONOAUDIOLÓGICO — USO ESCOLAR
Data: ${new Date().toLocaleDateString('pt-BR')}

Aluno(a): ${patient}
Instituição: [Nome da escola]
Ano/Série: [preencher]

I. IDENTIFICAÇÃO
${patient}, [idade] anos, em acompanhamento fonoaudiológico desde [data].

II. DIAGNÓSTICO
[Diagnóstico fonoaudiológico formal]

III. AVALIAÇÃO REALIZADA
[Instrumentos utilizados, datas]

IV. DESEMPENHO ATUAL
[Descrição objetiva do desempenho nas áreas avaliadas]

V. IMPACTO NO CONTEXTO ESCOLAR
[Como o diagnóstico impacta o aprendizado e a participação escolar]

VI. RECOMENDAÇÕES PEDAGÓGICAS
1. [Recomendação 1]
2. [Recomendação 2]
3. [Recomendação 3]
4. [Recomendação 4]

VII. ADAPTAÇÕES CURRICULARES SUGERIDAS
[Adaptações específicas — tempo ampliado, avaliação oral, etc.]

VIII. PROGNÓSTICO
[Prognóstico e perspectivas]

Este documento foi elaborado com base em avaliação clínica formal e se destina exclusivamente ao uso educacional do(a) paciente identificado(a), conforme Resolução CFFa nº 427/2013.

${fono}
Fonoaudióloga
${crfa}`,

  'relatorio-interdisciplinar': (patient, crfa, fono) =>
`RELATÓRIO INTERDISCIPLINAR
Data: ${new Date().toLocaleDateString('pt-BR')}

PACIENTE: ${patient}
PERÍODO DO RELATÓRIO: [data início] a ${new Date().toLocaleDateString('pt-BR')}

EQUIPE ENVOLVIDA:
• Fonoaudiologia: ${fono} — ${crfa}
• [Outros profissionais]

I. OBJETIVO DO RELATÓRIO
[Descreva o motivo da elaboração]

II. HISTÓRICO E DIAGNÓSTICO
[Histórico clínico e diagnósticos de cada área]

III. EVOLUÇÃO POR ÁREA

FONOAUDIOLOGIA:
[Evolução, objetivos atingidos, objetivos em andamento]

[PSICOLOGIA / TERAPIA OCUPACIONAL / NEUROPEDIATRIA]:
[Evolução em cada área — preencher com informações das equipes]

IV. OBJETIVOS COMUNS
[Metas compartilhadas entre as equipes]

V. CONCLUSÃO E RECOMENDAÇÕES
[Conclusões e próximos passos]

Documento elaborado em conjunto pela equipe multiprofissional.

${fono}
${crfa}`,
}

// ── Config ────────────────────────────────────────────────────────────────────

const DOC_CFG: Record<DocType, { label: string; icon: string; color: string; desc: string }> = {
  'encaminhamento-escola':          { label: 'Encaminhamento Escolar',       icon: 'school',         color: 'text-info    bg-info/10    border-info/20',    desc: 'Orientações ao ambiente educacional' },
  'encaminhamento-medico':          { label: 'Encaminhamento Médico',        icon: 'medical_services',color: 'text-danger  bg-danger/10  border-danger/20',  desc: 'Referência para médico clínico ou especialista' },
  'encaminhamento-neuropediatra':   { label: 'Encaminhamento Neuropediatra', icon: 'neurology',      color: 'text-warning bg-warning/10 border-warning/20', desc: 'Solicitação de avaliação neurológica' },
  'encaminhamento-psicologo':       { label: 'Encaminhamento Psicologia',    icon: 'psychology',     color: 'text-olive   bg-neon/10    border-neon/20',    desc: 'Referência para avaliação/acompanhamento psi' },
  'parecer-escola':                 { label: 'Parecer Escolar',              icon: 'description',    color: 'text-success bg-success/10 border-success/20', desc: 'Documento formal para uso pedagógico' },
  'relatorio-interdisciplinar':     { label: 'Relatório Interdisciplinar',   icon: 'groups',         color: 'text-text-secondary bg-surface-low border-border', desc: 'Síntese multiprofissional conjunta' },
}

const STATUS_CFG: Record<DocStatus, { label: string; color: string }> = {
  rascunho:   { label: 'Rascunho',   color: 'text-text-tertiary bg-surface-low' },
  finalizado: { label: 'Finalizado', color: 'text-olive bg-neon/10'             },
  enviado:    { label: 'Enviado ✓',  color: 'text-success bg-success-surface'   },
}

const INITIAL_DOCS: Document[] = []

// ── Modal: Novo Documento ─────────────────────────────────────────────────────

function NewDocModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (doc: Document) => void
}) {
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [selectedType, setSelectedType] = useState<DocType | null>(null)
  const [form, setForm] = useState({ patientName: '', destinatario: '' })
  const fono  = '[Nome do(a) profissional]'
  const crfa  = '[CRFa]'

  function handleCreate() {
    if (!selectedType || !form.patientName.trim()) return
    const content = TEMPLATES[selectedType](form.patientName, crfa, fono)
    onSave({
      id: String(Date.now()),
      type: selectedType,
      patientName: form.patientName.trim(),
      destinatario: form.destinatario.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'rascunho',
      content,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-surface w-full max-w-2xl shadow-[var(--shadow-dark)] overflow-hidden my-4">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border">
          <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">
            Novo Documento — {step === 'type' ? 'Selecionar tipo' : 'Dados'}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {step === 'type' ? (
          <div className="p-6 flex flex-col gap-3">
            <p className="text-xs text-text-secondary">Escolha o tipo de documento a gerar:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(DOC_CFG) as [DocType, typeof DOC_CFG[DocType]][]).map(([type, cfg]) => (
                <button key={type}
                  onClick={() => { setSelectedType(type); setStep('details') }}
                  className={`flex items-start gap-3 p-4 rounded border text-left transition-all hover:shadow-sm ${cfg.color}`}
                >
                  <span className="material-symbols-outlined text-lg mt-0.5 shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>{cfg.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-text-primary">{cfg.label}</p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">{cfg.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">
            {selectedType && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded border text-sm font-semibold ${DOC_CFG[selectedType].color}`}>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>{DOC_CFG[selectedType].icon}</span>
                {DOC_CFG[selectedType].label}
              </div>
            )}
            <div>
              <label className="section-label block mb-1.5">Nome do paciente *</label>
              <input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                placeholder="Nome completo" className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Destinatário / Instituição</label>
              <input value={form.destinatario} onChange={e => setForm(f => ({ ...f, destinatario: e.target.value }))}
                placeholder="Ex: Colégio ABC, Dr. João Silva..." className="input w-full" />
            </div>
            <p className="text-[10px] text-text-tertiary">
              O documento será pré-preenchido com um template baseado no tipo selecionado. Você poderá editar todo o conteúdo antes de finalizar.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep('type')} className="btn-outline flex-1">← Voltar</button>
              <button onClick={handleCreate} disabled={!form.patientName.trim()} className="btn-primary flex-1">
                Criar documento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Editor de documento ───────────────────────────────────────────────────────

function DocEditor({ doc, onClose, onUpdate }: {
  doc: Document
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Document>) => void
}) {
  const [content, setContent] = useState(doc.content)
  const [status, setStatus]   = useState<DocStatus>(doc.status)
  const cfg = DOC_CFG[doc.type]

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>${cfg.label} — ${doc.patientName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 2cm; line-height: 1.6; color: #000; }
        pre { white-space: pre-wrap; font-family: inherit; }
        @media print { body { margin: 1.5cm; } }
      </style></head>
      <body><pre>${content}</pre></body></html>
    `)
    win.document.close()
    win.print()
  }

  function handleSave() {
    onUpdate(doc.id, { content, status })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-dark border-b border-dark-border shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <p className="font-display font-bold text-xs uppercase tracking-widest text-neon">{cfg.label}</p>
            <p className="text-[10px] text-white/50">{doc.patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status toggle */}
          <div className="flex rounded border border-dark-border overflow-hidden">
            {(['rascunho', 'finalizado', 'enviado'] as DocStatus[]).map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  status === s ? 'bg-neon text-dark' : 'text-white/40 hover:text-white'
                }`}>
                {STATUS_CFG[s].label}
              </button>
            ))}
          </div>
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs">
            <span className="material-symbols-outlined text-sm">print</span>
            PDF
          </button>
          <button onClick={handleSave} className="btn-primary text-xs">
            Salvar
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden flex">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="flex-1 resize-none p-8 font-mono text-sm text-text-primary bg-surface focus:outline-none leading-relaxed"
          spellCheck={false}
          placeholder="Conteúdo do documento..."
        />
      </div>

      {/* Footer hint */}
      <div className="px-5 py-2 bg-surface-low border-t border-border-soft shrink-0 flex items-center justify-between">
        <p className="text-[10px] text-text-tertiary">Edite livremente — os campos entre colchetes [  ] devem ser preenchidos manualmente.</p>
        <p className="text-[10px] text-text-tertiary">{content.length} caracteres</p>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function EncaminhamentosPage() {
  const [docs, setDocs]       = useState<Document[]>(INITIAL_DOCS)
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<Document | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType]     = useState<string>('all')
  const [search, setSearch]             = useState('')

  function handleSave(doc: Document) {
    setDocs(prev => [doc, ...prev])
  }

  function handleUpdate(id: string, patch: Partial<Document>) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))
  }

  const filtered = docs.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    if (filterType   !== 'all' && d.type   !== filterType)   return false
    if (search && !d.patientName.toLowerCase().includes(search.toLowerCase()) &&
        !d.destinatario.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (editing) {
    return <DocEditor doc={editing} onClose={() => setEditing(null)} onUpdate={handleUpdate} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {showNew && <NewDocModal onClose={() => setShowNew(false)} onSave={handleSave} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">
            Encaminhamentos
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Templates prontos para escola, médico, neuropediatra e psicólogo
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Documento
        </button>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: docs.length,                              icon: 'folder_open', color: 'text-text-primary' },
          { label: 'Finalizados', value: docs.filter(d => d.status !== 'rascunho').length, icon: 'check_circle', color: 'text-success' },
          { label: 'Rascunhos',   value: docs.filter(d => d.status === 'rascunho').length,  icon: 'edit_note',   color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex flex-col gap-1.5">
            <span className={`material-symbols-outlined text-lg ${s.color}`} style={{ fontVariationSettings: '"FILL" 1' }}>{s.icon}</span>
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tipos de template disponíveis */}
      <div className="card p-4 flex flex-col gap-3">
        <p className="section-label">Templates disponíveis</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(DOC_CFG) as [DocType, typeof DOC_CFG[DocType]][]).map(([, cfg]) => (
            <div key={cfg.label} className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded border ${cfg.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: '"FILL" 1' }}>{cfg.icon}</span>
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por paciente ou destinatário..."
            className="input w-full pl-9"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input">
          <option value="all">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="finalizado">Finalizado</option>
          <option value="enviado">Enviado</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input">
          <option value="all">Todos os tipos</option>
          {(Object.entries(DOC_CFG) as [DocType, typeof DOC_CFG[DocType]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Lista de documentos */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">send</span>
          </div>
          <p className="empty-state__title">Nenhum documento encontrado</p>
          <p className="empty-state__desc">Gere encaminhamentos, atestados e relatórios para a rede de cuidado dos seus pacientes.</p>
          <div className="empty-state__actions">
            <button onClick={() => setShowNew(true)} className="bk-btn bk-btn-primary">Criar primeiro documento</button>
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {/* Header da tabela */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-surface-low border-b border-border-soft">
            {['Tipo', 'Paciente', 'Destinatário', 'Data', 'Status', ''].map(h => (
              <p key={h} className="section-label">{h}</p>
            ))}
          </div>

          <div className="divide-y divide-border-soft">
            {filtered.map(doc => {
              const cfg    = DOC_CFG[doc.type]
              const status = STATUS_CFG[doc.status]
              return (
                <div key={doc.id}
                  className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-1.5 sm:gap-4 sm:items-center px-5 py-4 hover:bg-surface-low transition-colors">
                  {/* Tipo */}
                  <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded border self-start sm:self-auto ${cfg.color}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '11px', fontVariationSettings: '"FILL" 1' }}>{cfg.icon}</span>
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </div>
                  {/* Paciente */}
                  <p className="text-sm font-bold text-text-primary truncate">{doc.patientName}</p>
                  {/* Destinatário */}
                  <p className="text-xs text-text-tertiary truncate">{doc.destinatario || '—'}</p>
                  {/* Data */}
                  <p className="text-xs text-text-tertiary whitespace-nowrap">
                    {new Date(doc.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                  {/* Status */}
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded self-start sm:self-auto ${status.color}`}>
                    {status.label}
                  </span>
                  {/* Ação */}
                  <button
                    onClick={() => setEditing(doc)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-olive hover:text-dark transition-colors self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                    Editar
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Nota legal */}
      <div className="flex items-start gap-2 text-[10px] text-text-tertiary leading-relaxed">
        <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
        <p>Os documentos gerados seguem as diretrizes da Resolução CFFa nº 427/2013. O profissional é responsável pela veracidade e adequação das informações inseridas antes da emissão e envio.</p>
      </div>
    </div>
  )
}
