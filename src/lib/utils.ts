import type { DataPoint, KPI, PartyStats, Party, CagrResult } from '@/types';

export function formatValue(value: number, kpi: KPI): string {
  const { format = 'number', decimals = 1 } = kpi;
  if (format === 'dollar') {
    return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (format === 'percent') {
    return value.toFixed(decimals) + '%';
  }
  if (format === 'decimal') {
    return value.toFixed(decimals);
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: decimals ?? 0 });
}

export function filterByRange(data: DataPoint[], startYear: number, endYear: number): DataPoint[] {
  return data.filter((d) => d.year >= startYear && d.year <= endYear);
}

export function computePartyStats(data: DataPoint[], higherIsBetter: boolean): Record<Party, PartyStats> {
  const grouped: Record<Party, DataPoint[]> = { R: [], D: [] };
  for (const d of data) {
    if (d.value !== null) grouped[d.party].push(d);
  }

  function stats(party: Party): PartyStats {
    const points = grouped[party];
    if (points.length === 0) {
      return { party, avg: null, best: null, worst: null, trend: 'unknown', years: 0 };
    }
    const sum = points.reduce((acc, p) => acc + (p.value as number), 0);
    const avg = sum / points.length;

    const sorted = [...points].sort((a, b) => (a.value as number) - (b.value as number));
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];

    const best = higherIsBetter
      ? { year: highest.year, value: highest.value as number }
      : { year: lowest.year, value: lowest.value as number };
    const worst = higherIsBetter
      ? { year: lowest.year, value: lowest.value as number }
      : { year: highest.year, value: highest.value as number };

    const mid = Math.floor(points.length / 2);
    const firstHalf = points.slice(0, mid);
    const secondHalf = points.slice(mid);
    let trend: PartyStats['trend'] = 'stable';
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const avgFirst = firstHalf.reduce((a, p) => a + (p.value as number), 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, p) => a + (p.value as number), 0) / secondHalf.length;
      const delta = avgSecond - avgFirst;
      const threshold = Math.abs(avg) * 0.05;
      if (delta > threshold) trend = higherIsBetter ? 'improving' : 'declining';
      else if (delta < -threshold) trend = higherIsBetter ? 'declining' : 'improving';
    }

    return { party, avg, best, worst, trend, years: points.length };
  }

  return { R: stats('R'), D: stats('D') };
}

/** Compute 4-year CAGR from the data. Returns null if not applicable. */
export function computeCagr(data: DataPoint[], windowYears = 4): CagrResult | null {
  const valid = data.filter((d) => d.value !== null && (d.value as number) > 0);
  if (valid.length < 2) return null;

  const endPoint = valid[valid.length - 1];
  const targetStartYear = endPoint.year - windowYears;

  // Find the point closest to targetStartYear without going over
  let startPoint: DataPoint | null = null;
  for (const d of valid) {
    if (d.year <= targetStartYear) {
      startPoint = d;
    } else {
      break;
    }
  }
  if (!startPoint || startPoint.year >= endPoint.year) return null;

  const years = endPoint.year - startPoint.year;
  const rate = Math.pow((endPoint.value as number) / (startPoint.value as number), 1 / years) - 1;

  return { rate, startYear: startPoint.year, endYear: endPoint.year, startValue: startPoint.value as number };
}

export function getYearRange(preset: string, customStart?: number, customEnd?: number): [number, number] {
  const now = 2026;
  switch (preset) {
    case '5yr':   return [now - 4, now];
    case '10yr':  return [now - 9, now];
    case '20yr':  return [now - 19, now];
    case '50yr':  return [1975, now];
    case '1970s': return [1975, 1979];
    case '1980s': return [1980, 1989];
    case '1990s': return [1990, 1999];
    case '2000s': return [2000, 2009];
    case '2010s': return [2010, 2019];
    case '2020s': return [2020, now];
    case 'custom': return [customStart ?? 1975, customEnd ?? now];
    default:      return [1975, now];
  }
}

export const PARTY_COLORS = {
  R: { fill: '#C4736A', bg: 'rgba(196,115,106,0.10)', text: '#a85a52', light: 'rgba(196,115,106,0.06)' },
  D: { fill: '#6B8DB8', bg: 'rgba(107,141,184,0.10)', text: '#4e6e96', light: 'rgba(107,141,184,0.06)' },
} as const;

export const PALETTE = {
  deep:   '#565264',
  medium: '#706677',
  mauve:  '#A6808C',
  beige:  '#CCB7AE',
  warm:   '#D6CFCB',
} as const;

export const CAGR_LINE_COLOR = '#7a6540';
