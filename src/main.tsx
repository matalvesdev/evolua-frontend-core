import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { initSentry, Sentry } from './lib/sentry'
import './index.css'

// Init Sentry o mais cedo possível, antes de qualquer outro código rodar
initSentry()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div role="alert" style={{ padding: 24, fontFamily: 'system-ui' }}>
          <h1>Algo deu errado</h1>
          <p>Já fomos notificados. Tente recarregar a página.</p>
          {import.meta.env.DEV && <pre style={{ color: 'crimson' }}>{String(error)}</pre>}
          <button onClick={resetError}>Tentar novamente</button>
        </div>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
