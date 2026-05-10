import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@/hooks/use-auth'
import { StatsGrid }      from '@/components/dashboard/StatsGrid'
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar'
import { AIAssistant }    from '@/components/dashboard/AIAssistant'
import { SmartReminders } from '@/components/dashboard/SmartReminders'
import { RecentPatients } from '@/components/dashboard/RecentPatients'
import { TaskList }       from '@/components/dashboard/TaskList'
import { QuickActions }   from '@/components/dashboard/QuickActions'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
})

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function DashboardHome() {
  const { user } = useUser()

  const firstName = (
    (user?.user_metadata as Record<string,string> | undefined)?.['nome']?.split(' ')[0] ??
    user?.user_metadata?.name?.split(' ')[0] ??
    user?.user_metadata?.full_name?.split(' ')[0] ??
    'Profissional'
  ) as string

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5">

      {/*
        ╔══════════════════════════════════════════════════════╗
        ║  PADRÃO F — mapa de calor                           ║
        ║                                                      ║
        ║  ████████████████████████  ← varredura 1 (stats)    ║
        ║  ████████████████████████  ← varredura 2 (ação+alerta)║
        ║  ████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← corpo esq (agenda)     ║
        ║  ████▓▓▓▓░░░░░░░░░░░░░░░░  ← corpo dir (IA)         ║
        ║  ████████▓▓▓▓▓▓░░░░░░░░░░  ← base (pacientes/tasks) ║
        ╚══════════════════════════════════════════════════════╝
      */}

      {/* ── Saudação ─────────────────────────────────────────
          Âncora visual no canto superior esquerdo — onde o
          olho começa a varredura F                           */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary capitalize">
            {today}
          </p>
          <h1 className="font-display font-bold text-xl text-text-primary leading-tight mt-0.5">
            {getGreeting()}, <span className="text-olive">{firstName}</span>
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-success-surface border border-success/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-success">Sistema ok</span>
        </div>
      </div>

      {/* ── VARREDURA 1: Stats horizontais ───────────────────
          KPIs de negócio — leitura rápida esquerda→direita  */}
      <StatsGrid />

      {/* ── VARREDURA 2: Command Center + Lembretes ──────────
          Ação mais importante do dia (esquerda, peso maior)
          + Alertas bloqueantes (direita, visibilidade imediata)
          Ambos exigem atenção e ação — ficam juntos aqui     */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Command Center — motor de ação diário */}
        <div className="lg:col-span-8">
          <QuickActions />
        </div>

        {/* Lembretes + Tarefas empilhados — alertas bloqueantes
            seguidos imediatamente pelo to-do administrativo    */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <SmartReminders />
          <TaskList />
        </div>

      </div>

      {/* ── CORPO: Agenda + IA Assistente ────────────────────
          Varredura vertical — olho desce pela esquerda
          Agenda: motor operacional do dia a dia (col maior)
          IA: promessa #1 da landing, insights clínicos       */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <div className="lg:col-span-7">
          <WeeklyCalendar />
        </div>

        <div className="lg:col-span-5">
          <AIAssistant />
        </div>

      </div>

      {/* ── BASE: Pacientes ──────────────────────────────────
          Tabela rica — adesão, última sessão, diagnóstico    */}
      <RecentPatients />

      {/* ── BLOG EVOLUA + BIBLIOTECA ─────────────────────────
          Conteúdo editorial da Evolua + acesso à biblioteca  */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Card: Postagens recentes do blog */}
        <div className="lg:col-span-8 card p-0 overflow-hidden border border-border-soft">
          {/* Header */}
          <div className="relative px-6 py-4 bg-dark flex items-center gap-4">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-neon" />
            <div className="flex items-center justify-center w-10 h-10 bg-neon/10 border border-neon/20 rounded-md flex-shrink-0">
              <span className="material-symbols-outlined text-neon text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>article</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm uppercase tracking-wide text-neon leading-tight">Blog Evolua</p>
              <p className="text-xs text-white/40 mt-0.5">Conteúdo clínico e de negócios para fonoaudiólogos</p>
            </div>
            <a
              href="https://evolua.com.br/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-neon/10 border border-neon/20 rounded text-xs font-bold text-neon uppercase tracking-wide hover:bg-neon/20 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Ver todos
            </a>
          </div>

          {/* Posts */}
          <div className="divide-y divide-border-soft">
            {([] as { tag: string; tagColor: string; title: string; excerpt: string; author: string; date: string; readTime: string; icon: string }[]).length === 0 ? (
              <div className="empty-state py-10">
                <span className="material-symbols-outlined text-3xl text-text-tertiary">article</span>
                <p className="text-sm text-text-secondary">Sem postagens no momento</p>
                <p className="text-xs text-text-tertiary">Acesse o blog para acompanhar conteúdos publicados</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Card: Biblioteca — acesso rápido */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Atalhos da biblioteca */}
          <div className="card p-4 flex flex-col gap-3">
            <p className="section-label">Biblioteca clínica</p>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Diretrizes e manuais',  icon: 'verified',     to: '/dashboard/biblioteca' },
                { label: 'Com evidência (DOI)',    icon: 'link',         to: '/dashboard/biblioteca' },
                { label: 'Salvos por você',        icon: 'bookmark',     to: '/dashboard/biblioteca' },
                { label: 'Assistente de estudos',  icon: 'auto_awesome', to: '/dashboard/biblioteca' },
              ].map(item => (
                <a key={item.label} href={item.to}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded hover:bg-surface-high transition-colors">
                  <span className="material-symbols-outlined text-text-tertiary group-hover:text-olive text-sm transition-colors" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {item.icon}
                  </span>
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors flex-1">{item.label}</span>
                  <span className="material-symbols-outlined text-[14px] text-text-tertiary group-hover:text-olive transition-colors">chevron_right</span>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="pt-4 border-t border-border-soft flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-text-tertiary">
        <p>© {new Date().getFullYear()} Evolua · Todos os direitos reservados</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-olive transition-colors">Suporte</a>
          <a href="#" className="hover:text-olive transition-colors">Privacidade</a>
          <a href="#" className="hover:text-olive transition-colors">Termos</a>
        </div>
      </footer>

    </div>
  )
}
