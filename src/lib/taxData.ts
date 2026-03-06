// Tax data for 2026 (and 2025 for reference)
// Source: IRS Revenue Procedure 2025-32, One Big Beautiful Bill Act

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface FederalTaxConfig {
  brackets: { single: TaxBracket[]; married: TaxBracket[] };
  standardDeduction: { single: number; married: number };
  socialSecurity: { rate: number; wageBase: number };
  medicare: { rate: number; additionalRate: number; additionalThreshold: { single: number; married: number } };
}

export interface StateTaxConfig {
  name: string;
  abbreviation: string;
  hasIncomeTax: boolean;
  flatRate?: number;
  brackets?: { single: TaxBracket[]; married: TaxBracket[] };
  standardDeduction?: { single: number; married: number };
  notes?: string;
}

// ============================================================
// 2026 FEDERAL TAX DATA (IRS Rev. Proc. 2025-32 + OBBBA)
// ============================================================
export const FEDERAL_TAX_2026: FederalTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 12400, rate: 0.10 },
      { min: 12400, max: 50400, rate: 0.12 },
      { min: 50400, max: 105700, rate: 0.22 },
      { min: 105700, max: 201775, rate: 0.24 },
      { min: 201775, max: 256225, rate: 0.32 },
      { min: 256225, max: 640600, rate: 0.35 },
      { min: 640600, max: null, rate: 0.37 },
    ],
    married: [
      { min: 0, max: 24800, rate: 0.10 },
      { min: 24800, max: 100800, rate: 0.12 },
      { min: 100800, max: 211400, rate: 0.22 },
      { min: 211400, max: 403550, rate: 0.24 },
      { min: 403550, max: 512450, rate: 0.32 },
      { min: 512450, max: 768700, rate: 0.35 },
      { min: 768700, max: null, rate: 0.37 },
    ],
  },
  standardDeduction: {
    single: 16100,
    married: 32200,
  },
  socialSecurity: {
    rate: 0.062,
    wageBase: 184500,
  },
  medicare: {
    rate: 0.0145,
    additionalRate: 0.009,
    additionalThreshold: {
      single: 200000,
      married: 250000,
    },
  },
};

// ============================================================
// 2025 FEDERAL TAX DATA (for reference / withholding calc)
// ============================================================
export const FEDERAL_TAX_2025: FederalTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
    married: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: null, rate: 0.37 },
    ],
  },
  standardDeduction: {
    single: 15750,
    married: 31500,
  },
  socialSecurity: {
    rate: 0.062,
    wageBase: 176100,
  },
  medicare: {
    rate: 0.0145,
    additionalRate: 0.009,
    additionalThreshold: {
      single: 200000,
      married: 250000,
    },
  },
};

// ============================================================
// STATE INCOME TAX DATA (2026)
// States with no income tax: AK, FL, NV, NH, SD, TN, TX, WA, WY
// (NH taxes interest/dividends only, not wages - treated as no wage tax)
// ============================================================
export const STATE_TAX_DATA: Record<string, StateTaxConfig> = {
  AL: {
    name: 'Alabama', abbreviation: 'AL', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 500, rate: 0.02 },
        { min: 500, max: 3000, rate: 0.04 },
        { min: 3000, max: null, rate: 0.05 },
      ],
      married: [
        { min: 0, max: 1000, rate: 0.02 },
        { min: 1000, max: 6000, rate: 0.04 },
        { min: 6000, max: null, rate: 0.05 },
      ],
    },
    standardDeduction: { single: 3000, married: 8500 },
  },
  AK: { name: 'Alaska', abbreviation: 'AK', hasIncomeTax: false },
  AZ: {
    name: 'Arizona', abbreviation: 'AZ', hasIncomeTax: true,
    flatRate: 0.025,
  },
  AR: {
    name: 'Arkansas', abbreviation: 'AR', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 4999, rate: 0.02 },
        { min: 4999, max: 9999, rate: 0.04 },
        { min: 9999, max: null, rate: 0.047 },
      ],
      married: [
        { min: 0, max: 4999, rate: 0.02 },
        { min: 4999, max: 9999, rate: 0.04 },
        { min: 9999, max: null, rate: 0.047 },
      ],
    },
    standardDeduction: { single: 2200, married: 4400 },
  },
  CA: {
    name: 'California', abbreviation: 'CA', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 10412, rate: 0.01 },
        { min: 10412, max: 24684, rate: 0.02 },
        { min: 24684, max: 38959, rate: 0.04 },
        { min: 38959, max: 54081, rate: 0.06 },
        { min: 54081, max: 68350, rate: 0.08 },
        { min: 68350, max: 349137, rate: 0.093 },
        { min: 349137, max: 418961, rate: 0.103 },
        { min: 418961, max: 698274, rate: 0.113 },
        { min: 698274, max: 1000000, rate: 0.123 },
        { min: 1000000, max: null, rate: 0.133 },
      ],
      married: [
        { min: 0, max: 20824, rate: 0.01 },
        { min: 20824, max: 49368, rate: 0.02 },
        { min: 49368, max: 77918, rate: 0.04 },
        { min: 77918, max: 108162, rate: 0.06 },
        { min: 108162, max: 136700, rate: 0.08 },
        { min: 136700, max: 698274, rate: 0.093 },
        { min: 698274, max: 837922, rate: 0.103 },
        { min: 837922, max: 1000000, rate: 0.113 },
        { min: 1000000, max: null, rate: 0.123 },
      ],
    },
    standardDeduction: { single: 5540, married: 11080 },
    notes: 'SDI (State Disability Insurance) of 1.1% also applies to all wages',
  },
  CO: {
    name: 'Colorado', abbreviation: 'CO', hasIncomeTax: true,
    flatRate: 0.044,
    standardDeduction: { single: 16100, married: 32200 },
  },
  CT: {
    name: 'Connecticut', abbreviation: 'CT', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.02 },
        { min: 10000, max: 50000, rate: 0.045 },
        { min: 50000, max: 100000, rate: 0.055 },
        { min: 100000, max: 200000, rate: 0.06 },
        { min: 200000, max: 250000, rate: 0.065 },
        { min: 250000, max: 500000, rate: 0.069 },
        { min: 500000, max: null, rate: 0.0699 },
      ],
      married: [
        { min: 0, max: 20000, rate: 0.02 },
        { min: 20000, max: 100000, rate: 0.045 },
        { min: 100000, max: 200000, rate: 0.055 },
        { min: 200000, max: 400000, rate: 0.06 },
        { min: 400000, max: 500000, rate: 0.065 },
        { min: 500000, max: 1000000, rate: 0.069 },
        { min: 1000000, max: null, rate: 0.0699 },
      ],
    },
    standardDeduction: { single: 0, married: 0 },
  },
  DE: {
    name: 'Delaware', abbreviation: 'DE', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 2000, rate: 0.0 },
        { min: 2000, max: 5000, rate: 0.022 },
        { min: 5000, max: 10000, rate: 0.039 },
        { min: 10000, max: 20000, rate: 0.048 },
        { min: 20000, max: 25000, rate: 0.052 },
        { min: 25000, max: 60000, rate: 0.0555 },
        { min: 60000, max: null, rate: 0.066 },
      ],
      married: [
        { min: 0, max: 2000, rate: 0.0 },
        { min: 2000, max: 5000, rate: 0.022 },
        { min: 5000, max: 10000, rate: 0.039 },
        { min: 10000, max: 20000, rate: 0.048 },
        { min: 20000, max: 25000, rate: 0.052 },
        { min: 25000, max: 60000, rate: 0.0555 },
        { min: 60000, max: null, rate: 0.066 },
      ],
    },
    standardDeduction: { single: 3250, married: 6500 },
  },
  FL: { name: 'Florida', abbreviation: 'FL', hasIncomeTax: false },
  GA: {
    name: 'Georgia', abbreviation: 'GA', hasIncomeTax: true,
    flatRate: 0.055,
    standardDeduction: { single: 12000, married: 24000 },
  },
  HI: {
    name: 'Hawaii', abbreviation: 'HI', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 2400, rate: 0.014 },
        { min: 2400, max: 4800, rate: 0.032 },
        { min: 4800, max: 9600, rate: 0.055 },
        { min: 9600, max: 14400, rate: 0.064 },
        { min: 14400, max: 19200, rate: 0.068 },
        { min: 19200, max: 24000, rate: 0.072 },
        { min: 24000, max: 36000, rate: 0.076 },
        { min: 36000, max: 48000, rate: 0.079 },
        { min: 48000, max: 150000, rate: 0.0825 },
        { min: 150000, max: 175000, rate: 0.09 },
        { min: 175000, max: 200000, rate: 0.10 },
        { min: 200000, max: null, rate: 0.11 },
      ],
      married: [
        { min: 0, max: 4800, rate: 0.014 },
        { min: 4800, max: 9600, rate: 0.032 },
        { min: 9600, max: 19200, rate: 0.055 },
        { min: 19200, max: 28800, rate: 0.064 },
        { min: 28800, max: 38400, rate: 0.068 },
        { min: 38400, max: 48000, rate: 0.072 },
        { min: 48000, max: 72000, rate: 0.076 },
        { min: 72000, max: 96000, rate: 0.079 },
        { min: 96000, max: 300000, rate: 0.0825 },
        { min: 300000, max: 350000, rate: 0.09 },
        { min: 350000, max: 400000, rate: 0.10 },
        { min: 400000, max: null, rate: 0.11 },
      ],
    },
    standardDeduction: { single: 2200, married: 4400 },
  },
  ID: {
    name: 'Idaho', abbreviation: 'ID', hasIncomeTax: true,
    flatRate: 0.059,
    standardDeduction: { single: 14600, married: 29200 },
  },
  IL: {
    name: 'Illinois', abbreviation: 'IL', hasIncomeTax: true,
    flatRate: 0.0495,
    standardDeduction: { single: 0, married: 0 },
  },
  IN: {
    name: 'Indiana', abbreviation: 'IN', hasIncomeTax: true,
    flatRate: 0.03,
    standardDeduction: { single: 1000, married: 2000 },
  },
  IA: {
    name: 'Iowa', abbreviation: 'IA', hasIncomeTax: true,
    flatRate: 0.038,
    standardDeduction: { single: 14600, married: 29200 },
  },
  KS: {
    name: 'Kansas', abbreviation: 'KS', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 15000, rate: 0.031 },
        { min: 15000, max: 30000, rate: 0.0525 },
        { min: 30000, max: null, rate: 0.057 },
      ],
      married: [
        { min: 0, max: 30000, rate: 0.031 },
        { min: 30000, max: 60000, rate: 0.0525 },
        { min: 60000, max: null, rate: 0.057 },
      ],
    },
    standardDeduction: { single: 3500, married: 8000 },
  },
  KY: {
    name: 'Kentucky', abbreviation: 'KY', hasIncomeTax: true,
    flatRate: 0.04,
    standardDeduction: { single: 3160, married: 3160 },
  },
  LA: {
    name: 'Louisiana', abbreviation: 'LA', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 12500, rate: 0.02 },
        { min: 12500, max: 50000, rate: 0.04 },
        { min: 50000, max: null, rate: 0.06 },
      ],
      married: [
        { min: 0, max: 25000, rate: 0.02 },
        { min: 25000, max: 100000, rate: 0.04 },
        { min: 100000, max: null, rate: 0.06 },
      ],
    },
    standardDeduction: { single: 4500, married: 9000 },
  },
  ME: {
    name: 'Maine', abbreviation: 'ME', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 26050, rate: 0.058 },
        { min: 26050, max: 61600, rate: 0.0675 },
        { min: 61600, max: null, rate: 0.0715 },
      ],
      married: [
        { min: 0, max: 52100, rate: 0.058 },
        { min: 52100, max: 123200, rate: 0.0675 },
        { min: 123200, max: null, rate: 0.0715 },
      ],
    },
    standardDeduction: { single: 14600, married: 29200 },
  },
  MD: {
    name: 'Maryland', abbreviation: 'MD', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 1000, rate: 0.02 },
        { min: 1000, max: 2000, rate: 0.03 },
        { min: 2000, max: 3000, rate: 0.04 },
        { min: 3000, max: 100000, rate: 0.0475 },
        { min: 100000, max: 125000, rate: 0.05 },
        { min: 125000, max: 150000, rate: 0.0525 },
        { min: 150000, max: 250000, rate: 0.055 },
        { min: 250000, max: null, rate: 0.0575 },
      ],
      married: [
        { min: 0, max: 1000, rate: 0.02 },
        { min: 1000, max: 2000, rate: 0.03 },
        { min: 2000, max: 3000, rate: 0.04 },
        { min: 3000, max: 150000, rate: 0.0475 },
        { min: 150000, max: 175000, rate: 0.05 },
        { min: 175000, max: 225000, rate: 0.0525 },
        { min: 225000, max: 300000, rate: 0.055 },
        { min: 300000, max: null, rate: 0.0575 },
      ],
    },
    standardDeduction: { single: 2550, married: 5150 },
    notes: 'Local/county income tax (1.75%–3.2%) not included in estimate',
  },
  MA: {
    name: 'Massachusetts', abbreviation: 'MA', hasIncomeTax: true,
    flatRate: 0.05,
    standardDeduction: { single: 0, married: 0 },
    notes: 'Surtax of 4% applies to income over $1,000,000',
  },
  MI: {
    name: 'Michigan', abbreviation: 'MI', hasIncomeTax: true,
    flatRate: 0.0425,
    standardDeduction: { single: 5600, married: 11200 },
  },
  MN: {
    name: 'Minnesota', abbreviation: 'MN', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 31690, rate: 0.0535 },
        { min: 31690, max: 104090, rate: 0.068 },
        { min: 104090, max: 193240, rate: 0.0785 },
        { min: 193240, max: null, rate: 0.0985 },
      ],
      married: [
        { min: 0, max: 46330, rate: 0.0535 },
        { min: 46330, max: 184040, rate: 0.068 },
        { min: 184040, max: 321450, rate: 0.0785 },
        { min: 321450, max: null, rate: 0.0985 },
      ],
    },
    standardDeduction: { single: 14575, married: 29150 },
  },
  MS: {
    name: 'Mississippi', abbreviation: 'MS', hasIncomeTax: true,
    flatRate: 0.04,
    standardDeduction: { single: 2300, married: 4600 },
  },
  MO: {
    name: 'Missouri', abbreviation: 'MO', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 1207, rate: 0.0 },
        { min: 1207, max: 2414, rate: 0.02 },
        { min: 2414, max: 3621, rate: 0.025 },
        { min: 3621, max: 4828, rate: 0.03 },
        { min: 4828, max: 6035, rate: 0.035 },
        { min: 6035, max: 7242, rate: 0.04 },
        { min: 7242, max: 8428, rate: 0.045 },
        { min: 8428, max: null, rate: 0.049 },
      ],
      married: [
        { min: 0, max: 1207, rate: 0.0 },
        { min: 1207, max: 2414, rate: 0.02 },
        { min: 2414, max: 3621, rate: 0.025 },
        { min: 3621, max: 4828, rate: 0.03 },
        { min: 4828, max: 6035, rate: 0.035 },
        { min: 6035, max: 7242, rate: 0.04 },
        { min: 7242, max: 8428, rate: 0.045 },
        { min: 8428, max: null, rate: 0.049 },
      ],
    },
    standardDeduction: { single: 14600, married: 29200 },
  },
  MT: {
    name: 'Montana', abbreviation: 'MT', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 20500, rate: 0.047 },
        { min: 20500, max: null, rate: 0.059 },
      ],
      married: [
        { min: 0, max: 41000, rate: 0.047 },
        { min: 41000, max: null, rate: 0.059 },
      ],
    },
    standardDeduction: { single: 5540, married: 11080 },
  },
  NE: {
    name: 'Nebraska', abbreviation: 'NE', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 3700, rate: 0.0246 },
        { min: 3700, max: 22170, rate: 0.0351 },
        { min: 22170, max: 35730, rate: 0.0501 },
        { min: 35730, max: null, rate: 0.0664 },
      ],
      married: [
        { min: 0, max: 7390, rate: 0.0246 },
        { min: 7390, max: 44340, rate: 0.0351 },
        { min: 44340, max: 71450, rate: 0.0501 },
        { min: 71450, max: null, rate: 0.0664 },
      ],
    },
    standardDeduction: { single: 7900, married: 15800 },
  },
  NV: { name: 'Nevada', abbreviation: 'NV', hasIncomeTax: false },
  NH: {
    name: 'New Hampshire', abbreviation: 'NH', hasIncomeTax: false,
    notes: 'No tax on wages/salary income',
  },
  NJ: {
    name: 'New Jersey', abbreviation: 'NJ', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 20000, rate: 0.014 },
        { min: 20000, max: 35000, rate: 0.0175 },
        { min: 35000, max: 40000, rate: 0.035 },
        { min: 40000, max: 75000, rate: 0.05525 },
        { min: 75000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
      married: [
        { min: 0, max: 20000, rate: 0.014 },
        { min: 20000, max: 50000, rate: 0.0175 },
        { min: 50000, max: 70000, rate: 0.0245 },
        { min: 70000, max: 80000, rate: 0.035 },
        { min: 80000, max: 150000, rate: 0.05525 },
        { min: 150000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
    },
    standardDeduction: { single: 0, married: 0 },
  },
  NM: {
    name: 'New Mexico', abbreviation: 'NM', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 5500, rate: 0.017 },
        { min: 5500, max: 11000, rate: 0.032 },
        { min: 11000, max: 16000, rate: 0.047 },
        { min: 16000, max: 210000, rate: 0.049 },
        { min: 210000, max: null, rate: 0.059 },
      ],
      married: [
        { min: 0, max: 8000, rate: 0.017 },
        { min: 8000, max: 16000, rate: 0.032 },
        { min: 16000, max: 24000, rate: 0.047 },
        { min: 24000, max: 315000, rate: 0.049 },
        { min: 315000, max: null, rate: 0.059 },
      ],
    },
    standardDeduction: { single: 14600, married: 29200 },
  },
  NY: {
    name: 'New York', abbreviation: 'NY', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 17150, rate: 0.04 },
        { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 },
        { min: 27900, max: 161550, rate: 0.055 },
        { min: 161550, max: 323200, rate: 0.06 },
        { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: null, rate: 0.109 },
      ],
      married: [
        { min: 0, max: 27900, rate: 0.04 },
        { min: 27900, max: 43000, rate: 0.045 },
        { min: 43000, max: 161550, rate: 0.0525 },
        { min: 161550, max: 323200, rate: 0.0585 },
        { min: 323200, max: 2155350, rate: 0.0625 },
        { min: 2155350, max: 5000000, rate: 0.0685 },
        { min: 5000000, max: 25000000, rate: 0.0965 },
        { min: 25000000, max: null, rate: 0.103 },
      ],
    },
    standardDeduction: { single: 8000, married: 16050 },
    notes: 'NYC residents pay additional local income tax (3.078%–3.876%)',
  },
  NC: {
    name: 'North Carolina', abbreviation: 'NC', hasIncomeTax: true,
    flatRate: 0.045,
    standardDeduction: { single: 12750, married: 25500 },
  },
  ND: {
    name: 'North Dakota', abbreviation: 'ND', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 44725, rate: 0.0 },
        { min: 44725, max: 225975, rate: 0.0195 },
        { min: 225975, max: null, rate: 0.025 },
      ],
      married: [
        { min: 0, max: 74750, rate: 0.0 },
        { min: 74750, max: 275925, rate: 0.0195 },
        { min: 275925, max: null, rate: 0.025 },
      ],
    },
    standardDeduction: { single: 14600, married: 29200 },
  },
  OH: {
    name: 'Ohio', abbreviation: 'OH', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 26050, rate: 0.0 },
        { min: 26050, max: 100000, rate: 0.0275 },
        { min: 100000, max: null, rate: 0.035 },
      ],
      married: [
        { min: 0, max: 26050, rate: 0.0 },
        { min: 26050, max: 100000, rate: 0.0275 },
        { min: 100000, max: null, rate: 0.035 },
      ],
    },
    standardDeduction: { single: 0, married: 0 },
  },
  OK: {
    name: 'Oklahoma', abbreviation: 'OK', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 1000, rate: 0.0025 },
        { min: 1000, max: 2500, rate: 0.0075 },
        { min: 2500, max: 3750, rate: 0.0175 },
        { min: 3750, max: 4900, rate: 0.0275 },
        { min: 4900, max: 7200, rate: 0.0375 },
        { min: 7200, max: null, rate: 0.0475 },
      ],
      married: [
        { min: 0, max: 2000, rate: 0.0025 },
        { min: 2000, max: 5000, rate: 0.0075 },
        { min: 5000, max: 7500, rate: 0.0175 },
        { min: 7500, max: 9800, rate: 0.0275 },
        { min: 9800, max: 12200, rate: 0.0375 },
        { min: 12200, max: null, rate: 0.0475 },
      ],
    },
    standardDeduction: { single: 6350, married: 12700 },
  },
  OR: {
    name: 'Oregon', abbreviation: 'OR', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 18400, rate: 0.0475 },
        { min: 18400, max: 250000, rate: 0.0675 },
        { min: 250000, max: null, rate: 0.099 },
      ],
      married: [
        { min: 0, max: 36800, rate: 0.0475 },
        { min: 36800, max: 500000, rate: 0.0675 },
        { min: 500000, max: null, rate: 0.099 },
      ],
    },
    standardDeduction: { single: 2420, married: 4840 },
  },
  PA: {
    name: 'Pennsylvania', abbreviation: 'PA', hasIncomeTax: true,
    flatRate: 0.0307,
    standardDeduction: { single: 0, married: 0 },
  },
  RI: {
    name: 'Rhode Island', abbreviation: 'RI', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 77450, rate: 0.0375 },
        { min: 77450, max: 176050, rate: 0.0475 },
        { min: 176050, max: null, rate: 0.0599 },
      ],
      married: [
        { min: 0, max: 154900, rate: 0.0375 },
        { min: 154900, max: 352100, rate: 0.0475 },
        { min: 352100, max: null, rate: 0.0599 },
      ],
    },
    standardDeduction: { single: 10300, married: 20650 },
  },
  SC: {
    name: 'South Carolina', abbreviation: 'SC', hasIncomeTax: true,
    flatRate: 0.064,
    standardDeduction: { single: 14600, married: 29200 },
  },
  SD: { name: 'South Dakota', abbreviation: 'SD', hasIncomeTax: false },
  TN: { name: 'Tennessee', abbreviation: 'TN', hasIncomeTax: false },
  TX: { name: 'Texas', abbreviation: 'TX', hasIncomeTax: false },
  UT: {
    name: 'Utah', abbreviation: 'UT', hasIncomeTax: true,
    flatRate: 0.0465,
    standardDeduction: { single: 924, married: 1848 },
  },
  VT: {
    name: 'Vermont', abbreviation: 'VT', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 45400, rate: 0.0335 },
        { min: 45400, max: 110050, rate: 0.066 },
        { min: 110050, max: 229550, rate: 0.076 },
        { min: 229550, max: null, rate: 0.0875 },
      ],
      married: [
        { min: 0, max: 75850, rate: 0.0335 },
        { min: 75850, max: 183400, rate: 0.066 },
        { min: 183400, max: 236350, rate: 0.076 },
        { min: 236350, max: null, rate: 0.0875 },
      ],
    },
    standardDeduction: { single: 7000, married: 14000 },
  },
  VA: {
    name: 'Virginia', abbreviation: 'VA', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 3000, rate: 0.02 },
        { min: 3000, max: 5000, rate: 0.03 },
        { min: 5000, max: 17000, rate: 0.05 },
        { min: 17000, max: null, rate: 0.0575 },
      ],
      married: [
        { min: 0, max: 3000, rate: 0.02 },
        { min: 3000, max: 5000, rate: 0.03 },
        { min: 5000, max: 17000, rate: 0.05 },
        { min: 17000, max: null, rate: 0.0575 },
      ],
    },
    standardDeduction: { single: 8000, married: 16000 },
  },
  WA: { name: 'Washington', abbreviation: 'WA', hasIncomeTax: false },
  WV: {
    name: 'West Virginia', abbreviation: 'WV', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.0236 },
        { min: 10000, max: 25000, rate: 0.0315 },
        { min: 25000, max: 40000, rate: 0.0354 },
        { min: 40000, max: 60000, rate: 0.0472 },
        { min: 60000, max: null, rate: 0.0512 },
      ],
      married: [
        { min: 0, max: 10000, rate: 0.0236 },
        { min: 10000, max: 25000, rate: 0.0315 },
        { min: 25000, max: 40000, rate: 0.0354 },
        { min: 40000, max: 60000, rate: 0.0472 },
        { min: 60000, max: null, rate: 0.0512 },
      ],
    },
    standardDeduction: { single: 0, married: 0 },
  },
  WI: {
    name: 'Wisconsin', abbreviation: 'WI', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 14320, rate: 0.035 },
        { min: 14320, max: 28640, rate: 0.044 },
        { min: 28640, max: 315310, rate: 0.053 },
        { min: 315310, max: null, rate: 0.0765 },
      ],
      married: [
        { min: 0, max: 19090, rate: 0.035 },
        { min: 19090, max: 38190, rate: 0.044 },
        { min: 38190, max: 420420, rate: 0.053 },
        { min: 420420, max: null, rate: 0.0765 },
      ],
    },
    standardDeduction: { single: 13330, married: 24660 },
  },
  WY: { name: 'Wyoming', abbreviation: 'WY', hasIncomeTax: false },
  DC: {
    name: 'Washington D.C.', abbreviation: 'DC', hasIncomeTax: true,
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.04 },
        { min: 10000, max: 40000, rate: 0.06 },
        { min: 40000, max: 60000, rate: 0.065 },
        { min: 60000, max: 250000, rate: 0.085 },
        { min: 250000, max: 500000, rate: 0.0925 },
        { min: 500000, max: 1000000, rate: 0.0975 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
      married: [
        { min: 0, max: 10000, rate: 0.04 },
        { min: 10000, max: 40000, rate: 0.06 },
        { min: 40000, max: 60000, rate: 0.065 },
        { min: 60000, max: 250000, rate: 0.085 },
        { min: 250000, max: 500000, rate: 0.0925 },
        { min: 500000, max: 1000000, rate: 0.0975 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
    },
    standardDeduction: { single: 0, married: 0 },
  },
};

export const STATES_SORTED = Object.values(STATE_TAX_DATA).sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const TAX_YEARS = [2026, 2025];

export function getFederalConfig(year: number): FederalTaxConfig {
  if (year === 2025) return FEDERAL_TAX_2025;
  return FEDERAL_TAX_2026;
}
