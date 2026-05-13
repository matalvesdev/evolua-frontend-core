import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Mantemos tipos locais alinhados com backend-core/contracts/src/billing.ts
// até `@evolua/contracts` ser consumido também pelo frontend.

export type BillingProvider = 'abacatepay' | 'stripe'

export interface Plan {
  id: string
  slug: string
  name: string
  description: string | null
  amountCents: number
  currency: string
  interval: 'monthly' | 'yearly'
  maxUsers: number | null
  maxPatients: number | null
  features: string[]
  isActive: boolean
  stripeProductId: string | null
  stripePriceId: string | null
  abacatepayProductId: string | null
}

export interface Subscription {
  id: string
  clinicId: string
  planId: string
  provider: BillingProvider
  providerSubscriptionId: string
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
  trialEndsAt: string | null
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  clinicId: string
  subscriptionId: string | null
  provider: BillingProvider
  providerInvoiceId: string
  status: 'open' | 'paid' | 'void' | 'uncollectible' | 'refunded'
  amountCents: number
  currency: string
  paidAt: string | null
  invoiceUrl: string | null
  pdfUrl: string | null
  createdAt: string
}

export interface CheckoutSession {
  url: string
  provider: BillingProvider
  providerSessionId: string
}

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ['billing', 'plans'],
    queryFn: () => api.get<Plan[]>('/api/billing/plans'),
    staleTime: 5 * 60_000,
  })
}

export function useCurrentSubscription() {
  return useQuery<Subscription | null>({
    queryKey: ['billing', 'subscription'],
    queryFn: () => api.get<Subscription | null>('/api/billing/subscription'),
    staleTime: 30_000,
  })
}

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ['billing', 'invoices'],
    queryFn: () => api.get<Invoice[]>('/api/billing/invoices'),
    staleTime: 60_000,
  })
}

export function useCreateCheckout() {
  return useMutation<CheckoutSession, Error, { planSlug: string; provider?: BillingProvider; successUrl?: string; cancelUrl?: string }>({
    mutationFn: (body) => api.post<CheckoutSession>('/api/billing/checkout', body),
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation<{ ok: boolean }, Error, void>({
    mutationFn: () => api.post<{ ok: boolean }>('/api/billing/subscription/cancel', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing', 'subscription'] })
    },
  })
}
