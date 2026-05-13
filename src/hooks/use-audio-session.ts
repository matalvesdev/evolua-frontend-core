import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ── Tipos (espelham contracts/audio.ts + ai.ts) ───────────────────────────────

export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AudioSession {
  id: string
  clinicId: string
  patientId: string
  therapistId: string
  appointmentId: string | null
  audioPath: string
  audioUrl: string | null
  audioDuration: number | null
  fileSize: number | null
  transcription: string | null
  transcriptionStatus: TranscriptionStatus | string
  transcriptionError: string | null
  transcribedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAudioSessionInput {
  patientId: string
  appointmentId?: string
  audioPath: string
  audioDuration?: number
  fileSize?: number
}

export interface TranscriptionStatusResult {
  transcription: string
  transcriptionStatus: string
}

export interface SoapEvolution {
  soap: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  summary: string
  nextSessionSuggestions: string[]
}

export interface GenerateEvolutionInput {
  patientId: string
  transcript?: string
  therapistNotes?: string
  treatmentPlanSummary?: string
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useCreateAudioSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAudioSessionInput) =>
      api.post<AudioSession>('/api/audio', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['audio-sessions'] })
    },
  })
}

export function useRequestTranscription() {
  return useMutation({
    mutationFn: (audioSessionId: string) =>
      api.post<AudioSession>('/api/audio/transcribe', { audioSessionId }),
  })
}

/**
 * Faz polling do status da transcrição enquanto estiver `pending` ou `processing`.
 * Quando `enabled = false` (ou sem id), não dispara nada.
 */
export function useAudioTranscription(id: string | null) {
  return useQuery<TranscriptionStatusResult>({
    queryKey: ['audio-sessions', id, 'transcription'],
    queryFn: () =>
      api.get<TranscriptionStatusResult>(`/api/audio/${id}/transcription`),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.transcriptionStatus
      if (status === 'completed' || status === 'failed') return false
      return 3000
    },
    refetchIntervalInBackground: false,
  })
}

export function useGenerateEvolution() {
  return useMutation({
    mutationFn: (body: GenerateEvolutionInput) =>
      api.post<SoapEvolution>('/api/ai/evolution/generate', body),
  })
}
