import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/mais')({
  component: MaisPage,
})

const FEATURES = [
  {
    group: 'Clínica',
    items: [
      { icon:'mic',              label:'Sessão',              desc:'Gravar, transcrever e gerar relatório com IA',         to:'/dashboard/sessao',               badge:''     },
      { icon:'event',            label:'Agenda',              desc:'Calendário de sessões e agendamentos',                 to:'/dashboard/agenda',               badge:''     },
      { icon:'group',            label:'Pacientes',           desc:'Prontuários, histórico e evolução clínica',            to:'/dashboard/pacientes',            badge:''     },
      { icon:'clinical_notes',   label:'Prontuário',          desc:'Prontuário nativo para fonoaudiologia com escalas',    to:'/dashboard/prontuario',           badge:''     },
      { icon:'target',           label:'Plano Terapêutico',   desc:'Objetivos por área com tracking session-by-session',   to:'/dashboard/plano-terapeutico',    badge:'Novo' },
      { icon:'timeline',         label:'Linha do Tempo',      desc:'Histórico clínico completo com marcos e evolução',     to:'/dashboard/linha-do-tempo',       badge:'Novo' },
      { icon:'send',             label:'Encaminhamentos',     desc:'Templates para escola, médico e neuropediatra',        to:'/dashboard/encaminhamentos',      badge:'Novo' },
      { icon:'description',      label:'Relatórios',          desc:'Relatórios clínicos gerados e revisados por IA',       to:'/dashboard/relatorios',           badge:''     },
    ],
  },
  {
    group: 'Recursos',
    items: [
      { icon:'grid_view',    label:'Painel CAA',   desc:'Pictogramas e construtor de frases interativo',   to:'/dashboard/caa',        badge:'Novo' },
      { icon:'folder',       label:'Materiais',    desc:'Biblioteca de protocolos, escalas e atividades',  to:'/dashboard/materiais',  badge:''     },
      { icon:'local_library',label:'Biblioteca',   desc:'Artigos, diretrizes e protocolos científicos',    to:'/dashboard/biblioteca', badge:''     },
      { icon:'campaign',     label:'Marketing',    desc:'Templates de posts e geração de conteúdo com IA', to:'/dashboard/marketing',  badge:''     },
      { icon:'task_alt',     label:'Tarefas',      desc:'Lista de tarefas e pendências administrativas',   to:'/dashboard/tarefas',    badge:''     },
    ],
  },
  {
    group: 'Gestão',
    items: [
      { icon:'payments',     label:'Financeiro',       desc:'Receitas, despesas e cobranças pendentes',        to:'/dashboard/financeiro',    badge:''     },
      { icon:'send',         label:'WhatsApp',         desc:'Lembretes automáticos para pacientes',            to:'/dashboard/pacientes',     badge:'Auto' },
      { icon:'video_call',   label:'Teleconsulta',     desc:'Atendimentos por vídeo conforme normas do CFoF',  to:'/dashboard/sessao',        badge:'CFoF' },
    ],
  },
  {
    group: 'Conta',
    items: [
      { icon:'person',       label:'Perfil',           desc:'Dados profissionais e registro CRFa',             to:'/dashboard/perfil',        badge:''     },
      { icon:'settings',     label:'Configurações',    desc:'Clínica, notificações, IA e pagamentos',          to:'/dashboard/configuracoes', badge:''     },
    ],
  },
]

function MaisPage() {
  return (
    <div className="flex flex-col gap-6 p-6">

      <div>
        <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Recursos</h1>
        <p className="text-sm text-text-secondary mt-0.5">Todos os módulos do sistema em um só lugar</p>
      </div>

      <div className="flex flex-col gap-8">
        {FEATURES.map(group => (
          <div key={group.group}>
            <p className="section-label mb-3">{group.group}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {group.items.map(item => (
                <Link key={item.to + item.label} to={item.to}
                  className="card p-4 flex flex-col gap-3 hover:shadow-[var(--shadow-card)] transition-all hover:border-border group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded bg-neon-surface border border-border-neon flex items-center justify-center">
                      <span className="material-symbols-outlined text-olive group-hover:scale-110 transition-transform" style={{fontVariationSettings:'"FILL" 1'}}>{item.icon}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-olive bg-neon-surface border border-border-neon px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-text-primary group-hover:text-olive transition-colors">{item.label}</p>
                    <p className="text-xs text-text-tertiary mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary group-hover:text-olive transition-colors mt-auto">
                    Acessar
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
