import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTransactions, useCreateTransaction, useFinancesSummary } from '@/hooks/use-finances'
import { transactionToVM, type TransactionVM as Transaction } from '@/lib/view-models'

export const Route = createFileRoute('/dashboard/financeiro')({
  component: FinanceiroPage,
})

// ── Tipos UI ──────────────────────────────────────────────────────────────────

type TxType = 'receita' | 'despesa'
type TxStatus = 'pago' | 'pendente' | 'vencido'

const MONTHS_SPARKLINE: number[] = []
const MAX_SPARK = MONTHS_SPARKLINE.length ? Math.max(...MONTHS_SPARKLINE) : 1

const STATUS_CFG: Record<TxStatus, {label:string; color:string}> = {
  pago:     { label:'Pago',     color:'text-success bg-success-surface' },
  pendente: { label:'Pendente', color:'text-warning bg-warning-surface' },
  vencido:  { label:'Vencido',  color:'text-danger  bg-danger-surface'  },
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
}

// ── Gráfico de barras simples ─────────────────────────────────────────────────

function Sparkline() {
  const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  if (MONTHS_SPARKLINE.length === 0) {
    return (
      <div className="empty-state h-16">
        <p className="text-xs text-text-secondary">Sem histórico</p>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-1.5 h-16">
      {MONTHS_SPARKLINE.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className={`w-full rounded-sm transition-colors ${i === 3 ? 'bg-neon' : 'bg-neon/30 group-hover:bg-neon/50'}`}
            style={{ height: `${(v / MAX_SPARK) * 100}%` }}
            title={`${MONTH_LABELS[i]}: ${fmt(v)}`}
          />
          <span className="text-[8px] text-text-tertiary">{MONTH_LABELS[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ── Modal Novo Lançamento ─────────────────────────────────────────────────────

function NewTransactionModal({ onClose, onSave }: { onClose: () => void; onSave: (t: { description: string; patient?: string; type: TxType; status: TxStatus; amount: number; date: string }) => void }) {
  const [form, setForm] = useState({
    description: '', patient: '', type: 'receita' as TxType,
    status: 'pendente' as TxStatus, amount: '', date: new Date().toISOString().split('T')[0],
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.description.trim() || !form.amount) return
    onSave({
      date: form.date,
      patient: form.patient || undefined,
      description: form.description.trim(),
      type: form.type,
      status: form.status,
      amount: parseFloat(form.amount),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface w-full max-w-md shadow-[var(--shadow-dark)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border">
          <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Novo Lançamento</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="section-label block mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {(['receita','despesa'] as TxType[]).map(t => (
                <button key={t} onClick={() => set('type', t)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide border rounded transition-colors ${
                    form.type === t
                      ? t === 'receita' ? 'bg-success-surface border-success text-success' : 'bg-danger-surface border-danger text-danger'
                      : 'border-border-soft text-text-tertiary hover:border-border'
                  }`}>
                  {t === 'receita' ? '+ Receita' : '− Despesa'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Descrição *</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ex: Sessão de terapia" className="input w-full" />
          </div>
          {form.type === 'receita' && (
            <div>
              <label className="section-label block mb-1.5">Paciente</label>
              <input value={form.patient} onChange={e => set('patient', e.target.value)} placeholder="Nome do paciente (opcional)" className="input w-full" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Valor (R$) *</label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0,00" min="0" step="0.01" className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Data</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input w-full" />
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input w-full">
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline">Cancelar</button>
            <button onClick={handleSave} className="flex-1 btn-primary" disabled={!form.description.trim() || !form.amount}>
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function FinanceiroPage() {
  const txQuery = useTransactions({ pageSize: 100 })
  const summaryQuery = useFinancesSummary()
  const createTx = useCreateTransaction()
  const transactions: Transaction[] = useMemo(
    () => (txQuery.data?.data ?? []).map(transactionToVM),
    [txQuery.data],
  )
  const [txFilter, setTxFilter] = useState<'all'|TxType|TxStatus>('all')
  const [search, setSearch]     = useState('')
  const [showNew, setShowNew]   = useState(false)

  const summary = summaryQuery.data
  const receitas  = summary ? Number(summary.totalIncome) :
    transactions.filter(t => t.type === 'receita' && t.status === 'pago').reduce((s,t) => s+t.amount, 0)
  const pendentes = summary ? Number(summary.pendingIncome) :
    transactions.filter(t => t.type === 'receita' && t.status !== 'pago').reduce((s,t) => s+t.amount, 0)
  const despesas  = summary ? Number(summary.totalExpense) :
    transactions.filter(t => t.type === 'despesa').reduce((s,t) => s+t.amount, 0)
  const liquido   = summary ? Number(summary.balance) : receitas - despesas

  const filtered = transactions.filter(t => {
    const matchFilter = txFilter === 'all' || t.type === txFilter || t.status === txFilter
    const matchSearch = search === '' ||
      (t.patient ?? '').toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {showNew && <NewTransactionModal
        onClose={() => setShowNew(false)}
        onSave={t => createTx.mutate({
          description: t.description,
          type: t.type === 'receita' ? 'income' : 'expense',
          status: t.status === 'pago' ? 'paid' : t.status === 'vencido' ? 'overdue' : 'pending',
          amount: t.amount.toFixed(2),
          dueDate: t.date,
          category: t.type === 'receita' ? 'session' : 'general',
        })}
      />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Financeiro</h1>
          <p className="text-sm text-text-secondary mt-0.5 capitalize">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Exportar
          </button>
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Stats hero */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Receita recebida', value: receitas,  icon:'trending_up',   color:'text-success', bg:'bg-success/10 border-success/20' },
          { label:'A receber',        value: pendentes, icon:'schedule',      color:'text-warning', bg:'bg-warning/10 border-warning/20' },
          { label:'Despesas',         value: despesas,  icon:'trending_down', color:'text-danger',  bg:'bg-danger/10  border-danger/20'  },
          { label:'Resultado líquido',value: liquido,   icon:'account_balance',color:'text-info',   bg:'bg-info/10    border-info/20'    },
        ].map(s => (
          <div key={s.label} className="card p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded border flex items-center justify-center ${s.bg}`}>
              <span className={`material-symbols-outlined text-sm ${s.color}`} style={{fontVariationSettings:'"FILL" 1'}}>{s.icon}</span>
            </div>
            <p className={`font-display font-bold text-xl leading-none ${s.color}`}>{fmt(s.value)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de receita mensal */}
      <div className="card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="section-label">Receita mensal — {new Date().getFullYear()}</p>
          {MONTHS_SPARKLINE.length > 0 && (
            <p className="font-display font-bold text-sm text-olive">
              {fmt(MONTHS_SPARKLINE[MONTHS_SPARKLINE.length - 1] ?? 0)} no mês atual
            </p>
          )}
        </div>
        <Sparkline />
      </div>

      {/* Filtros + tabela */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por paciente ou descrição..."
              className="input w-full pl-9"
            />
          </div>
          <div className="flex rounded border border-border-soft overflow-hidden flex-shrink-0">
            {([['all','Todos'],['receita','Receitas'],['despesa','Despesas'],['pendente','Pendentes'],['vencido','Vencidos']] as const).map(([v,l]) => (
              <button key={v} onClick={() => setTxFilter(v)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors border-r border-border-soft last:border-r-0 ${
                  txFilter === v ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-surface-low border-b border-border-soft">
            {['Data','Descrição','Paciente','Tipo','Valor','Status'].map(h => (
              <p key={h} className="section-label">{h}</p>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <p className="empty-state__title">Nenhum lançamento encontrado</p>
              <p className="empty-state__desc">Ajuste o período ou registre uma nova entrada/saída para acompanhar suas finanças.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-soft">
              {filtered.map(tx => (
                <div key={tx.id}
                  className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-1 sm:gap-4 sm:items-center px-5 py-4 hover:bg-surface-low transition-colors">
                  <p className="text-xs text-text-tertiary whitespace-nowrap">{formatDate(tx.date)}</p>
                  <p className="text-sm font-bold text-text-primary truncate">{tx.description}</p>
                  <p className="text-xs text-text-tertiary truncate">{tx.patient ?? '—'}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded self-start sm:self-auto ${
                    tx.type === 'receita' ? 'text-success bg-success-surface' : 'text-danger bg-danger-surface'
                  }`}>
                    {tx.type}
                  </span>
                  <p className={`font-display font-bold text-sm ${tx.type === 'receita' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'despesa' ? '- ' : ''}{fmt(tx.amount)}
                  </p>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded self-start sm:self-auto ${STATUS_CFG[tx.status].color}`}>
                    {STATUS_CFG[tx.status].label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Rodapé com total */}
          <div className="flex items-center justify-between px-5 py-3 bg-surface-low border-t border-border-soft">
          <p className="text-xs text-text-tertiary">{filtered.length} lançamentos</p>
            <p className="font-display font-bold text-sm text-text-primary">
              Total: {fmt(filtered.reduce((s,t) => t.type === 'receita' ? s+t.amount : s-t.amount, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
