import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  useCaaBoards,
  useCreateCaaBoard,
  useUpdateCaaBoard,
  useDeleteCaaBoard,
  type CaaBoard,
} from '@/hooks/use-caa'
import { usePatients } from '@/hooks/use-patients'
import { CaaBoardEditor, type CaaBoardEditorState } from '@/components/caa/caa-board-editor'
import { CaaBoardGrid } from '@/components/caa/caa-board-grid'

export const Route = createFileRoute('/dashboard/caa')({
  component: CAAPage,
})

type ViewMode = { kind: 'list' } | { kind: 'edit'; board?: CaaBoard }

function CAAPage() {
  const [view, setView] = useState<ViewMode>({ kind: 'list' })
  const [filterPatient, setFilterPatient] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')

  const boardsQuery = useCaaBoards({
    patientId: filterPatient || undefined,
    category: filterCategory || undefined,
    pageSize: 50,
  })

  const patientsQuery = usePatients({ status: 'active', pageSize: 100 })
  const patientOptions = useMemo(
    () => (patientsQuery.data?.data ?? []).map((p) => ({ id: p.id, name: p.name })),
    [patientsQuery.data],
  )
  const patientById = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of patientOptions) m.set(p.id, p.name)
    return m
  }, [patientOptions])

  const createMut = useCreateCaaBoard()
  const updateMut = useUpdateCaaBoard()
  const deleteMut = useDeleteCaaBoard()

  const isSaving = createMut.isPending || updateMut.isPending

  async function handleSave(state: CaaBoardEditorState) {
    const editingBoard = view.kind === 'edit' ? view.board : undefined

    if (editingBoard) {
      await updateMut.mutateAsync({
        id: editingBoard.id,
        body: {
          patientId: state.patientId,
          title: state.title,
          description: state.description || null,
          rows: state.rows,
          cols: state.cols,
          cells: state.cells,
          category: state.category,
          therapeuticObjective: state.therapeuticObjective || null,
        },
      })
    } else {
      await createMut.mutateAsync({
        patientId: state.patientId ?? undefined,
        title: state.title,
        description: state.description || undefined,
        rows: state.rows,
        cols: state.cols,
        cells: state.cells,
        category: state.category,
        therapeuticObjective: state.therapeuticObjective || undefined,
      })
    }
    setView({ kind: 'list' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta prancha CAA? Esta ação não pode ser desfeita.')) return
    await deleteMut.mutateAsync(id)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (view.kind === 'edit') {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={() => setView({ kind: 'list' })}
            className="text-text-secondary hover:text-text-primary flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Voltar
          </button>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">
            {view.board ? 'Editar Prancha' : 'Nova Prancha CAA'}
          </h1>
        </div>

        <CaaBoardEditor
          initialState={
            view.board
              ? {
                  title: view.board.title,
                  description: view.board.description ?? '',
                  rows: view.board.rows,
                  cols: view.board.cols,
                  cells: view.board.cells,
                  category: view.board.category,
                  therapeuticObjective: view.board.therapeuticObjective ?? '',
                  patientId: view.board.patientId,
                }
              : undefined
          }
          patients={patientOptions}
          onSave={handleSave}
          onCancel={() => setView({ kind: 'list' })}
          isSaving={isSaving}
        />
      </div>
    )
  }

  // Lista de pranchas
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">
            Painel CAA
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Pranchas de Comunicação Aumentativa e Alternativa
          </p>
        </div>
        <button
          onClick={() => setView({ kind: 'edit' })}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nova prancha
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <select
          value={filterPatient}
          onChange={(e) => setFilterPatient(e.target.value)}
          className="input sm:flex-1"
        >
          <option value="">Todos os pacientes</option>
          {patientOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input sm:w-64"
        >
          <option value="">Todas as categorias</option>
          {[
            'Comunicação Básica',
            'Rotina Diária',
            'Alimentação',
            'Emoções',
            'Escola',
            'Família',
            'Atividades',
            'Vocabulário',
            'Frases',
            'Personalizado',
          ].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {boardsQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
        </div>
      ) : boardsQuery.isError ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">error</span>
          </div>
          <p className="empty-state__title">Falha ao carregar pranchas</p>
          <p className="empty-state__desc">
            Verifique sua conexão e tente novamente. {(boardsQuery.error as Error)?.message ?? ''}
          </p>
        </div>
      ) : !boardsQuery.data || boardsQuery.data.data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">grid_view</span>
          </div>
          <p className="empty-state__title">Nenhuma prancha CAA</p>
          <p className="empty-state__desc">
            Crie sua primeira prancha de comunicação para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boardsQuery.data.data.map((b) => (
            <article key={b.id} className="card p-4 flex flex-col gap-3">
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-text-primary truncate">{b.title}</h3>
                  <p className="text-[11px] text-text-tertiary">
                    {b.rows}×{b.cols} · {b.category}
                    {b.patientId ? ` · ${patientById.get(b.patientId) ?? 'Paciente'}` : ' · Genérica'}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setView({ kind: 'edit', board: b })}
                    className="p-1.5 rounded hover:bg-surface-low text-text-secondary hover:text-text-primary"
                    aria-label="Editar"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger"
                    aria-label="Excluir"
                    title="Excluir"
                    disabled={deleteMut.isPending}
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </header>

              {/* Mini preview */}
              <div className="rounded-lg bg-surface-low p-2 overflow-hidden">
                <CaaBoardGrid
                  rows={Math.min(b.rows, 3)}
                  cols={Math.min(b.cols, 5)}
                  cells={b.cells.filter(
                    (c) => c.row < Math.min(b.rows, 3) && c.col < Math.min(b.cols, 5),
                  )}
                  mode="display"
                />
              </div>

              {b.therapeuticObjective ? (
                <p className="text-[11px] text-text-secondary line-clamp-2">
                  <span className="font-semibold">Objetivo:</span> {b.therapeuticObjective}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
