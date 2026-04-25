'use client';

import type { KPI, DataPoint } from '@/types';
import { computePartyStats, formatValue, PARTY_COLORS, PALETTE } from '@/lib/utils';

interface Props {
  kpi: KPI;
  data: DataPoint[];
}

const TREND_ICONS: Record<string, string> = {
  improving: '↑',
  declining: '↓',
  stable: '→',
  unknown: '–',
};

const TREND_COLORS: Record<string, string> = {
  improving: '#5a9e6f',
  declining: '#c45a52',
  stable: '#706677',
  unknown: '#aaa',
};

export default function PartyComparison({ kpi, data }: Props) {
  const stats = computePartyStats(data, kpi.higherIsBetter);

  const parties = ['R', 'D'] as const;

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {parties.map((party) => {
        const s = stats[party];
        const colors = PARTY_COLORS[party];
        const label = party === 'R' ? 'Republican' : 'Democrat';
        const noData = s.avg === null;

        return (
          <div
            key={party}
            className="rounded-xl p-3 border"
            style={{
              background: colors.light,
              borderColor: colors.fill + '40',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: colors.fill, color: '#fff' }}
              >
                {label}
              </span>
              <span className="text-xs" style={{ color: PALETTE.medium }}>
                {s.years} yr{s.years !== 1 ? 's' : ''}
              </span>
            </div>

            {noData ? (
              <p className="text-xs italic" style={{ color: PALETTE.medium }}>No data in range</p>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs" style={{ color: PALETTE.medium }}>Avg</span>
                  <span className="font-bold text-sm" style={{ color: PALETTE.deep }}>
                    {formatValue(s.avg!, kpi)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs" style={{ color: PALETTE.medium }}>Best ({s.best?.year})</span>
                  <span className="text-xs font-medium" style={{ color: PALETTE.deep }}>
                    {s.best ? formatValue(s.best.value, kpi) : '–'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs" style={{ color: PALETTE.medium }}>Worst ({s.worst?.year})</span>
                  <span className="text-xs font-medium" style={{ color: PALETTE.deep }}>
                    {s.worst ? formatValue(s.worst.value, kpi) : '–'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t" style={{ borderColor: colors.fill + '30' }}>
                  <span className="text-xs" style={{ color: PALETTE.medium }}>Trend</span>
                  <span className="text-xs font-semibold" style={{ color: TREND_COLORS[s.trend] }}>
                    {TREND_ICONS[s.trend]} {s.trend}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
