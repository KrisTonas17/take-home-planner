'use client'

import { PlannerState, AllocationBuckets, ALLOCATION_PRESETS } from '@/types/planner'
import { formatCurrency } from '@/lib/utils'

interface Props {
  state: PlannerState
  update: (partial: Partial<PlannerState>) => void
  monthlyDiscretionary: number
  annualDiscretionary: number
  allocationTotal: number
}

const BUCKET_CONFIG: { key: keyof Omit<AllocationBuckets, 'customLabel'>; label: string; color: string; icon: string }[] = [
  { key: 'save', label: 'Save', color: '#3fb950', icon: '🏦' },
  { key: 'invest', label: 'Invest', color: '#58a6ff', icon: '📈' },
  { key: 'fun', label: 'Fun', color: '#bc8cff', icon: '🎉' },
  { key: 'taxReserve', label: 'Extra Tax Reserve', color: '#d29922', icon: '🧾' },
  { key: 'debtPayoff', label: 'Debt Payoff', color: '#f85149', icon: '💳' },
  { key: 'custom', label: 'Custom', color: '#8b949e', icon: '✨' },
]

export function StepAllocations({ state, update, monthlyDiscretionary, annualDiscretionary, allocationTotal }: Props) {
  const allocs = state.allocations
  const remaining = 100 - allocationTotal
  const isValid = Math.abs(remaining) < 1

  const setAlloc = (key: keyof Omit<AllocationBuckets, 'customLabel'>, value: number) => {
    update({ allocations: { ...allocs, [key]: value } })
  }

  const applyPreset = (presetName: string) => {
    const preset = ALLOCATION_PRESETS[presetName as keyof typeof ALLOCATION_PRESETS]
    if (preset) {
      update({ allocations: { ...allocs, ...preset } })
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Allocate Your Discretionary Cash
        </h2>

        {/* Context */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Monthly Discretionary</div>
            <div className="text-xl font-display font-bold mt-0.5" style={{ color: monthlyDiscretionary < 0 ? 'var(--color-danger)' : 'var(--color-accent)' }}>
              {formatCurrency(monthlyDiscretionary)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Annual Discretionary</div>
            <div className="text-xl font-display font-bold mt-0.5" style={{ color: monthlyDiscretionary < 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {formatCurrency(annualDiscretionary)}
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="mb-6">
          <label className="label">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(ALLOCATION_PRESETS).map(name => (
              <button key={name} onClick={() => applyPreset(name)} className="chip chip-inactive text-xs">
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Allocation stacked bar */}
        <div className="h-3 rounded-full overflow-hidden flex mb-6" style={{ background: 'var(--color-border)' }}>
          {BUCKET_CONFIG.map(b => {
            const pct = allocs[b.key as keyof typeof allocs]
            if (typeof pct !== 'number' || pct <= 0) return null
            return (
              <div
                key={b.key}
                className="h-full transition-all duration-300"
                style={{ width: `${Math.min(pct, 100)}%`, background: b.color }}
                title={`${b.label}: ${pct}%`}
              />
            )
          })}
        </div>

        {/* Sliders */}
        <div className="space-y-5">
          {BUCKET_CONFIG.map(bucket => {
            const pct = Number(allocs[bucket.key as keyof typeof allocs] || 0)
            const monthly = monthlyDiscretionary * (pct / 100)
            const annual = monthly * 12
            return (
              <div key={bucket.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{bucket.icon}</span>
                    {bucket.key === 'custom' ? (
                      <input
                        type="text"
                        value={allocs.customLabel}
                        onChange={e => update({ allocations: { ...allocs, customLabel: e.target.value } })}
                        className="text-sm font-medium bg-transparent border-b border-dashed focus:outline-none"
                        style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)', maxWidth: 120 }}
                      />
                    ) : (
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{bucket.label}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {formatCurrency(monthly)}/mo · {formatCurrency(annual)}/yr
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        value={pct}
                        min={0}
                        max={100}
                        onChange={e => setAlloc(bucket.key as keyof Omit<AllocationBuckets, 'customLabel'>, Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="text-right text-sm font-mono"
                        style={{
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 6,
                          padding: '3px 22px 3px 8px',
                          width: 64,
                          color: 'var(--color-text)',
                          fontFamily: 'inherit',
                        }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-muted)' }}>%</span>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={pct}
                  onChange={e => setAlloc(bucket.key as keyof Omit<AllocationBuckets, 'customLabel'>, parseInt(e.target.value))}
                  style={{ accentColor: bucket.color }}
                />
              </div>
            )
          })}
        </div>

        {/* Total indicator */}
        <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Total allocated</span>
          <span className={`text-lg font-display font-bold ${isValid ? '' : ''}`}
            style={{ color: isValid ? 'var(--color-accent)' : remaining < 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
            {allocationTotal}%
          </span>
        </div>

        {!isValid && remaining > 0 && (
          <div className="info-box mt-3">
            ℹ️ {remaining.toFixed(0)}% unallocated ({formatCurrency(monthlyDiscretionary * (remaining / 100))}/mo). Adjust sliders to reach 100%.
          </div>
        )}
        {!isValid && remaining < 0 && (
          <div className="warning-box mt-3">
            ⚠️ You've allocated {Math.abs(remaining).toFixed(0)}% more than 100%. Reduce one or more buckets.
          </div>
        )}
        {isValid && (
          <div className="success-box mt-3">
            ✓ Fully allocated — {formatCurrency(monthlyDiscretionary)}/month accounted for.
          </div>
        )}

        {/* Tax reserve warning */}
        {(state.spouse1.bonus > 0 || state.spouse2.bonus > 0) && allocs.taxReserve < 10 && (
          <div className="warning-box mt-3">
            ⚠️ You have variable compensation but less than 10% in the Extra Tax Reserve bucket. Consider increasing it to avoid an April surprise.
          </div>
        )}
      </div>
    </div>
  )
}
