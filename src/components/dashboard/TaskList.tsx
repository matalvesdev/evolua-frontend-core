import { useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'

export type Priority = 'high' | 'medium' | 'low'

export interface TaskItem {
  id:        string
  title:     string
  priority:  Priority
  dueDate:   string | null
  done:      boolean
  category:  string
}

const INITIAL_TASKS: TaskItem[] = []

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; badge: string }> = {
  high:   { label: 'Alta',   dot: 'bg-danger',  badge: 'bg-danger-surface text-danger'   },
  medium: { label: 'Média',  dot: 'bg-warning', badge: 'bg-warning-surface text-warning' },
  low:    { label: 'Baixa',  dot: 'bg-border',  badge: 'bg-surface-high text-text-tertiary' },
}

function formatDue(iso: string | null) {
  if (!iso) return null
  const d    = new Date(iso)
  const now  = new Date()
  const diff = Math.ceil((d.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / 86400000)
  if (diff < 0)  return { label: 'Vencida',  cls: 'text-danger font-bold' }
  if (diff === 0) return { label: 'Hoje',    cls: 'text-warning font-bold' }
  if (diff === 1) return { label: 'Amanhã',  cls: 'text-warning' }
  return { label: `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`, cls: 'text-text-tertiary' }
}

let _nextId = 100
function genId() { return String(++_nextId) }

export function TaskList() {
  const [tasks, setTasks]       = useState<TaskItem[]>(INITIAL_TASKS)
  const [adding, setAdding]     = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const inputRef = useRef<HTMLInputElement>(null)

  const pending   = tasks.filter(t => !t.done)
  const done      = tasks.filter(t => t.done)
  const overdue   = pending.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length

  function toggle(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function addTask() {
    const title = newTitle.trim()
    if (!title) { setAdding(false); return }
    setTasks(prev => [{
      id:       genId(),
      title,
      priority: newPriority,
      dueDate:  null,
      done:     false,
      category: 'Geral',
    }, ...prev])
    setNewTitle('')
    setNewPriority('medium')
    setAdding(false)
  }

  function startAdding() {
    setAdding(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="card p-0 overflow-hidden flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-soft">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-success-surface rounded-md">
            <span className="material-symbols-outlined text-success text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
              checklist
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-text-primary uppercase tracking-wide leading-none">
              Tarefas
            </h3>
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {pending.length} pendente{pending.length !== 1 ? 's' : ''}
              {overdue > 0 && <span className="text-danger font-bold"> · {overdue} vencida{overdue > 1 ? 's' : ''}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startAdding}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-dark text-neon rounded text-[10px] font-bold uppercase tracking-wide hover:bg-dark-raised transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nova
          </button>
          <Link to="/dashboard/tarefas" className="link-brand text-[10px] uppercase tracking-wider">
            Ver todas
          </Link>
        </div>
      </div>

      {/* ── Input de nova tarefa ── */}
      {adding && (
        <div className="px-4 py-3 border-b border-border-soft bg-neon-surface flex flex-col gap-2">
          <input
            ref={inputRef}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Descreva a tarefa…"
            className="input text-sm py-2"
          />
          <div className="flex items-center gap-2">
            <span className="section-label">Prioridade:</span>
            {(['high', 'medium', 'low'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  newPriority === p
                    ? PRIORITY_CONFIG[p].badge + ' ring-1 ring-current'
                    : 'bg-surface text-text-tertiary hover:bg-surface-high'
                }`}
              >
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={addTask} className="px-3 py-1 bg-dark text-neon rounded text-[10px] font-bold uppercase tracking-wide hover:bg-dark-raised transition-colors">
              Adicionar
            </button>
            <button onClick={() => setAdding(false)} className="p-1 text-text-tertiary hover:text-text-primary transition-colors">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Lista de pendentes ── */}
      <ul className="flex flex-col divide-y divide-border-soft overflow-y-auto no-scrollbar max-h-[320px]">
        {pending.length === 0 && !adding ? (
          <li className="flex flex-col items-center justify-center gap-2 py-8 text-text-tertiary">
            <span className="material-symbols-outlined text-2xl text-success" style={{ fontVariationSettings: '"FILL" 1' }}>task_alt</span>
            <p className="text-sm font-medium">Tudo em dia!</p>
            <button onClick={startAdding} className="link-brand text-xs uppercase tracking-wider">+ Nova tarefa</button>
          </li>
        ) : (
          pending.map(t => {
            const due = formatDue(t.dueDate)
            const cfg = PRIORITY_CONFIG[t.priority]
            return (
              <li key={t.id}>
                <div className="flex items-start gap-3 px-5 py-3 hover:bg-surface-low transition-colors group">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggle(t.id)}
                    className={`mt-0.5 w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center transition-all rounded-sm ${
                      'border-border hover:border-olive'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[10px] text-transparent group-hover:text-olive transition-colors">check</span>
                  </button>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary leading-snug">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Prioridade */}
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-text-tertiary">{cfg.label}</span>
                      </span>
                      {/* Prazo */}
                      {due && (
                        <>
                          <span className="text-text-tertiary text-[9px]">·</span>
                          <span className={`text-[10px] ${due.cls}`}>{due.label}</span>
                        </>
                      )}
                      {/* Categoria */}
                      <span className="text-text-tertiary text-[9px]">·</span>
                      <span className="text-[9px] text-text-tertiary">{t.category}</span>
                    </div>
                  </div>

                  {/* Concluir */}
                  <button
                    onClick={() => toggle(t.id)}
                    title="Marcar como concluída"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-success transition-all"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                  </button>
                </div>
              </li>
            )
          })
        )}
      </ul>

      {/* ── Concluídas (colapsado) ── */}
      {done.length > 0 && (
        <details className="border-t border-border-soft group">
          <summary className="flex items-center gap-2 px-5 py-2.5 cursor-pointer select-none hover:bg-surface-low transition-colors list-none">
            <span className="material-symbols-outlined text-sm text-text-secondary transition-transform group-open:rotate-90">chevron_right</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
              {done.length} concluída{done.length > 1 ? 's' : ''}
            </span>
          </summary>
          <ul className="flex flex-col divide-y divide-border-soft">
            {done.map(t => (
              <li key={t.id}>
                <div className="flex items-center gap-3 px-5 py-2.5 opacity-50 hover:opacity-70 transition-opacity group">
                  <button
                    onClick={() => toggle(t.id)}
                    className="w-4 h-4 border-2 border-olive bg-olive flex-shrink-0 flex items-center justify-center rounded-sm"
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 10 }}>check</span>
                  </button>
                  <p className="text-sm text-text-secondary line-through flex-1 truncate">{t.title}</p>
                  <button onClick={() => toggle(t.id)} className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[10px] text-text-tertiary hover:text-olive transition-all uppercase tracking-wide">
                    Desfazer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-2.5 border-t border-border-soft bg-surface-low flex items-center justify-between">
        <p className="text-[10px] text-text-tertiary">{done.length} de {tasks.length} concluídas</p>
        <Link to="/dashboard/tarefas" className="link-brand text-[10px] uppercase tracking-wider">
          Gerenciar →
        </Link>
      </div>
    </div>
  )
}
