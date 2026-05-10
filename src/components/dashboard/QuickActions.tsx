import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTodayAppointments, usePendingReports } from '@/hooks/use-dashboard'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ModalId = 'novo-paciente' | 'agendar' | 'relatorio' | 'financeiro' | 'caa' | 'biblioteca' | 'marketing' | 'tarefas' | null

// ── Overlay base ──────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, subtitle, icon, children, wide }: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon: string
  children: React.ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={`relative z-10 bg-surface border border-border-soft rounded shadow-2xl flex flex-col max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-soft flex-shrink-0">
          <div className="w-9 h-9 rounded bg-dark flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-neon text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>{icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary leading-tight">{title}</p>
            {subtitle && <p className="text-[10px] text-text-tertiary mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Modal: Novo Paciente ──────────────────────────────────────────────────────

function ModalNovoPaciente({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nome: '', nascimento: '', telefone: '', email: '',
    responsavel: '', diagnostico: '', plano: '', observacoes: '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function handleClose() { setStep(1); setForm({ nome:'',nascimento:'',telefone:'',email:'',responsavel:'',diagnostico:'',plano:'',observacoes:'' }); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Novo Paciente" subtitle="Cadastro rápido" icon="person_add">
      <div className="p-5 flex flex-col gap-4">
        {/* Steps */}
        <div className="flex gap-2">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${step >= s ? 'bg-olive' : 'bg-surface-high'}`} />
          ))}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
          Etapa {step} de 2 — {step === 1 ? 'Dados pessoais' : 'Informações clínicas'}
        </p>

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">Nome completo *</label>
              <input className="input w-full" placeholder="Ex: Ana Beatriz Souza" value={form.nome} onChange={set('nome')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Data de nascimento</label>
                <input className="input w-full" type="date" value={form.nascimento} onChange={set('nascimento')} />
              </div>
              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input className="input w-full" placeholder="(11) 99999-0000" value={form.telefone} onChange={set('telefone')} />
              </div>
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input w-full" type="email" placeholder="paciente@email.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Responsável (se menor)</label>
              <input className="input w-full" placeholder="Nome do responsável" value={form.responsavel} onChange={set('responsavel')} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">Hipótese diagnóstica</label>
              <select className="input w-full" value={form.diagnostico} onChange={set('diagnostico')}>
                <option value="">Selecionar...</option>
                <option>Gagueira / Fluência</option>
                <option>Disfonia / Alteração vocal</option>
                <option>Disfagia / Alteração de deglutição</option>
                <option>TEA — Transtorno do Espectro Autista</option>
                <option>Atraso de linguagem</option>
                <option>Atraso de fala</option>
                <option>Perda auditiva</option>
                <option>CAA — Comunicação Aumentativa</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="label">Plano / Convênio</label>
              <select className="input w-full" value={form.plano} onChange={set('plano')}>
                <option value="">Selecionar...</option>
                <option>Particular</option>
                <option>Unimed</option>
                <option>Bradesco Saúde</option>
                <option>Amil</option>
                <option>SulAmérica</option>
                <option>APAE</option>
                <option>Outro convênio</option>
              </select>
            </div>
            <div>
              <label className="label">Observações iniciais</label>
              <textarea className="input w-full resize-none" rows={3} placeholder="Queixas, histórico relevante, encaminhamento..." value={form.observacoes} onChange={set('observacoes')} />
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="btn-ghost flex-1">Voltar</button>
          )}
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!form.nome}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          ) : (
            <>
              <Link to="/dashboard/pacientes" onClick={handleClose} className="btn-primary flex-1 text-center">
                Salvar e ver pacientes
              </Link>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ── Modal: Agendar ────────────────────────────────────────────────────────────

function ModalAgendar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    paciente: '', data: '', hora: '', duracao: '50', modalidade: 'presencial', observacao: '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const PACIENTES: string[] = []
  const HORARIOS  = ['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00']

  function handleClose() { setForm({ paciente:'',data:'',hora:'',duracao:'50',modalidade:'presencial',observacao:'' }); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Agendar Sessão" subtitle="Nova consulta na agenda" icon="event">
      <div className="p-5 flex flex-col gap-4">
        <div>
          <label className="label">Paciente *</label>
          <select className="input w-full" value={form.paciente} onChange={set('paciente')}>
            <option value="">Selecionar paciente...</option>
            {PACIENTES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Data *</label>
            <input className="input w-full" type="date" value={form.data} onChange={set('data')} />
          </div>
          <div>
            <label className="label">Horário *</label>
            <select className="input w-full" value={form.hora} onChange={set('hora')}>
              <option value="">Selecionar...</option>
              {HORARIOS.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Duração</label>
            <select className="input w-full" value={form.duracao} onChange={set('duracao')}>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="50">50 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </div>
          <div>
            <label className="label">Modalidade</label>
            <select className="input w-full" value={form.modalidade} onChange={set('modalidade')}>
              <option value="presencial">Presencial</option>
              <option value="teleconsulta">Teleconsulta</option>
              <option value="domiciliar">Domiciliar</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Observação</label>
          <textarea className="input w-full resize-none" rows={2} placeholder="Instruções especiais, materiais necessários..." value={form.observacao} onChange={set('observacao')} />
        </div>

        {/* Preview */}
        {form.paciente && form.data && form.hora && (
          <div className="flex items-center gap-3 px-4 py-3 bg-neon-surface border border-olive/20 rounded">
            <span className="material-symbols-outlined text-olive" style={{ fontVariationSettings: '"FILL" 1' }}>event_available</span>
            <div>
              <p className="text-xs font-bold text-olive">{form.paciente}</p>
              <p className="text-[10px] text-text-tertiary">
                {new Date(form.data + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' '}às {form.hora} · {form.duracao} min · {form.modalidade}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleClose} className="btn-ghost flex-1">Cancelar</button>
          <Link
            to="/dashboard/agenda"
            onClick={handleClose}
            className={`btn-primary flex-1 text-center ${(!form.paciente || !form.data || !form.hora) ? 'pointer-events-none opacity-40' : ''}`}
          >
            Confirmar agendamento
          </Link>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal: Relatório ──────────────────────────────────────────────────────────

function ModalRelatorio({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tipo, setTipo] = useState<'sessao' | 'evolucao' | 'alta' | 'encaminhamento'>('sessao')
  const [paciente, setPaciente] = useState('')
  const [conteudo, setConteudo] = useState('')

  const TIPOS = [
    { id: 'sessao',         label: 'Relatório de Sessão',     icon: 'description',       desc: 'Registro da sessão clínica com evolução e objetivos' },
    { id: 'evolucao',       label: 'Relatório de Evolução',   icon: 'trending_up',       desc: 'Progresso do paciente ao longo do período' },
    { id: 'alta',           label: 'Relatório de Alta',       icon: 'task_alt',          desc: 'Conclusão do processo terapêutico' },
    { id: 'encaminhamento', label: 'Encaminhamento',          icon: 'forward_to_inbox',  desc: 'Encaminhamento para outro profissional ou especialidade' },
  ] as const

  const PACIENTES: string[] = []

  const TEMPLATES: Record<typeof tipo, string> = {
    sessao: 'Paciente compareceu à sessão de fonoaudiologia. Durante o atendimento foram trabalhados os objetivos propostos no plano terapêutico. Observou-se...\n\nTécnicas utilizadas:\n- \n\nEvolução:\n\nObjetivos para próxima sessão:\n',
    evolucao: 'Paciente em acompanhamento fonoaudiológico desde ___. Evolução observada no período:\n\nÁreas trabalhadas:\n- \n\nResultados alcançados:\n\nAjustes no plano terapêutico:\n',
    alta: 'Paciente recebeu alta fonoaudiológica após alcançar os objetivos terapêuticos estabelecidos.\n\nObjetivos alcançados:\n- \n\nOrientações finais:\n\nRecomendações de acompanhamento:\n',
    encaminhamento: 'Encaminho o(a) paciente ___ para avaliação/acompanhamento com ___.\n\nMotivo do encaminhamento:\n\nHistórico relevante:\n\nHipótese diagnóstica:\n',
  }

  function handleClose() { setTipo('sessao'); setPaciente(''); setConteudo(''); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Novo Relatório" subtitle="Gerar com IA ou escrever manualmente" icon="description" wide>
      <div className="p-5 flex flex-col gap-4">
        {/* Tipo */}
        <div>
          <label className="label">Tipo de relatório</label>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map(t => (
              <button key={t.id} onClick={() => { setTipo(t.id); setConteudo('') }}
                className={`flex items-start gap-2 px-3 py-2.5 rounded border text-left transition-colors ${
                  tipo === t.id ? 'border-olive bg-neon-surface' : 'border-border-soft bg-surface hover:bg-surface-high'
                }`}>
                <span className={`material-symbols-outlined text-sm mt-0.5 flex-shrink-0 ${tipo === t.id ? 'text-olive' : 'text-text-tertiary'}`} style={{ fontVariationSettings: '"FILL" 1' }}>{t.icon}</span>
                <div>
                  <p className={`text-[11px] font-bold leading-tight ${tipo === t.id ? 'text-olive' : 'text-text-primary'}`}>{t.label}</p>
                  <p className="text-[9px] text-text-tertiary mt-0.5 leading-snug">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Paciente */}
        <div>
          <label className="label">Paciente</label>
          <select className="input w-full" value={paciente} onChange={e => setPaciente(e.target.value)}>
            <option value="">Selecionar paciente...</option>
            {PACIENTES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Botão gerar com IA */}
        <button
          onClick={() => setConteudo(TEMPLATES[tipo])}
          className="flex items-center gap-2 px-4 py-2.5 rounded border border-olive/30 bg-neon-surface text-olive text-xs font-bold uppercase tracking-wide hover:bg-neon/20 transition-colors"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
          Gerar estrutura com IA
        </button>

        {/* Conteúdo */}
        <div>
          <label className="label">Conteúdo</label>
          <textarea
            className="input w-full resize-none font-mono text-[11px]"
            rows={8}
            placeholder="Escreva ou gere com IA acima..."
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleClose} className="btn-ghost flex-1">Cancelar</button>
          <Link to="/dashboard/relatorios" onClick={handleClose} className="btn-primary flex-1 text-center">
            Salvar relatório
          </Link>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal: Financeiro ─────────────────────────────────────────────────────────

function ModalFinanceiro({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'receita' | 'despesa'>('receita')
  const [form, setForm] = useState({ descricao: '', valor: '', data: '', categoria: '', paciente: '', forma: 'pix' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const CATS_RECEITA  = ['Consulta particular','Plano de saúde','Avaliação','Teleconsulta','Pacote de sessões','Outro']
  const CATS_DESPESA  = ['Aluguel/consultório','Materiais clínicos','Software/assinatura','Cursos e capacitação','Publicidade','Imposto/contador','Outro']
  const PACIENTES: string[]    = []

  function handleClose() { setForm({ descricao:'',valor:'',data:'',categoria:'',paciente:'',forma:'pix' }); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Lançamento Financeiro" subtitle="Registrar receita ou despesa" icon="payments">
      <div className="p-5 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex rounded overflow-hidden border border-border-soft">
          <button onClick={() => setTab('receita')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${tab === 'receita' ? 'bg-success text-white' : 'bg-surface text-text-tertiary hover:bg-surface-high'}`}>
            <span className="material-symbols-outlined text-sm">arrow_downward</span> Receita
          </button>
          <button onClick={() => setTab('despesa')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${tab === 'despesa' ? 'bg-danger text-white' : 'bg-surface text-text-tertiary hover:bg-surface-high'}`}>
            <span className="material-symbols-outlined text-sm">arrow_upward</span> Despesa
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Valor (R$) *</label>
            <input className="input w-full" type="number" placeholder="0,00" min="0" step="0.01" value={form.valor} onChange={set('valor')} />
          </div>
          <div>
            <label className="label">Data *</label>
            <input className="input w-full" type="date" value={form.data} onChange={set('data')} />
          </div>
        </div>

        <div>
          <label className="label">Descrição</label>
          <input className="input w-full" placeholder={tab === 'receita' ? 'Ex: Sessão — Ana Beatriz' : 'Ex: Renovação Canva Pro'} value={form.descricao} onChange={set('descricao')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Categoria</label>
            <select className="input w-full" value={form.categoria} onChange={set('categoria')}>
              <option value="">Selecionar...</option>
              {(tab === 'receita' ? CATS_RECEITA : CATS_DESPESA).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Forma de pagamento</label>
            <select className="input w-full" value={form.forma} onChange={set('forma')}>
              <option value="pix">PIX</option>
              <option value="credito">Cartão de crédito</option>
              <option value="debito">Cartão de débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="transferencia">Transferência</option>
              <option value="convenio">Convênio</option>
            </select>
          </div>
        </div>

        {tab === 'receita' && (
          <div>
            <label className="label">Paciente vinculado</label>
            <select className="input w-full" value={form.paciente} onChange={set('paciente')}>
              <option value="">Nenhum / avulso</option>
              {PACIENTES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleClose} className="btn-ghost flex-1">Cancelar</button>
          <Link to="/dashboard/financeiro" onClick={handleClose} className="btn-primary flex-1 text-center">
            Salvar lançamento
          </Link>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal: Painel CAA ─────────────────────────────────────────────────────────

function ModalCAA({ open, onClose }: { open: boolean; onClose: () => void }) {
  const PICTOGRAMAS = [
    { label: 'Comer',     icon: '🍽️' }, { label: 'Beber',     icon: '🥤' },
    { label: 'Banheiro',  icon: '🚽' }, { label: 'Dormir',    icon: '😴' },
    { label: 'Dói',       icon: '🤕' }, { label: 'Feliz',     icon: '😊' },
    { label: 'Triste',    icon: '😢' }, { label: 'Ajuda',     icon: '🙋' },
    { label: 'Não',       icon: '❌' }, { label: 'Sim',       icon: '✅' },
    { label: 'Quero',     icon: '🤲' }, { label: 'Brincar',   icon: '🎮' },
  ]
  const [frase, setFrase] = useState<string[]>([])

  return (
    <Modal open={open} onClose={onClose} title="Painel CAA" subtitle="Comunicação Aumentativa e Alternativa" icon="grid_view" wide>
      <div className="p-5 flex flex-col gap-4">
        {/* Frase construída */}
        <div className="min-h-[48px] px-4 py-3 bg-surface-low border border-border-soft rounded flex items-center gap-2 flex-wrap">
          {frase.length === 0
            ? <p className="text-xs text-text-tertiary">Toque nos pictogramas para construir a frase...</p>
            : frase.map((p, i) => (
                <span key={i} className="px-2 py-1 bg-neon-surface text-olive text-xs font-bold rounded">{p}</span>
              ))
          }
        </div>

        {/* Controles */}
        <div className="flex gap-2">
          <button onClick={() => setFrase(f => f.slice(0, -1))} disabled={frase.length === 0}
            className="btn-ghost text-xs disabled:opacity-40 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">backspace</span> Apagar
          </button>
          <button onClick={() => setFrase([])} disabled={frase.length === 0}
            className="btn-ghost text-xs disabled:opacity-40 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">clear_all</span> Limpar
          </button>
          <button
            onClick={() => { if (frase.length > 0) window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(frase.join(' ')), { lang: 'pt-BR' })) }}
            disabled={frase.length === 0}
            className="btn-primary text-xs disabled:opacity-40 flex items-center gap-1 ml-auto">
            <span className="material-symbols-outlined text-sm">volume_up</span> Falar
          </button>
        </div>

        {/* Grade */}
        <div className="grid grid-cols-4 gap-2">
          {PICTOGRAMAS.map(p => (
            <button key={p.label} onClick={() => setFrase(f => [...f, p.label])}
              className="flex flex-col items-center gap-1.5 p-3 rounded border border-border-soft bg-surface hover:bg-neon-surface hover:border-olive/30 transition-colors">
              <span className="text-2xl">{p.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">{p.label}</span>
            </button>
          ))}
        </div>

        <Link to="/dashboard/caa" onClick={onClose} className="flex items-center justify-center gap-2 text-xs font-bold text-olive hover:underline">
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Abrir Painel CAA completo
        </Link>
      </div>
    </Modal>
  )
}

// ── Modal: Biblioteca ─────────────────────────────────────────────────────────

function ModalBiblioteca({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [loading, setLoading] = useState(false)

  type Ref = { title: string; area: string; year: number; type: string; typeColor: string }
  // REFS — consumir de hook real (useLibraryRefs) quando backend disponível
  const REFS: Ref[] = []

  const filtered = REFS.filter(r =>
    query === '' || r.title.toLowerCase().includes(query.toLowerCase()) || r.area.toLowerCase().includes(query.toLowerCase())
  )

  function handleAsk() {
    if (!chatInput.trim() || loading) return
    setLoading(true)
    setChatReply('')
    // TODO: integrar com endpoint de IA do backend
    setTimeout(() => {
      setChatReply('Assistente de estudos disponível em breve. Acesse a Biblioteca para consultar as referências cadastradas.')
      setLoading(false)
    }, 600)
  }

  function handleClose() { setQuery(''); setChatInput(''); setChatReply(''); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Biblioteca Clínica" subtitle="Referências e assistente de estudos" icon="library_books" wide>
      <div className="p-5 flex flex-col gap-4">

        {/* Chat rápido */}
        <div className="flex flex-col gap-2 p-4 bg-dark rounded">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neon">Assistente de estudos</p>
          <div className="flex gap-2">
            <input className="input flex-1 text-xs bg-white/10 border-white/10 text-white placeholder:text-white/30"
              placeholder="Pergunte sobre qualquer tema clínico..."
              value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAsk() }}
            />
            <button onClick={handleAsk} disabled={!chatInput.trim() || loading}
              className="btn-primary text-xs flex items-center gap-1 disabled:opacity-40">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                {loading ? 'hourglass_top' : 'send'}
              </span>
            </button>
          </div>
          {chatReply && (
            <p className="text-xs text-white/80 leading-relaxed bg-white/5 px-3 py-2 rounded">{chatReply}</p>
          )}
        </div>

        {/* Busca */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
          <input className="input w-full pl-9 text-xs" placeholder="Buscar referência por título ou área..."
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-2">
          {filtered.map(r => (
            <div key={r.title} className="flex items-start gap-3 px-3 py-2.5 rounded border border-border-soft bg-surface-low">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${r.typeColor}`}>{r.type}</span>
                  <span className="text-[9px] text-text-tertiary">{r.area} · {r.year}</span>
                </div>
                <p className="text-xs font-bold text-text-primary leading-snug line-clamp-1">{r.title}</p>
              </div>
              <span className="material-symbols-outlined text-text-tertiary text-sm flex-shrink-0 mt-0.5">bookmark_border</span>
            </div>
          ))}
        </div>

        <Link to="/dashboard/biblioteca" onClick={handleClose} className="btn-primary text-center text-xs">
          Abrir Biblioteca completa
        </Link>
      </div>
    </Modal>
  )
}

// ── Modal: Marketing ──────────────────────────────────────────────────────────

function ModalMarketing({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'post' | 'gerar'>('post')
  const [form, setForm] = useState({ rede: 'instagram', formato: 'carrossel', tema: '', legenda: '' })
  const [gerado, setGerado] = useState('')
  const [gerando, setGerando] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function gerar() {
    if (!form.tema) return
    setGerando(true)
    setGerado('')
    // TODO: integrar com endpoint de IA do backend
    setTimeout(() => {
      setGerado('Geração de conteúdo com IA disponível em breve. Configure manualmente sua publicação ou aguarde a integração.')
      setGerando(false)
    }, 600)
  }

  function handleClose() { setForm({ rede:'instagram', formato:'carrossel', tema:'', legenda:'' }); setGerado(''); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Marketing" subtitle="Criar e programar conteúdo" icon="campaign" wide>
      <div className="p-5 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex rounded overflow-hidden border border-border-soft">
          {[{ id: 'post', label: 'Novo post' }, { id: 'gerar', label: 'Gerar com IA' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${tab === t.id ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:bg-surface-high'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'post' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Rede social</label>
                <select className="input w-full" value={form.rede} onChange={set('rede')}>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              <div>
                <label className="label">Formato</label>
                <select className="input w-full" value={form.formato} onChange={set('formato')}>
                  <option value="carrossel">Carrossel</option>
                  <option value="feed">Foto / Feed</option>
                  <option value="reels">Reels / Vídeo</option>
                  <option value="stories">Stories</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Legenda</label>
              <textarea className="input w-full resize-none" rows={4} placeholder="Escreva a legenda do post..." value={form.legenda} onChange={set('legenda')} />
            </div>
            <p className="text-[10px] text-text-tertiary text-right">{form.legenda.length}/2200 caracteres</p>
          </>
        )}

        {tab === 'gerar' && (
          <>
            <div>
              <label className="label">Tema ou área clínica</label>
              <input className="input w-full" placeholder="Ex: gagueira, voz, TEA, disfagia..." value={form.tema} onChange={set('tema')} />
            </div>
            <button onClick={gerar} disabled={!form.tema || gerando}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                {gerando ? 'hourglass_top' : 'auto_awesome'}
              </span>
              {gerando ? 'Gerando...' : 'Gerar legenda com IA'}
            </button>
            {gerado && (
              <div className="flex flex-col gap-2">
                <label className="label">Legenda gerada</label>
                <textarea className="input w-full resize-none font-mono text-[11px]" rows={7} value={gerado} onChange={e => setGerado(e.target.value)} />
                <button onClick={() => { navigator.clipboard.writeText(gerado) }}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-olive hover:underline self-start">
                  <span className="material-symbols-outlined text-sm">content_copy</span> Copiar legenda
                </button>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleClose} className="btn-ghost flex-1">Cancelar</button>
          <Link to="/dashboard/marketing" onClick={handleClose} className="btn-primary flex-1 text-center">
            Ir para Marketing
          </Link>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal: Tarefas ────────────────────────────────────────────────────────────

function ModalTarefas({ open, onClose }: { open: boolean; onClose: () => void }) {
  type Tarefa = { id: string; text: string; done: boolean; priority: string }
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [nova, setNova] = useState('')
  const [prio, setPrio] = useState('media')

  function toggle(id: string) {
    setTarefas(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  function adicionar() {
    if (!nova.trim()) return
    setTarefas(ts => [...ts, { id: Date.now().toString(), text: nova.trim(), done: false, priority: prio }])
    setNova('')
  }

  const PRIO_COLOR: Record<string, string> = {
    alta:  'bg-danger-surface text-danger',
    media: 'bg-warning-surface text-warning',
    baixa: 'bg-surface-high text-text-tertiary',
  }

  const pendentes = tarefas.filter(t => !t.done)
  const concluidas = tarefas.filter(t => t.done)

  return (
    <Modal open={open} onClose={onClose} title="Tarefas" subtitle={`${pendentes.length} pendente${pendentes.length !== 1 ? 's' : ''}`} icon="task_alt">
      <div className="p-5 flex flex-col gap-4">

        {/* Nova tarefa */}
        <div className="flex flex-col gap-2 p-3 bg-surface-low rounded border border-border-soft">
          <input className="input w-full text-xs" placeholder="Nova tarefa..." value={nova} onChange={e => setNova(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') adicionar() }} />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Prioridade:</span>
            {['alta', 'media', 'baixa'].map(p => (
              <button key={p} onClick={() => setPrio(p)}
                className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded transition-colors ${prio === p ? PRIO_COLOR[p] : 'bg-surface text-text-tertiary border border-border-soft'}`}>
                {p}
              </button>
            ))}
            <button onClick={adicionar} disabled={!nova.trim()} className="ml-auto btn-primary text-[10px] py-1 px-3 disabled:opacity-40">
              Adicionar
            </button>
          </div>
        </div>

        {/* Pendentes */}
        <div className="flex flex-col gap-1.5">
          {pendentes.map(t => (
            <button key={t.id} onClick={() => toggle(t.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-surface-high transition-colors text-left group">
              <span className="material-symbols-outlined text-text-tertiary group-hover:text-olive text-lg flex-shrink-0 transition-colors">
                check_box_outline_blank
              </span>
              <span className="flex-1 text-xs text-text-primary leading-snug">{t.text}</span>
              <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0 ${PRIO_COLOR[t.priority]}`}>
                {t.priority}
              </span>
            </button>
          ))}
        </div>

        {/* Concluídas */}
        {concluidas.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Concluídas ({concluidas.length})</p>
            <div className="flex flex-col gap-1">
              {concluidas.map(t => (
                <button key={t.id} onClick={() => toggle(t.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-surface-high transition-colors text-left opacity-50">
                  <span className="material-symbols-outlined text-success text-lg flex-shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>check_box</span>
                  <span className="flex-1 text-xs text-text-tertiary line-through leading-snug">{t.text}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <Link to="/dashboard/tarefas" onClick={onClose} className="flex items-center justify-center gap-2 text-xs font-bold text-olive hover:underline mt-1">
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Ver todas as tarefas
        </Link>
      </div>
    </Modal>
  )
}

// ── Config de ações ───────────────────────────────────────────────────────────

const ACTIONS: {
  id: ModalId
  icon: string
  label: string
  badge?: string
}[] = [
  { id: 'novo-paciente', icon: 'person_add',    label: 'Novo Paciente' },
  { id: 'agendar',       icon: 'event',         label: 'Agendar'       },
  { id: 'relatorio',     icon: 'description',   label: 'Relatório'     },
  { id: 'financeiro',    icon: 'payments',      label: 'Financeiro'    },
  { id: 'caa',           icon: 'grid_view',     label: 'Painel CAA'    },
  { id: 'biblioteca',    icon: 'library_books', label: 'Biblioteca', badge: 'IA' },
  { id: 'marketing',     icon: 'campaign',      label: 'Marketing'     },
  { id: 'tarefas',       icon: 'task_alt',      label: 'Tarefas'       },
]

// ── Componente principal ──────────────────────────────────────────────────────

export function QuickActions() {
  const { data: apiAppts   = [] } = useTodayAppointments()
  const { data: apiReports = [] } = usePendingReports()
  const [activeModal, setActiveModal] = useState<ModalId>(null)

  const todayList      = apiAppts
  const pendingReports = apiReports.length

  const total     = todayList.length
  const completed = todayList.filter(a => a.status === 'completed').length
  const remaining = todayList.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length
  const noConfirm = todayList.filter(a => a.status === 'scheduled').length
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0
  const next      = todayList.find(a => a.status === 'confirmed' || a.status === 'scheduled')

  const close = () => setActiveModal(null)

  return (
    <>
      {/* ── Modais ──────────────────────────────────────────── */}
      <ModalNovoPaciente open={activeModal === 'novo-paciente'} onClose={close} />
      <ModalAgendar      open={activeModal === 'agendar'}       onClose={close} />
      <ModalRelatorio    open={activeModal === 'relatorio'}     onClose={close} />
      <ModalFinanceiro   open={activeModal === 'financeiro'}    onClose={close} />
      <ModalCAA          open={activeModal === 'caa'}           onClose={close} />
      <ModalBiblioteca   open={activeModal === 'biblioteca'}    onClose={close} />
      <ModalMarketing    open={activeModal === 'marketing'}     onClose={close} />
      <ModalTarefas      open={activeModal === 'tarefas'}       onClose={close} />

      <div className="card p-0 overflow-hidden border border-border-soft flex flex-col h-full">

        {/* ── ROW 1: CTA + próxima sessão ──────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch">
          <Link
            to="/dashboard/sessao"
            className="group relative flex-shrink-0 flex items-center gap-4 px-6 py-5 bg-dark hover:bg-dark-raised transition-all"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-neon" />
            <div className="flex items-center justify-center w-11 h-11 bg-neon/10 border border-neon/20 rounded-md flex-shrink-0">
              <span className="material-symbols-outlined text-neon text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>mic</span>
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-sm uppercase tracking-wide text-neon leading-tight">Iniciar Sessão</p>
              <p className="text-xs text-white/40 mt-0.5">IA grava, transcreve e gera o relatório</p>
            </div>
            <span className="material-symbols-outlined text-neon/40 group-hover:text-neon transition-colors ml-2">arrow_forward</span>
          </Link>

          {next ? (
            <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-surface border-t sm:border-t-0 sm:border-l border-border-soft">
              <div className="flex flex-col items-center justify-center w-10 h-10 bg-neon-surface rounded-md flex-shrink-0">
                <span className="font-display font-bold text-olive text-xs leading-none">
                  {new Date(next.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-0.5">Próxima sessão</p>
                <p className="text-sm font-bold text-text-primary truncate">{next.patientName}</p>
                <p className="text-xs text-text-tertiary capitalize">{next.modality}</p>
              </div>
              <Link
                to="/dashboard/sessao"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-neon-surface border border-border-neon rounded text-xs font-bold text-olive uppercase tracking-wide hover:bg-neon/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Iniciar
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center px-5 py-4 bg-surface border-t sm:border-t-0 sm:border-l border-border-soft">
              <p className="text-sm text-text-secondary">Nenhuma sessão pendente hoje</p>
            </div>
          )}
        </div>

        {/* ── ROW 2: Toolbar de ações ───────────────────────── */}
        <div className="flex items-center overflow-x-auto no-scrollbar bg-surface-low border-t border-border-soft">
          {ACTIONS.map(({ id, icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setActiveModal(id)}
              className="group relative flex flex-col items-center justify-center gap-1.5 px-4 py-3 flex-shrink-0 hover:bg-surface transition-colors border-r border-border-soft last:border-r-0"
            >
              <div className="relative">
                <span className="material-symbols-outlined text-text-tertiary group-hover:text-olive transition-colors text-xl" style={{ fontVariationSettings: '"FILL" 0' }}>
                  {icon}
                </span>
                {badge && (
                  <span className="absolute -top-1.5 -right-2.5 text-[8px] font-bold uppercase bg-neon-surface text-olive px-1 py-px rounded-sm leading-none">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary group-hover:text-olive transition-colors whitespace-nowrap leading-none">
                {label}
              </span>
            </button>
          ))}
          <div className="flex-1" />
          <Link to="/dashboard/mais" className="flex-shrink-0 flex items-center gap-1 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-text-tertiary hover:text-olive transition-colors border-l border-border-soft">
            <span className="material-symbols-outlined text-sm">apps</span>
            Tudo
          </Link>
        </div>

        {/* ── ROW 3: Resumo executivo do dia ───────────────────── */}
        <div className="flex-1 flex flex-col border-t border-border-soft">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-soft">
            <p className="section-label">Resumo do dia</p>
            <Link to="/dashboard/relatorios" className="link-brand text-[10px] uppercase tracking-wider">
              Relatórios →
            </Link>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-border-soft flex-1">

            <div className="flex flex-col gap-2 p-4">
              <p className="section-label">Sessões hoje</p>
              <div className="flex items-end gap-2">
                <p className="font-display font-bold text-2xl text-text-primary leading-none">{completed}</p>
                <p className="text-xs text-text-tertiary mb-0.5">de {total} concluídas</p>
              </div>
              <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
                <div className="h-full bg-olive rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-text-tertiary">{remaining} restante{remaining !== 1 ? 's' : ''} no dia</p>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <p className="section-label">Relatórios IA</p>
              <div className="flex items-end gap-2">
                <p className={`font-display font-bold text-2xl leading-none ${pendingReports > 0 ? 'text-warning' : 'text-success'}`}>
                  {pendingReports}
                </p>
                <p className="text-xs text-text-tertiary mb-0.5">{pendingReports > 0 ? 'p/ revisar' : 'revisados'}</p>
              </div>
              <Link to="/dashboard/relatorios"
                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${pendingReports > 0 ? 'text-warning hover:text-olive' : 'text-success'}`}>
                <span className="material-symbols-outlined text-sm">{pendingReports > 0 ? 'rate_review' : 'task_alt'}</span>
                {pendingReports > 0 ? 'Revisar agora' : 'Tudo em dia'}
              </Link>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <p className="section-label">Confirmações</p>
              <div className="flex items-end gap-2">
                <p className={`font-display font-bold text-2xl leading-none ${noConfirm > 0 ? 'text-warning' : 'text-success'}`}>
                  {noConfirm}
                </p>
                <p className="text-xs text-text-tertiary mb-0.5">{noConfirm > 0 ? 'sem resposta' : 'confirmadas'}</p>
              </div>
              <Link to="/dashboard/pacientes"
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary hover:text-olive transition-colors">
                <span className="material-symbols-outlined text-sm">send</span>
                Lembrar via WhatsApp
              </Link>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <p className="section-label">Taxa semana</p>
              <div className="flex items-end gap-2">
                <p className="font-display font-bold text-2xl text-text-primary leading-none">—</p>
                <p className="text-xs text-text-tertiary mb-0.5">sem dados</p>
              </div>
              <Link to="/dashboard/relatorios"
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary hover:text-olive transition-colors">
                <span className="material-symbols-outlined text-sm">bar_chart</span>
                Ver indicadores
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
