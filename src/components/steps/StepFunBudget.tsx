'use client'

import { PlannerState } from '@/types/planner'
import { formatCurrency } from '@/lib/utils'

interface Props {
  state: PlannerState
  update: (partial: Partial<PlannerState>) => void
  monthlyDiscretionary: number
}

export function StepFunBudget({ state, update, monthlyDiscretionary }: Props) {
  const funAllocPct = state.allocations.fun / 100
  const funAllocMonthly = monthlyDiscretionary * funAllocPct
  const funAllocAnnual = funAllocMonthly * 12

  const funTargetMonthly = state.funBudgetMode === 'monthly'
    ? state.funBudgetAmount
    : state.funBudgetAmount / 12
  const funTargetAnnual = funTargetMonthly * 12

  const isOverAlloc = funTargetMonthly > funAllocMonthly && funAllocMonthly > 0
  const remainingAfterFun = monthlyDiscretionary - funTargetMonthly
  const funPctOfDiscretionary = monthlyDiscretionary > 0 ? funTargetMonthly / monthlyDiscretionary : 0

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Fun Budget Planner 🎉
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          How much do you want to spend on lifestyle, entertainment, dining, travel, and the stuff that makes life worth earning for?
        </p>

        {/* Fun allocation reference */}
        {funAllocMonthly > 0 && (
          <div className="p-4 rounded-lg mb-6" style={{ background: 'rgba(188,140,255,0.08)', border: '1px solid rgba(188,140,255,0.3)' }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#bc8cff' }}>Your "Fun" allocation bucket says:</div>
            <div className="flex gap-6">
              <div>
                <div className="text-xl font-display font-bold" style={{ color: '#bc8cff' }}>
                  {formatCurrency(funAllocMonthly)}/mo
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>From your {state.allocations.fun}% fun slice</div>
              </div>
              <div>
                <div className="text-xl font-display font-bold" style={{ color: 'var(--color-text)' }}>
                  {formatCurrency(funAllocAnnual)}/yr
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Annual budget</div>
              </div>
            </div>
          </div>
        )}

        {/* Fun target input */}
        <div className="mb-6">
          <label className="label">Set Your Actual Fun Target</label>
          <div className="flex gap-3 mb-4">
            {(['monthly', 'annual'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  const newAmount = mode === 'monthly'
                    ? (state.funBudgetMode === 'annual' ? state.funBudgetAmount / 12 : state.funBudgetAmount)
                    : (state.funBudgetMode === 'monthly' ? state.funBudgetAmount * 12 : state.funBudgetAmount)
                  update({ funBudgetMode: mode, funBudgetAmount: Math.round(newAmount) })
                }}
                className={`chip ${state.funBudgetMode === mode ? 'chip-active' : 'chip-inactive'}`}
              >
                {mode === 'monthly' ? 'Monthly' : 'Annual'}
              </button>
            ))}
          </div>
          <div className="relative" style={{ maxWidth: 260 }}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              type="number"
              className="input"
              style={{ paddingLeft: 24, fontSize: 18 }}
              placeholder={state.funBudgetMode === 'monthly' ? '500' : '6,000'}
              value={state.funBudgetAmount || ''}
              onChange={e => update({ funBudgetAmount: parseFloat(e.target.value) || 0 })}
              min={0}
            />
          </div>
        </div>

        {/* Results */}
        {state.funBudgetAmount > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="metric">
                <div className="metric-value" style={{ color: '#bc8cff' }}>{formatCurrency(funTargetMonthly)}</div>
                <div className="metric-label">Monthly Fun Budget</div>
              </div>
              <div className="metric">
                <div className="metric-value">{formatCurrency(funTargetAnnual)}</div>
                <div className="metric-label">Annual Fun Budget</div>
              </div>
              <div className="metric">
                <div className="metric-value" style={{ color: remainingAfterFun >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                  {formatCurrency(remainingAfterFun)}
                </div>
                <div className="metric-label">Remaining After Fun / Month</div>
              </div>
            </div>

            {/* Fun as % of discretionary */}
            {monthlyDiscretionary > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                  <span>Fun budget as % of discretionary income</span>
                  <span style={{ color: funPctOfDiscretionary > 0.5 ? 'var(--color-warning)' : 'var(--color-accent)' }}>
                    {Math.round(funPctOfDiscretionary * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, funPctOfDiscretionary * 100)}%`,
                      background: funPctOfDiscretionary > 0.5 ? 'var(--color-warning)' : '#bc8cff',
                    }}
                  />
                </div>
              </div>
            )}

            {isOverAlloc && (
              <div className="warning-box">
                ⚠️ Your fun target ({formatCurrency(funTargetMonthly)}/mo) exceeds your Fun allocation bucket ({formatCurrency(funAllocMonthly)}/mo). Consider adjusting your allocation on the previous step.
              </div>
            )}
            {funPctOfDiscretionary > 0.48 && (
              <div className="warning-box">
                ⚠️ Fun is consuming {Math.round(funPctOfDiscretionary * 100)}% of discretionary income, which leaves limited runway for savings and unexpected costs.
              </div>
            )}
            {remainingAfterFun >= 0 && !isOverAlloc && (
              <div className="success-box">
                ✓ Your fun budget leaves {formatCurrency(remainingAfterFun)}/month available for other goals. Your annual plan looks sustainable.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
