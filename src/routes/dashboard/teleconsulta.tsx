import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/teleconsulta')({
  component: TeleconsultaPage,
})

const PATIENTS: string[] = []

interface Session {
  id: string
  patient: string
  date: string
  time: string
  link: string
  status: 'scheduled' | 'active' | 'ended'
  sentViaWhatsApp: boolean
}

const INITIAL_SESSIONS: Session[] = []

function generateLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const code = Array.from({length:8}, () => chars[Math.floor(Math.random()*chars.length)]).join('')
  return `https://meet.evolua.app/fono/${code}`
}

function TeleconsultaPage() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS)
  const [showNew, setShowNew]   = useState(false)
  const [form, setForm]         = useState({ patient: PATIENTS[0], date: '', time: '09:00', sendWA: true })
  const [copied, setCopied]     = useState<string|null>(null)
  const [activeSession, setActiveSession] = useState<Session|null>(
    INITIAL_SESSIONS.find(s => s.status === 'active') ?? null
  )

  function createSession() {
    const link = generateLink()
    const s: Session = {
      id: Date.now().toString(),
      patient: form.patient, date: form.date, time: form.time,
      link, status: 'scheduled', sentViaWhatsApp: form.sendWA,
    }
    setSessions(prev => [s, ...prev])
    setShowNew(false)
  }

  function copyLink(link: string, id: string) {
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function sendWhatsApp(s: Session) {
    const msg = encodeURIComponent(`Olá ${s.patient.split(' ')[0]}! Sua teleconsulta está agendada para ${new Date(s.date+'T00:00:00').toLocaleDateString('pt-BR')} às ${s.time}.\n\nAcesse pelo link:\n${s.link}\n\nEvolua — Sistema de Fonoaudiologia`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
    setSessions(prev => prev.map(x => x.id === s.id ? {...x, sentViaWhatsApp: true} : x))
  }

  function joinSession(s: Session) {
    setActiveSession(s)
    setSessions(prev => prev.map(x => x.id === s.id ? {...x, status:'active'} : x))
  }

  function endSession() {
    if (!activeSession) return
    setSessions(prev => prev.map(x => x.id === activeSession.id ? {...x, status:'ended'} : x))
    setActiveSession(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface w-full max-w-md shadow-[var(--shadow-dark)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-dark">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Nova Teleconsulta</h2>
              <button onClick={() => setShowNew(false)} className="text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="section-label block mb-1.5">Paciente</label>
                <select value={form.patient} onChange={e => setForm(f=>({...f,patient:e.target.value}))} className="input w-full">
                  {PATIENTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1.5">Data</label>
                  <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} className="input w-full" />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Horário</label>
                  <input type="time" value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))} className="input w-full" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.sendWA} onChange={e => setForm(f=>({...f,sendWA:e.target.checked}))} className="w-4 h-4 accent-[var(--color-olive)]" />
                <span className="text-sm text-text-primary">Enviar link via WhatsApp automaticamente</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="flex-1 btn-outline">Cancelar</button>
                <button onClick={createSession} disabled={!form.patient || !form.date} className="flex-1 btn-primary disabled:opacity-50">
                  Criar e gerar link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Teleconsulta</h1>
          <p className="text-sm text-text-secondary mt-0.5">Atendimento remoto regulamentado pelo CFFa · sem Zoom ou Meet externos</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-sm">add</span>
          Nova Teleconsulta
        </button>
      </div>

      {/* Sala ativa */}
      {activeSession && (
        <div className="card p-0 overflow-hidden border-2 border-info">
          <div className="px-5 py-3 bg-info flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <p className="font-display font-bold text-sm uppercase tracking-widest text-white">Sessão em andamento</p>
            </div>
            <button onClick={endSession} className="text-xs font-bold text-white/80 hover:text-white transition-colors border border-white/30 px-3 py-1">
              Encerrar
            </button>
          </div>
          <div className="p-5 flex flex-col lg:flex-row gap-5">
            {/* Preview da "sala" */}
            <div className="lg:flex-1 bg-dark aspect-video flex flex-col items-center justify-center gap-3 min-h-[180px]">
              <div className="avatar w-16 h-16 text-2xl">{activeSession.patient.charAt(0)}</div>
              <p className="text-white font-bold text-sm">{activeSession.patient}</p>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                Conectado
              </div>
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <p className="section-label">Link da sala</p>
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-low border border-border-soft text-xs font-mono text-text-secondary break-all">
                {activeSession.link}
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyLink(activeSession.link, activeSession.id)} className="flex items-center gap-1.5 px-3 py-2 border border-border-soft hover:bg-surface-low transition-colors text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">{copied===activeSession.id ? 'check' : 'content_copy'}</span>
                  {copied===activeSession.id ? 'Copiado!' : 'Copiar'}
                </button>
                <button onClick={() => sendWhatsApp(activeSession)} className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de sessões */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border-soft">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Sessões agendadas</p>
        </div>
        <div className="divide-y divide-border-soft">
          {sessions.filter(s => s.status !== 'ended').map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-low transition-colors flex-wrap">
              <div className="avatar w-9 h-9 text-sm">{s.patient.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">{s.patient}</p>
                <p className="text-xs text-text-tertiary">
                  {new Date(s.date+'T00:00:00').toLocaleDateString('pt-BR', {weekday:'short',day:'numeric',month:'short'})} às {s.time}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {s.sentViaWhatsApp ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings:'"FILL" 1' }}>check_circle</span>
                    WA enviado
                  </span>
                ) : (
                  <button onClick={() => sendWhatsApp(s)} className="flex items-center gap-1 text-xs font-bold text-[#25D366] hover:underline">
                    <span className="material-symbols-outlined text-sm">chat</span>
                    Enviar WA
                  </button>
                )}
                <button onClick={() => copyLink(s.link, s.id)} className="flex items-center gap-1 px-2 py-1 border border-border-soft text-xs hover:bg-surface-low transition-colors">
                  <span className="material-symbols-outlined text-sm">{copied===s.id ? 'check' : 'content_copy'}</span>
                  {copied===s.id ? 'Copiado' : 'Link'}
                </button>
                {s.status === 'scheduled' && (
                  <button onClick={() => joinSession(s)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">video_call</span>
                    Entrar
                  </button>
                )}
                {s.status === 'active' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-info">
                    <span className="w-1.5 h-1.5 bg-info rounded-full animate-pulse" />
                    Ao vivo
                  </span>
                )}
              </div>
            </div>
          ))}
          {sessions.filter(s => s.status !== 'ended').length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">
                <span className="material-symbols-outlined">video_call</span>
              </div>
              <p className="empty-state__title">Nenhuma teleconsulta agendada</p>
              <p className="empty-state__desc">Crie um link e atenda pacientes em qualquer lugar — sem instalações.</p>
              <div className="empty-state__actions">
                <button onClick={() => setShowNew(true)} className="bk-btn bk-btn-primary">Criar agora</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
