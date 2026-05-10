import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Priority, TaskItem } from '@/components/dashboard/TaskList'

export const Route = createFileRoute('/dashboard/tarefas')({
  component: TarefasPage,
})

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; row: string; badge: string }> = {
  high:   { label: 'Alta',  dot: 'bg-danger',  row: 'border-l-danger',  badge: 'bg-danger-surface text-danger'          },
  medium: { label: 'Média', dot: 'bg-warning', row: 'border-l-warning', badge: 'bg-warning-surface text-warning'        },
  low:    { label: 'Baixa', dot: 'bg-border',  row: 'border-l-border',  badge: 'bg-surface-high text-text-tertiary'     },
}

const CATEGORIES = ['Todos', 'Clínico', 'Administrativo', 'Agenda', 'Financeiro', 'Geral']

const INITIAL_TASKS: TaskItem[] = []

function formatDue(iso: string | null): { label: string; cls: string } | null {
  if (!iso) return null
  const d   = new Date(iso)
  const now = new Date()
  const diff = Math.ceil((new Date(d).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 86400000)
  if (diff < 0)   return { label: 'Vencida',  cls: 'text-danger font-bold'    }
  if (diff === 0) return { label: 'Hoje',     cls: 'text-warning font-bold'   }
  if (diff === 1) return { label: 'Amanhã',   cls: 'text-warning'             }
  return { label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), cls: 'text-text-tertiary' }
}

let _id = 200
function genId() { return String(++_id) }

function TarefasPage() {
  const [tasks, setTasks]         = useState<TaskItem[]>(INITIAL_TASKS)
  const [filter, setFilter]       = useState<'pendentes' | 'concluidas' | 'todas'>('pendentes')
  const [category, setCategory]   = useState('Todos')
  const [priority, setPriority]   = useState<Priority | 'todas'>('todas')
  const [search, setSearch]       = useState('')
  const [adding, setAdding]       = useState(false)
  const [newTitle, setNewTitle]   = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newCategory, setNewCategory] = useState('Geral')
  const [newDue, setNewDue]       = useState('')
  const [editId, setEditId]       = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function toggle(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  function remove(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }
  function startEdit(t: TaskItem) {
    setEditId(t.id)
    setEditTitle(t.title)
  }
  function saveEdit(id: string) {
    if (editTitle.trim()) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, title: editTitle.trim() } : t))
    }
    setEditId(null)
  }
  function addTask() {
    const title = newTitle.trim()
    if (!title) { setAdding(false); return }
    setTasks(prev => [{
      id:       genId(),
      title,
      priority: newPriority,
      dueDate:  newDue ? new Date(newDue).toISOString() : null,
      done:     false,
      category: newCategory,
    }, ...prev])
    setNewTitle(''); setNewPriority('medium'); setNewCategory('Geral'); setNewDue('')
    setAdding(false)
  }

  const filtered = tasks.filter(t => {
    const matchFilter   = filter === 'todas' || (filter === 'pendentes' ? !t.done : t.done)
    const matchCategory = category === 'Todos' || t.category === category
    const matchPriority = priority === 'todas' || t.priority === priority
    const matchSearch   = !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchCategory && matchPriority && matchSearch
  })

  const pending   = tasks.filter(t => !t.done).length
  const done      = tasks.filter(t => t.done).length
  const overdue   = tasks.filter(t => !t.done && t.dueDate && new Date(t.dueDate) < new Date()).length

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary uppercase tracking-tight">
            Tarefas
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {pending} pendente{pending !== 1 ? 's' : ''}
            {overdue > 0 && <span className="text-danger font-bold"> · {overdue} vencida{overdue > 1 ? 's' : ''}</span>}
          </p>
        </div>
        <button
          onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          className="cta-dark flex items-center gap-2 px-4 py-2 rounded-md font-display font-bold text-sm uppercase tracking-wide"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nova Tarefa
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendentes', value: pending, icon: 'pending_actions', cls: 'bg-neon-surface text-olive' },
          { label: 'Concluídas', value: done,   icon: 'task_alt',        cls: 'bg-success-surface text-success' },
          { label: 'Vencidas',  value: overdue, icon: 'alarm',           cls: overdue > 0 ? 'bg-danger-surface text-danger' : 'bg-surface-high text-text-tertiary' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3 py-3">
            <span className={`material-symbols-outlined text-xl p-2 rounded-md ${s.cls}`} style={{ fontVariationSettings: '"FILL" 1' }}>
              {s.icon}
            </span>
            <div>
              <p className="font-display font-bold text-2xl text-text-primary leading-none">{s.value}</p>
              <p className="text-xs text-text-tertiary uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Formulário nova tarefa ── */}
      {adding && (
        <div className="card border border-border-neon bg-neon-surface space-y-3">
          <p className="section-label">Nova tarefa</p>
          <input
            ref={inputRef}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Descreva a tarefa…"
            className="input"
          />
          <div className="flex flex-wrap items-center gap-3">
            {/* Prioridade */}
            <div className="flex items-center gap-1.5">
              <span className="section-label">Prioridade</span>
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <button key={p} onClick={() => setNewPriority(p)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                    newPriority === p ? PRIORITY_CONFIG[p].badge + ' ring-1 ring-current' : 'bg-surface text-text-tertiary hover:bg-surface-high'
                  }`}
                >{PRIORITY_CONFIG[p].label}</button>
              ))}
            </div>
            {/* Categoria */}
            <div className="flex items-center gap-1.5">
              <span className="section-label">Categoria</span>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="input py-1 text-sm w-auto"
              >
                {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Prazo */}
            <div className="flex items-center gap-1.5">
              <span className="section-label">Prazo</span>
              <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} className="input py-1 text-sm w-auto" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={addTask} className="cta-dark flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm">add</span>Adicionar
            </button>
            <button onClick={() => setAdding(false)} className="btn-ghost text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[13px] leading-none">search</span>
          <input className="input pl-9 text-sm" placeholder="Buscar tarefa…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {/* Status */}
        <div className="flex gap-1 bg-surface border border-border-soft rounded-md p-1">
          {(['pendentes', 'concluidas', 'todas'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                filter === f ? 'bg-dark text-neon' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'concluidas' ? 'Concluídas' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {/* Prioridade */}
        <div className="flex gap-1 bg-surface border border-border-soft rounded-md p-1">
          {(['todas', 'high', 'medium', 'low'] as const).map(p => (
            <button key={p} onClick={() => setPriority(p)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                priority === p ? 'bg-dark text-neon' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {p === 'todas' ? 'Todas' : PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filtro por categoria ── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
              category === c ? 'bg-dark text-neon' : 'bg-surface border border-border-soft text-text-tertiary hover:text-text-primary hover:border-border'
            }`}
          >{c}</button>
        ))}
      </div>

      {/* ── Lista ── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>task_alt</span>
          </div>
          <p className="empty-state__title">Nenhuma tarefa encontrada</p>
          <p className="empty-state__desc">
            {filter === 'pendentes'
              ? 'Tudo em dia! Crie uma nova tarefa para manter o ritmo.'
              : 'Ajuste os filtros para visualizar tarefas em outros estados.'}
          </p>
          {filter === 'pendentes' && (
            <div className="empty-state__actions">
              <button
                onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50) }}
                className="bk-btn bk-btn-primary"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Criar tarefa
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <ul className="divide-y divide-border-soft">
            {filtered.map(t => {
              const due = formatDue(t.dueDate)
              const cfg = PRIORITY_CONFIG[t.priority]
              return (
                <li key={t.id} className={`flex items-start gap-3 px-5 py-4 hover:bg-surface-low transition-colors group border-l-2 ${cfg.row}`}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggle(t.id)}
                    className={`mt-0.5 w-5 h-5 border-2 flex-shrink-0 flex items-center justify-center transition-all rounded-sm ${
                      t.done ? 'bg-olive border-olive' : 'border-border hover:border-olive'
                    }`}
                  >
                    {t.done && <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>check</span>}
                  </button>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    {editId === t.id ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={() => saveEdit(t.id)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(t.id); if (e.key === 'Escape') setEditId(null) }}
                        className="input text-sm w-full py-0.5"
                      />
                    ) : (
                      <p className={`text-sm font-medium leading-snug ${t.done ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                        {t.title}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`badge text-[9px] ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="badge bg-surface-high text-text-tertiary text-[9px]">{t.category}</span>
                      {due && <span className={`text-[10px] font-semibold ${due.cls}`}>{due.label}</span>}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!t.done && (
                      <button onClick={() => startEdit(t)} title="Editar" className="p-1.5 text-text-tertiary hover:text-olive transition-colors rounded hover:bg-neon-surface">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                    )}
                    {!t.done && (
                      <button onClick={() => toggle(t.id)} title="Concluir" className="p-1.5 text-text-tertiary hover:text-success transition-colors rounded hover:bg-success-surface">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                      </button>
                    )}
                    <button onClick={() => remove(t.id)} title="Excluir" className="p-1.5 text-text-tertiary hover:text-danger transition-colors rounded hover:bg-danger-surface">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* ── Footer ── */}
      <p className="text-center text-xs text-text-tertiary pb-4">
        {done} de {tasks.length} tarefas concluídas
      </p>
    </div>
  )
}
