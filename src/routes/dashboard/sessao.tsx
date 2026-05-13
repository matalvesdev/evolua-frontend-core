import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { usePatients } from '@/hooks/use-patients'
import {
  useCreateAudioSession,
  useRequestTranscription,
  useAudioTranscription,
  useGenerateEvolution,
  type SoapEvolution,
} from '@/hooks/use-audio-session'
import { uploadAudioBlob } from '@/lib/storage'

export const Route = createFileRoute('/dashboard/sessao')({
  component: SessaoPage,
})

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Phase = 'pre' | 'recording' | 'processing' | 'review' | 'signed'

// ── Timer ─────────────────────────────────────────────────────────────────────
function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!running) {
      return
    }
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  // reset quando para totalmente (running false E elapsed deve ser controlado externamente p/ reset)
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return {
    label: `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    seconds: elapsed,
    reset: () => setElapsed(0),
  }
}

// ── Waveform reativo ao volume real ───────────────────────────────────────────
function Waveform({ levels, active }: { levels: number[]; active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-0.5 h-12" aria-hidden>
      {levels.map((lvl, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-75 ${active ? 'bg-neon' : 'bg-border-soft'}`}
          style={{ height: active ? `${Math.max(4, Math.min(48, lvl * 48))}px` : '4px' }}
        />
      ))}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
function SessaoPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('pre')
  const [paused, setPaused] = useState(false)
  const [patientId, setPatientId] = useState<string>('')
  const [sessionType, setSessionType] = useState('Terapia de Linguagem')
  const [audioSessionId, setAudioSessionId] = useState<string | null>(null)
  const [evolution, setEvolution] = useState<SoapEvolution | null>(null)
  const [draft, setDraft] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [levels, setLevels] = useState<number[]>(Array(32).fill(0))
  const timer = useTimer(phase === 'recording' && !paused)

  // Recursos de gravação (refs para não causar re-renders)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animRef = useRef<number | null>(null)

  // Hooks de dados
  const { data: patientsResp, isLoading: loadingPatients } = usePatients({ status: 'active', pageSize: 100 })
  const patients = patientsResp?.data ?? []
  const createSession = useCreateAudioSession()
  const requestTranscription = useRequestTranscription()
  const transcriptionPoll = useAudioTranscription(audioSessionId)
  const generateEvolution = useGenerateEvolution()

  const patient = patients.find(p => p.id === patientId)

  useEffect(() => {
    if (!patientId && patients.length > 0) {
      setPatientId(patients[0]!.id)
    }
  }, [patients, patientId])

  // ── Visualizador de volume ───────────────────────────────────────────────
  const tick = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    // amostragem em 32 bins
    const step = Math.floor(data.length / 32) || 1
    const next: number[] = []
    for (let i = 0; i < 32; i++) {
      const v = data[i * step] ?? 0
      next.push(v / 255)
    }
    setLevels(next)
    animRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Cleanup ──────────────────────────────────────────────────────────────
  const cleanupMedia = useCallback(() => {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    recorderRef.current?.stream.getTracks().forEach(t => t.stop())
    mediaStreamRef.current?.getTracks().forEach(t => t.stop())
    void audioCtxRef.current?.close().catch(() => {})
    recorderRef.current = null
    mediaStreamRef.current = null
    audioCtxRef.current = null
    analyserRef.current = null
    setLevels(Array(32).fill(0))
  }, [])

  useEffect(() => () => cleanupMedia(), [cleanupMedia])

  // ── Inicia gravação real ─────────────────────────────────────────────────
  async function startRecording() {
    setErrorMsg(null)
    if (!patientId) {
      setErrorMsg('Selecione um paciente antes de iniciar.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      // Analyser para waveform
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.start(1000) // chunk a cada 1s
      recorderRef.current = recorder

      animRef.current = requestAnimationFrame(tick)
      timer.reset()
      setPhase('recording')
      setPaused(false)
    } catch (e) {
      setErrorMsg(
        e instanceof Error
          ? `Não foi possível acessar o microfone: ${e.message}`
          : 'Não foi possível acessar o microfone.',
      )
      cleanupMedia()
    }
  }

  function togglePause() {
    const rec = recorderRef.current
    if (!rec) return
    if (rec.state === 'recording') {
      rec.pause()
      setPaused(true)
    } else if (rec.state === 'paused') {
      rec.resume()
      setPaused(false)
    }
  }

  // ── Encerra: upload → cria sessão → solicita transcrição ─────────────────
  async function stopRecording() {
    const rec = recorderRef.current
    if (!rec) return

    const seconds = timer.seconds
    setPhase('processing')

    // Espera dataavailable final
    const blob = await new Promise<Blob>((resolve) => {
      rec.onstop = () => {
        const b = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        resolve(b)
      }
      try { rec.stop() } catch { resolve(new Blob(chunksRef.current, { type: 'audio/webm' })) }
    })

    cleanupMedia()

    try {
      // 1. Upload pro Supabase Storage
      const path = await uploadAudioBlob(patientId, blob, 'webm')

      // 2. Cria AudioSession no backend
      const created = await createSession.mutateAsync({
        patientId,
        audioPath: path,
        audioDuration: seconds,
        fileSize: blob.size,
      })
      setAudioSessionId(created.id)

      // 3. Dispara transcrição (assíncrona — polling segue via useAudioTranscription)
      await requestTranscription.mutateAsync(created.id)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Falha ao processar áudio')
      setPhase('pre')
    }
  }

  // ── Quando transcrição completar, gera evolução SOAP ─────────────────────
  useEffect(() => {
    if (phase !== 'processing') return
    if (!transcriptionPoll.data) return
    const { transcriptionStatus, transcription } = transcriptionPoll.data
    if (transcriptionStatus === 'failed') {
      setErrorMsg('Falha na transcrição. Tente novamente.')
      setPhase('pre')
      return
    }
    if (transcriptionStatus !== 'completed' || !transcription) return
    if (generateEvolution.isPending || evolution) return

    generateEvolution.mutate(
      {
        patientId,
        transcript: transcription,
      },
      {
        onSuccess: (data) => {
          setEvolution(data)
          setDraft(renderDraft(data, patient?.name ?? 'Paciente', sessionType))
          setPhase('review')
        },
        onError: (e) => {
          setErrorMsg(e instanceof Error ? e.message : 'Falha ao gerar evolução')
          // Mesmo sem evolução IA, deixa o terapeuta editar a transcrição manualmente
          setDraft(renderDraftFallback(transcription, patient?.name ?? 'Paciente', sessionType))
          setPhase('review')
        },
      },
    )
  }, [phase, transcriptionPoll.data, patientId, patient?.name, sessionType, generateEvolution, evolution])

  function sign() {
    // TODO(reports-integration): persistir como Report (módulo reports/) com signature.
    setPhase('signed')
  }

  function reset() {
    setPhase('pre')
    setAudioSessionId(null)
    setEvolution(null)
    setDraft('')
    setErrorMsg(null)
    timer.reset()
  }

  const transcriptionStatus = transcriptionPoll.data?.transcriptionStatus
  const liveTranscript = transcriptionPoll.data?.transcription ?? ''

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">
            {phase === 'pre' ? 'Iniciar Sessão' : phase === 'recording' ? 'Sessão ao Vivo' : phase === 'processing' ? 'Processando...' : phase === 'signed' ? 'Sessão Concluída' : 'Rascunho de Evolução'}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {phase === 'recording' ? `Gravando — ${timer.label}` : 'IA transcreve e gera rascunho automaticamente'}
          </p>
        </div>
        {phase !== 'pre' && phase !== 'signed' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-danger-surface border border-danger/20 text-xs font-bold text-danger uppercase tracking-wide">
            <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
            {phase === 'recording' ? (paused ? 'Pausado' : 'Gravando') : 'Processando'}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="px-4 py-3 bg-danger-surface border border-danger/20 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {/* ── PRÉ-SESSÃO ── */}
      {phase === 'pre' && (
        <div className="card p-6 flex flex-col gap-5">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Dados da sessão</p>
          <div>
            <label className="section-label block mb-1.5">Paciente</label>
            {loadingPatients ? (
              <p className="text-sm text-text-secondary">Carregando pacientes...</p>
            ) : patients.length === 0 ? (
              <p className="text-sm text-text-secondary">Nenhum paciente ativo cadastrado.</p>
            ) : (
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="input w-full"
              >
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="section-label block mb-1.5">Tipo de sessão</label>
            <select value={sessionType} onChange={e => setSessionType(e.target.value)} className="input w-full">
              {['Terapia de Linguagem','Avaliação','Atraso de Fala','Gagueira','TEA','Disfonia','Voz','Deglutição','Motricidade Orofacial'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="px-4 py-3 bg-neon-surface border border-border-neon flex items-start gap-3">
            <span className="material-symbols-outlined text-olive text-lg shrink-0" style={{ fontVariationSettings:'"FILL" 1' }}>auto_awesome</span>
            <div>
              <p className="text-sm font-bold text-text-primary">IA ativada</p>
              <p className="text-xs text-text-tertiary mt-0.5">A sessão será gravada, transcrita pelo Whisper e um rascunho SOAP será gerado automaticamente ao final.</p>
            </div>
          </div>
          <button
            onClick={startRecording}
            disabled={!patientId || loadingPatients}
            className="btn-primary flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
              <span className="text-text-tertiary">Paciente: <span className="font-bold text-text-primary">{patient?.name ?? '—'}</span></span>
              <span className="font-display font-bold text-xl text-text-primary tabular-nums">{timer.label}</span>
            </div>
            <Waveform levels={levels} active={!paused} />
            <div className="flex gap-3 mt-2">
              <button
                onClick={togglePause}
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
        </div>
      )}

      {/* ── PROCESSANDO ── */}
      {phase === 'processing' && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin" />
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">
            {transcriptionStatus === 'completed' ? 'Gerando evolução SOAP...' : 'Transcrevendo áudio com Whisper...'}
          </p>
          <p className="text-xs text-text-tertiary text-center max-w-xs">
            {transcriptionStatus === 'completed'
              ? 'A IA está organizando a transcrição em formato SOAP.'
              : 'Pode levar até 1 minuto dependendo da duração da sessão.'}
          </p>
          {liveTranscript && (
            <p className="text-xs text-text-secondary italic max-w-md text-center mt-2">
              "{liveTranscript.slice(0, 200)}{liveTranscript.length > 200 ? '...' : ''}"
            </p>
          )}
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

          {evolution?.nextSessionSuggestions && evolution.nextSessionSuggestions.length > 0 && (
            <div className="card p-4">
              <p className="section-label mb-2">Sugestões para próxima sessão</p>
              <ul className="text-sm text-text-primary list-disc pl-5 space-y-1">
                {evolution.nextSessionSuggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-dark border-b border-dark-border flex items-center justify-between">
              <p className="font-display font-bold text-xs uppercase tracking-widest text-neon">Evolução clínica</p>
              <span className="text-[10px] text-white/40">{patient?.name ?? '—'} · {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={22}
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
            <p className="text-sm text-text-secondary mt-1">Evolução salva no prontuário de {patient?.name ?? '—'}.</p>
            <p className="text-xs text-text-tertiary mt-2 italic">TODO: persistir como Report formal (integração com módulo reports/)</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={reset} className="flex-1 btn-outline text-sm">
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

// ── Helpers de template ──────────────────────────────────────────────────────

function renderDraft(ev: SoapEvolution, patientName: string, sessionType: string): string {
  const date = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
  return [
    `EVOLUÇÃO CLÍNICA — ${date}`,
    `Paciente: ${patientName}`,
    `Tipo: ${sessionType}`,
    '',
    'RESUMO:',
    ev.summary || '—',
    '',
    'S — SUBJETIVO:',
    ev.soap.subjective || '—',
    '',
    'O — OBJETIVO:',
    ev.soap.objective || '—',
    '',
    'A — AVALIAÇÃO:',
    ev.soap.assessment || '—',
    '',
    'P — PLANO:',
    ev.soap.plan || '—',
  ].join('\n')
}

function renderDraftFallback(transcript: string, patientName: string, sessionType: string): string {
  const date = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
  return [
    `EVOLUÇÃO CLÍNICA — ${date}`,
    `Paciente: ${patientName}`,
    `Tipo: ${sessionType}`,
    '',
    '⚠️ Geração de evolução por IA indisponível. Transcrição bruta:',
    '',
    transcript,
  ].join('\n')
}
