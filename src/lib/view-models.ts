/**
 * View-model adapters: backend types → shape esperado pelas páginas existentes.
 * Centraliza a tradução para que as rotas de UI sejam reescritas com baixo risco.
 */
import type { Patient as ApiPatient, Appointment as ApiAppointment } from '@/types'
import type { Transaction as ApiTransaction } from '@/hooks/use-finances'

// ── Pacientes ─────────────────────────────────────────────────────────────────
export interface PatientVM {
  id: string
  name: string
  age: number
  diagnosis: string
  sessions: number
  next: string
  status: 'ativo' | 'aguardando' | 'inativo'
  avatar: string
  color: string
  phone: string
  guardian: string
  email: string
  since: string
  notes: string
}

const AVATAR_COLORS = [
  'bg-neon-surface text-olive',
  'bg-info-surface text-info',
  'bg-warning-surface text-warning',
  'bg-success-surface text-success',
  'bg-rose-50 text-rose-600',
] as const

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export function patientToVM(p: ApiPatient): PatientVM {
  const status: PatientVM['status'] =
    p.status === 'active' ? 'ativo' : p.status === 'discharged' ? 'inativo' : 'aguardando'
  return {
    id: p.id,
    name: p.name,
    age: p.age ?? 0,
    diagnosis: p.diagnosis ?? '—',
    sessions: 0,
    next: '—',
    status,
    avatar: initials(p.name),
    color: colorFor(p.id),
    phone: p.phone ?? '',
    guardian: '',
    email: p.email ?? '',
    since: p.createdAt?.slice(0, 10) ?? '',
    notes: '',
  }
}

// ── Agendamentos ──────────────────────────────────────────────────────────────
export interface AppointmentVM {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  endTime: string // HH:MM (estimado +50min se não houver duration)
  patient: string
  type: string
  modality: 'presencial' | 'teleconsulta'
  status: 'confirmed' | 'scheduled' | 'completed' | 'cancelled'
  googleEventId?: string
  notes?: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function appointmentToVM(a: ApiAppointment): AppointmentVM {
  const dt = new Date(a.dateTime)
  const date = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
  const time = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
  const end = new Date(dt.getTime() + 50 * 60_000)
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`
  const status: AppointmentVM['status'] =
    a.status === 'no_show' ? 'cancelled' : (a.status as AppointmentVM['status'])
  return {
    id: a.id,
    date,
    time,
    endTime,
    patient: a.patientName,
    type: a.type,
    modality: a.modality === 'teleconsult' ? 'teleconsulta' : 'presencial',
    status,
    notes: a.notes,
  }
}

// ── Transações ────────────────────────────────────────────────────────────────
export interface TransactionVM {
  id: string
  date: string // YYYY-MM-DD
  patient?: string
  description: string
  type: 'receita' | 'despesa'
  status: 'pago' | 'pendente' | 'vencido'
  amount: number
}

export function transactionToVM(t: ApiTransaction): TransactionVM {
  const status: TransactionVM['status'] =
    t.status === 'paid' ? 'pago' : t.status === 'overdue' ? 'vencido' : 'pendente'
  return {
    id: t.id,
    date: (t.paidAt ?? t.dueDate).slice(0, 10),
    patient: t.patientId ?? undefined,
    description: t.description,
    type: t.type === 'income' ? 'receita' : 'despesa',
    status,
    amount: Number(t.amount),
  }
}
