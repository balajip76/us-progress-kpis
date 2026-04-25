import type { President, Party } from '@/types';

export const PRESIDENTS: President[] = [
  { name: 'Gerald Ford',      party: 'R', startYear: 1974, endYear: 1977 },
  { name: 'Jimmy Carter',     party: 'D', startYear: 1977, endYear: 1981 },
  { name: 'Ronald Reagan',    party: 'R', startYear: 1981, endYear: 1989 },
  { name: 'George H.W. Bush', party: 'R', startYear: 1989, endYear: 1993 },
  { name: 'Bill Clinton',     party: 'D', startYear: 1993, endYear: 2001 },
  { name: 'George W. Bush',   party: 'R', startYear: 2001, endYear: 2009 },
  { name: 'Barack Obama',     party: 'D', startYear: 2009, endYear: 2017 },
  { name: 'Donald Trump',     party: 'R', startYear: 2017, endYear: 2021 },
  { name: 'Joe Biden',        party: 'D', startYear: 2021, endYear: 2025 },
  { name: 'Donald Trump',     party: 'R', startYear: 2025, endYear: 2029 },
];

export function getPartyForYear(year: number): { party: Party; president: string } {
  for (const p of PRESIDENTS) {
    if (year >= p.startYear && year < p.endYear) {
      return { party: p.party, president: p.name };
    }
  }
  return { party: 'R', president: 'Unknown' };
}

export function buildDataPoints(
  rawData: Record<number, number | null>
): Array<{ year: number; value: number | null; party: Party; president: string }> {
  return Object.entries(rawData)
    .map(([y, value]) => {
      const year = parseInt(y, 10);
      const { party, president } = getPartyForYear(year);
      return { year, value, party, president };
    })
    .sort((a, b) => a.year - b.year);
}

/** Interpolate sparse year→value map to fill every year from min to max */
export function interpolate(sparse: Record<number, number>): Record<number, number> {
  const years = Object.keys(sparse).map(Number).sort((a, b) => a - b);
  const result: Record<number, number> = {};
  for (let i = 0; i < years.length; i++) {
    const y0 = years[i];
    const v0 = sparse[y0];
    result[y0] = v0;
    if (i < years.length - 1) {
      const y1 = years[i + 1];
      const v1 = sparse[y1];
      const steps = y1 - y0;
      for (let d = 1; d < steps; d++) {
        result[y0 + d] = v0 + ((v1 - v0) * d) / steps;
      }
    }
  }
  return result;
}
