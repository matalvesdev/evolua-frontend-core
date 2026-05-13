import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  usePlans,
  useCurrentSubscription,
  useInvoices,
  useCreateCheckout,
  useCancelSubscription,
  type Plan,
  type BillingProvider,
} from '@/hooks/use-billing'

export const Route = createFileRoute('/dashboard/billing')({
  component: BillingPage,
})

function fmtBRL(cents: number, currency = 'BRL') {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency })
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  trialing:   { label: 'Trial',     color: 'text-info  bg-info-surface'    },
  active:     { label: 'Ativa',     color: 'text-success bg-success-surface' },
  past_due:   { label: 'Atrasada',  color: 'text-warning bg-warning-surface' },
  canceled:   { label: 'Cancelada', color: 'text-text-tertiary bg-surface-2' },
  unpaid:     { label: 'Não paga',  color: 'text-danger bg-danger-surface'  },
  incomplete: { label: 'Incompleta',color: 'text-warning bg-warning-surface' },
}

const INVOICE_STATUS_CFG: Record<string, { label: string; color: string }> = {
  paid:          { label: 'Paga',         color: 'text-success bg-success-surface' },
  open:          { label: 'Em aberto',    color: 'text-warning bg-warning-surface' },
  void:          { label: 'Anulada',      color: 'text-text-tertiary bg-surface-2' },
  uncollectible: { label: 'Inadimplente', color: 'text-danger bg-danger-surface'   },
  refunded:      { label: 'Reembolsada',  color: 'text-info bg-info-surface'       },
}

function BillingPage() {
  const { data: plans = [], isLoading: loadingPlans } = usePlans()
  const { data: subscription, isLoading: loadingSub } = useCurrentSubscription()
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoices()
  const checkout = useCreateCheckout()
  const cancel = useCancelSubscription()

  const [provider, setProvider] = useState<BillingProvider>('abacatepay')
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(plan: Plan) {
    setError(null)
    try {
      const session = await checkout.mutateAsync({ planSlug: plan.slug, provider })
      window.location.href = session.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar checkout')
    }
  }

  async function handleCancel() {
    if (!confirm('Cancelar assinatura ao final do período corrente?')) return
    setError(null)
    try {
      await cancel.mutateAsync()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar')
    }
  }

  const currentPlan = subscription
    ? plans.find((p) => p.id === subscription.planId)
    : null

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Assinatura</h1>
          <p className="text-sm text-text-secondary">
            Gerencie seu plano, formas de pagamento e histórico de faturas.
          </p>
        </div>
      </header>

      {error && (
        <div className="card border-danger bg-danger-surface px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Assinatura atual */}
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-medium text-text-primary">Assinatura atual</h2>
        {loadingSub ? (
          <p className="text-sm text-text-secondary">Carregando…</p>
        ) : !subscription ? (
          <p className="text-sm text-text-secondary">
            Você ainda não tem uma assinatura ativa. Escolha um plano abaixo.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-text-primary">
                  {currentPlan?.name ?? '—'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CFG[subscription.status]?.color ?? ''}`}
                >
                  {STATUS_CFG[subscription.status]?.label ?? subscription.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                Renovação em {fmtDate(subscription.currentPeriodEnd)} via{' '}
                <span className="capitalize">{subscription.provider}</span>
                {subscription.cancelAtPeriodEnd && ' · cancelamento agendado'}
              </p>
            </div>
            {!subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
              <button
                onClick={handleCancel}
                disabled={cancel.isPending}
                className="btn btn-ghost text-danger"
              >
                {cancel.isPending ? 'Cancelando…' : 'Cancelar assinatura'}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Planos */}
      <section className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-text-primary">Planos disponíveis</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">Pagamento:</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as BillingProvider)}
              className="input"
            >
              <option value="abacatepay">PIX / Boleto (AbacatePay)</option>
              <option value="stripe">Cartão internacional (Stripe)</option>
            </select>
          </div>
        </div>

        {loadingPlans ? (
          <p className="text-sm text-text-secondary">Carregando planos…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const isCurrent = subscription?.planId === plan.id
              const isFree = plan.amountCents === 0
              return (
                <div
                  key={plan.id}
                  className={`card flex flex-col gap-3 p-5 ${
                    isCurrent ? 'border-neon ring-1 ring-neon' : ''
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">{plan.name}</h3>
                    {plan.description && (
                      <p className="mt-1 text-xs text-text-secondary">{plan.description}</p>
                    )}
                  </div>
                  <div className="text-2xl font-semibold text-text-primary">
                    {isFree ? 'Grátis' : fmtBRL(plan.amountCents, plan.currency)}
                    {!isFree && (
                      <span className="text-sm font-normal text-text-secondary">
                        {' '}/{plan.interval === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    )}
                  </div>
                  <ul className="flex-1 space-y-1 text-xs text-text-secondary">
                    {plan.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <button
                    disabled={isCurrent || isFree || checkout.isPending}
                    onClick={() => handleCheckout(plan)}
                    className={`btn ${isCurrent ? 'btn-ghost' : 'btn-primary'}`}
                  >
                    {isCurrent ? 'Plano atual' : isFree ? 'Plano padrão' : 'Assinar'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Faturas */}
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-medium text-text-primary">Histórico de faturas</h2>
        {loadingInvoices ? (
          <p className="text-sm text-text-secondary">Carregando…</p>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-text-secondary">Nenhuma fatura emitida ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-text-tertiary">
                <tr>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="py-2 pr-4 text-text-primary">{fmtDate(inv.createdAt)}</td>
                    <td className="py-2 pr-4 text-text-primary">
                      {fmtBRL(inv.amountCents, inv.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${INVOICE_STATUS_CFG[inv.status]?.color ?? ''}`}
                      >
                        {INVOICE_STATUS_CFG[inv.status]?.label ?? inv.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 capitalize text-text-secondary">{inv.provider}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        {inv.invoiceUrl && (
                          <a className="link text-xs" href={inv.invoiceUrl} target="_blank" rel="noreferrer">
                            Ver
                          </a>
                        )}
                        {inv.pdfUrl && (
                          <a className="link text-xs" href={inv.pdfUrl} target="_blank" rel="noreferrer">
                            PDF
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
