# Take Home Planner

**See what you actually keep, then decide where it goes.**

A polished financial planning simulator that helps you understand your real take-home pay, plan fixed expenses, and allocate the remainder across meaningful buckets.

## Features

- **2026 + 2025 Federal Tax Brackets** — IRS Rev. Proc. 2025-32, OBBBA-adjusted
- **All 50 States + DC** — state income tax estimates built in
- **Single & Married Filing Jointly** — with withholding gap analysis for married filers
- **Two views for married filers**: paycheck withholding reality vs. true household tax estimate
- **7-step guided flow**: Household → Income → Deductions → Expenses → Allocations → Fun → Results
- **Interactive allocation sliders** with presets (Conservative, Balanced, Aggressive, Tax Buffer, High Earner)
- **Fun budget planner** with sustainability warnings
- **Results dashboard** with bar charts, pie chart, and annual runway visualization
- Smart warnings for over-allocation, under-withheld variable comp, high expense ratios

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- 100% client-side — no backend, no DB, no auth

## Deploy to Vercel

```bash
# Clone and install
npm install

# Run locally
npm run dev

# Deploy
npx vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

## Tax Data

Tax data lives in `src/lib/taxData.ts`. To update for future years:
1. Add a new `FederalTaxConfig` object (e.g., `FEDERAL_TAX_2027`)
2. Update `getFederalConfig()` to return it for the new year
3. Add `2027` to the `TAX_YEARS` array in `taxData.ts`
4. Add `2027` as an option in `StepHousehold.tsx`

## Disclaimer

This tool provides estimates based on publicly available IRS and state tax data. It is not tax advice. Consult a qualified tax professional for your specific situation.
