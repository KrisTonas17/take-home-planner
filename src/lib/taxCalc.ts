import { TaxBracket, FederalTaxConfig, StateTaxConfig, getFederalConfig, STATE_TAX_DATA } from './taxData';

export function calcBracketTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const taxable = Math.min(income, bracket.max ?? Infinity) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

export function calcFederalTax(
  taxableIncome: number,
  filingStatus: 'single' | 'married',
  federal: FederalTaxConfig
): number {
  const brackets = filingStatus === 'married' ? federal.brackets.married : federal.brackets.single;
  return calcBracketTax(taxableIncome, brackets);
}

export function calcStateTax(
  grossIncome: number,
  filingStatus: 'single' | 'married',
  stateCode: string
): number {
  const state: StateTaxConfig = STATE_TAX_DATA[stateCode];
  if (!state || !state.hasIncomeTax) return 0;

  const deduction = state.standardDeduction
    ? (filingStatus === 'married' ? state.standardDeduction.married : state.standardDeduction.single)
    : 0;

  const taxableIncome = Math.max(0, grossIncome - deduction);

  if (state.flatRate !== undefined) {
    return taxableIncome * state.flatRate;
  }

  if (state.brackets) {
    const brackets = filingStatus === 'married' ? state.brackets.married : state.brackets.single;
    return calcBracketTax(taxableIncome, brackets);
  }

  return 0;
}

export function calcPayrollTax(wages: number, federal: FederalTaxConfig): { ss: number; medicare: number } {
  const ssWages = Math.min(wages, federal.socialSecurity.wageBase);
  const ss = ssWages * federal.socialSecurity.rate;

  let medicare = wages * federal.medicare.rate;
  // Note: Additional Medicare is an annual reconciliation item; for paycheck view we use standard rate
  return { ss, medicare };
}

export interface PersonTaxResult {
  grossIncome: number;
  preTaxDeductions: number;
  federalTaxableIncome: number;
  federalTax: number;
  stateTax: number;
  sssTax: number;
  medicareTax: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
}

export interface HouseholdTaxResult {
  spouse1: PersonTaxResult;
  spouse2?: PersonTaxResult;
  combinedGross: number;
  combinedTax: number;
  combinedNet: number;
  combinedNetMonthly: number;
  // For married: true household view
  trueHouseholdFederalTax?: number;
  trueHouseholdStateTax?: number;
  trueHouseholdTotalTax?: number;
  trueHouseholdNet?: number;
  trueHouseholdNetMonthly?: number;
  withholdingDifference?: number; // Positive = under-withheld
}

export function calcPersonTax(params: {
  salary: number;
  bonus: number;
  otherIncome: number;
  k401: number;
  healthInsurance: number;
  hsa: number;
  filingStatus: 'single' | 'married';
  state: string;
  taxYear: number;
  applyStandardDeduction: boolean;
}): PersonTaxResult {
  const federal = getFederalConfig(params.taxYear);

  const grossIncome = params.salary + params.bonus + params.otherIncome;

  // Pre-tax deductions reduce federal/state taxable income (but NOT payroll taxes for 401k in most cases)
  const preTaxDeductions = params.k401 + params.healthInsurance + params.hsa;

  // For withholding purposes, SS/Medicare are on gross (minus some pre-tax health benefits, simplified)
  const payrollWages = Math.max(0, grossIncome - params.healthInsurance - params.hsa);
  const { ss, medicare } = calcPayrollTax(payrollWages, federal);

  // Federal taxable income
  const stdDed = params.applyStandardDeduction
    ? (params.filingStatus === 'married' ? federal.standardDeduction.married : federal.standardDeduction.single)
    : 0;

  const federalTaxableIncome = Math.max(0, grossIncome - preTaxDeductions - stdDed);
  const federalTax = calcFederalTax(federalTaxableIncome, params.filingStatus, federal);

  // State: applied to gross minus pre-tax deductions (simplified)
  const stateAGI = Math.max(0, grossIncome - params.k401 - params.healthInsurance - params.hsa);
  const stateTax = calcStateTax(stateAGI, params.filingStatus, params.state);

  const totalTax = federalTax + stateTax + ss + medicare;
  const netAnnual = grossIncome - totalTax;
  const netMonthly = netAnnual / 12;
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;

  return {
    grossIncome,
    preTaxDeductions,
    federalTaxableIncome,
    federalTax,
    stateTax,
    sssTax: ss,
    medicareTax: medicare,
    totalTax,
    netAnnual,
    netMonthly,
    effectiveRate,
  };
}

export function calcHousehold(params: {
  spouse1: {
    salary: number;
    bonus: number;
    otherIncome: number;
    k401: number;
    healthInsurance: number;
    hsa: number;
  };
  spouse2?: {
    salary: number;
    bonus: number;
    otherIncome: number;
    k401: number;
    healthInsurance: number;
    hsa: number;
  };
  filingStatus: 'single' | 'married';
  state: string;
  taxYear: number;
  applyStandardDeduction: boolean;
}): HouseholdTaxResult {
  const federal = getFederalConfig(params.taxYear);

  const s1 = calcPersonTax({ ...params.spouse1, filingStatus: params.filingStatus, state: params.state, taxYear: params.taxYear, applyStandardDeduction: params.applyStandardDeduction });

  let s2: PersonTaxResult | undefined;

  if (params.filingStatus === 'married' && params.spouse2) {
    s2 = calcPersonTax({ ...params.spouse2, filingStatus: 'married', state: params.state, taxYear: params.taxYear, applyStandardDeduction: params.applyStandardDeduction });
  }

  const combinedGross = s1.grossIncome + (s2?.grossIncome ?? 0);
  const combinedTax = s1.totalTax + (s2?.totalTax ?? 0);
  const combinedNet = s1.netAnnual + (s2?.netAnnual ?? 0);
  const combinedNetMonthly = combinedNet / 12;

  let result: HouseholdTaxResult = { spouse1: s1, spouse2: s2, combinedGross, combinedTax, combinedNet, combinedNetMonthly };

  // For married: also calculate true household tax (combined income, MFJ brackets)
  if (params.filingStatus === 'married' && params.spouse2) {
    const combinedSalary = params.spouse1.salary + params.spouse2.salary;
    const combinedBonus = params.spouse1.bonus + params.spouse2.bonus;
    const combinedOther = params.spouse1.otherIncome + params.spouse2.otherIncome;
    const combined401k = params.spouse1.k401 + params.spouse2.k401;
    const combinedHealth = params.spouse1.healthInsurance + params.spouse2.healthInsurance;
    const combinedHsa = params.spouse1.hsa + params.spouse2.hsa;

    const totalGross = combinedSalary + combinedBonus + combinedOther;
    const totalPreTax = combined401k + combinedHealth + combinedHsa;

    const stdDed = params.applyStandardDeduction ? federal.standardDeduction.married : 0;
    const trueFederalTaxable = Math.max(0, totalGross - totalPreTax - stdDed);
    const trueFederalTax = calcFederalTax(trueFederalTaxable, 'married', federal);
    const trueStateAGI = Math.max(0, totalGross - totalPreTax);
    const trueStateTax = calcStateTax(trueStateAGI, 'married', params.state);

    const ss1Wages = Math.min(params.spouse1.salary + params.spouse1.bonus + params.spouse1.otherIncome - params.spouse1.healthInsurance - params.spouse1.hsa, federal.socialSecurity.wageBase);
    const ss2Wages = Math.min(params.spouse2.salary + params.spouse2.bonus + params.spouse2.otherIncome - params.spouse2.healthInsurance - params.spouse2.hsa, federal.socialSecurity.wageBase);
    const trueSS = (Math.max(0, ss1Wages) + Math.max(0, ss2Wages)) * federal.socialSecurity.rate;
    const trueMedicare = Math.max(0, totalGross - combinedHealth - combinedHsa) * federal.medicare.rate;

    const trueHouseholdTotalTax = trueFederalTax + trueStateTax + trueSS + trueMedicare;
    const trueHouseholdNet = totalGross - trueHouseholdTotalTax;
    const trueHouseholdNetMonthly = trueHouseholdNet / 12;

    // Withholding difference: positive means the household may owe more at filing
    const withholdingDifference = trueHouseholdTotalTax - combinedTax;

    result = {
      ...result,
      trueHouseholdFederalTax: trueFederalTax,
      trueHouseholdStateTax: trueStateTax,
      trueHouseholdTotalTax,
      trueHouseholdNet,
      trueHouseholdNetMonthly,
      withholdingDifference,
    };
  }

  return result;
}
