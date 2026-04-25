'use client';

import { useMemo, useState } from 'react';
import type { KPI, DataPoint, CagrResult } from '@/types';
import { formatValue, computeCagr, PALETTE, CAGR_LINE_COLOR } from '@/lib/utils';
import KPIChart from './KPIChart';
import PartyComparison from './PartyComparison';

interface Props {
  kpi: KPI;
  data: DataPoint[];
  showPartyShading: boolean;
  showCagr: boolean;
  startYear: number;
  endYear: number;
}

export default function KPICard({ kpi, data, showPartyShading, showCagr, startYear, endYear }: Props) {
  const [showComparison, setShowComparison] = useState(false);

  const sorted = useMemo(() => [...data].filter((d) => d.value !== null).sort((a, b) => b.year - a.year), [data]);
  const latest   = sorted[0];
  const previous = sorted[1];

  const delta = latest && previous && latest.value !== null && previous.value !== null
    ? latest.value - previous.value : null;
  const improving = delta !== null ? (kpi.higherIsBetter ? delta > 0 : delta < 0) : null;

  // Compute CAGR here so we can display it in the header (avoids SVG z-index issues)
  const cagrResult: CagrResult | null = useMemo(() => {
    if (!showCagr || !kpi.cagr) return null;
    return computeCagr(data, 4);
  }, [data, showCagr, kpi.cagr]);

  const cagrPct     = cagrResult ? cagrResult.rate * 100 : null;
  const cagrGood    = cagrPct !== null && (kpi.higherIsBetter ? cagrPct > 0 : cagrPct < 0);
  const cagrLabel   = cagrPct !== null
    ? `${cagrPct >= 0 ? '+' : ''}${cagrPct.toFixed(1)}%`
    : null;

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{ background: 'rgba(255,255,255,0.8)', borderColor: PALETTE.beige + '80' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: name + unit */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-snug" style={{ color: PALETTE.deep }}>{kpi.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: PALETTE.medium }}>{kpi.unit}</p>
          </div>

          {/* Right: latest value + CAGR badge */}
          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
            {latest && latest.value !== null && (
              <div>
                <span className="font-bold text-lg leading-none" style={{ color: PALETTE.deep }}>
                  {formatValue(latest.value, kpi)}
                </span>
                {delta !== null && (
                  <p
                    className="text-xs mt-0.5 font-medium"
                    style={{ color: improving ? '#5a9e6f' : improving === false ? '#c45a52' : PALETTE.medium }}
                  >
                    {improving ? '▲' : improving === false ? '▼' : ''}
                    {' '}{Math.abs(delta).toFixed(kpi.decimals ?? 1)} ({latest.year})
                  </p>
                )}
              </div>
            )}

            {/* CAGR badge — lives here in the card header, never inside SVG */}
            {showCagr && cagrResult && cagrLabel && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                style={{
                  background: cagrGood ? 'rgba(90,158,111,0.08)' : 'rgba(196,90,82,0.08)',
                  borderColor: cagrGood ? '#5a9e6f60' : '#c45a5260',
                  color: cagrGood ? '#5a9e6f' : '#c45a52',
                }}
                title={`4-year CAGR (${cagrResult.startYear}–${cagrResult.endYear})`}
              >
                {/* Dashed line icon */}
                <svg width="18" height="6" viewBox="0 0 18 6" fill="none" aria-hidden>
                  <line x1="0" y1="3" x2="18" y2="3"
                    stroke={CAGR_LINE_COLOR} strokeWidth="2" strokeDasharray="4 2" />
                </svg>
                4yr CAGR&nbsp;
                <span className="font-bold">{cagrLabel}/yr</span>
                <span className="opacity-60 font-normal ml-0.5">
                  ({cagrResult.startYear}–{cagrResult.endYear})
                </span>
              </div>
            )}

            {/* "N/A" nudge when CAGR is on but not applicable for this metric */}
            {showCagr && !kpi.cagr && (
              <span className="text-xs italic" style={{ color: PALETTE.medium }}>CAGR n/a</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart — receives cagrResult so it can draw the overlay line */}
      <div className="px-2 pb-2">
        <KPIChart
          kpi={kpi}
          data={data}
          showPartyShading={showPartyShading}
          cagrResult={cagrResult}
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

      {showComparison && (
        <div className="px-5 pb-5">
          <PartyComparison kpi={kpi} data={data} />
        </div>
      )}
    </div>
  );
}
