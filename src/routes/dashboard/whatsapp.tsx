import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/whatsapp')({
  component: WhatsAppPage,
})

interface Message {
  id: string
  patient: string
  phone: string
  type: 'reminder' | 'confirmation' | 'reschedule' | 'exercise' | 'manual'
  text: string
  sentAt: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

const INITIAL_MESSAGES: Message[] = []

const TYPE_LABELS = { reminder:'Lembrete', confirmation:'Confirmação', reschedule:'Remarcação', exercise:'Exercício', manual:'Manual' }
const TYPE_COLORS: Record<string, string> = {
  reminder:'bg-info-surface text-info',
  confirmation:'bg-success-surface text-success',
  reschedule:'bg-warning-surface text-warning',
  exercise:'bg-neon-surface text-olive',
  manual:'bg-surface-low text-text-secondary',
}
const STATUS_ICONS: Record<string, string> = {
  sent:'check', delivered:'done_all', read:'done_all', failed:'error'
}
const STATUS_COLORS: Record<string, string> = {
  sent:'text-text-tertiary', delivered:'text-info', read:'text-success', failed:'text-danger'
}

const PATIENTS: string[] = []

// ── Automações configuráveis ──────────────────────────────────────────────────
type Automation = { id: string; label: string; desc: string; active: boolean }
const AUTOMATIONS: Automation[] = []

function WhatsAppPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [automations, setAutomations] = useState(AUTOMATIONS)
  const [tab, setTab] = useState<'messages'|'automations'|'send'>('messages')
  const [manualForm, setManualForm] = useState({ patient: PATIENTS[0], text: '' })
  const [sent, setSent] = useState(false)

  function toggleAuto(id: string) {
    setAutomations(prev => prev.map(a => a.id === id ? {...a, active:!a.active} : a))
  }

  function sendManual() {
    const m: Message = {
      id: Date.now().toString(),
      patient: manualForm.patient,
      phone: '+5541999990000',
      type: 'manual',
      text: manualForm.text,
      sentAt: new Date().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
      status: 'sent',
    }
    setMessages(prev => [m, ...prev])
    setManualForm(f => ({...f, text:''}))
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">WhatsApp</h1>
          <p className="text-sm text-text-secondary mt-0.5">Mensagens automáticas e manuais para seus pacientes</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 border border-[#25D366]/30 text-xs font-bold text-[#25D366]">
          <span className="w-2 h-2 rounded-full bg-[#25D366]" />
          WhatsApp Business API
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-soft">
        {([
          { key:'messages',    label:'Mensagens',    icon:'chat'          },
          { key:'automations', label:'Automações',   icon:'automation'    },
          { key:'send',        label:'Enviar manual', icon:'send'          },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
              tab === t.key ? 'border-olive text-olive' : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Histórico de mensagens ── */}
      {tab === 'messages' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-soft flex items-center justify-between">
            <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Mensagens recentes</p>
            <span className="badge badge-brand">{messages.length}</span>
          </div>
          <div className="divide-y divide-border-soft">
            {messages.map(m => (
              <div key={m.id} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-low transition-colors">
                <div className="avatar w-9 h-9 text-sm shrink-0">{m.patient.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold text-text-primary">{m.patient}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 ${TYPE_COLORS[m.type]}`}>
                      {TYPE_LABELS[m.type]}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{m.text}</p>
                  <p className="text-[10px] text-text-tertiary mt-1">{m.sentAt}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`material-symbols-outlined text-base ${STATUS_COLORS[m.status]}`}
                    style={{ fontVariationSettings: m.status==='read' ? '"FILL" 1' : undefined }}
                    title={m.status}>
                    {STATUS_ICONS[m.status]}
                  </span>
                  {m.status === 'failed' && (
                    <button className="text-[10px] font-bold text-danger hover:underline">Reenviar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Automações ── */}
      {tab === 'automations' && (
        <div className="flex flex-col gap-3">
          <div className="px-4 py-3 bg-neon-surface border border-border-neon flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-sm text-olive" style={{ fontVariationSettings:'"FILL" 1' }}>info</span>
            <span className="text-text-primary">Mensagens são enviadas via API oficial do WhatsApp Business. Incluso em todos os planos.</span>
          </div>
          {automations.map(a => (
            <div key={a.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">{a.label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{a.desc}</p>
              </div>
              <button
                onClick={() => toggleAuto(a.id)}
                className={`relative w-11 h-6 shrink-0 transition-colors ${a.active ? 'bg-olive' : 'bg-border-soft'}`}
                style={{ borderRadius: '999px' }}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white transition-transform`}
                  style={{ borderRadius: '50%', left: a.active ? 'calc(100% - 20px)' : '4px' }}
                />
              </button>
            </div>
          ))}
          {automations.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <p className="empty-state__title">Nenhuma automação configurada</p>
              <p className="empty-state__desc">Configure automações de WhatsApp para enviar lembretes, confirmações e mensagens em datas comemorativas.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Envio manual ── */}
      {tab === 'send' && (
        <div className="card p-6 flex flex-col gap-5 max-w-lg">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Mensagem manual</p>
          <div>
            <label className="section-label block mb-1.5">Paciente</label>
            <select value={manualForm.patient} onChange={e => setManualForm(f=>({...f,patient:e.target.value}))} className="input w-full">
              {PATIENTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label block mb-1.5">Mensagem</label>
            <textarea
              value={manualForm.text}
              onChange={e => setManualForm(f=>({...f,text:e.target.value}))}
              rows={5}
              placeholder="Digite a mensagem a ser enviada via WhatsApp..."
              className="input w-full resize-none text-sm"
            />
            <p className="text-[10px] text-text-tertiary mt-1">{manualForm.text.length}/1000 caracteres</p>
          </div>
          <div className="flex items-center gap-3">
            {sent && (
              <span className="flex items-center gap-1.5 text-xs text-success font-bold">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings:'"FILL" 1' }}>check_circle</span>
                Mensagem enviada!
              </span>
            )}
            <button
              onClick={sendManual}
              disabled={!manualForm.text.trim()}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Enviar WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
