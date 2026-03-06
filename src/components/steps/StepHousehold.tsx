'use client'

import { PlannerState } from '@/types/planner'
import { STATES_SORTED } from '@/lib/taxData'

interface Props {
  state: PlannerState
  update: (partial: Partial<PlannerState>) => void
}

export function StepHousehold({ state, update }: Props) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-display font-semibold mb-6" style={{ color: 'var(--color-text)' }}>
          First, tell us about your household
        </h2>

        <div className="space-y-6">
          {/* Filing Status */}
          <div>
            <label className="label">Filing Status</label>
            <div className="flex gap-3">
              {['single', 'married'].map(status => (
                <button
                  key={status}
                  onClick={() => update({ filingStatus: status as 'single' | 'married' })}
                  className={`chip ${state.filingStatus === status ? 'chip-active' : 'chip-inactive'}`}
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                >
                  {status === 'single' ? '👤 Single' : '👫 Married Filing Jointly'}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div>
            <label className="label" htmlFor="state">State of Residence</label>
            <select
              id="state"
              className="input"
              style={{ maxWidth: 320 }}
              value={state.state}
              onChange={e => update({ state: e.target.value })}
            >
              {STATES_SORTED.map(s => (
                <option key={s.abbreviation} value={s.abbreviation}>
                  {s.name} {!s.hasIncomeTax ? '(No state income tax)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tax Year */}
          <div>
            <label className="label">Tax Year</label>
            <div className="flex gap-3">
              {[2026, 2025].map(year => (
                <button
                  key={year}
                  onClick={() => update({ taxYear: year })}
                  className={`chip ${state.taxYear === year ? 'chip-active' : 'chip-inactive'}`}
                >
                  {year} {year === 2026 ? '(Default)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Calc Mode */}
          <div>
            <label className="label">Calculation View</label>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => update({ calcMode: 'withholding' })}
                className={`text-left rounded-lg p-4 transition-all ${state.calcMode === 'withholding' ? '' : ''}`}
                style={{
                  background: state.calcMode === 'withholding' ? 'rgba(63,185,80,0.08)' : 'var(--color-surface-2)',
                  border: `1px solid ${state.calcMode === 'withholding' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                <div className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                  📊 Paycheck Withholding View
                </div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  What your payroll withholding likely looks like month to month. Each earner's taxes calculated independently.
                </div>
              </button>

              <button
                onClick={() => update({ calcMode: 'household' })}
                className="text-left rounded-lg p-4 transition-all"
                style={{
                  background: state.calcMode === 'household' ? 'rgba(63,185,80,0.08)' : 'var(--color-surface-2)',
                  border: `1px solid ${state.calcMode === 'household' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                <div className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                  🏠 True Household Annual Estimate
                </div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Your combined income calculated as a household. For married filers, this reveals potential withholding gaps.
                </div>
              </button>
            </div>

            {state.filingStatus === 'married' && (
              <div className="info-box mt-3">
                💡 <strong>Married insight:</strong> Employers withhold taxes based on each person's wages individually, but your actual tax liability depends on your combined household income. We'll show you both views.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
