import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/dashboard/sessao')({
  component: SessaoPage,
})

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Phase = 'pre' | 'recording' | 'processing' | 'review' | 'signed'

const PATIENTS: string[] = []

// ── Timer ─────────────────────────────────────────────────────────────────────
function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

// ── Waveform animado ──────────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-0.5 h-12" aria-hidden>
      {Array.from({length:32}, (_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${active ? 'bg-neon' : 'bg-border-soft'}`}
          style={{
            height: active ? `${Math.sin(i * 0.5) * 20 + 24}px` : '4px',
            animationDelay: `${i * 0.04}s`,
            animation: active ? `wave ${0.8 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`@keyframes wave { from { transform: scaleY(0.3) } to { transform: scaleY(1) } }`}</style>
    </div>
  )
}

// ── Simulação de transcrição por chunks ───────────────────────────────────────
const TRANSCRIPT_CHUNKS: string[] = []

const DRAFT_TEMPLATE = `EVOLUÇÃO CLÍNICA — {date}
Paciente: {patient}
Terapeuta: Dra. [Nome]

RESUMO DA SESSÃO:
{transcript}

ANÁLISE CLÍNICA:
Sessão produtiva com progressos observáveis. Paciente demonstrou boa adesão às atividades propostas.

OBJETIVOS TRABALHADOS:
• Ampliação de vocabulário expressivo
• Estruturação frasal
• Consciência fonológica

PRÓXIMA SESSÃO:
Continuar sequência de atividades. Solicitar engajamento familiar com exercícios domiciliares.

Assinado digitalmente por: Dra. [Nome] — CFFa [número]`

// ── Página principal ──────────────────────────────────────────────────────────
function SessaoPage() {
  const navigate = useNavigate()
  const [phase, setPhase]         = useState<Phase>('pre')
  const [paused, setPaused]       = useState(false)
  const [patient, setPatient]     = useState(PATIENTS[0] ?? '')
  const [sessionType, setType]    = useState('Terapia de Linguagem')
  const [transcript, setTranscript] = useState('')
  const [draft, setDraft]         = useState('')
  const [, setSigned]             = useState(false)
  const [chunkIdx, setChunkIdx]   = useState(0)
  const timer                     = useTimer(phase === 'recording' && !paused)
  const transcriptRef             = useRef<HTMLTextAreaElement>(null)

  // Simula transcrição chegando em tempo real
  useEffect(() => {
    if (phase !== 'recording' || paused) return
    if (chunkIdx >= TRANSCRIPT_CHUNKS.length) return
    const id = setTimeout(() => {
      setTranscript(t => t + TRANSCRIPT_CHUNKS[chunkIdx])
      setChunkIdx(i => i + 1)
    }, 4000)
    return () => clearTimeout(id)
  }, [phase, paused, chunkIdx])

  function startRecording() { setPhase('recording'); setTranscript(''); setChunkIdx(0) }

  function stopRecording() {
    setPhase('processing')
    // TODO: substituir por chamada real ao pipeline de transcrição + geração de evolução.
    const d = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
    setDraft(DRAFT_TEMPLATE.replace('{date}', d).replace('{patient}', patient).replace('{transcript}', ''))
    setPhase('review')
  }

  function sign() {
    setSigned(true)
    setPhase('signed')
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">
            {phase === 'pre' ? 'Iniciar Sessão' : phase === 'recording' ? 'Sessão ao Vivo' : phase === 'processing' ? 'Processando...' : phase === 'signed' ? 'Sessão Concluída' : 'Rascunho de Evolução'}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {phase === 'recording' ? `Gravando — ${timer}` : 'IA transcreve e gera rascunho automaticamente'}
          </p>
        </div>
        {phase !== 'pre' && phase !== 'signed' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-danger-surface border border-danger/20 text-xs font-bold text-danger uppercase tracking-wide">
            <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
            {phase === 'recording' ? (paused ? 'Pausado' : 'Gravando') : 'Processando'}
          </div>
        )}
      </div>

      {/* ── PRÉ-SESSÃO ── */}
      {phase === 'pre' && (
        <div className="card p-6 flex flex-col gap-5">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Dados da sessão</p>
          <div>
            <label className="section-label block mb-1.5">Paciente</label>
            {PATIENTS.length === 0 ? (
              <p className="text-sm text-text-secondary">Nenhum paciente cadastrado.</p>
            ) : (
              <select value={patient} onChange={e => setPatient(e.target.value)} className="input w-full">
                {PATIENTS.map(p => <option key={p}>{p}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="section-label block mb-1.5">Tipo de sessão</label>
            <select value={sessionType} onChange={e => setType(e.target.value)} className="input w-full">
              {['Terapia de Linguagem','Avaliação','Atraso de Fala','Gagueira','TEA','Disfonia','Voz','Deglutição','Motricidade Orofacial'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="px-4 py-3 bg-neon-surface border border-border-neon flex items-start gap-3">
            <span className="material-symbols-outlined text-olive text-lg shrink-0" style={{ fontVariationSettings:'"FILL" 1' }}>auto_awesome</span>
            <div>
              <p className="text-sm font-bold text-text-primary">IA ativada</p>
              <p className="text-xs text-text-tertiary mt-0.5">A sessão será transcrita em tempo real e um rascunho de evolução será gerado automaticamente ao final.</p>
            </div>
          </div>
          <button onClick={startRecording} className="btn-primary flex items-center justify-center gap-2 py-3 text-base">
            <span className="material-symbols-outlined" style={{ fontVariationSettings:'"FILL" 1' }}>mic</span>
            Iniciar Gravação
          </button>
        </div>
      )}

      {/* ── GRAVANDO ── */}
      {phase === 'recording' && (
        <div className="flex flex-col gap-4">
          <div className="card p-6 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between mb-2 text-sm">
              <span className="text-text-tertiary">Paciente: <span className="font-bold text-text-primary">{patient}</span></span>
              <span className="font-display font-bold text-xl text-text-primary tabular-nums">{timer}</span>
            </div>
            <Waveform active={!paused} />
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setPaused(p => !p)}
                className="flex items-center gap-2 px-5 py-2.5 border border-border-soft hover:bg-surface-low transition-colors text-sm font-bold"
              >
                <span className="material-symbols-outlined text-base">{paused ? 'play_arrow' : 'pause'}</span>
                {paused ? 'Retomar' : 'Pausar'}
              </button>
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-2.5 bg-danger text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-base">stop</span>
                Encerrar Sessão
              </button>
            </div>
          </div>

          {/* Transcrição em tempo real */}
          {transcript && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-sm text-olive" style={{ fontVariationSettings:'"FILL" 1' }}>auto_awesome</span>
                <p className="section-label">Transcrição em tempo real</p>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">{transcript}<span className="animate-pulse">|</span></p>
            </div>
          )}
        </div>
      )}

      {/* ── PROCESSANDO ── */}
      {phase === 'processing' && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin" />
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Gerando rascunho com IA...</p>
          <p className="text-xs text-text-tertiary text-center max-w-xs">A IA está organizando a transcrição e criando o rascunho de evolução. Isso leva alguns segundos.</p>
        </div>
      )}

      {/* ── REVISÃO ── */}
      {phase === 'review' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 px-4 py-3 bg-neon-surface border border-border-neon">
            <span className="material-symbols-outlined text-olive shrink-0" style={{ fontVariationSettings:'"FILL" 1' }}>auto_awesome</span>
            <div>
              <p className="text-sm font-bold text-text-primary">Rascunho gerado pela IA</p>
              <p className="text-xs text-text-tertiary">Revise, edite se necessário e assine digitalmente para finalizar.</p>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-dark border-b border-dark-border flex items-center justify-between">
              <p className="font-display font-bold text-xs uppercase tracking-widest text-neon">Evolução clínica</p>
              <span className="text-[10px] text-white/40">{patient} · {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <textarea
              ref={transcriptRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={18}
              className="w-full p-5 text-sm text-text-primary leading-relaxed bg-surface outline-none resize-none font-mono"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => window.print()} className="btn-outline flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-sm">print</span>
              Imprimir PDF
            </button>
            <button onClick={sign} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings:'"FILL" 1' }}>verified</span>
              Assinar e Finalizar
            </button>
          </div>
        </div>
      )}

      {/* ── ASSINADO ── */}
      {phase === 'signed' && (
        <div className="card p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 bg-success-surface border-2 border-success flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-success" style={{ fontVariationSettings:'"FILL" 1' }}>verified</span>
          </div>
          <div>
            <p className="font-display font-bold text-lg uppercase tracking-wide text-text-primary">Sessão finalizada!</p>
            <p className="text-sm text-text-secondary mt-1">Evolução salva no prontuário de {patient} com assinatura digital.</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={() => { setPhase('pre'); setTranscript(''); setDraft(''); setSigned(false) }} className="flex-1 btn-outline text-sm">
              Nova Sessão
            </button>
            <button onClick={() => navigate({ to: '/dashboard/prontuario' })} className="flex-1 btn-primary text-sm">
              Ver Prontuário
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
