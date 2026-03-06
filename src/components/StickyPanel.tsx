'use client'

import { HouseholdTaxResult } from '@/lib/taxCalc'
import { AllocationBuckets } from '@/types/planner'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface Props {
  taxResult: HouseholdTaxResult
  calcMode: 'withholding' | 'household'
  totalFixedMonthly: number
  monthlyTakeHome: number
  monthlyDiscretionary: number
  allocationTotal: number
  allocations: AllocationBuckets
  filingStatus: 'single' | 'married'
}

export function StickyPanel({
  taxResult, calcMode, totalFixedMonthly, monthlyTakeHome,
  monthlyDiscretionary, allocationTotal, allocations, filingStatus,
}: Props) {
  const usingHousehold = calcMode === 'household' && filingStatus === 'married' && taxResult.trueHouseholdNetMonthly

  return (
    <div className="sticky top-24">
      <div className="card" style={{ fontSize: 13 }}>
        <div className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>
          Live Summary
        </div>

        {/* Take-home */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span style={{ color: 'var(--color-muted)' }}>Monthly Take-Home</span>
            <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>
              {formatCurrency(monthlyTakeHome)}
            </span>
          </div>
          {usingHousehold && taxResult.trueHouseholdNetMonthly && (
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Withholding view</span>
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {formatCurrency(taxResult.combinedNetMonthly)}
              </span>
            </div>
          )}
          <div className="flex justify-between mb-1">
            <span style={{ color: 'var(--color-muted)' }}>Fixed Monthly</span>
            <span style={{ color: totalFixedMonthly > monthlyTakeHome ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {formatCurrency(totalFixedMonthly)}
            </span>
          </div>
          <div className="h-px my-2" style={{ background: 'var(--color-border)' }} />
          <div className="flex justify-between font-semibold">
            <span style={{ color: 'var(--color-muted)' }}>Discretionary / Month</span>
            <span style={{ color: monthlyDiscretionary < 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {formatCurrency(monthlyDiscretionary)}
            </span>
          </div>
        </div>

        {/* Tax breakdown */}
        {taxResult.combinedGross > 0 && (
          <div className="p-3 rounded-lg mb-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>Tax Overview</div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-muted)' }}>Gross Income</span>
                <span>{formatCurrency(taxResult.combinedGross)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-muted)' }}>Federal</span>
                <span>{formatCurrency(taxResult.spouse1.federalTax + (taxResult.spouse2?.federalTax ?? 0))}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-muted)' }}>State</span>
                <span>{formatCurrency(taxResult.spouse1.stateTax + (taxResult.spouse2?.stateTax ?? 0))}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-muted)' }}>SS + Medicare</span>
                <span>{formatCurrency(taxResult.spouse1.sssTax + taxResult.spouse1.medicareTax + (taxResult.spouse2 ? taxResult.spouse2.sssTax + taxResult.spouse2.medicareTax : 0))}</span>
              </div>
              <div className="h-px my-1" style={{ background: 'var(--color-border)' }} />
              <div className="flex justify-between font-semibold">
                <span>Effective Rate</span>
                <span style={{ color: 'var(--color-warning)' }}>
                  {formatPercent(taxResult.combinedGross > 0 ? taxResult.combinedTax / taxResult.combinedGross : 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Withholding gap warning */}
        {filingStatus === 'married' && taxResult.withholdingDifference !== undefined && Math.abs(taxResult.withholdingDifference) > 500 && (
          <div className="warning-box text-xs">
            {taxResult.withholdingDifference > 0
              ? `⚠️ Household may owe ~${formatCurrency(taxResult.withholdingDifference)} more at filing vs. payroll withholding`
              : `✓ Household over-withheld by ~${formatCurrency(Math.abs(taxResult.withholdingDifference))}`}
          </div>
        )}

        {/* Allocation total */}
        {allocationTotal > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span style={{ color: 'var(--color-muted)' }}>Allocated</span>
              <span style={{ color: Math.abs(100 - allocationTotal) < 1 ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                {allocationTotal}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
