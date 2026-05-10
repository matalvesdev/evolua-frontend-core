import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Appointment } from '@/types'

interface ListResponse<T> {
  data: T[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export interface ListAppointmentsParams {
  page?: number
  pageSize?: number
  startDate?: string // ISO
  endDate?: string // ISO
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  patientId?: string
}

function buildQuery(p: ListAppointmentsParams): string {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v))
  }
  const q = usp.toString()
  return q ? `?${q}` : ''
}

export function useAppointments(params: ListAppointmentsParams = {}) {
  return useQuery<ListResponse<Appointment>>({
    queryKey: ['appointments', 'list', params],
    queryFn: () => api.get<ListResponse<Appointment>>(`/api/appointments${buildQuery(params)}`),
    staleTime: 30_000,
  })
}

export function useAppointment(id: string | undefined) {
  return useQuery<Appointment>({
    queryKey: ['appointments', id],
    queryFn: () => api.get<Appointment>(`/api/appointments/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Appointment>) =>
      api.post<Appointment>('/api/appointments', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Appointment> }) =>
      api.patch<Appointment>(`/api/appointments/${id}`, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['appointments'] })
      void qc.invalidateQueries({ queryKey: ['appointments', id] })
    },
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/api/appointments/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
