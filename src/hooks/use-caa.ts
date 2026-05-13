import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

// ── Tipos (espelham contracts/caa.ts) ────────────────────────────────────────

export interface CaaCell {
  id: string
  row: number
  col: number
  label: string
  pictogramId?: number
  pictogramUrl?: string
  backgroundColor?: string
  textColor?: string
  action?: string
}

export interface CaaBoard {
  id: string
  clinicId: string
  therapistId: string
  patientId: string | null
  title: string
  description: string | null
  rows: number
  cols: number
  cells: CaaCell[]
  category: string
  therapeuticObjective: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCaaBoardInput {
  patientId?: string
  title: string
  description?: string
  rows?: number
  cols?: number
  cells?: CaaCell[]
  category?: string
  therapeuticObjective?: string
}

export interface UpdateCaaBoardInput {
  patientId?: string | null
  title?: string
  description?: string | null
  rows?: number
  cols?: number
  cells?: CaaCell[]
  category?: string
  therapeuticObjective?: string | null
}

export interface ListCaaBoardsParams {
  patientId?: string
  category?: string
  page?: number
  pageSize?: number
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedCaaBoards {
  data: CaaBoard[]
  pagination: Pagination
}

export interface ArasaacPictogram {
  _id: number
  keywords: Array<{ keyword: string; type?: number; plural?: string; meaning?: string }>
  categories?: string[]
  tags?: string[]
}

// ── URLs públicas do ARASAAC para PNGs (servido por static.arasaac.org) ──────

export function getArasaacPictogramUrl(id: number, opts?: { resolution?: number }): string {
  const res = opts?.resolution ?? 500
  return `https://static.arasaac.org/pictograms/${id}/${id}_${res}.png`
}

// ── Hooks ────────────────────────────────────────────────────────────────────

function buildBoardsQuery(params: ListCaaBoardsParams): string {
  const sp = new URLSearchParams()
  if (params.patientId) sp.set('patientId', params.patientId)
  if (params.category) sp.set('category', params.category)
  if (params.page) sp.set('page', String(params.page))
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  const q = sp.toString()
  return q ? `?${q}` : ''
}

export function useCaaBoards(params: ListCaaBoardsParams = {}) {
  return useQuery<PaginatedCaaBoards>({
    queryKey: ['caa-boards', params],
    queryFn: () => api.get<PaginatedCaaBoards>(`/api/caa/boards${buildBoardsQuery(params)}`),
    placeholderData: keepPreviousData,
  })
}

export function useCaaBoard(id: string | null) {
  return useQuery<CaaBoard>({
    queryKey: ['caa-boards', id],
    queryFn: () => api.get<CaaBoard>(`/api/caa/boards/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateCaaBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCaaBoardInput) => api.post<CaaBoard>('/api/caa/boards', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['caa-boards'] })
    },
  })
}

export function useUpdateCaaBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCaaBoardInput }) =>
      api.patch<CaaBoard>(`/api/caa/boards/${id}`, body),
    onSuccess: (board) => {
      void qc.invalidateQueries({ queryKey: ['caa-boards'] })
      void qc.invalidateQueries({ queryKey: ['caa-boards', board.id] })
    },
  })
}

export function useDeleteCaaBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<null>(`/api/caa/boards/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['caa-boards'] })
    },
  })
}

/**
 * Hook de debounce simples para o input de busca de pictograma.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

/**
 * Busca pictogramas via proxy backend (cache + rate limit no servidor).
 * Só dispara para queries com >= 2 caracteres.
 */
export function useArasaacSearch(query: string, lang: 'pt' | 'en' | 'es' = 'pt') {
  const debounced = useDebouncedValue(query.trim(), 400)
  return useQuery<ArasaacPictogram[]>({
    queryKey: ['arasaac', lang, debounced],
    queryFn: () =>
      api.get<ArasaacPictogram[]>(
        `/api/caa/pictograms/search?q=${encodeURIComponent(debounced)}&lang=${lang}`,
      ),
    enabled: debounced.length >= 2,
    staleTime: 5 * 60 * 1000,
  })
}
