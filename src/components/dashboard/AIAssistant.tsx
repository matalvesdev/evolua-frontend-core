import { Link } from '@tanstack/react-router'
import { useTodayAppointments, usePendingReports } from '@/hooks/use-dashboard'

// Insights de IA — consumir via hook real quando backend disponível
type AIInsight = {
  id: string
  to: string
  icon: string
  value: string
  label: string
  up: boolean
  trend: string
}
const AI_INSIGHTS: AIInsight[] = []

export function AIAssistant() {
  const { data: todayAppts    = [] } = useTodayAppointments()
  const { data: pendingReports = [] } = usePendingReports()

  const nextAppt = todayAppts
    .filter(a => (a.status === 'scheduled' || a.status === 'confirmed') && new Date(a.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]

  const hasPending = pendingReports.length > 0

  // Card hero — contexto dinâmico baseado no estado real
  const hero = nextAppt
    ? {
        tag:    'Próxima Sessão',
        tagCls: 'bg-info-surface text-info',
        icon:   'mic',
        title:  `${nextAppt.patientName.split(' ')[0]} — ${new Date(nextAppt.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        body:   'A IA vai gravar a sessão, transcrever e gerar o rascunho do relatório de evolução. Você revisa e assina em segundos.',
        cta:    'Iniciar sessão com IA',
        ctaTo:  '/dashboard/sessao',
        ctaCls: 'cta-dark',
      }
    : hasPending
    ? {
        tag:    'Atenção',
        tagCls: 'bg-warning-surface text-warning',
        icon:   'rate_review',
        title:  `${pendingReports.length} relatório${pendingReports.length > 1 ? 's' : ''} aguardando revisão`,
        body:   'A IA gerou os rascunhos das evoluções. Revise, ajuste se necessário e assine digitalmente — validade jurídica garantida.',
        cta:    'Revisar relatórios',
        ctaTo:  '/dashboard/relatorios',
        ctaCls: 'btn-primary',
      }
    : {
        tag:    'Tudo em dia',
        tagCls: 'bg-success-surface text-success',
        icon:   'auto_awesome',
        title:  'Assistente IA pronto',
        body:   'Grave a próxima sessão em tablet ou celular. A IA transcreve, organiza na ficha e gera o relatório de evolução automaticamente.',
        cta:    'Iniciar sessão',
        ctaTo:  '/dashboard/sessao',
        ctaCls: 'cta-dark',
      }

  return (
    <div className="card flex flex-col gap-0 p-0 overflow-hidden h-full">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-soft">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-dark rounded-md">
            <span
              className="material-symbols-outlined text-neon text-base"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide leading-none">
              Assistente IA
            </h3>
            <p className="text-[10px] text-text-tertiary mt-0.5">Evolua · Exclusivo</p>
          </div>
        </div>
        <span className="badge badge-brand">Ativo</span>
      </div>

      {/* ── Card hero contextual ──────────────────────────── */}
      <div className="relative bg-dark flex flex-col gap-3 px-5 py-4 overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-neon/10 blur-2xl pointer-events-none" />

        <span className={`badge w-fit text-[9px] ${hero.tagCls}`}>{hero.tag}</span>

        <div className="flex items-start gap-3 relative z-10">
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-neon/10 border border-neon/20 rounded-md mt-0.5">
            <span
              className="material-symbols-outlined text-neon text-lg"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {hero.icon}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-white text-sm leading-snug">{hero.title}</p>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">{hero.body}</p>
          </div>
        </div>

        <Link
          to={hero.ctaTo}
          className={`relative z-10 self-start flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${hero.ctaCls}`}
        >
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
          {hero.cta}
        </Link>
      </div>

      {/* ── Insights clínicos ─────────────────────────────── */}
      {AI_INSIGHTS.length > 0 && (
        <div className="flex flex-col divide-y divide-border-soft flex-1">
          <p className="section-label px-5 pt-4 pb-2">Indicadores clínicos</p>
          {AI_INSIGHTS.map(ins => (
            <Link
              key={ins.id}
              to={ins.to}
              className="flex items-center gap-3 px-5 py-3 hover:bg-surface-low transition-colors group"
            >
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-neon-surface rounded-md">
                <span className="material-symbols-outlined text-olive text-base">{ins.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="font-display font-bold text-sm text-text-primary">{ins.value}</p>
                  <p className="text-[10px] text-text-tertiary truncate">{ins.label}</p>
                </div>
                <p className={`text-[10px] font-semibold ${ins.up ? 'text-success' : 'text-warning'}`}>
                  {ins.trend}
                </p>
              </div>
              <span className="material-symbols-outlined text-border group-hover:text-olive transition-colors text-base">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      )}
      {AI_INSIGHTS.length === 0 && <div className="flex-1" />}

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-border-soft bg-surface-low flex items-center justify-between">
        <p className="text-[10px] text-text-tertiary">IA atualizada · agora mesmo</p>
        <Link to="/dashboard/relatorios" className="link-brand text-[10px] uppercase tracking-wider">
          Ver relatórios →
        </Link>
      </div>
    </div>
  )
}
