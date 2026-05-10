import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL as string | undefined

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    // Backend ainda não configurado — UI exibe empty-states até a configuração
    throw new Error('[Evolua] VITE_API_URL não definido. Configure o backend para ativar esta feature.')
  }

  // getUser() valida a identidade no servidor (não pode ser forjado via storage).
  // getSession() retorna o access_token atual — é a fonte correta para o Bearer token.
  // Fazemos as duas em paralelo para não duplicar latência.
  const [{ data: { user }, error: userError }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  if (userError || !user) {
    throw new Error('[Evolua] Usuário não autenticado.')
  }

  // Usa o access_token da sessão ativa — token e user confirmados no mesmo ciclo
  const token = session?.access_token

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)               => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
}
