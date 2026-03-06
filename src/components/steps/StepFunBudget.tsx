'use client'

import { useState } from 'react'
import { PlannerState, FunLineItem, FunFrequency } from '@/types/planner'
import { formatCurrency } from '@/lib/utils'

interface Props {
  state: PlannerState
  update: (partial: Partial<PlannerState>) => void
  monthlyDiscretionary: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const PRESET_CATEGORIES: { label: string; icon: string }[] = [
  { label: 'Dining Out', icon: '🍽️' },
  { label: 'Bars & Drinks', icon: '🍸' },
  { label: 'Coffee', icon: '☕' },
  { label: 'Travel', icon: '✈️' },
  { label: 'Hotels', icon: '🏨' },
  { label: 'Concerts & Shows', icon: '🎶' },
  { label: 'Movies', icon: '🎬' },
  { label: 'Sports & Activities', icon: '⚽' },
  { label: 'Shopping', icon: '🛍️' },
  { label: 'Spa & Wellness', icon: '💆' },
  { label: 'Gifts', icon: '🎁' },
  { label: 'Hobbies', icon: '🎨' },
  { label: 'Gaming', icon: '🎮' },
  { label: 'Books & Courses', icon: '📚' },
  { label: 'Dates', icon: '💑' },
  { label: 'Kids Activities', icon: '🎠' },
  { label: 'Pets', icon: '🐾' },
  { label: 'Streaming & Apps', icon: '📺' },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function calcMonthlyBreakdown(items: FunLineItem[]): number[] {
  const months = Array(12).fill(0)
  for (const item of items) {
    if (item.frequency === 'monthly') {
      for (let m = 0; m < 12; m++) months[m] += item.amount
    } else {
      months[item.month] += item.amount
    }
  }
  return months
}

export function StepFunBudget({ state, update, monthlyDiscretionary }: Props) {
  const [showPresets, setShowPresets] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const [customIcon, setCustomIcon] = useState('✨')

  const funAllocMonthly = monthlyDiscretionary * (state.allocations.fun / 100)
  const funAllocAnnual = funAllocMonthly * 12

  const items: FunLineItem[] = state.funItems ?? []

  const setItems = (next: FunLineItem[]) => update({ funItems: next })

  const addPreset = (label: string, icon: string) => {
    setItems([...items, {
      id: uid(), label, icon, amount: 0,
      frequency: 'monthly', month: new Date().getMonth(),
    }])
    setShowPresets(false)
  }

  const addCustom = () => {
    if (!customLabel.trim()) return
    setItems([...items, {
      id: uid(), label: customLabel.trim(), icon: customIcon,
      amount: 0, frequency: 'monthly', month: new Date().getMonth(), isCustom: true,
    }])
    setCustomLabel('')
    setCustomIcon('✨')
  }

  const updateItem = (id: string, patch: Partial<FunLineItem>) =>
    setItems(items.map(it => it.id === id ? { ...it, ...patch } : it))

  const removeItem = (id: string) => setItems(items.filter(it => it.id !== id))

  const monthlyBreakdown = calcMonthlyBreakdown(items)
  const totalAnnual = items.reduce((sum, it) =>
    sum + (it.frequency === 'monthly' ? it.amount * 12 : it.amount), 0)
  const avgMonthly = totalAnnual / 12
  const remainingMonthly = funAllocMonthly - avgMonthly
  const remainingAnnual = funAllocAnnual - totalAnnual
  const peakMonth = monthlyBreakdown.indexOf(Math.max(...monthlyBreakdown))
  const maxMonthValue = Math.max(...monthlyBreakdown, 1)

  const categoryTotals = items.reduce<Record<string, { icon: string; annual: number }>>((acc, it) => {
    const annual = it.frequency === 'monthly' ? it.amount * 12 : it.amount
    if (!acc[it.label]) acc[it.label] = { icon: it.icon, annual: 0 }
    acc[it.label].annual += annual
    return acc
  }, {})

  return (
    <div className="space-y-5">

      {/* Budget reference */}
      {funAllocMonthly > 0 && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: '#bc8cff' }}>Your Fun Budget</div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-display font-bold" style={{ color: '#bc8cff' }}>
                  {formatCurrency(funAllocMonthly)}
                  <span className="text-sm font-sans font-normal" style={{ color: 'var(--color-muted)' }}>/mo</span>
                </span>
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  {formatCurrency(funAllocAnnual)}/yr &middot; {state.allocations.fun}% of discretionary
                </span>
              </div>
            </div>
            {items.length > 0 && (
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest mb-1"
                  style={{ color: remainingMonthly >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                  {remainingMonthly >= 0 ? 'Remaining avg' : 'Over budget avg'}
                </div>
                <div className="text-2xl font-display font-bold"
                  style={{ color: remainingMonthly >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                  {formatCurrency(Math.abs(remainingMonthly))}
                  <span className="text-sm font-sans font-normal" style={{ color: 'var(--color-muted)' }}>/mo</span>
                </div>
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="mt-4">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(100, (avgMonthly / Math.max(funAllocMonthly, 1)) * 100)}%`,
                  background: avgMonthly > funAllocMonthly
                    ? 'var(--color-danger)'
                    : avgMonthly / funAllocMonthly > 0.85
                      ? 'var(--color-warning)'
                      : '#bc8cff',
                }} />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
                <span>Planned avg: {formatCurrency(avgMonthly)}/mo</span>
                <span>{Math.round((avgMonthly / Math.max(funAllocMonthly, 1)) * 100)}% of budget</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Line items */}
      <div className="card">
        <div className="mb-5">
          <h2 className="text-xl font-display font-semibold" style={{ color: 'var(--color-text)' }}>
            Plan Your Fun Spending 🎉
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Add what you actually want to spend on. Monthly items recur all year. One-time items land in a specific month.
          </p>
        </div>

        {/* Existing items */}
        {items.length > 0 && (
          <div className="space-y-2.5 mb-5">
            {items.map(item => (
              <div key={item.id} className="rounded-xl p-3"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="font-medium text-sm flex-1 min-w-0 truncate" style={{ color: 'var(--color-text)' }}>
                    {item.label}
                  </div>

                  {/* Amount */}
                  <div className="relative flex-shrink-0" style={{ width: 108 }}>
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: 'var(--color-muted)' }}>$</span>
                    <input
                      type="number"
                      className="input text-right"
                      style={{ paddingLeft: 18, paddingRight: 8, fontSize: 14, height: 34 }}
                      placeholder="0"
                      value={item.amount || ''}
                      onChange={e => updateItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>

                  {/* Frequency toggle */}
                  <div className="flex rounded-lg overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid var(--color-border)' }}>
                    {(['monthly', 'one-time'] as FunFrequency[]).map(freq => (
                      <button key={freq}
                        onClick={() => updateItem(item.id, { frequency: freq })}
                        className="px-2.5 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: item.frequency === freq ? 'var(--color-accent)' : 'var(--color-surface-2)',
                          color: item.frequency === freq ? '#0d1117' : 'var(--color-muted)',
                        }}>
                        {freq === 'monthly' ? '↻ Monthly' : '📅 Once'}
                      </button>
                    ))}
                  </div>

                  {/* Month picker */}
                  {item.frequency === 'one-time' && (
                    <select
                      className="input flex-shrink-0"
                      style={{ width: 80, height: 34, fontSize: 12, padding: '4px 8px' }}
                      value={item.month}
                      onChange={e => updateItem(item.id, { month: parseInt(e.target.value) })}>
                      {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                  )}

                  {/* Annual equiv label */}
                  <div className="text-xs flex-shrink-0" style={{ color: 'var(--color-muted)', minWidth: 64, textAlign: 'right' }}>
                    {item.frequency === 'monthly'
                      ? <>{formatCurrency(item.amount * 12)}/yr</>
                      : <span style={{ color: '#bc8cff' }}>{MONTHS[item.month]}</span>}
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-lg leading-none"
                    style={{ color: 'var(--color-muted)', background: 'var(--color-surface-2)' }}
                    title="Remove">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add preset button */}
        <div className="space-y-3">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="btn-secondary w-full flex items-center justify-between"
            style={{ padding: '10px 16px' }}>
            <span>+ Add spending category</span>
            <span style={{ color: 'var(--color-muted)', fontSize: 11 }}>{showPresets ? '▲ close' : '▼ browse'}</span>
          </button>

          {showPresets && (
            <div className="rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              {PRESET_CATEGORIES.map(cat => {
                const alreadyAdded = items.some(it => it.label === cat.label && !it.isCustom)
                return (
                  <button key={cat.label}
                    onClick={() => !alreadyAdded && addPreset(cat.label, cat.icon)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-all"
                    style={{
                      background: alreadyAdded ? 'rgba(63,185,80,0.1)' : 'var(--color-surface-2)',
                      border: `1px solid ${alreadyAdded ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      color: alreadyAdded ? 'var(--color-accent)' : 'var(--color-text)',
                      opacity: alreadyAdded ? 0.6 : 1,
                      cursor: alreadyAdded ? 'default' : 'pointer',
                    }}>
                    <span>{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.label}</span>
                    {alreadyAdded && <span className="ml-auto text-xs">✓</span>}
                  </button>
                )
              })}
            </div>
          )}

          {/* Custom row */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="input flex-1"
              placeholder="Custom (e.g. Ski Trip, Book Club...)"
              style={{ fontSize: 13 }}
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
            />
            <input
              type="text"
              className="input"
              style={{ width: 48, textAlign: 'center', fontSize: 20, padding: '6px 4px', flexShrink: 0 }}
              value={customIcon}
              onChange={e => setCustomIcon(e.target.value)}
              maxLength={2}
              title="Pick emoji"
            />
            <button
              onClick={addCustom}
              disabled={!customLabel.trim()}
              className="btn-primary flex-shrink-0"
              style={{ padding: '10px 18px', opacity: customLabel.trim() ? 1 : 0.4 }}>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      {items.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Month-by-Month View</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--color-muted)' }}>
            Monthly items recur every month. One-time items spike in their assigned month.
          </p>

          <div className="flex items-end gap-1 h-28 mb-1.5">
            {monthlyBreakdown.map((val, i) => {
              const barH = Math.round((val / maxMonthValue) * 100)
              const over = funAllocMonthly > 0 && val > funAllocMonthly
              const isPeak = i === peakMonth && val > 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                  <div className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${barH}%`,
                      minHeight: val > 0 ? 3 : 0,
                      background: over ? 'var(--color-danger)' : isPeak ? '#bc8cff' : 'rgba(188,140,255,0.4)',
                    }}>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                        color: 'var(--color-text)',
                      }}>
                      {MONTHS[i]}: {formatCurrency(val)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {funAllocMonthly > 0 && (
            <div className="flex items-center gap-2 text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>
              <div className="w-4 border-t border-dashed" style={{ borderColor: '#bc8cff' }} />
              Budget: {formatCurrency(funAllocMonthly)}/mo
            </div>
          )}

          <div className="flex gap-1">
            {MONTHS.map((m, i) => (
              <div key={i} className="flex-1 text-center text-xs"
                style={{ color: i === peakMonth && monthlyBreakdown[i] > 0 ? '#bc8cff' : 'var(--color-muted)' }}>
                {m}
              </div>
            ))}
          </div>

          {monthlyBreakdown[peakMonth] > 0 && (
            <div className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
              Peak month: <strong style={{ color: '#bc8cff' }}>{MONTHS[peakMonth]}</strong> &mdash;{' '}
              <strong style={{ color: 'var(--color-text)' }}>{formatCurrency(monthlyBreakdown[peakMonth])}</strong>
              {funAllocMonthly > 0 && monthlyBreakdown[peakMonth] > funAllocMonthly && (
                <span style={{ color: 'var(--color-danger)' }}>
                  {' '}(over budget by {formatCurrency(monthlyBreakdown[peakMonth] - funAllocMonthly)})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1].annual - a[1].annual)
              .map(([label, data]) => {
                const pct = totalAnnual > 0 ? data.annual / totalAnnual : 0
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text)' }}>
                        <span>{data.icon}</span>
                        <span>{label}</span>
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {Math.round(pct * 100)}%
                        </span>
                      </div>
                      <div className="text-sm text-right">
                        <span className="font-medium">{formatCurrency(data.annual / 12)}/mo</span>
                        <span className="ml-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                          {formatCurrency(data.annual)}/yr
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: '#bc8cff' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Annual Fun Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="metric">
              <div className="metric-value" style={{ color: '#bc8cff' }}>{formatCurrency(avgMonthly)}</div>
              <div className="metric-label">Avg Monthly</div>
            </div>
            <div className="metric">
              <div className="metric-value">{formatCurrency(totalAnnual)}</div>
              <div className="metric-label">Total Annual</div>
            </div>
            <div className="metric">
              <div className="metric-value"
                style={{ color: remainingAnnual >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                {formatCurrency(Math.abs(remainingAnnual))}
              </div>
              <div className="metric-label">{remainingAnnual >= 0 ? 'Unspent Budget' : 'Over Budget'}</div>
            </div>
            <div className="metric">
              <div className="metric-value">{MONTHS[peakMonth]}</div>
              <div className="metric-label">Peak Month</div>
            </div>
          </div>
          <div className="mt-4">
            {remainingAnnual >= 0 ? (
              <div className="success-box">
                ✓ Your fun plan fits the budget. {formatCurrency(remainingAnnual)} in annual headroom.
              </div>
            ) : (
              <div className="warning-box">
                ⚠️ Planned spending exceeds your Fun allocation by {formatCurrency(Math.abs(remainingAnnual))}/yr.
                Increase the Fun % in Step 5 or trim some items.
              </div>
            )}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-10" style={{ color: 'var(--color-muted)' }}>
          <div className="text-5xl mb-3">🎉</div>
          <div className="text-sm font-medium">Add your first category to start planning.</div>
          <div className="text-xs mt-1.5">Monthly items recur all year. One-time items land in a specific month.</div>
        </div>
      )}
    </div>
  )
}
