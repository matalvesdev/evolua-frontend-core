import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/caa')({
  component: CAAPage,
})

// ── Mock pictogramas ──────────────────────────────────────────────────────────

type Category = 'emocoes' | 'necessidades' | 'atividades' | 'alimentos' | 'lugares' | 'pessoas'

interface Pictogram {
  id: string
  label: string
  icon: string
  category: Category
  color: string
}

const PICTOGRAMS: Pictogram[] = []

const CATEGORY_LABELS: Record<Category, string> = {
  emocoes:     'Emoções',
  necessidades:'Necessidades',
  atividades:  'Atividades',
  alimentos:   'Alimentos',
  lugares:     'Lugares',
  pessoas:     'Pessoas',
}

function CAAPage() {
  const [activeCategory, setActiveCategory] = useState<Category|'all'>('all')
  const [sentence, setSentence] = useState<Pictogram[]>([])
  const [search, setSearch] = useState('')

  const filtered = PICTOGRAMS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchSearch = search === '' || p.label.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function addToSentence(p: Pictogram) {
    setSentence(s => [...s, p])
  }

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Painel CAA</h1>
          <p className="text-sm text-text-secondary mt-0.5">Comunicação Aumentativa e Alternativa</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="btn-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">print</span>
            Imprimir painel
          </button>
          <button className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Novo pictograma
          </button>
        </div>
      </div>

      {/* Construtor de frase */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 bg-dark flex items-center justify-between">
          <p className="font-display font-bold text-sm uppercase tracking-widest text-neon">Construtor de Frase</p>
          <button
            onClick={() => setSentence([])}
            className="text-[10px] font-bold uppercase tracking-wide text-white/40 hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Limpar
          </button>
        </div>
        <div className="p-4 min-h-[80px] flex items-center gap-2 flex-wrap bg-surface-low">
          {sentence.length === 0 ? (
            <p className="text-sm text-text-secondary">Clique nos pictogramas abaixo para montar uma frase...</p>
          ) : (
            <>
              {sentence.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSentence(s => s.filter((_,idx) => idx !== i))}
                  className={`flex flex-col items-center gap-1 p-2 rounded border border-transparent hover:border-danger/30 transition-colors group ${p.color}`}
                >
                  <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings:'"FILL" 1'}}>{p.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">{p.label}</span>
                  <span className="text-[8px] text-danger opacity-0 group-hover:opacity-100 transition-opacity">remover</span>
                </button>
              ))}
              <button
                onClick={() => {
                  const text = sentence.map(p => p.label).join(' ')
                  if ('speechSynthesis' in window) {
                    const utt = new SpeechSynthesisUtterance(text)
                    utt.lang = 'pt-BR'
                    window.speechSynthesis.speak(utt)
                  }
                }}
                className="ml-2 flex items-center gap-1.5 px-4 py-2 bg-dark text-neon rounded font-bold text-xs uppercase tracking-wide hover:bg-dark-raised transition-colors"
              >
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:'"FILL" 1'}}>volume_up</span>
                Falar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar pictograma..."
            className="input w-full pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors border ${
              activeCategory === 'all'
                ? 'bg-dark text-neon border-dark'
                : 'bg-surface border-border-soft text-text-tertiary hover:text-text-primary'
            }`}
          >
            Todos
          </button>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors border ${
                activeCategory === cat
                  ? 'bg-dark text-neon border-dark'
                  : 'bg-surface border-border-soft text-text-tertiary hover:text-text-primary'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de pictogramas */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => addToSentence(p)}
            className={`flex flex-col items-center gap-2 p-3 rounded border border-transparent hover:border-border hover:shadow-[var(--shadow-card)] transition-all active:scale-95 ${p.color}`}
          >
            <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings:'"FILL" 1'}}>{p.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight">{p.label}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">search_off</span>
          </div>
          <p className="empty-state__title">Nenhum pictograma encontrado</p>
          <p className="empty-state__desc">Tente outra categoria ou busca para localizar o pictograma desejado.</p>
        </div>
      )}
    </div>
  )
}
