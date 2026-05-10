import { Link } from '@tanstack/react-router'
import { useDashboardStats } from '@/hooks/use-dashboard'

// Sparkline mini — 7 barras representando os últimos 7 dias
function Spark({ values, color }: { values: number[]; color: string }) {
  if (values.length === 0) return null
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-[2px] h-6">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all ${color}`}
          style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: 2 }}
        />
      ))}
    </div>
  )
}

// Sparklines — serão substituídos por dados reais do backend (stats.sparklines)
const SPARK_SESSIONS:  number[] = []
const SPARK_PATIENTS:  number[] = []
const SPARK_REPORTS:   number[] = []

export function StatsGrid() {
  const { data: stats } = useDashboardStats()

  const sessionsToday = stats?.todayPendingCount ?? 0
  const sessionsWeek  = stats?.weekAppointmentsCount ?? 0
  const activePatients = stats?.activePatientsCount ?? 0
  const pendingReports = stats?.pendingReportsCount ?? 0
  const revenue = stats?.monthRevenue
    ? `R$\u00a0${(stats.monthRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
    : 'R$\u00a0—'
  const revenueGrowth = stats?.monthRevenueGrowth ?? null

  return (
    <div className="grid grid-cols-12 gap-4">

      {/* ── HERO STAT: Receita do mês ── 4 colunas */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-4 card bg-dark border-0 flex flex-col justify-between gap-4 relative overflow-hidden min-h-[130px]">
        {/* Glow decorativo */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-neon/10 blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <span className="section-label text-white/40 tracking-widest">Receita do Mês</span>
          <span
            className="material-symbols-outlined text-neon/70 text-lg"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            payments
          </span>
        </div>

        <div className="relative z-10">
          <p className="font-display font-bold text-4xl text-white leading-none tracking-tight">
            {revenue}
          </p>
          {revenueGrowth !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${revenueGrowth >= 0 ? 'text-neon' : 'text-danger'}`}>
              <span className="material-symbols-outlined text-sm">
                {revenueGrowth >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% vs mês passado
            </div>
          )}
        </div>

        <Link
          to="/dashboard/financeiro"
          className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-neon/60 hover:text-neon transition-colors self-start"
        >
          Ver financeiro →
        </Link>
      </div>

      {/* ── Sessões hoje ── */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 card flex flex-col gap-3 justify-between">
        <div className="flex items-center justify-between">
          <span className="section-label">Hoje</span>
          <span
            className="material-symbols-outlined text-base text-info bg-info-surface p-1.5 rounded-md"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            today
          </span>
        </div>
        <p className="font-display font-bold text-3xl text-text-primary leading-none">
          {sessionsToday === 0 ? '—' : sessionsToday}
          <span className="text-sm font-sans font-normal text-text-tertiary ml-1">sessões</span>
        </p>
        <Spark values={SPARK_SESSIONS} color="bg-info" />
      </div>

      {/* ── Sessões na semana ── */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 card flex flex-col gap-3 justify-between">
        <div className="flex items-center justify-between">
          <span className="section-label">Semana</span>
          <span
            className="material-symbols-outlined text-base text-olive bg-neon-surface p-1.5 rounded-md"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            calendar_month
          </span>
        </div>
        <p className="font-display font-bold text-3xl text-text-primary leading-none">
          {sessionsWeek === 0 ? '—' : sessionsWeek}
          <span className="text-sm font-sans font-normal text-text-tertiary ml-1">sessões</span>
        </p>
        <Spark values={SPARK_SESSIONS} color="bg-neon" />
      </div>

      {/* ── Pacientes ativos ── */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 card flex flex-col gap-3 justify-between">
        <div className="flex items-center justify-between">
          <span className="section-label">Pacientes</span>
          <span
            className="material-symbols-outlined text-base text-olive bg-neon-surface p-1.5 rounded-md"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            groups
          </span>
        </div>
        <p className="font-display font-bold text-3xl text-text-primary leading-none">
          {activePatients === 0 ? '—' : activePatients}
          <span className="text-sm font-sans font-normal text-text-tertiary ml-1">ativos</span>
        </p>
        <Spark values={SPARK_PATIENTS} color="bg-olive" />
      </div>

      {/* ── Relatórios IA pendentes ── */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 card flex flex-col gap-3 justify-between">
        <div className="flex items-center justify-between">
          <span className="section-label">Relatórios IA</span>
          <span
            className="material-symbols-outlined text-base text-olive bg-neon-surface p-1.5 rounded-md"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            auto_awesome
          </span>
        </div>
        <p className="font-display font-bold text-3xl text-text-primary leading-none">
          {pendingReports === 0 ? '0' : pendingReports}
          <span className="text-sm font-sans font-normal text-text-tertiary ml-1">
            {pendingReports === 0 ? 'revisados' : 'pendentes'}
          </span>
        </p>
        <Spark values={SPARK_REPORTS} color={pendingReports > 0 ? 'bg-warning' : 'bg-success'} />
      </div>

    </div>
  )
}
