import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/laudos')({
  component: LaudosPage,
})

type LaudoType = 'alta' | 'evolucao' | 'parecer' | 'avaliacao'

interface Laudo {
  id: string
  type: LaudoType
  patient: string
  date: string
  status: 'draft' | 'signed' | 'delivered'
}

const TYPE_LABELS: Record<LaudoType, string> = {
  alta: 'Relatório de Alta', evolucao: 'Relatório de Evolução',
  parecer: 'Parecer Fonoaudiológico', avaliacao: 'Relatório de Avaliação',
}

const TYPE_ICONS: Record<LaudoType, string> = {
  alta: 'task_alt', evolucao: 'trending_up', parecer: 'description', avaliacao: 'assignment',
}

const INITIAL_LAUDOS: Laudo[] = []

const STATUS_LABEL = { draft: 'Rascunho', signed: 'Assinado', delivered: 'Entregue' }
const STATUS_COLOR = { draft: 'bg-warning-surface text-warning', signed: 'bg-info-surface text-info', delivered: 'bg-success-surface text-success' }

const TEMPLATES: Record<LaudoType, string> = {
  evolucao: `RELATÓRIO DE EVOLUÇÃO FONOAUDIOLÓGICA
Resolução CFFa nº 427/2013

Paciente: ___________________________  CID: ____________
Data de nascimento: __________________  Convênio: ________
Período: de ____________ a ____________

DADOS DO ATENDIMENTO:
Número de sessões realizadas: ________
Frequência: ________  Modalidade: ( ) Presencial  ( ) Teleconsulta

QUADRO INICIAL:
[Descrever condição inicial do paciente, queixa principal e hipótese diagnóstica]

EVOLUÇÃO CLÍNICA:
[Descrever progresso observado durante o período de atendimento, incluindo aspectos quantitativos e qualitativos]

OBJETIVOS ALCANÇADOS:
□ _______________________________________________
□ _______________________________________________
□ _______________________________________________

CONDUTA ATUAL:
( ) Continuação do tratamento
( ) Alta fonoaudiológica
( ) Encaminhamento: _____________________________

OBSERVAÇÕES:
[Informações complementares relevantes]

Responsável técnico: _____________________________
CFFa: __________________________________________
Data: __________________________________________
Assinatura: ____________________________________`,

  avaliacao: `RELATÓRIO DE AVALIAÇÃO FONOAUDIOLÓGICA
Resolução CFFa nº 427/2013

Paciente: ___________________________  Data de nasc.: ________
Responsável: ________________________  Contato: _____________
Data da avaliação: ___________________  Nº sessões: __________

MOTIVO DO ENCAMINHAMENTO:
[Descrever a queixa principal e o profissional que encaminhou]

ANAMNESE:
História pregressa: [Gestação, nascimento, marcos do desenvolvimento]

AVALIAÇÃO:
[Descrever instrumentos e achados clínicos por domínio avaliado]

HIPÓTESE DIAGNÓSTICA:
CID-10: ________  Descrição: _______________________________

PROGNÓSTICO:
( ) Favorável  ( ) Reservado  ( ) Desfavorável
Justificativa: ___________________________________________

CONDUTAS PROPOSTAS:
□ Fonoterapia — frequência sugerida: ______________________
□ Orientação familiar
□ Encaminhamento: _______________________________________

Responsável técnico: _____________________________
CFFa: __________________________________________`,

  parecer: `PARECER FONOAUDIOLÓGICO
Resolução CFFa nº 427/2013

À [Destinatário]:

Paciente: ___________________________
CID-10: ____________

Venho por meio deste parecer informar sobre o quadro fonoaudiológico do(a) paciente acima identificado(a), em atendimento neste serviço desde ____________.

SÍNTESE CLÍNICA:
[Descrição objetiva do quadro e evolução]

CONCLUSÃO:
[Parecer técnico conclusivo com recomendações]

Permanecemos à disposição para esclarecimentos.

Atenciosamente,
Responsável técnico: _____________________________
CFFa: __________________________________________
Data: __________________________________________`,

  alta: `RELATÓRIO DE ALTA FONOAUDIOLÓGICA
Resolução CFFa nº 427/2013

Paciente: ___________________________  Data de nasc.: ________
CID-10: ____________  Período: de _________ a _________
Número de sessões: ________

MOTIVO DO ENCAMINHAMENTO:
[Descrição inicial da queixa]

CONDIÇÃO NA ALTA:
[Descrição detalhada da condição na alta, comparando com estado inicial]

OBJETIVOS ALCANÇADOS:
□ _______________________________________________
□ _______________________________________________

ORIENTAÇÕES PARA MANUTENÇÃO:
[Instruções para o paciente e família após a alta]

RETORNO SE NECESSÁRIO:
( ) Sim — em caso de: _______________________________
( ) Não indicado

Responsável técnico: _____________________________
CFFa: __________________________________________
Data: __________________________________________
Assinatura: ____________________________________`,
}

function LaudosPage() {
  const [laudos, setLaudos] = useState<Laudo[]>(INITIAL_LAUDOS)
  const [editing, setEditing] = useState<Laudo | null>(null)
  const [draft, setDraft] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ type: 'evolucao' as LaudoType, patient: '' })

  function openLaudo(l: Laudo) {
    setEditing(l)
    setDraft(TEMPLATES[l.type])
  }

  function sign(id: string) {
    setLaudos(prev => prev.map(l => l.id === id ? {...l, status: 'signed'} : l))
    setEditing(null)
  }

  function createNew() {
    const l: Laudo = {
      id: Date.now().toString(),
      type: newForm.type, patient: newForm.patient,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
    }
    setLaudos(prev => [l, ...prev])
    setShowNew(false)
    setEditing(l)
    setDraft(TEMPLATES[newForm.type])
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-surface-low transition-colors">
            <span className="material-symbols-outlined text-text-tertiary">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg uppercase tracking-wider text-text-primary">{TYPE_LABELS[editing.type]}</h1>
            <p className="text-xs text-text-tertiary">{editing.patient} · {new Date(editing.date+'T00:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-outline flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              PDF
            </button>
            {editing.status === 'draft' && (
              <button onClick={() => sign(editing.id)} className="btn-primary flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings:'"FILL" 1' }}>verified</span>
                Assinar digitalmente
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-2.5 bg-neon-surface border border-border-neon flex items-center gap-2 text-xs">
          <span className="material-symbols-outlined text-sm text-olive" style={{ fontVariationSettings:'"FILL" 1' }}>verified_user</span>
          <span className="text-text-primary font-medium">Template baseado na Resolução CFFa nº 427/2013</span>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 bg-dark border-b border-dark-border flex items-center justify-between">
            <p className="font-display font-bold text-xs uppercase tracking-widest text-neon">{TYPE_LABELS[editing.type]}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${STATUS_COLOR[editing.status]}`}>
              {STATUS_LABEL[editing.status]}
            </span>
          </div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={28}
            className="w-full p-6 text-sm text-text-primary leading-relaxed bg-surface outline-none resize-none font-mono"
            readOnly={editing.status === 'signed' || editing.status === 'delivered'}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface w-full max-w-md shadow-[var(--shadow-dark)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-dark">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Novo Laudo</h2>
              <button onClick={() => setShowNew(false)} className="text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="section-label block mb-1.5">Tipo de laudo</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(TYPE_LABELS) as [LaudoType, string][]).map(([k, v]) => (
                    <button key={k} onClick={() => setNewForm(f=>({...f,type:k}))}
                      className={`flex items-center gap-2 px-3 py-2.5 border text-left text-xs font-bold transition-colors ${
                        newForm.type === k ? 'bg-neon-surface border-border-neon text-olive' : 'border-border-soft text-text-tertiary hover:border-border'
                      }`}>
                      <span className="material-symbols-outlined text-sm">{TYPE_ICONS[k]}</span>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="section-label block mb-1.5">Paciente</label>
                <input value={newForm.patient} onChange={e => setNewForm(f=>({...f,patient:e.target.value}))} className="input w-full" placeholder="Nome do paciente" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="flex-1 btn-outline">Cancelar</button>
                <button onClick={createNew} disabled={!newForm.patient.trim()} className="flex-1 btn-primary disabled:opacity-50">Criar laudo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Laudos</h1>
          <p className="text-sm text-text-secondary mt-0.5">Templates CFoF · PDF · Assinatura digital</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Laudo
        </button>
      </div>

      {/* Tipos de laudo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(TYPE_LABELS) as [LaudoType, string][]).map(([k, v]) => (
          <button
            key={k}
            onClick={() => { setNewForm({type:k, patient:''}); setShowNew(true) }}
            className="card p-4 flex flex-col gap-3 hover:border-border text-left transition-colors"
          >
            <span className="material-symbols-outlined text-2xl text-text-tertiary">{TYPE_ICONS[k]}</span>
            <p className="text-sm font-bold text-text-primary leading-snug">{v}</p>
            <p className="text-[10px] text-text-tertiary">Resolução CFFa nº 427/2013</p>
          </button>
        ))}
      </div>

      {/* Lista de laudos */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-soft">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Laudos recentes</p>
        </div>
        <div className="divide-y divide-border-soft">
          {laudos.map(l => (
            <button
              key={l.id}
              onClick={() => openLaudo(l)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-xl text-text-tertiary">{TYPE_ICONS[l.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">{TYPE_LABELS[l.type]}</p>
                <p className="text-xs text-text-tertiary">{l.patient}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">{new Date(l.date+'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 ${STATUS_COLOR[l.status]}`}>
                  {STATUS_LABEL[l.status]}
                </span>
                <span className="material-symbols-outlined text-sm text-text-secondary">chevron_right</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
