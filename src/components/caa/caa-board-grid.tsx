import type { CaaCell } from '@/hooks/use-caa'

interface CaaBoardGridProps {
  rows: number
  cols: number
  cells: CaaCell[]
  onCellClick?: (row: number, col: number, cell: CaaCell | undefined) => void
  onCellRemove?: (row: number, col: number) => void
  /** Em modo `display`, sem botões de remover, células vazias inacessíveis. */
  mode?: 'edit' | 'display'
  /** Em modo display, ao clicar pode falar a label via SpeechSynthesis. */
  onCellSpeak?: (cell: CaaCell) => void
}

export function CaaBoardGrid({
  rows,
  cols,
  cells,
  onCellClick,
  onCellRemove,
  mode = 'edit',
  onCellSpeak,
}: CaaBoardGridProps) {
  const cellByPos = new Map<string, CaaCell>()
  for (const c of cells) cellByPos.set(`${c.row}-${c.col}`, c)

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(80px, auto))`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, idx) => {
        const row = Math.floor(idx / cols)
        const col = idx % cols
        const cell = cellByPos.get(`${row}-${col}`)
        const filled = Boolean(cell)

        if (mode === 'display') {
          if (!filled) {
            return (
              <div
                key={`${row}-${col}`}
                className="aspect-square rounded-lg bg-surface-low border border-dashed border-border-soft/60"
              />
            )
          }
          return (
            <button
              key={cell!.id}
              onClick={() => onCellSpeak?.(cell!)}
              className="aspect-square flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-border bg-surface hover:shadow-[var(--shadow-card)] active:scale-95 transition-all"
              style={{
                backgroundColor: cell!.backgroundColor ?? undefined,
                color: cell!.textColor ?? undefined,
              }}
            >
              {cell!.pictogramUrl ? (
                <img
                  src={cell!.pictogramUrl}
                  alt={cell!.label}
                  className="w-full h-3/4 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="material-symbols-outlined text-3xl text-text-tertiary">image</span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight line-clamp-2">
                {cell!.label}
              </span>
            </button>
          )
        }

        // edit mode
        return (
          <div
            key={`${row}-${col}`}
            className={`relative aspect-square rounded-lg border transition-colors ${
              filled
                ? 'border-border bg-surface'
                : 'border-dashed border-border-soft bg-surface-low hover:border-neon/60 hover:bg-dark/5'
            }`}
            style={
              filled && cell!.backgroundColor
                ? { backgroundColor: cell!.backgroundColor, color: cell!.textColor ?? undefined }
                : undefined
            }
          >
            <button
              onClick={() => onCellClick?.(row, col, cell)}
              className="w-full h-full flex flex-col items-center justify-center gap-1 p-2"
            >
              {filled ? (
                <>
                  {cell!.pictogramUrl ? (
                    <img
                      src={cell!.pictogramUrl}
                      alt={cell!.label}
                      className="w-full h-3/4 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-text-tertiary">image</span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight line-clamp-2">
                    {cell!.label}
                  </span>
                </>
              ) : (
                <span className="material-symbols-outlined text-text-tertiary text-2xl">add</span>
              )}
            </button>

            {filled && onCellRemove ? (
              <button
                onClick={() => onCellRemove(row, col)}
                className="absolute top-1 right-1 print:hidden w-5 h-5 rounded-full bg-danger text-white text-[10px] flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                aria-label="Remover célula"
                title="Remover célula"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
