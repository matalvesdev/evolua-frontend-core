import { useState } from 'react'
import { useArasaacSearch, getArasaacPictogramUrl, type ArasaacPictogram } from '@/hooks/use-caa'

interface PictogramSearchProps {
  onSelect: (pictogram: ArasaacPictogram) => void
  lang?: 'pt' | 'en' | 'es'
}

export function PictogramSearch({ onSelect, lang = 'pt' }: PictogramSearchProps) {
  const [query, setQuery] = useState('')
  const { data: pictograms, isFetching, isError } = useArasaacSearch(query, lang)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[13px] leading-none">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar pictograma (ex: comer, casa, feliz...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input w-full pl-9"
          autoFocus
        />
      </div>

      {isFetching && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-neon border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-xs text-danger text-center py-2">
          Falha ao consultar ARASAAC. Tente novamente em instantes.
        </p>
      )}

      {!isFetching && pictograms && pictograms.length > 0 && (
        <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
          {pictograms.slice(0, 40).map((p) => {
            const label = p.keywords[0]?.keyword ?? ''
            return (
              <button
                key={p._id}
                onClick={() => onSelect(p)}
                className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-surface-low transition-all"
              >
                <img
                  src={getArasaacPictogramUrl(p._id, { resolution: 100 })}
                  alt={label}
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                />
                <span className="text-[10px] text-center text-text-secondary leading-tight line-clamp-2">
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {!isFetching && query.trim().length >= 2 && pictograms && pictograms.length === 0 && !isError && (
        <p className="text-sm text-text-tertiary text-center py-4">
          Nenhum pictograma encontrado para &ldquo;{query}&rdquo;.
        </p>
      )}

      <p className="text-[10px] text-text-tertiary text-center">
        Pictogramas fornecidos por{' '}
        <a
          href="https://arasaac.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-secondary"
        >
          ARASAAC
        </a>{' '}
        (licença CC BY-NC-SA).
      </p>
    </div>
  )
}
