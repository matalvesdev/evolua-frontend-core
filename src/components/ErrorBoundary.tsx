/**
 * ErrorBoundary global da aplicação.
 *
 * Captura erros de render em descendentes e exibe uma tela de fallback
 * com a opção de recarregar. Em dev mostra a stack; em prod apenas
 * mensagem amigável.
 *
 * Em desenvolvimento, o React mostra o overlay de erro do Vite por cima;
 * este boundary é a rede de segurança em produção (e quando overlay é
 * fechado).
 *
 * TODO: integrar com Sentry React quando o pacote for instalado —
 * substituir `console.error` por `Sentry.captureException(error)`.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Mantém o console no dev — em prod o Sentry assume essa função.
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-6">
        <div className="max-w-md w-full bg-surface border-2 border-outline-variant p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-2xl text-deep">
              Algo deu errado
            </h1>
            <p className="text-sm text-ink-soft">
              A aplicação encontrou um erro inesperado. Tente recarregar a
              página. Se o problema persistir, contate o suporte.
            </p>
          </div>

          {import.meta.env.DEV && (
            <pre className="text-xs bg-canvas border border-outline-variant p-3 overflow-auto max-h-40 text-rose">
              {error.message}
            </pre>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.reset}
              className="flex-1 bg-surface border-2 border-deep text-deep px-4 py-2 font-medium hover:bg-lavender transition-colors"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 bg-deep text-neon px-4 py-2 font-medium hover:bg-ink transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
