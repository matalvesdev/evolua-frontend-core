/**
 * Skeleton primitivo — placeholder de loading geométrico, sem animação
 * pesada (apenas pulse). Use para substituir conteúdo enquanto a query
 * está carregando, mantendo o layout estável (evita CLS).
 *
 * Uso:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-32 w-full" />
 */
import { type HTMLAttributes } from 'react';

export function Skeleton({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`animate-pulse bg-surface-low border border-outline-variant ${className}`}
      {...props}
    />
  );
}
