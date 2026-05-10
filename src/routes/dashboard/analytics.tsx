import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/analytics')({
  component: AnalyticsPage,
})

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: substituir por hooks de dados reais (use-dashboard) quando os endpoints
// /api/analytics/* estiverem disponíveis no backend.
type SessionArea = { area: string; pct: number; color: string }
type MonthlyEntry = { month: string; sessions: number; revenue?: number }
type AdherenceEntry = { group: string; pct: number }
type NoReturnEntry = { name: string; area: string; days: number }

const SESSION_BY_AREA: SessionArea[] = []
const MONTHLY: MonthlyEntry[] = []
const ADHERENCE_BY_AGE: AdherenceEntry[] = []
const NO_RETURN_PATIENTS: NoReturnEntry[] = []

const maxMonthly = MONTHLY.length ? Math.max(...MONTHLY.map(m => m.sessions)) : 1

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPI({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${color}`}>
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings:'"FILL" 1' }}>{icon}</span>
        {label}
      </div>
      <p className="font-display font-bold text-3xl text-text-primary">{value}</p>
      <p className="text-xs text-text-tertiary">{sub}</p>
    </div>
  )
}

function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'|'12m'>('30d')

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary mt-0.5">Indicadores clínicos e operacionais da clínica</p>
        </div>
        <div className="flex border border-border-soft overflow-hidden">
          {(['7d','30d','90d','12m'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                period === p ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon="group"    label="Pacientes ativos"   value="—" sub="sem dados"   color="text-info"    />
        <KPI icon="event"    label="Sessões realizadas" value="—" sub="sem dados"   color="text-success" />
        <KPI icon="payments" label="Receita do mês"     value="—" sub="sem dados"   color="text-olive"   />
        <KPI icon="percent"  label="Taxa de adesão"     value="—" sub="sem dados"   color="text-warning" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sessões por mês */}
        <div className="lg:col-span-2 card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Sessões por mês</p>
            <p className="text-xs text-text-tertiary">últimos 7 meses</p>
          </div>
          {MONTHLY.length === 0 ? (
            <div className="empty-state h-40">
              <span className="material-symbols-outlined text-3xl text-text-tertiary">bar_chart</span>
              <p className="text-sm text-text-secondary">Sem sessões registradas</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {MONTHLY.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-text-tertiary">{m.sessions}</span>
                  <div
                    className="w-full bg-neon/80 hover:bg-neon transition-colors"
                    style={{ height: `${(m.sessions / maxMonthly) * 100}%`, minHeight: '4px' }}
                    title={`${m.sessions} sessões`}
                  />
                  <span className="text-[9px] text-text-tertiary">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribuição por área */}
        <div className="card p-5 flex flex-col gap-4">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Por área</p>
          {SESSION_BY_AREA.length === 0 ? (
            <p className="text-sm text-text-secondary">Sem dados disponíveis</p>
          ) : (
            <div className="flex flex-col gap-2">
              {SESSION_BY_AREA.map(a => (
                <div key={a.area} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
                  <span className="text-xs text-text-secondary flex-1 truncate">{a.area}</span>
                  <div className="w-16 bg-surface-high h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${a.pct}%`, background: a.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-text-tertiary w-6 text-right">{a.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Adesão por faixa etária + Sem retorno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Adesão */}
        <div className="card p-5 flex flex-col gap-4">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Adesão por faixa etária</p>
          {ADHERENCE_BY_AGE.length === 0 ? (
            <p className="text-sm text-text-secondary">Sem dados disponíveis</p>
          ) : (
          <div className="flex flex-col gap-3">
            {ADHERENCE_BY_AGE.map(a => (
              <div key={a.group} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-24 shrink-0">{a.group}</span>
                <div className="flex-1 bg-surface-high h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.pct >= 80 ? 'bg-success' : a.pct >= 70 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-8 text-right ${a.pct >= 80 ? 'text-success' : a.pct >= 70 ? 'text-warning' : 'text-danger'}`}>
                  {a.pct}%
                </span>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Pacientes sem retorno */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-soft flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Sem retorno há +30 dias</p>
              <p className="text-xs text-text-tertiary mt-0.5">Requer atenção</p>
            </div>
            <span className="badge badge-danger">{NO_RETURN_PATIENTS.length}</span>
          </div>
          {NO_RETURN_PATIENTS.length === 0 ? (
            <div className="empty-state py-10">
              <span className="material-symbols-outlined text-3xl text-text-tertiary">check_circle</span>
              <p className="text-sm text-text-secondary">Nenhum paciente em alerta</p>
            </div>
          ) : (
            <div className="divide-y divide-border-soft">
              {NO_RETURN_PATIENTS.map(p => (
                <div key={p.name} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-low transition-colors">
                  <div className="avatar w-8 h-8 text-xs">{p.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{p.name}</p>
                    <p className="text-xs text-text-tertiary">{p.area}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-danger">{p.days}d</span>
                    <button className="text-[10px] font-bold text-olive hover:underline">
                      Contatar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Receita mensal */}
      <div className="card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Receita mensal (R$)</p>
          {MONTHLY.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-success">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              tendência positiva
            </span>
          )}
        </div>
        {MONTHLY.length === 0 ? (
          <div className="empty-state h-24">
            <p className="text-sm text-text-secondary">Sem receitas registradas</p>
          </div>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {MONTHLY.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[8px] font-bold text-text-tertiary">{((m.revenue ?? 0)/1000).toFixed(1)}k</span>
                <div
                  className="w-full bg-olive/70 hover:bg-olive transition-colors"
                  style={{ height:`${((m.revenue ?? 0) / 7900) * 100}%`, minHeight:'4px' }}
                />
                <span className="text-[9px] text-text-tertiary">{m.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
