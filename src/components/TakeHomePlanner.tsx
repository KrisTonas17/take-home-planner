'use client'

import { useState, useMemo } from 'react'
import { PlannerState, DEFAULT_STATE, AllocationBuckets, ALLOCATION_PRESETS } from '@/types/planner'
import { calcHousehold, HouseholdTaxResult } from '@/lib/taxCalc'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { STATES_SORTED, STATE_TAX_DATA } from '@/lib/taxData'
import { StepHousehold } from './steps/StepHousehold'
import { StepIncome } from './steps/StepIncome'
import { StepDeductions } from './steps/StepDeductions'
import { StepExpenses } from './steps/StepExpenses'
import { StepAllocations } from './steps/StepAllocations'
import { StepFunBudget } from './steps/StepFunBudget'
import { ResultsDashboard } from './ResultsDashboard'
import { StickyPanel } from './StickyPanel'

const STEPS = [
  { id: 1, label: 'Setup' },
  { id: 2, label: 'Income' },
  { id: 3, label: 'Deductions' },
  { id: 4, label: 'Expenses' },
  { id: 5, label: 'Allocate' },
  { id: 6, label: 'Fun' },
  { id: 7, label: 'Results' },
]

export function TakeHomePlanner() {
  const [state, setState] = useState<PlannerState>(DEFAULT_STATE)
  const [showResults, setShowResults] = useState(false)

  const update = (partial: Partial<PlannerState>) =>
    setState(prev => ({ ...prev, ...partial }))

  const taxResult = useMemo<HouseholdTaxResult>(() => {
    return calcHousehold({
      spouse1: state.spouse1,
      spouse2: state.filingStatus === 'married' ? state.spouse2 : undefined,
      filingStatus: state.filingStatus,
      state: state.state,
      taxYear: state.taxYear,
      applyStandardDeduction: state.applyStandardDeduction,
    })
  }, [state.spouse1, state.spouse2, state.filingStatus, state.state, state.taxYear, state.applyStandardDeduction])

  const totalFixedMonthly = Object.values(state.fixedExpenses).reduce((a, b) => a + b, 0)
  const totalFixedAnnual = totalFixedMonthly * 12

  const monthlyTakeHome = state.calcMode === 'withholding'
    ? taxResult.combinedNetMonthly
    : (taxResult.trueHouseholdNetMonthly ?? taxResult.combinedNetMonthly)

  const annualTakeHome = monthlyTakeHome * 12
  const monthlyDiscretionary = monthlyTakeHome - totalFixedMonthly
  const annualDiscretionary = monthlyDiscretionary * 12

  const allocationTotal = state.allocations.save + state.allocations.invest +
    state.allocations.fun + state.allocations.taxReserve +
    state.allocations.debtPayoff + state.allocations.custom

  const goNext = () => {
    if (state.currentStep < 7) update({ currentStep: state.currentStep + 1 })
    if (state.currentStep === 6) setShowResults(true)
  }
  const goBack = () => {
    if (state.currentStep > 1) update({ currentStep: state.currentStep - 1 })
    setShowResults(false)
  }

  const currentStepLabel = STEPS.find(s => s.id === state.currentStep)?.label || ''

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50"
        style={{ background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--color-accent)', color: '#0d1117' }}>
                T
              </div>
              <span className="font-display font-semibold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>
                Take Home Planner
              </span>
            </div>
            {state.state && (
              <span className="text-xs px-2 py-1 rounded-full hidden sm:inline-flex"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                {STATE_TAX_DATA[state.state]?.name} · {state.taxYear}
              </span>
            )}
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map(step => (
              <button
                key={step.id}
                onClick={() => {
                  update({ currentStep: step.id })
                  if (step.id === 7) setShowResults(true)
                  else setShowResults(false)
                }}
                className="step-dot"
                title={step.label}
                style={{
                  background: step.id === state.currentStep
                    ? 'var(--color-accent)'
                    : step.id < state.currentStep
                    ? 'var(--color-accent-muted)'
                    : 'var(--color-border)',
                  transform: step.id === state.currentStep ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <button onClick={() => { setState(DEFAULT_STATE); setShowResults(false) }}
            className="text-xs"
            style={{ color: 'var(--color-muted)' }}>
            Reset
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex gap-6 pt-8">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Hero - only on step 1 */}
            {state.currentStep === 1 && (
              <div className="mb-10 animate-in">
                <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 leading-tight"
                  style={{ color: 'var(--color-text)' }}>
                  See what you actually keep,<br />
                  <span style={{ color: 'var(--color-accent)' }}>then decide where it goes.</span>
                </h1>
                <p className="text-base sm:text-lg max-w-2xl" style={{ color: 'var(--color-muted)' }}>
                  Estimate real take-home pay, account for fixed expenses, and turn the rest into a plan. No login, no ads, no backend.
                </p>
              </div>
            )}

            {/* Step label */}
            {state.currentStep > 1 && (
              <div className="mb-6 animate-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
                    Step {state.currentStep} of 7
                  </span>
                </div>
              </div>
            )}

            {/* Step content */}
            <div className="animate-in" key={state.currentStep}>
              {state.currentStep === 1 && (
                <StepHousehold state={state} update={update} />
              )}
              {state.currentStep === 2 && (
                <StepIncome state={state} update={update} />
              )}
              {state.currentStep === 3 && (
                <StepDeductions state={state} update={update} />
              )}
              {state.currentStep === 4 && (
                <StepExpenses state={state} update={update}
                  totalMonthly={totalFixedMonthly}
                  monthlyTakeHome={monthlyTakeHome}
                />
              )}
              {state.currentStep === 5 && (
                <StepAllocations
                  state={state}
                  update={update}
                  monthlyDiscretionary={monthlyDiscretionary}
                  annualDiscretionary={annualDiscretionary}
                  allocationTotal={allocationTotal}
                />
              )}
              {state.currentStep === 6 && (
                <StepFunBudget
                  state={state}
                  update={update}
                  monthlyDiscretionary={monthlyDiscretionary}
                />
              )}
              {state.currentStep === 7 && (
                <ResultsDashboard
                  state={state}
                  taxResult={taxResult}
                  totalFixedMonthly={totalFixedMonthly}
                  totalFixedAnnual={totalFixedAnnual}
                  monthlyTakeHome={monthlyTakeHome}
                  annualTakeHome={annualTakeHome}
                  monthlyDiscretionary={monthlyDiscretionary}
                  annualDiscretionary={annualDiscretionary}
                  allocationTotal={allocationTotal}
                />
              )}
            </div>

            {/* Navigation */}
            {state.currentStep < 7 && (
              <div className="flex items-center gap-3 mt-8">
                {state.currentStep > 1 && (
                  <button className="btn-secondary" onClick={goBack}>
                    ← Back
                  </button>
                )}
                <button className="btn-primary" onClick={goNext}>
                  {state.currentStep === 6 ? 'View Results →' : 'Continue →'}
                </button>
              </div>
            )}

            {state.currentStep === 7 && (
              <div className="mt-8">
                <button className="btn-secondary" onClick={goBack}>
                  ← Edit Plan
                </button>
              </div>
            )}
          </main>

          {/* Sticky panel - desktop */}
          {state.currentStep >= 2 && state.currentStep < 7 && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <StickyPanel
                taxResult={taxResult}
                calcMode={state.calcMode}
                totalFixedMonthly={totalFixedMonthly}
                monthlyTakeHome={monthlyTakeHome}
                monthlyDiscretionary={monthlyDiscretionary}
                allocationTotal={allocationTotal}
                allocations={state.allocations}
                filingStatus={state.filingStatus}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 mt-16" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-center" style={{ color: 'var(--color-muted)' }}>
            Take Home Planner is an estimation tool, not tax advice. Results are approximations based on 2026 and 2025 IRS published brackets.
            Consult a qualified tax professional for your specific situation.
            Social Security wage base 2026: $184,500. Medicare: 1.45% flat (additional 0.9% threshold not reflected in paycheck estimate).
          </p>
        </div>
      </footer>
    </div>
  )
}
