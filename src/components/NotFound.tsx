/**
 * Tela 404 global — exibida pelo TanStack Router quando uma rota
 * não existe. Mantém o tom calmo, geométrico e sem emoji.
 */
import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-6">
      <div className="max-w-md w-full bg-surface border-2 border-outline-variant p-8 space-y-6 text-center">
        <div className="space-y-2">
          <p className="font-display text-6xl text-deep tracking-tight">404</p>
          <h1 className="font-display text-xl text-deep">Página não encontrada</h1>
          <p className="text-sm text-ink-soft">
            A URL que você acessou não existe ou foi movida.
          </p>
        </div>
        <Link
          to="/"
          className="inline-block bg-deep text-neon px-6 py-2 font-medium hover:bg-ink transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
