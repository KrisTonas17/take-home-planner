'use client'

import { PlannerState, SpouseIncome } from '@/types/planner'
import { formatCurrency } from '@/lib/utils'
import { calcPersonTax } from '@/lib/taxCalc'

interface Props {
  state: PlannerState
  update: (partial: Partial<PlannerState>) => void
}

function IncomeSection({
  label,
  income,
  onChange,
}: {
  label: string
  income: SpouseIncome
  onChange: (updated: SpouseIncome) => void
}) {
  const set = (key: keyof SpouseIncome) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...income, [key]: parseFloat(e.target.value) || 0 })

  const total = income.salary + income.bonus + income.otherIncome

  return (
    <div className="card">
      <h3 className="font-semibold text-base mb-5" style={{ color: 'var(--color-text)' }}>
        {label}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Base Salary / Year</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              type="number"
              className="input"
              style={{ paddingLeft: 24 }}
              placeholder="100,000"
              value={income.salary || ''}
              onChange={set('salary')}
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="label">Bonus / Variable Comp / Year</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              type="number"
              className="input"
              style={{ paddingLeft: 24 }}
              placeholder="0"
              value={income.bonus || ''}
              onChange={set('bonus')}
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="label">Other Taxable Income / Year</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              type="number"
              className="input"
              style={{ paddingLeft: 24 }}
              placeholder="0"
              value={income.otherIncome || ''}
              onChange={set('otherIncome')}
              min={0}
            />
          </div>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Total gross: <strong style={{ color: 'var(--color-text)' }}>{formatCurrency(total)}</strong>
            {income.bonus > 0 && (
              <span className="ml-3 text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(210,153,34,0.15)', color: '#e3b341' }}>
                {Math.round((income.bonus / total) * 100)}% variable — may affect withholding
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

export function StepIncome({ state, update }: Props) {
  return (
    <div className="space-y-4">
      <IncomeSection
        label={state.filingStatus === 'married' ? 'Spouse 1 Income' : 'Your Income'}
        income={state.spouse1}
        onChange={s1 => update({ spouse1: s1 })}
      />
      {state.filingStatus === 'married' && (
        <IncomeSection
          label="Spouse 2 Income"
          income={state.spouse2}
          onChange={s2 => update({ spouse2: s2 })}
        />
      )}
      <div className="info-box">
        💡 Enter annual amounts. Bonuses and commissions are included in gross income and taxed at the same effective rate for this estimate.
      </div>
    </div>
  )
}
