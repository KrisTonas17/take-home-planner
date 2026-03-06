'use client'

import { PlannerState, SpouseIncome } from '@/types/planner'
import { formatCurrency } from '@/lib/utils'

interface Props {
  state: PlannerState
  update: (partial: Partial<PlannerState>) => void
}

function DeductionSection({
  label,
  income,
  onChange,
  showStdDed,
  applyStdDed,
  onToggleStdDed,
  stdDedAmount,
}: {
  label: string
  income: SpouseIncome
  onChange: (updated: SpouseIncome) => void
  showStdDed?: boolean
  applyStdDed?: boolean
  onToggleStdDed?: () => void
  stdDedAmount?: number
}) {
  const set = (key: keyof SpouseIncome) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...income, [key]: parseFloat(e.target.value) || 0 })

  const totalPreTax = income.k401 + income.healthInsurance + income.hsa
  const totalReduction = totalPreTax + (applyStdDed ? (stdDedAmount || 0) : 0)

  return (
    <div className="card">
      <h3 className="font-semibold text-base mb-5" style={{ color: 'var(--color-text)' }}>
        {label}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">
            401(k) / 403(b) Contributions / Year
            <span className="ml-1 text-xs normal-case" style={{ color: 'var(--color-accent)' }}>Pre-tax</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              type="number"
              className="input"
              style={{ paddingLeft: 24 }}
              placeholder="0"
              value={income.k401 || ''}
              onChange={set('k401')}
              min={0}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>2026 limit: $24,500</p>
        </div>
        <div>
          <label className="label">
            Health Insurance / Month
            <span className="ml-1 text-xs normal-case" style={{ color: 'var(--color-accent)' }}>Pre-tax</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              type="number"
              className="input"
              style={{ paddingLeft: 24 }}
              placeholder="0"
              value={income.healthInsurance ? income.healthInsurance / 12 : ''}
              onChange={e => onChange({ ...income, healthInsurance: (parseFloat(e.target.value) || 0) * 12 })}
              min={0}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Annual: {formatCurrency(income.healthInsurance)}</p>
        </div>
        <div>
          <label className="label">
            HSA / FSA / Year
            <span className="ml-1 text-xs normal-case" style={{ color: 'var(--color-accent)' }}>Pre-tax</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-muted)' }}>$</span>
            <input
              type="number"
              className="input"
              style={{ paddingLeft: 24 }}
              placeholder="0"
              value={income.hsa || ''}
              onChange={set('hsa')}
              min={0}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>HSA 2026 limit: $4,300 (self)</p>
        </div>
      </div>

      {totalPreTax > 0 && (
        <div className="mt-4 pt-4 text-sm" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
          Pre-tax deductions: <strong style={{ color: 'var(--color-accent)' }}>{formatCurrency(totalPreTax)}</strong>
          <span className="ml-2 text-xs">reduces your federal taxable income</span>
        </div>
      )}
    </div>
  )
}

export function StepDeductions({ state, update }: Props) {
  return (
    <div className="space-y-4">
      <DeductionSection
        label={state.filingStatus === 'married' ? 'Spouse 1 Deductions' : 'Your Pre-Tax Deductions'}
        income={state.spouse1}
        onChange={s1 => update({ spouse1: s1 })}
      />

      {state.filingStatus === 'married' && (
        <DeductionSection
          label="Spouse 2 Deductions"
          income={state.spouse2}
          onChange={s2 => update({ spouse2: s2 })}
        />
      )}

      {/* Standard deduction toggle */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>Apply Standard Deduction</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              2026: {state.filingStatus === 'married' ? '$32,200 (Married)' : '$16,100 (Single)'}
            </div>
          </div>
          <button
            onClick={() => update({ applyStandardDeduction: !state.applyStandardDeduction })}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: state.applyStandardDeduction ? 'var(--color-accent)' : 'var(--color-border)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              style={{ transform: state.applyStandardDeduction ? 'translateX(26px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
          Most taxpayers take the standard deduction. Turn this off if you itemize deductions and your total exceeds the standard amount.
        </p>
      </div>

      <div className="info-box">
        ℹ️ These are pre-tax deductions that reduce your federal (and usually state) taxable income. 401(k) contributions don't reduce payroll taxes (SS/Medicare) but do reduce federal and most state income taxes.
      </div>
    </div>
  )
}
