export type Party = 'R' | 'D';

export interface President {
  name: string;
  party: Party;
  startYear: number;
  endYear: number;
}

export interface DataPoint {
  year: number;
  value: number | null;
  party: Party;
  president: string;
}

export interface KPI {
  id: string;
  name: string;
  unit: string;
  description: string;
  source: string;
  sourceUrl: string;
  higherIsBetter: boolean;
  format?: 'number' | 'percent' | 'dollar' | 'decimal';
  decimals?: number;
  cagr?: boolean; // whether a 4-yr CAGR is meaningful for this metric
  data: DataPoint[];
}

export interface CagrResult {
  rate: number;        // e.g. 0.032 = 3.2%
  startYear: number;
  endYear: number;
  startValue: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  kpis: KPI[];
}

export type TimeRange = '5yr' | '10yr' | '20yr' | '50yr' | 'custom';

export interface CustomRange {
  start: number;
  end: number;
}

export type Decade = '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export interface PartyStats {
  party: Party;
  avg: number | null;
  best: { year: number; value: number } | null;
  worst: { year: number; value: number } | null;
  trend: 'improving' | 'declining' | 'stable' | 'unknown';
  years: number;
}
