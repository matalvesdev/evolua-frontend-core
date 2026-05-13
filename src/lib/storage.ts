import { supabase } from './supabase'

const BUCKET = 'audio-sessions'

/**
 * Upload de áudio de sessão para o bucket privado `audio-sessions`.
 *
 * Requer policy de INSERT em `storage.objects` permitindo `authenticated`
 * inserir em `bucket_id = 'audio-sessions'`. Não usa URLs públicas — leitura
 * é feita via signed URL emitida pelo backend.
 *
 * @returns o `path` no bucket (ex: `<patientId>/sessao-<timestamp>.webm`)
 */
export async function uploadAudioBlob(
  patientId: string,
  blob: Blob,
  ext = 'webm',
): Promise<string> {
  // sanity: patientId precisa ser UUID
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(patientId)) {
    throw new Error('uploadAudioBlob: patientId inválido')
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const path = `${patientId}/sessao-${timestamp}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: blob.type || `audio/${ext}`,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Falha no upload do áudio: ${error.message}`)
  }
  return path
}
