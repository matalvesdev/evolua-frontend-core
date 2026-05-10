import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Patient } from '@/types'

interface ListResponse<T> {
  data: T[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export interface ListPatientsParams {
  page?: number
  pageSize?: number
  status?: 'active' | 'inactive' | 'archived'
  search?: string
}

function buildQuery(p: ListPatientsParams): string {
  const usp = new URLSearchParams()
  if (p.page) usp.set('page', String(p.page))
  if (p.pageSize) usp.set('pageSize', String(p.pageSize))
  if (p.status) usp.set('status', p.status)
  if (p.search) usp.set('search', p.search)
  const q = usp.toString()
  return q ? `?${q}` : ''
}

export function usePatients(params: ListPatientsParams = {}) {
  return useQuery<ListResponse<Patient>>({
    queryKey: ['patients', 'list', params],
    queryFn: () => api.get<ListResponse<Patient>>(`/api/patients${buildQuery(params)}`),
    staleTime: 30_000,
  })
}

export function usePatient(id: string | undefined) {
  return useQuery<Patient>({
    queryKey: ['patients', id],
    queryFn: () => api.get<Patient>(`/api/patients/${id}`),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Patient>) => api.post<Patient>('/api/patients', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Patient> }) =>
      api.patch<Patient>(`/api/patients/${id}`, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['patients'] })
      void qc.invalidateQueries({ queryKey: ['patients', id] })
    },
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/api/patients/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
