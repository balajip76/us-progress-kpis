'use client';

import { useState } from 'react';
import type { KPI, DataPoint } from '@/types';
import { formatValue, PALETTE } from '@/lib/utils';
import KPIChart from './KPIChart';
import PartyComparison from './PartyComparison';

interface Props {
  kpi: KPI;
  data: DataPoint[];
  showPartyShading: boolean;
  startYear: number;
  endYear: number;
}

export default function KPICard({ kpi, data, showPartyShading, startYear, endYear }: Props) {
  const [showComparison, setShowComparison] = useState(false);

  const latest = [...data].filter((d) => d.value !== null).sort((a, b) => b.year - a.year)[0];
  const previous = [...data].filter((d) => d.value !== null).sort((a, b) => b.year - a.year)[1];

  const delta = latest && previous && latest.value !== null && previous.value !== null
    ? latest.value - previous.value : null;

  const improving = delta !== null
    ? (kpi.higherIsBetter ? delta > 0 : delta < 0)
    : null;

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{ background: 'rgba(255,255,255,0.8)', borderColor: PALETTE.beige + '80' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm leading-snug" style={{ color: PALETTE.deep }}>{kpi.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: PALETTE.medium }}>{kpi.unit}</p>
          </div>
          {latest && latest.value !== null && (
            <div className="text-right shrink-0">
              <span className="font-bold text-lg leading-none" style={{ color: PALETTE.deep }}>
                {formatValue(latest.value, kpi)}
              </span>
              {delta !== null && (
                <p
                  className="text-xs mt-0.5 font-medium"
                  style={{ color: improving ? '#5a9e6f' : improving === false ? '#c45a52' : PALETTE.medium }}
                >
                  {improving ? '▲' : improving === false ? '▼' : ''}
                  {' '}{Math.abs(delta).toFixed(kpi.decimals ?? 1)} {latest.year}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-2">
        <KPIChart
          kpi={kpi}
          data={data}
          showPartyShading={showPartyShading}
          startYear={startYear}
          endYear={endYear}
        />
      </div>

      {/* Footer */}
      <div
        className="px-5 py-2.5 flex items-center justify-between border-t"
        style={{ borderColor: PALETTE.beige + '60' }}
      >
        <a
          href={kpi.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-opacity hover:opacity-70"
          style={{ color: PALETTE.medium }}
        >
          {kpi.source} ↗
        </a>
        <button
          onClick={() => setShowComparison((v) => !v)}
          className="text-xs font-medium px-3 py-1 rounded-lg transition-all duration-150"
          style={{
            color: showComparison ? '#fff' : PALETTE.mauve,
            background: showComparison ? PALETTE.mauve : PALETTE.beige + '60',
          }}
        >
          R vs D
        </button>
      </div>

      {/* Party comparison (collapsible) */}
      {showComparison && (
        <div className="px-5 pb-5">
          <PartyComparison kpi={kpi} data={data} />
        </div>
      )}
    </div>
  );
}
