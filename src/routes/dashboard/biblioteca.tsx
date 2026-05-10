import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/dashboard/biblioteca')({
  component: BibliotecaPage,
})

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ArticleArea = 'linguagem' | 'voz' | 'fluencia' | 'degluticao' | 'audiologia' | 'tea' | 'caa'
type ArticleType = 'artigo' | 'diretriz' | 'protocolo' | 'revisao' | 'manual'

interface Article {
  id: string
  title: string
  authors: string
  source: string
  year: number
  area: ArticleArea
  type: ArticleType
  abstract: string
  doi?: string
  tags: string[]
  saved: boolean
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  timestamp: Date
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const ARTICLES: Article[] = []

// ── Respostas mock do chatbot ──────────────────────────────────────────────────

function generateChatResponse(_question: string, _articles: Article[]): { content: string; sources: string[] } {
  // TODO: integrar com endpoint de IA do backend (RAG sobre a biblioteca clínica).
  return {
    content: 'A assistente de estudos com IA será ativada em breve. Enquanto isso, utilize a busca e os filtros da biblioteca para localizar referências.',
    sources: [],
  }
}

// ── Config ────────────────────────────────────────────────────────────────────

const AREA_CFG: Record<ArticleArea, { label:string; color:string; icon:string }> = {
  linguagem:  { label:'Linguagem',   color:'text-info    bg-info-surface',    icon:'record_voice_over' },
  voz:        { label:'Voz',         color:'text-warning bg-warning-surface', icon:'mic'               },
  fluencia:   { label:'Fluência',    color:'text-olive   bg-neon-surface',    icon:'waves'             },
  degluticao: { label:'Deglutição',  color:'text-success bg-success-surface', icon:'water_drop'        },
  audiologia: { label:'Audiologia',  color:'text-danger  bg-danger-surface',  icon:'hearing'           },
  tea:        { label:'TEA',         color:'text-info    bg-info-surface',    icon:'neurology'         },
  caa:        { label:'CAA',         color:'text-olive   bg-neon-surface',    icon:'grid_view'         },
}

const TYPE_CFG: Record<ArticleType, { label:string; color:string }> = {
  artigo:   { label:'Artigo',    color:'text-text-secondary bg-surface-high'   },
  diretriz: { label:'Diretriz',  color:'text-danger  bg-danger-surface'        },
  protocolo:{ label:'Protocolo', color:'text-info    bg-info-surface'          },
  revisao:  { label:'Revisão',   color:'text-success bg-success-surface'       },
  manual:   { label:'Manual',    color:'text-olive   bg-neon-surface'          },
}

const SUGGESTED_QUESTIONS: string[] = []

// ── Componente Chat ───────────────────────────────────────────────────────────

function ChatPanel({ articles }: { articles: Article[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Olá! A assistente de estudos clínicos será ativada em breve. Quando integrada ao backend, ela poderá responder dúvidas baseando-se nas referências da sua biblioteca.',
      sources: [],
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSend(text?: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // TODO: substituir por chamada real ao endpoint de IA (RAG sobre a biblioteca).
    const { content, sources } = generateChatResponse(q, articles)
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      sources,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMsg])
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Renderiza markdown simples
  function renderContent(text: string) {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-text-primary mt-2 mb-0.5">{line.slice(2, -2)}</p>
      }
      // Bold inline
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      const rendered = parts.map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>
          : part
      )
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc text-text-secondary">{rendered.slice(1)}</li>
      }
      if (line.startsWith('#')) {
        return null // skip markdown headers
      }
      if (line === '') return <div key={i} className="h-1" />
      return <p key={i} className="text-text-secondary leading-relaxed">{rendered}</p>
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-soft bg-surface">
        <div className="w-8 h-8 rounded bg-dark flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-neon text-sm" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-xs uppercase tracking-wider text-text-primary">Assistente Clínico</p>
          <p className="text-[10px] text-text-tertiary">Baseado na sua biblioteca · {ARTICLES.length} referências indexadas</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-success-surface border border-success/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wide text-success">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === 'assistant' ? 'bg-dark' : 'bg-neon'
            }`}>
              <span className={`material-symbols-outlined text-sm ${msg.role === 'assistant' ? 'text-neon' : 'text-dark'}`}
                style={{fontVariationSettings:'"FILL" 1'}}>
                {msg.role === 'assistant' ? 'auto_awesome' : 'person'}
              </span>
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-dark text-white'
                  : 'bg-surface border border-border-soft text-text-secondary'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="flex flex-col gap-0.5 prose-sm">
                    {renderContent(msg.content)}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-col gap-1 w-full">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-text-tertiary px-1">Fontes citadas:</p>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="flex items-start gap-1.5 px-2 py-1.5 bg-neon-surface rounded border border-olive/20">
                      <span className="material-symbols-outlined text-olive text-[12px] mt-0.5 flex-shrink-0" style={{fontVariationSettings:'"FILL" 1'}}>library_books</span>
                      <p className="text-[10px] text-olive leading-tight">{src}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[9px] text-text-tertiary px-1">
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded bg-dark flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-neon text-sm" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
            </div>
            <div className="px-4 py-3 bg-surface border border-border-soft rounded flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-olive animate-bounce" style={{animationDelay:'0ms'}} />
              <span className="w-1.5 h-1.5 rounded-full bg-olive animate-bounce" style={{animationDelay:'150ms'}} />
              <span className="w-1.5 h-1.5 rounded-full bg-olive animate-bounce" style={{animationDelay:'300ms'}} />
              <span className="text-[10px] text-text-tertiary ml-1">Analisando referências...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map(q => (
            <button key={q} onClick={() => handleSend(q)}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded border border-border-soft bg-surface text-text-tertiary hover:text-olive hover:border-olive/40 hover:bg-neon-surface transition-colors text-left">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border-soft bg-surface-low">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre qualquer tema clínico, caso ou referência..."
            rows={2}
            className="flex-1 input resize-none text-xs leading-relaxed"
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary flex items-center justify-center w-10 h-10 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:'"FILL" 1'}}>send</span>
          </button>
        </div>
        <p className="text-[9px] text-text-tertiary mt-2 text-center">
          Enter para enviar · Shift+Enter para quebrar linha · Respostas baseadas nas referências da sua biblioteca
        </p>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function BibliotecaPage() {
  const [search, setSearch]           = useState('')
  const [areaFilter, setAreaFilter]   = useState<ArticleArea|'all'>('all')
  const [typeFilter, setTypeFilter]   = useState<ArticleType|'all'>('all')
  const [savedFilter, setSavedFilter] = useState(false)
  const [expanded, setExpanded]       = useState<string|null>(null)
  const [savedIds, setSavedIds]       = useState<Set<string>>(
    new Set(ARTICLES.filter(a => a.saved).map(a => a.id))
  )
  const [chatOpen, setChatOpen]       = useState(true)

  const filtered = ARTICLES.filter(a => {
    const matchSearch = search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.authors.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchArea = areaFilter === 'all' || a.area === areaFilter
    const matchType = typeFilter === 'all' || a.type === typeFilter
    const matchSaved = !savedFilter || savedIds.has(a.id)
    return matchSearch && matchArea && matchType && matchSaved
  })

  function toggleSave(id: string) {
    setSavedIds(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Painel esquerdo: Biblioteca ────────────────────────────────────── */}
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ${chatOpen ? 'w-full lg:w-[55%]' : 'w-full'}`}>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Biblioteca</h1>
              <p className="text-sm text-text-secondary mt-0.5">Artigos, diretrizes e protocolos clínicos</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSavedFilter(s => !s)}
                className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-bold uppercase tracking-wide transition-colors ${
                  savedFilter ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-tertiary hover:text-text-primary'
                }`}>
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:`"FILL" ${savedFilter ? 1 : 0}`}}>bookmark</span>
                {savedIds.size}
              </button>
              <button className="btn-primary flex items-center gap-2 text-xs px-3 py-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Adicionar
              </button>
              {/* Toggle chat mobile */}
              <button
                onClick={() => setChatOpen(o => !o)}
                className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-bold uppercase tracking-wide transition-colors lg:hidden ${
                  chatOpen ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-tertiary'
                }`}>
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:'"FILL" 1'}}>auto_awesome</span>
              </button>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Referências', value: ARTICLES.length,    icon:'library_books',  color:'text-text-primary' },
              { label:'Diretrizes',  value: ARTICLES.filter(a => a.type === 'diretriz' || a.type === 'manual').length, icon:'verified', color:'text-danger' },
              { label:'Com DOI',     value: ARTICLES.filter(a => a.doi).length, icon:'link', color:'text-info' },
              { label:'Salvos',      value: savedIds.size, icon:'bookmark', color:'text-olive' },
            ].map(s => (
              <div key={s.label} className="card p-4 flex flex-col gap-1">
                <span className={`material-symbols-outlined ${s.color}`} style={{fontVariationSettings:'"FILL" 1'}}>{s.icon}</span>
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título, autor ou tag..."
                className="input w-full pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setAreaFilter('all')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-colors ${
                  areaFilter === 'all' ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-tertiary hover:text-text-primary'
                }`}>
                Todas
              </button>
              {(Object.keys(AREA_CFG) as ArticleArea[]).map(area => (
                <button key={area} onClick={() => setAreaFilter(areaFilter === area ? 'all' : area)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-colors ${
                    areaFilter === area ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-tertiary hover:text-text-primary'
                  }`}>
                  <span className="material-symbols-outlined text-[12px]">{AREA_CFG[area].icon}</span>
                  {AREA_CFG[area].label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary self-center">Tipo:</span>
              {(['all', ...Object.keys(TYPE_CFG)] as ('all'|ArticleType)[]).map(type => (
                <button key={type} onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                    typeFilter === type ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-tertiary hover:text-text-primary'
                  }`}>
                  {type === 'all' ? 'Todos' : TYPE_CFG[type as ArticleType].label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          <p className="text-xs text-text-tertiary">{filtered.length} referência{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>

          {/* Lista de artigos */}
          {filtered.length === 0 ? (
            <div className="empty-state mt-4">
              <div className="empty-state__icon">
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <p className="empty-state__title">Nenhuma referência encontrada</p>
              <p className="empty-state__desc">Tente outros termos ou explore as categorias para descobrir conteúdo científico.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-6">
              {filtered.map(article => {
                const areaCfg = AREA_CFG[article.area]
                const typeCfg = TYPE_CFG[article.type]
                const isOpen  = expanded === article.id
                const isSaved = savedIds.has(article.id)

                return (
                  <div key={article.id} className="card p-0 overflow-hidden">
                    <div className="p-4 flex flex-col gap-3">
                      {/* Badges + ações */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${typeCfg.color}`}>
                          {typeCfg.label}
                        </span>
                        <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${areaCfg.color}`}>
                          <span className="material-symbols-outlined text-[10px]">{areaCfg.icon}</span>
                          {areaCfg.label}
                        </span>
                        <span className="text-[9px] text-text-tertiary">{article.year}</span>
                        <div className="ml-auto flex items-center gap-2">
                          {article.doi && (
                            <a
                              href={`https://doi.org/${article.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] font-bold text-info hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                              DOI
                            </a>
                          )}
                          <button onClick={() => toggleSave(article.id)}
                            className={`transition-colors ${isSaved ? 'text-olive' : 'text-text-tertiary hover:text-olive'}`}>
                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:`"FILL" ${isSaved ? 1 : 0}`}}>bookmark</span>
                          </button>
                        </div>
                      </div>

                      {/* Título */}
                      <div>
                        <h3 className="font-bold text-sm text-text-primary leading-snug">{article.title}</h3>
                        <p className="text-xs text-text-tertiary mt-0.5">{article.authors} — <em>{article.source}</em></p>
                      </div>

                      {/* Abstract */}
                      <p className={`text-xs text-text-secondary leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                        {article.abstract}
                      </p>
                      <button onClick={() => setExpanded(isOpen ? null : article.id)}
                        className="text-[10px] font-bold text-olive hover:underline self-start">
                        {isOpen ? 'Ver menos' : 'Ver resumo completo'}
                      </button>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map(tag => (
                          <button key={tag}
                            onClick={() => setSearch(tag)}
                            className="text-[9px] font-bold bg-surface-low text-text-tertiary hover:text-olive hover:bg-neon-surface px-2 py-0.5 rounded transition-colors">
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex items-center relative w-0">
        <div className="absolute inset-y-0 left-0 w-px bg-border-soft" />
        {/* Toggle chat button */}
        <button
          onClick={() => setChatOpen(o => !o)}
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-12 rounded bg-surface border border-border-soft flex items-center justify-center text-text-tertiary hover:text-olive hover:border-olive/40 transition-colors z-10"
          title={chatOpen ? 'Fechar chat' : 'Abrir chat'}
        >
          <span className="material-symbols-outlined text-sm">
            {chatOpen ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* ── Painel direito: Chatbot ────────────────────────────────────────── */}
      <div className={`hidden lg:flex flex-col border-l border-border-soft bg-surface-low transition-all duration-300 overflow-hidden ${
        chatOpen ? 'lg:w-[45%]' : 'lg:w-0'
      }`}>
        {chatOpen && <ChatPanel articles={filtered} />}
      </div>

      {/* ── Chat mobile (overlay) ──────────────────────────────────────────── */}
      {chatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-surface flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-soft">
            <button onClick={() => setChatOpen(false)} className="text-text-tertiary hover:text-text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <p className="font-display font-bold text-sm uppercase tracking-wide text-text-primary">Assistente Clínico</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel articles={filtered} />
          </div>
        </div>
      )}

    </div>
  )
}
