import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardStats, Appointment, Patient, Report, Task } from '@/types'

// Todos os endpoints do backend Fastify estão sob o prefixo /api/*.
// As rotas espelham os módulos em backend-core/apps/api/src/modules/.

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<DashboardStats>('/api/dashboard/stats'),
    staleTime: 60_000,
  })
}

export function useTodayAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'today'],
    queryFn: () => api.get<Appointment[]>('/api/appointments/today'),
    staleTime: 30_000,
  })
}

export function useWeekAppointments() {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'week'],
    queryFn: () =>
      api.get<Appointment[]>(
        `/api/appointments?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
      ),
    staleTime: 30_000,
  })
}

export function useActivePatients() {
  return useQuery<Patient[]>({
    queryKey: ['patients', 'active'],
    queryFn: () => api.get<Patient[]>('/api/patients?status=active&limit=100'),
    staleTime: 120_000,
  })
}

export function usePendingReports() {
  return useQuery<Report[]>({
    queryKey: ['reports', 'pending'],
    queryFn: () => api.get<Report[]>('/api/reports?status=pending_review'),
    staleTime: 60_000,
  })
}

export function usePendingTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'pending'],
    queryFn: () => api.get<Task[]>('/api/tasks?status=pending&limit=8'),
    staleTime: 60_000,
  })
}

