import { useCallback, useState } from 'react'
import { CaaBoardGrid } from './caa-board-grid'
import { PictogramSearch } from './pictogram-search'
import {
  getArasaacPictogramUrl,
  type CaaCell,
  type ArasaacPictogram,
} from '@/hooks/use-caa'

export interface CaaBoardEditorState {
  title: string
  description: string
  rows: number
  cols: number
  cells: CaaCell[]
  category: string
  therapeuticObjective: string
  patientId: string | null
}

interface PatientOption {
  id: string
  name: string
}

interface CaaBoardEditorProps {
  initialState?: Partial<CaaBoardEditorState>
  patients?: PatientOption[]
  onSave: (state: CaaBoardEditorState) => Promise<void> | void
  onCancel?: () => void
  onPrint?: () => void
  isSaving?: boolean
}

const CATEGORIES = [
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
]

const OBJECTIVES = [
  '',
  'Ampliar vocabulário expressivo',
  'Comunicação funcional',
  'Interação social',
  'Identificação de figuras',
  'Sequência temporal',
  'Expressão de emoções',
  'Rotina e autonomia',
]

export function CaaBoardEditor({
  initialState,
  patients = [],
  onSave,
  onCancel,
  onPrint,
  isSaving,
}: CaaBoardEditorProps) {
  const [state, setState] = useState<CaaBoardEditorState>({
    title: initialState?.title ?? 'Nova Prancha CAA',
    description: initialState?.description ?? '',
    rows: initialState?.rows ?? 3,
    cols: initialState?.cols ?? 5,
    cells: initialState?.cells ?? [],
    category: initialState?.category ?? 'Comunicação Básica',
    therapeuticObjective: initialState?.therapeuticObjective ?? '',
    patientId: initialState?.patientId ?? null,
  })

  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null)
  const [pendingLabel, setPendingLabel] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const handleCellClick = useCallback((row: number, col: number, cell: CaaCell | undefined) => {
    setSelectedPos({ row, col })
    setPendingLabel(cell?.label ?? '')
    setShowSearch(true)
  }, [])

  const handleSelectPictogram = useCallback(
    (p: ArasaacPictogram) => {
      if (!selectedPos) return
      const label = pendingLabel.trim() || p.keywords[0]?.keyword || ''
      const newCell: CaaCell = {
        id: `cell-${selectedPos.row}-${selectedPos.col}`,
        row: selectedPos.row,
        col: selectedPos.col,
        label,
        pictogramId: p._id,
        pictogramUrl: getArasaacPictogramUrl(p._id, { resolution: 500 }),
        backgroundColor: '#FFFFFF',
      }
      setState((s) => ({
        ...s,
        cells: [
          ...s.cells.filter((c) => !(c.row === selectedPos.row && c.col === selectedPos.col)),
          newCell,
        ],
      }))
      setShowSearch(false)
      setSelectedPos(null)
      setPendingLabel('')
    },
    [selectedPos, pendingLabel],
  )

  const removeCell = useCallback((row: number, col: number) => {
    setState((s) => ({
      ...s,
      cells: s.cells.filter((c) => !(c.row === row && c.col === col)),
    }))
  }, [])

  const closeModal = useCallback(() => {
    setShowSearch(false)
    setSelectedPos(null)
    setPendingLabel('')
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho com configs (escondido na impressão) */}
      <div className="card p-4 flex flex-col gap-4 print:hidden">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            placeholder="Título da prancha"
            className="input flex-1 font-semibold"
          />
          <select
            value={state.category}
            onChange={(e) => setState((s) => ({ ...s, category: e.target.value }))}
            className="input sm:w-56"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={state.description}
          onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
          placeholder="Descrição (opcional)"
          className="input min-h-[60px]"
          rows={2}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Linhas</span>
            <input
              type="number"
              min={1}
              max={8}
              value={state.rows}
              onChange={(e) => setState((s) => ({ ...s, rows: Math.max(1, Math.min(8, Number(e.target.value) || 1)) }))}
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Colunas</span>
            <input
              type="number"
              min={1}
              max={10}
              value={state.cols}
              onChange={(e) => setState((s) => ({ ...s, cols: Math.max(1, Math.min(10, Number(e.target.value) || 1)) }))}
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Paciente</span>
            <select
              value={state.patientId ?? ''}
              onChange={(e) => setState((s) => ({ ...s, patientId: e.target.value || null }))}
              className="input"
            >
              <option value="">— Genérica (sem paciente) —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Objetivo Terapêutico</span>
          <select
            value={state.therapeuticObjective}
            onChange={(e) => setState((s) => ({ ...s, therapeuticObjective: e.target.value }))}
            className="input"
          >
            {OBJECTIVES.map((obj) => (
              <option key={obj || 'none'} value={obj}>
                {obj || '— Nenhum —'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Título visível na impressão */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{state.title}</h1>
        {state.description ? <p className="text-sm">{state.description}</p> : null}
      </div>

      {/* Grade */}
      <div className="card p-4">
        <CaaBoardGrid
          rows={state.rows}
          cols={state.cols}
          cells={state.cells}
          onCellClick={handleCellClick}
          onCellRemove={removeCell}
          mode="edit"
        />
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3 justify-end print:hidden">
        {onCancel ? (
          <button onClick={onCancel} className="btn-outline" disabled={isSaving}>
            Cancelar
          </button>
        ) : null}
        <button onClick={() => onPrint?.() ?? window.print()} className="btn-outline flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">print</span>
          Imprimir
        </button>
        <button
          onClick={() => onSave(state)}
          className="btn-primary flex items-center gap-2"
          disabled={isSaving || !state.title.trim()}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">save</span>
              Salvar Prancha
            </>
          )}
        </button>
      </div>

      {/* Modal de busca de pictograma */}
      {showSearch && selectedPos ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="card max-w-2xl w-full p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-sm uppercase tracking-widest">
                Pictograma — linha {selectedPos.row + 1}, coluna {selectedPos.col + 1}
              </p>
              <button
                onClick={closeModal}
                className="text-text-tertiary hover:text-text-primary"
                aria-label="Fechar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <input
              type="text"
              value={pendingLabel}
              onChange={(e) => setPendingLabel(e.target.value)}
              placeholder="Rótulo da célula (opcional, usa palavra-chave do pictograma se vazio)"
              className="input"
            />

            <PictogramSearch onSelect={handleSelectPictogram} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
