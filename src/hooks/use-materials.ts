import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ── Tipos (espelham contracts/materials.ts) ──────────────────────────────────

export type TherapyArea =
  | 'linguagem' | 'fala' | 'fluencia' | 'voz'
  | 'degluticao' | 'fonologia' | 'mof' | 'tea' | 'caa'

export type MaterialFormat =
  | 'atividade' | 'brincadeira' | 'jogo' | 'historia' | 'exercicio' | 'roteiro'

export type AgeGroup = 'bebe' | 'infantil' | 'escolar' | 'adolescente' | 'adulto'

export interface Material {
  id: string
  clinicId: string
  therapistId: string
  title: string
  description: string | null
  area: TherapyArea
  format: MaterialFormat
  ageGroup: AgeGroup | null
  content: string
  objectives: string[]
  materialsNeeded: string[]
  durationMinutes: number | null
  tags: string[]
  fileUrl: string | null
  isPublic: boolean
  isAiGenerated: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMaterialInput {
  title: string
  description?: string
  area: TherapyArea
  format: MaterialFormat
  ageGroup?: AgeGroup
  content: string
  objectives?: string[]
  materialsNeeded?: string[]
  durationMinutes?: number
  tags?: string[]
  fileUrl?: string
  isPublic?: boolean
  isAiGenerated?: boolean
}

export interface UpdateMaterialInput {
  title?: string
  description?: string | null
  area?: TherapyArea
  format?: MaterialFormat
  ageGroup?: AgeGroup | null
  content?: string
  objectives?: string[]
  materialsNeeded?: string[]
  durationMinutes?: number | null
  tags?: string[]
  fileUrl?: string | null
  isPublic?: boolean
}

export interface ListMaterialsParams {
  area?: TherapyArea
  format?: MaterialFormat
  ageGroup?: AgeGroup
  aiOnly?: boolean
  search?: string
  page?: number
  pageSize?: number
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedMaterials {
  data: Material[]
  pagination: Pagination
}

export interface GenerateMaterialRequest {
  area: TherapyArea
  format: MaterialFormat
  age: AgeGroup
  context?: string
}

export interface GeneratedMaterial {
  title: string
  content: string
  objectives: string[]
  materialsNeeded: string[]
  durationMinutes: number | null
  instructions: string
}

// ── Hooks ────────────────────────────────────────────────────────────────────

function buildQuery(params: ListMaterialsParams): string {
  const sp = new URLSearchParams()
  if (params.area) sp.set('area', params.area)
  if (params.format) sp.set('format', params.format)
  if (params.ageGroup) sp.set('ageGroup', params.ageGroup)
  if (params.aiOnly) sp.set('aiOnly', 'true')
  if (params.search) sp.set('search', params.search)
  if (params.page) sp.set('page', String(params.page))
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  const q = sp.toString()
  return q ? `?${q}` : ''
}

export function useMaterials(params: ListMaterialsParams = {}) {
  return useQuery<PaginatedMaterials>({
    queryKey: ['materials', params],
    queryFn: () => api.get<PaginatedMaterials>(`/api/materials${buildQuery(params)}`),
    placeholderData: keepPreviousData,
  })
}

export function useMaterial(id: string | null) {
  return useQuery<Material>({
    queryKey: ['materials', id],
    queryFn: () => api.get<Material>(`/api/materials/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateMaterialInput) => api.post<Material>('/api/materials', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['materials'] })
    },
  })
}

export function useUpdateMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMaterialInput }) =>
      api.patch<Material>(`/api/materials/${id}`, body),
    onSuccess: (m) => {
      void qc.invalidateQueries({ queryKey: ['materials'] })
      void qc.invalidateQueries({ queryKey: ['materials', m.id] })
    },
  })
}

export function useDeleteMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<null>(`/api/materials/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['materials'] })
    },
  })
}

/** Gera material via IA (não persiste). */
export function useGenerateMaterial() {
  return useMutation({
    mutationFn: (body: GenerateMaterialRequest) =>
      api.post<GeneratedMaterial>('/api/materials/generate', body),
  })
}
