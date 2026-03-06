export type FilingStatus = 'single' | 'married';
export type CalcMode = 'withholding' | 'household';

export interface SpouseIncome {
  salary: number;
  bonus: number;
  otherIncome: number;
  k401: number;
  healthInsurance: number;
  hsa: number;
}

export interface FixedExpenses {
  housing: number;
  utilities: number;
  groceries: number;
  transportation: number;
  insurance: number;
  childcare: number;
  debtPayments: number;
  subscriptions: number;
  other: number;
}

export interface AllocationBuckets {
  save: number;      // percentage
  invest: number;
  fun: number;
  taxReserve: number;
  debtPayoff: number;
  custom: number;
  customLabel: string;
}

export interface PlannerState {
  // Step 1
  filingStatus: FilingStatus;
  state: string;
  taxYear: number;
  calcMode: CalcMode;
  applyStandardDeduction: boolean;

  // Step 2
  spouse1: SpouseIncome;
  spouse2: SpouseIncome;

  // Step 4
  fixedExpenses: FixedExpenses;

  // Step 5
  allocations: AllocationBuckets;

  // Step 6
  funBudgetMode: 'monthly' | 'annual';
  funBudgetAmount: number;

  currentStep: number;
}

export const DEFAULT_STATE: PlannerState = {
  filingStatus: 'single',
  state: 'CA',
  taxYear: 2026,
  calcMode: 'withholding',
  applyStandardDeduction: true,

  spouse1: {
    salary: 0,
    bonus: 0,
    otherIncome: 0,
    k401: 0,
    healthInsurance: 0,
    hsa: 0,
  },
  spouse2: {
    salary: 0,
    bonus: 0,
    otherIncome: 0,
    k401: 0,
    healthInsurance: 0,
    hsa: 0,
  },

  fixedExpenses: {
    housing: 0,
    utilities: 0,
    groceries: 0,
    transportation: 0,
    insurance: 0,
    childcare: 0,
    debtPayments: 0,
    subscriptions: 0,
    other: 0,
  },

  allocations: {
    save: 20,
    invest: 20,
    fun: 20,
    taxReserve: 10,
    debtPayoff: 10,
    custom: 0,
    customLabel: 'Other',
  },

  funBudgetMode: 'monthly',
  funBudgetAmount: 0,

  currentStep: 1,
};

export const ALLOCATION_PRESETS = {
  Conservative: { save: 30, invest: 20, fun: 15, taxReserve: 20, debtPayoff: 15, custom: 0 },
  Balanced: { save: 20, invest: 20, fun: 20, taxReserve: 10, debtPayoff: 10, custom: 0 },
  Aggressive: { save: 10, invest: 50, fun: 20, taxReserve: 10, debtPayoff: 10, custom: 0 },
  'Tax Buffer': { save: 15, invest: 15, fun: 15, taxReserve: 35, debtPayoff: 10, custom: 0 },
  'High Earner': { save: 20, invest: 30, fun: 15, taxReserve: 25, debtPayoff: 0, custom: 10 },
};
