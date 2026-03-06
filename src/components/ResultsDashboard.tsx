'use client'

import { useMemo } from 'react'
import { PlannerState } from '@/types/planner'
import { HouseholdTaxResult } from '@/lib/taxCalc'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { STATE_TAX_DATA } from '@/lib/taxData'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface Props {
  state: PlannerState
  taxResult: HouseholdTaxResult
  totalFixedMonthly: number
  totalFixedAnnual: number
  monthlyTakeHome: number
  annualTakeHome: number
  monthlyDiscretionary: number
  annualDiscretionary: number
  allocationTotal: number
}

const ALLOC_COLORS: Record<string, string> = {
  Save: '#3fb950',
  Invest: '#58a6ff',
  Fun: '#bc8cff',
  'Extra Tax Reserve': '#d29922',
  'Debt Payoff': '#f85149',
  Custom: '#8b949e',
}

function MetricCard({ label, monthly, annual, color }: { label: string; monthly: number; annual: number; color?: string }) {
  return (
    <div className="metric">
      <div className="metric-value" style={color ? { color } : {}}>
        {formatCurrency(monthly)}
        <span className="text-sm font-sans font-normal ml-1" style={{ color: 'var(--color-muted)' }}>/mo</span>
      </div>
      <div className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
        {formatCurrency(annual)}/yr
      </div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

export function ResultsDashboard({
  state, taxResult, totalFixedMonthly, totalFixedAnnual,
  monthlyTakeHome, annualTakeHome, monthlyDiscretionary, annualDiscretionary,
  allocationTotal,
}: Props) {
  const allocs = state.allocations
  const stateInfo = STATE_TAX_DATA[state.state]

  const spouse1 = taxResult.spouse1
  const spouse2 = taxResult.spouse2

  const combinedFederal = spouse1.federalTax + (spouse2?.federalTax ?? 0)
  const combinedState = spouse1.stateTax + (spouse2?.stateTax ?? 0)
  const combinedPayroll = spouse1.sssTax + spouse1.medicareTax + (spouse2 ? spouse2.sssTax + spouse2.medicareTax : 0)

  // Allocation data for pie
  const allocPieData = [
    { name: 'Save', value: allocs.save, pct: allocs.save },
    { name: 'Invest', value: allocs.invest, pct: allocs.invest },
    { name: 'Fun', value: allocs.fun, pct: allocs.fun },
    { name: 'Extra Tax Reserve', value: allocs.taxReserve, pct: allocs.taxReserve },
    { name: 'Debt Payoff', value: allocs.debtPayoff, pct: allocs.debtPayoff },
    ...(allocs.custom > 0 ? [{ name: allocs.customLabel || 'Custom', value: allocs.custom, pct: allocs.custom }] : []),
  ].filter(d => d.value > 0)

  // Monthly flow bar chart
  const barData = [
    { name: 'Take-Home', value: monthlyTakeHome, fill: '#3fb950' },
    { name: 'Fixed Costs', value: totalFixedMonthly, fill: '#f85149' },
    { name: 'Discretionary', value: Math.max(0, monthlyDiscretionary), fill: '#58a6ff' },
  ]

  // Annual runway - month by month cumulative savings
  const runwayData = useMemo(() => {
    const saveMonthly = monthlyDiscretionary * (allocs.save / 100)
    const investMonthly = monthlyDiscretionary * (allocs.invest / 100)
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      'Take-Home': Math.round(monthlyTakeHome),
      'Fixed Costs': Math.round(totalFixedMonthly),
      'Discretionary': Math.round(Math.max(0, monthlyDiscretionary)),
    }))
  }, [monthlyTakeHome, totalFixedMonthly, monthlyDiscretionary, allocs])

  // Warnings
  const warnings: string[] = []
  if (allocationTotal < 95) warnings.push(`${100 - allocationTotal}% of discretionary income (${formatCurrency(monthlyDiscretionary * ((100 - allocationTotal) / 100))}/mo) is unallocated.`)
  if (allocs.taxReserve < 5 && (state.spouse1.bonus > 0 || state.spouse2.bonus > 0)) warnings.push('Variable compensation detected but Extra Tax Reserve is under 5%. You may owe at filing.')
  if (state.filingStatus === 'married' && taxResult.withholdingDifference && taxResult.withholdingDifference > 2000) {
    warnings.push(`Married withholding gap: household may owe ~${formatCurrency(taxResult.withholdingDifference)} more at filing than payroll suggests.`)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Your Financial Picture
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {stateInfo?.name} · {state.taxYear} · {state.filingStatus === 'married' ? 'Married Filing Jointly' : 'Single'} ·{' '}
          {state.calcMode === 'withholding' ? 'Paycheck withholding view' : 'True household view'}
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="warning-box">⚠️ {w}</div>
          ))}
        </div>
      )}

      {/* Two-view comparison for married */}
      {state.filingStatus === 'married' && taxResult.trueHouseholdNetMonthly && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Two Views: What Your Plan Actually Looks Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
                Paycheck Withholding View
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Spouse 1 monthly net</span>
                  <span>{formatCurrency(spouse1.netMonthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Spouse 2 monthly net</span>
                  <span>{formatCurrency(spouse2?.netMonthly ?? 0)}</span>
                </div>
                <div className="h-px my-1" style={{ background: 'var(--color-border)' }} />
                <div className="flex justify-between font-semibold">
                  <span>Combined monthly</span>
                  <span style={{ color: 'var(--color-accent)' }}>{formatCurrency(taxResult.combinedNetMonthly)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
                  <span>Combined annual</span>
                  <span>{formatCurrency(taxResult.combinedNet)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.2)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: '#58a6ff' }}>
                True Household Annual View
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>True household net/mo</span>
                  <span style={{ color: '#58a6ff' }}>{formatCurrency(taxResult.trueHouseholdNetMonthly!)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>True household net/yr</span>
                  <span>{formatCurrency(taxResult.trueHouseholdNet!)}</span>
                </div>
                <div className="h-px my-1" style={{ background: 'var(--color-border)' }} />
                <div className="flex justify-between font-semibold" style={{
                  color: taxResult.withholdingDifference! > 0 ? 'var(--color-warning)' : 'var(--color-accent)'
                }}>
                  <span>Withholding gap (annual)</span>
                  <span>
                    {taxResult.withholdingDifference! > 0 ? '+' : ''}{formatCurrency(taxResult.withholdingDifference!)}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {taxResult.withholdingDifference! > 0
                    ? 'Household may owe this at filing'
                    : 'Household is over-withheld'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income + Tax Summary */}
      <div className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Income & Tax Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetricCard label="Gross Income" monthly={taxResult.combinedGross / 12} annual={taxResult.combinedGross} />
          <MetricCard label="Federal Tax" monthly={combinedFederal / 12} annual={combinedFederal} color="var(--color-warning)" />
          <MetricCard label="State Tax" monthly={combinedState / 12} annual={combinedState} color="var(--color-warning)" />
          <MetricCard label="SS + Medicare" monthly={combinedPayroll / 12} annual={combinedPayroll} color="var(--color-warning)" />
          <MetricCard label="Total Taxes" monthly={taxResult.combinedTax / 12} annual={taxResult.combinedTax} color="var(--color-danger)" />
          <MetricCard label="Take-Home" monthly={monthlyTakeHome} annual={annualTakeHome} color="var(--color-accent)" />
          <div className="metric">
            <div className="metric-value" style={{ color: 'var(--color-warning)' }}>
              {formatPercent(taxResult.combinedGross > 0 ? taxResult.combinedTax / taxResult.combinedGross : 0)}
            </div>
            <div className="metric-label">Effective Tax Rate</div>
          </div>
          <div className="metric">
            <div className="metric-value" style={{ color: 'var(--color-text)' }}>
              {formatCurrency(totalFixedMonthly)}
              <span className="text-sm font-sans font-normal ml-1" style={{ color: 'var(--color-muted)' }}>/mo</span>
            </div>
            <div className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>{formatCurrency(totalFixedAnnual)}/yr</div>
            <div className="metric-label">Fixed Expenses</div>
          </div>
        </div>
      </div>

      {/* Monthly Flow Bar Chart */}
      <div className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Monthly Cash Flow</h3>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13 }}
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: 'var(--color-text)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 justify-center mt-3">
          {barData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.fill }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      {/* Allocation Breakdown */}
      {allocPieData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Discretionary Allocation</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div style={{ width: 220, height: 220, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ALLOC_COLORS[entry.name] || '#8b949e'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value}% · ${formatCurrency(monthlyDiscretionary * value / 100)}/mo`, name]}
                    labelStyle={{ color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full">
              <div className="space-y-3">
                {allocPieData.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: ALLOC_COLORS[d.name] || '#8b949e' }} />
                        <span style={{ color: 'var(--color-text)' }}>{d.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatCurrency(monthlyDiscretionary * d.value / 100)}/mo</span>
                        <span className="ml-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                          {formatCurrency(annualDiscretionary * d.value / 100)}/yr
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.value}%`, background: ALLOC_COLORS[d.name] || '#8b949e' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annual Runway */}
      <div className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Annual Runway (Monthly View)</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={runwayData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: 'var(--color-text)' }}
              />
              <Bar dataKey="Take-Home" fill="#3fb950" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fixed Costs" fill="#f85149" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Discretionary" fill="#58a6ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 justify-center mt-3">
          {[{ color: '#3fb950', label: 'Take-Home' }, { color: '#f85149', label: 'Fixed Costs' }, { color: '#58a6ff', label: 'Discretionary' }].map(d => (
            <div key={d.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* Full summary table */}
      <div className="card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Full Annual Summary</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Gross Annual Income', value: taxResult.combinedGross, style: 'text' },
            { label: '  Federal Income Tax', value: -combinedFederal, style: 'warning' },
            { label: '  State Income Tax', value: -combinedState, style: 'warning' },
            { label: '  Social Security + Medicare', value: -combinedPayroll, style: 'warning' },
            { label: 'Annual Take-Home', value: annualTakeHome, style: 'accent', bold: true },
            { label: '  Annual Fixed Expenses', value: -totalFixedAnnual, style: 'danger' },
            { label: 'Annual Discretionary Cash', value: annualDiscretionary, style: 'blue', bold: true },
            ...(allocPieData.map(d => ({
              label: `  → ${d.name}`,
              value: annualDiscretionary * d.value / 100,
              style: 'muted',
            }))),
          ].map((row, i) => (
            <div
              key={i}
              className={`flex justify-between ${row.bold ? 'font-semibold py-1.5 border-t' : 'py-0.5'}`}
              style={row.bold ? { borderColor: 'var(--color-border)' } : {}}
            >
              <span style={{ color: 'var(--color-muted)' }}>{row.label}</span>
              <span style={{
                color: row.style === 'accent' ? 'var(--color-accent)'
                  : row.style === 'danger' ? 'var(--color-danger)'
                  : row.style === 'warning' ? 'var(--color-warning)'
                  : row.style === 'blue' ? '#58a6ff'
                  : row.style === 'muted' ? 'var(--color-muted)'
                  : 'var(--color-text)'
              }}>
                {row.value < 0 ? `-${formatCurrency(Math.abs(row.value))}` : formatCurrency(row.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fun budget summary */}
      {state.funBudgetAmount > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Fun Budget Summary 🎉</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="metric">
              <div className="metric-value" style={{ color: '#bc8cff' }}>
                {formatCurrency(state.funBudgetMode === 'monthly' ? state.funBudgetAmount : state.funBudgetAmount / 12)}
              </div>
              <div className="metric-label">Monthly Fun Budget</div>
            </div>
            <div className="metric">
              <div className="metric-value">
                {formatCurrency(state.funBudgetMode === 'annual' ? state.funBudgetAmount : state.funBudgetAmount * 12)}
              </div>
              <div className="metric-label">Annual Fun Budget</div>
            </div>
            <div className="metric">
              <div className="metric-value" style={{ color: 'var(--color-accent)' }}>
                {monthlyDiscretionary > 0
                  ? `${Math.round(((state.funBudgetMode === 'monthly' ? state.funBudgetAmount : state.funBudgetAmount / 12) / monthlyDiscretionary) * 100)}%`
                  : '—'}
              </div>
              <div className="metric-label">% of Discretionary Income</div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl text-xs" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
        This is an estimate, not tax advice. Results use 2026 IRS published brackets (Rev. Proc. 2025-32) and approximate state income tax rates. Actual withholding and tax liability may differ based on W-4 elections, itemized deductions, credits, self-employment income, investment income, and other factors. Consult a qualified tax professional.
      </div>
    </div>
  )
}
