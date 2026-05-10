import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/exercicios')({
  component: ExerciciosPage,
})

interface Exercise {
  id: string
  title: string
  area: string
  duration: string
  level: 'Fácil' | 'Médio' | 'Difícil'
  description: string
  videoUrl: string // placeholder
  tags: string[]
}

const EXERCISES: Exercise[] = []

const PATIENTS: string[] = []

const AREA_COLORS: Record<string, string> = {
  'Voz': 'bg-purple-100 text-purple-700',
  'Mot. Orofacial': 'bg-green-100 text-green-700',
  'Linguagem': 'bg-blue-100 text-blue-700',
  'Gagueira': 'bg-yellow-100 text-yellow-700',
  'Disfagia': 'bg-red-100 text-red-700',
  'TEA': 'bg-pink-100 text-pink-700',
}

const LEVEL_COLORS: Record<string, string> = {
  'Fácil': 'text-success', 'Médio': 'text-warning', 'Difícil': 'text-danger',
}

function ExerciciosPage() {
  const [filter, setFilter] = useState('Todos')
  const [selected, setSelected] = useState<Exercise[]>([])
  const [showPrescribe, setShowPrescribe] = useState(false)
  const [prescribeForm, setPrescribeForm] = useState({ patient: PATIENTS[0], freq: 'Diário', reminder: true, notes: '' })
  const [prescribed, setPrescribed] = useState<string[]>([])

  const areas = ['Todos', ...Array.from(new Set(EXERCISES.map(e => e.area)))]
  const filtered = filter === 'Todos' ? EXERCISES : EXERCISES.filter(e => e.area === filter)

  function toggleSelect(ex: Exercise) {
    setSelected(s => s.some(x => x.id === ex.id) ? s.filter(x => x.id !== ex.id) : [...s, ex])
  }

  function prescribe() {
    // TODO: integrar com /api/messages (canal=whatsapp) quando o backend
    // de prescrição em lote estiver pronto. Hoje apenas marca local.
    setPrescribed(prev => [...prev, ...selected.map(e => e.id)])
    setSelected([])
    setShowPrescribe(false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Modal prescrição */}
      {showPrescribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface w-full max-w-md shadow-[var(--shadow-dark)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-dark">
              <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Prescrever Exercícios</h2>
              <button onClick={() => setShowPrescribe(false)} className="text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* Resumo */}
              <div className="flex flex-col gap-1.5">
                <p className="section-label">Exercícios selecionados</p>
                {selected.map(ex => (
                  <div key={ex.id} className="flex items-center gap-2 text-sm text-text-primary">
                    <span className="material-symbols-outlined text-sm text-olive">fitness_center</span>
                    {ex.title}
                  </div>
                ))}
              </div>
              <div>
                <label className="section-label block mb-1.5">Paciente</label>
                <select value={prescribeForm.patient} onChange={e => setPrescribeForm(f=>({...f,patient:e.target.value}))} className="input w-full">
                  {PATIENTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label block mb-1.5">Frequência</label>
                <select value={prescribeForm.freq} onChange={e => setPrescribeForm(f=>({...f,freq:e.target.value}))} className="input w-full">
                  {['Diário','2x por semana','3x por semana','A cada 2 dias'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={prescribeForm.reminder} onChange={e => setPrescribeForm(f=>({...f,reminder:e.target.checked}))} className="w-4 h-4 accent-[var(--color-olive)]" />
                <span className="text-sm text-text-primary">Ativar lembretes automáticos via WhatsApp</span>
              </label>
              <div>
                <label className="section-label block mb-1.5">Observações</label>
                <textarea value={prescribeForm.notes} onChange={e => setPrescribeForm(f=>({...f,notes:e.target.value}))} rows={2} className="input w-full resize-none text-sm" placeholder="Instruções adicionais..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPrescribe(false)} className="flex-1 btn-outline">Cancelar</button>
                <button onClick={prescribe} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">send</span>
                  Enviar via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Exercícios</h1>
          <p className="text-sm text-text-secondary mt-0.5">Prescreva exercícios com vídeo direto no WhatsApp do paciente</p>
        </div>
        {selected.length > 0 && (
          <button onClick={() => setShowPrescribe(true)} className="btn-primary flex items-center gap-2 self-start">
            <span className="material-symbols-outlined text-sm">send</span>
            Prescrever {selected.length} exercício{selected.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Filtros de área */}
      <div className="flex flex-wrap gap-2">
        {areas.map(a => (
          <button key={a} onClick={() => setFilter(a)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-colors ${
              filter === a ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-tertiary hover:border-border'
            }`}>
            {a}
          </button>
        ))}
      </div>

      {/* Grid de exercícios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(ex => {
          const isSelected = selected.some(s => s.id === ex.id)
          const wasSent = prescribed.includes(ex.id)
          return (
            <div
              key={ex.id}
              onClick={() => toggleSelect(ex)}
              className={`card p-4 cursor-pointer transition-all flex flex-col gap-3 ${
                isSelected ? 'border-2 border-olive bg-neon-surface' : 'hover:border-border'
              } ${wasSent ? 'opacity-60' : ''}`}
            >
              {/* Área + selecionado */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${AREA_COLORS[ex.area] ?? 'bg-surface-low text-text-tertiary'}`}>
                  {ex.area}
                </span>
                {isSelected && (
                  <span className="material-symbols-outlined text-olive text-lg" style={{ fontVariationSettings:'"FILL" 1' }}>check_circle</span>
                )}
                {wasSent && !isSelected && (
                  <span className="text-[10px] font-bold text-success flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-sm">check</span>
                    Enviado
                  </span>
                )}
              </div>

              {/* Placeholder de vídeo */}
              <div className="aspect-video bg-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-white/20">play_circle</span>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <p className="text-sm font-bold text-text-primary leading-snug">{ex.title}</p>
                <p className="text-xs text-text-tertiary leading-relaxed line-clamp-2">{ex.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-text-tertiary">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {ex.duration}
                </span>
                <span className={`font-bold ${LEVEL_COLORS[ex.level]}`}>{ex.level}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {ex.tags.map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 bg-surface-low border border-border-soft text-text-tertiary uppercase tracking-wide">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">fitness_center</span>
          </div>
          <p className="empty-state__title">Nenhum exercício disponível</p>
          <p className="empty-state__desc">A biblioteca de exercícios será exibida aqui assim que estiver disponível.</p>
        </div>
      )}
    </div>
  )
}
