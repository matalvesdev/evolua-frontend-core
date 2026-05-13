import * as Sentry from '@sentry/react'

/**
 * Inicialização do Sentry para o frontend.
 *
 * No-op se VITE_SENTRY_DSN não estiver definido (dev local sem Sentry funciona).
 * Em produção, configure VITE_SENTRY_DSN no Vercel/host.
 *
 * Docs: https://docs.sentry.io/platforms/javascript/guides/react/
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info('[sentry] VITE_SENTRY_DSN não definido — Sentry desativado')
    }
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,

    // Performance — amostragem conservadora em prod
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    tracePropagationTargets: [
      /^\//,
      /^https:\/\/[^/]*useevolua\.com/,
      /^https:\/\/[^/]*\.supabase\.co/,
    ],

    // Replay de sessões (só em erro, pra economizar quota)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],

    // Não envia PII — Supabase user.email etc. ficam mascarados
    sendDefaultPii: false,

    // Filtra ruído conhecido
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError when attempting to fetch resource',
      /Loading chunk \d+ failed/,
    ],

    beforeSend(event) {
      // Redige cookies e headers sensíveis se vazarem em breadcrumbs
      if (event.request?.cookies) delete event.request.cookies
      if (event.request?.headers) {
        delete event.request.headers['Authorization']
        delete event.request.headers['Cookie']
      }
      return event
    },
  })
}

/** Atualiza usuário corrente no Sentry (chame após login). */
export function setSentryUser(user: { id: string; email?: string } | null) {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  if (user) {
    // id apenas — sem email/PII conforme sendDefaultPii:false
    Sentry.setUser({ id: user.id })
  } else {
    Sentry.setUser(null)
  }
}

export { Sentry }
