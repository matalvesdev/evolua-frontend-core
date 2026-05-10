import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/marketing')({
  component: MarketingPage,
})

// ── Tipos ─────────────────────────────────────────────────────────────────────

type PostCategory = 'conscientizacao' | 'dica' | 'depoimento' | 'servico' | 'data'
type PostFormat   = 'feed' | 'stories' | 'reels' | 'carrossel'
type PostStatus   = 'rascunho' | 'agendado' | 'publicado'

interface PostTemplate {
  id: string
  title: string
  caption: string
  category: PostCategory
  format: PostFormat
  hashtags: string[]
  color: string       // classe de bg para o card visual
}

interface ScheduledPost {
  id: string
  templateId: string
  title: string
  format: PostFormat
  scheduledFor: string  // ISO
  status: PostStatus
  platform: 'instagram' | 'whatsapp'
  reach?: number
  likes?: number
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const TEMPLATES: PostTemplate[] = []

const SCHEDULED: ScheduledPost[] = []

// ── Config ────────────────────────────────────────────────────────────────────

const CATEGORY_CFG: Record<PostCategory, { label:string; icon:string; color:string }> = {
  conscientizacao:{ label:'Conscientização', icon:'campaign',       color:'text-info    bg-info-surface'    },
  dica:           { label:'Dica',            icon:'lightbulb',      color:'text-olive   bg-neon-surface'    },
  depoimento:     { label:'Depoimento',      icon:'format_quote',   color:'text-success bg-success-surface' },
  servico:        { label:'Serviço',         icon:'medical_services',color:'text-warning bg-warning-surface'},
  data:           { label:'Data especial',   icon:'celebration',    color:'text-danger  bg-danger-surface'  },
}

const FORMAT_CFG: Record<PostFormat, { label:string; icon:string }> = {
  feed:      { label:'Feed',      icon:'crop_square'    },
  stories:   { label:'Stories',   icon:'crop_portrait'  },
  reels:     { label:'Reels',     icon:'play_circle'    },
  carrossel: { label:'Carrossel', icon:'view_carousel'  },
}

const STATUS_CFG: Record<PostStatus, { label:string; color:string }> = {
  rascunho:  { label:'Rascunho',  color:'text-text-tertiary bg-surface-high'  },
  agendado:  { label:'Agendado',  color:'text-info          bg-info-surface'  },
  publicado: { label:'Publicado', color:'text-success       bg-success-surface'},
}

function formatSchedule(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
}

// ── IA Generator Modal ────────────────────────────────────────────────────────

function AIGeneratorModal({ onClose }: { onClose: () => void }) {
  const [topic, setTopic]     = useState('')
  const [format, setFormat]   = useState<PostFormat>('feed')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState('')

  function generate() {
    if (!topic.trim()) return
    setLoading(true)
    setResult('')
    // TODO: substituir por chamada real ao endpoint de geração de conteúdo (IA).
    setLoading(false)
    setResult('A geração de conteúdo com IA estará disponível em breve.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-lg shadow-[var(--shadow-dark)] w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neon" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
            <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Gerar com IA</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="section-label block mb-1.5">Tema ou assunto</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ex: disfagia em idosos, TEA e comunicação, higiene vocal..."
              className="input w-full"
            />
          </div>
          <div>
            <label className="section-label block mb-1.5">Formato</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(FORMAT_CFG) as PostFormat[]).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${
                    format === f ? 'bg-dark text-neon border-dark' : 'border-border-soft text-text-tertiary hover:text-text-primary'
                  }`}>
                  <span className="material-symbols-outlined text-sm">{FORMAT_CFG[f].icon}</span>
                  {FORMAT_CFG[f].label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-3 p-4 bg-neon-surface border border-border-neon rounded">
              <span className="material-symbols-outlined text-olive animate-spin">progress_activity</span>
              <p className="text-sm text-olive font-bold">IA escrevendo seu post...</p>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col gap-2">
              <label className="section-label">Post gerado</label>
              <textarea
                value={result}
                onChange={e => setResult(e.target.value)}
                rows={8}
                className="input w-full resize-none text-xs leading-relaxed"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-outline">Cancelar</button>
            {result ? (
              <button onClick={onClose} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">save</span>
                Salvar template
              </button>
            ) : (
              <button onClick={generate} disabled={!topic.trim() || loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
                Gerar post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function MarketingPage() {
  const [tab, setTab]             = useState<'templates'|'agendamento'|'metricas'>('templates')
  const [catFilter, setCatFilter] = useState<PostCategory|'all'>('all')
  const [showAI, setShowAI]       = useState(false)
  const [expanded, setExpanded]   = useState<string|null>(null)

  const filtered = TEMPLATES.filter(t => catFilter === 'all' || t.category === catFilter)

  const agendados  = SCHEDULED.filter(s => s.status === 'agendado').length
  const publicados = SCHEDULED.filter(s => s.status === 'publicado').length

  return (
    <div className="flex flex-col gap-6 p-6">
      {showAI && <AIGeneratorModal onClose={() => setShowAI(false)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Marketing</h1>
          <p className="text-sm text-text-secondary mt-0.5">Templates de posts e geração de conteúdo com IA</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAI(true)}
            className="btn-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
            Gerar com IA
          </button>
          <button className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Novo template
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Templates',       value: TEMPLATES.length, icon:'library_books',  color:'text-text-primary' },
          { label:'Agendados',        value: agendados,        icon:'schedule_send',  color:'text-info'         },
          { label:'Publicados',       value: publicados,       icon:'check_circle',   color:'text-success'      },
          { label:'Alcance estimado', value: '—',              icon:'people',         color:'text-olive'        },
        ].map(s => (
          <div key={s.label} className="card p-4 flex flex-col gap-1">
            <span className={`material-symbols-outlined ${s.color}`} style={{fontVariationSettings:'"FILL" 1'}}>{s.icon}</span>
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-soft">
        {([['templates','Templates'],['agendamento','Agendamento'],['metricas','Métricas']] as const).map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
              tab === v
                ? 'border-dark text-text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── TEMPLATES ── */}
      {tab === 'templates' && (
        <div className="flex flex-col gap-4">
          {/* Filtros de categoria */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCatFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-colors ${
                catFilter === 'all' ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-tertiary hover:text-text-primary'
              }`}>
              Todos ({TEMPLATES.length})
            </button>
            {(Object.keys(CATEGORY_CFG) as PostCategory[]).map(cat => {
              const count = TEMPLATES.filter(t => t.category === cat).length
              if (count === 0) return null
              const cfg = CATEGORY_CFG[cat]
              return (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-colors ${
                    catFilter === cat ? 'bg-dark text-neon border-dark' : `border-border-soft text-text-tertiary hover:text-text-primary`
                  }`}>
                  <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                  {cfg.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Grade de templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => {
              const catCfg = CATEGORY_CFG[t.category]
              const fmtCfg = FORMAT_CFG[t.format]
              const isOpen = expanded === t.id
              return (
                <div key={t.id} className="card p-0 overflow-hidden flex flex-col">
                  {/* Visual preview */}
                  <div className={`${t.color} p-6 flex flex-col items-center justify-center min-h-[100px] relative`}>
                    <span className="material-symbols-outlined text-4xl opacity-20" style={{fontVariationSettings:'"FILL" 1'}}>
                      {catCfg.icon}
                    </span>
                    <p className="font-display font-bold text-sm text-center text-text-primary mt-2 leading-tight">
                      {t.title}
                    </p>
                    {/* Badge de formato */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide text-text-secondary">
                      <span className="material-symbols-outlined text-[10px]">{fmtCfg.icon}</span>
                      {fmtCfg.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${catCfg.color}`}>
                        {catCfg.label}
                      </span>
                    </div>

                    {/* Legenda — colapsável */}
                    <p className={`text-xs text-text-secondary leading-relaxed ${isOpen ? '' : 'line-clamp-3'}`}>
                      {t.caption}
                    </p>
                    <button onClick={() => setExpanded(isOpen ? null : t.id)}
                      className="text-[10px] font-bold text-olive hover:underline self-start">
                      {isOpen ? 'Ver menos' : 'Ver mais'}
                    </button>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {t.hashtags.slice(0,3).map(h => (
                        <span key={h} className="text-[9px] font-bold text-text-tertiary bg-surface-low px-1.5 py-0.5 rounded">
                          {h}
                        </span>
                      ))}
                      {t.hashtags.length > 3 && (
                        <span className="text-[9px] text-text-tertiary">+{t.hashtags.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 px-4 py-3 border-t border-border-soft bg-surface-low">
                    <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary hover:text-olive transition-colors">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copiar
                    </button>
                    <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary hover:text-olive transition-colors ml-2">
                      <span className="material-symbols-outlined text-sm">schedule_send</span>
                      Agendar
                    </button>
                    <button className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary hover:text-danger transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">
                <span className="material-symbols-outlined">library_books</span>
              </div>
              <p className="empty-state__title">Nenhum template disponível</p>
              <p className="empty-state__desc">Os templates de posts aparecerão aqui quando estiverem disponíveis.</p>
            </div>
          )}
        </div>
      )}

      {/* ── AGENDAMENTO ── */}
      {tab === 'agendamento' && (

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="section-label">{SCHEDULED.length} posts programados</p>
            <button className="btn-primary flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-sm">add</span>
              Agendar post
            </button>
          </div>
          <div className="card p-0 overflow-hidden divide-y divide-border-soft">
            {SCHEDULED.length === 0 ? (
              <div className="empty-state py-12">
                <span className="material-symbols-outlined text-4xl text-text-tertiary">schedule</span>
                <p className="text-sm text-text-secondary">Nenhum post agendado</p>
                <p className="text-xs text-text-tertiary">Use o botão acima para criar um agendamento</p>
              </div>
            ) : (
              SCHEDULED.sort((a,b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()).map(post => {
              const fmtCfg = FORMAT_CFG[post.format]
              const stCfg  = STATUS_CFG[post.status]
              return (
                <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-low transition-colors">
                  <div className="w-9 h-9 rounded bg-surface-low border border-border-soft flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm text-text-secondary">{fmtCfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{post.title}</p>
                    <p className="text-xs text-text-tertiary">{fmtCfg.label} · {post.platform}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${stCfg.color}`}>
                      {stCfg.label}
                    </span>
                    <p className="text-[10px] text-text-tertiary">{formatSchedule(post.scheduledFor)}</p>
                  </div>
                </div>
              )
            })
            )}
          </div>
        </div>
      )}

      {/* ── MÉTRICAS ── */}
      {tab === 'metricas' && (
        <div className="flex flex-col gap-4">
          {/* Banner informativo */}
          <div className="flex items-center gap-3 p-4 bg-neon-surface border border-border-neon rounded">
            <span className="material-symbols-outlined text-olive" style={{fontVariationSettings:'"FILL" 1'}}>info</span>
            <div>
              <p className="text-sm font-bold text-olive">Métricas em breve</p>
              <p className="text-xs text-text-secondary mt-0.5">A integração com Instagram Insights está em desenvolvimento.</p>
            </div>
          </div>

          {/* Métricas estimadas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Alcance estimado', value:'—',                icon:'people',           color:'text-info'    },
              { label:'Impressões',       value:'—',                icon:'visibility',        color:'text-text-primary'},
              { label:'Posts publicados', value: String(publicados), icon:'check_circle', color:'text-success'},
              { label:'Engajamento',      value:'—',                icon:'favorite',          color:'text-danger'  },
            ].map(s => (
              <div key={s.label} className="card p-4 flex flex-col gap-1">
                <span className={`material-symbols-outlined ${s.color}`} style={{fontVariationSettings:'"FILL" 1'}}>{s.icon}</span>
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Posts publicados */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-border-soft">
              <p className="section-label">Posts publicados</p>
            </div>
            <div className="divide-y divide-border-soft">
              {SCHEDULED.filter(s => s.status === 'publicado').length === 0 ? (
                <div className="empty-state py-10">
                  <p className="text-sm text-text-secondary">Sem posts publicados ainda</p>
                </div>
              ) : (
                SCHEDULED.filter(s => s.status === 'publicado').map(post => (
                <div key={post.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary">{post.title}</p>
                    <p className="text-xs text-text-tertiary">{FORMAT_CFG[post.format].label} · {formatSchedule(post.scheduledFor)}</p>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="font-display font-bold text-sm text-text-primary">{post.reach ?? 0}</p>
                      <p className="text-[9px] text-text-tertiary uppercase tracking-wide">alcance</p>
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm text-success">{post.likes ?? 0}</p>
                      <p className="text-[9px] text-text-tertiary uppercase tracking-wide">likes</p>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
