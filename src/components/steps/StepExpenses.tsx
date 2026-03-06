'use client'

import { PlannerState, FixedExpenses } from '@/types/planner'
import { formatCurrency } from '@/lib/utils'

interface Props {
  state: PlannerState
  update: (partial: Partial<PlannerState>) => void
  totalMonthly: number
  monthlyTakeHome: number
}

const EXPENSE_FIELDS: { key: keyof FixedExpenses; label: string; placeholder: string; icon: string }[] = [
  { key: 'housing', label: 'Housing (Rent / Mortgage)', placeholder: '2,000', icon: '🏠' },
  { key: 'utilities', label: 'Utilities', placeholder: '200', icon: '⚡' },
  { key: 'groceries', label: 'Groceries', placeholder: '600', icon: '🛒' },
  { key: 'transportation', label: 'Transportation / Car', placeholder: '400', icon: '🚗' },
  { key: 'insurance', label: 'Insurance (Non-health)', placeholder: '200', icon: '🛡️' },
  { key: 'childcare', label: 'Childcare / Education', placeholder: '0', icon: '👶' },
  { key: 'debtPayments', label: 'Debt Payments', placeholder: '300', icon: '💳' },
  { key: 'subscriptions', label: 'Subscriptions / Services', placeholder: '100', icon: '📱' },
  { key: 'other', label: 'Other Fixed', placeholder: '0', icon: '📦' },
]

export function StepExpenses({ state, update, totalMonthly, monthlyTakeHome }: Props) {
  const setExpense = (key: keyof FixedExpenses) => (e: React.ChangeEvent<HTMLInputElement>) => {
    update({
      fixedExpenses: {
        ...state.fixedExpenses,
        [key]: parseFloat(e.target.value) || 0,
      },
    })
  }

  const remaining = monthlyTakeHome - totalMonthly
  const expenseRatio = monthlyTakeHome > 0 ? totalMonthly / monthlyTakeHome : 0

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Fixed Monthly Expenses
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          Enter your recurring monthly costs. We'll subtract these from your take-home to show your real discretionary cash.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPENSE_FIELDS.map(field => (
            <div key={field.key}>
              <label className="label">{field.icon} {field.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
                <input
                  type="number"
                  className="input"
                  style={{ paddingLeft: 24 }}
                  placeholder={field.placeholder}
                  value={state.fixedExpenses[field.key] || ''}
                  onChange={setExpense(field.key)}
                  min={0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="mt-6 pt-5 rounded-xl p-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>Total Monthly Fixed</div>
              <div className="text-2xl font-display font-bold" style={{ color: 'var(--color-text)' }}>
                {formatCurrency(totalMonthly)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>Annualized</div>
              <div className="text-2xl font-display font-bold" style={{ color: 'var(--color-text)' }}>
                {formatCurrency(totalMonthly * 12)}
              </div>
            </div>
            {monthlyTakeHome > 0 && (
              <div>
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>Remaining / Month</div>
                <div className="text-2xl font-display font-bold" style={{ color: remaining < 0 ? 'var(--color-danger)' : 'var(--color-accent)' }}>
                  {formatCurrency(remaining)}
                </div>
              </div>
            )}
          </div>

          {/* Expense bar */}
          {monthlyTakeHome > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>
                <span>Fixed expenses as % of take-home</span>
                <span style={{ color: expenseRatio > 0.7 ? 'var(--color-danger)' : expenseRatio > 0.5 ? 'var(--color-warning)' : 'var(--color-accent)' }}>
                  {Math.round(expenseRatio * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, expenseRatio * 100)}%`,
                    background: expenseRatio > 0.7 ? 'var(--color-danger)' : expenseRatio > 0.5 ? 'var(--color-warning)' : 'var(--color-accent)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {remaining < 0 && monthlyTakeHome > 0 && (
          <div className="warning-box mt-4">
            ⚠️ Your fixed expenses exceed your estimated take-home by {formatCurrency(Math.abs(remaining))}/month. Review your income or expenses before continuing.
          </div>
        )}

        {expenseRatio > 0.7 && expenseRatio <= 1 && (
          <div className="warning-box mt-4">
            ⚠️ Fixed expenses are consuming {Math.round(expenseRatio * 100)}% of take-home. This leaves limited room for savings, investments, or unexpected costs.
          </div>
        )}
      </div>
    </div>
  )
}
