'use client';

import { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { KPI, DataPoint, CagrResult } from '@/types';
import { formatValue, PARTY_COLORS, PALETTE, CAGR_LINE_COLOR, computeCagr } from '@/lib/utils';

interface Props {
  kpi: KPI;
  data: DataPoint[];
  showPartyShading: boolean;
  showCagr: boolean;
  startYear: number;
  endYear: number;
}

interface Band { start: number; end: number; party: 'R' | 'D' }

function getPartyBands(data: DataPoint[]): Band[] {
  if (!data.length) return [];
  const bands: Band[] = [];
  let current: Band = { start: data[0].year, end: data[0].year, party: data[0].party };
  for (const d of data) {
    if (d.party !== current.party) {
      bands.push(current);
      current = { start: d.year, end: d.year, party: d.party };
    } else {
      current.end = d.year;
    }
  }
  bands.push(current);
  return bands;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, kpi, cagrResult }: any) {
  if (!active || !payload?.length) return null;
  const d: DataPoint = payload[0]?.payload;
  if (!d) return null;
  const pColor = PARTY_COLORS[d.party];
  const cagrPayload = payload.find((p: { dataKey: string }) => p.dataKey === 'cagrTrend');

  return (
    <div className="rounded-xl border shadow-xl px-4 py-3 text-sm"
      style={{ background: 'rgba(255,255,255,0.97)', borderColor: pColor.fill, minWidth: 190 }}>
      <p className="font-semibold mb-1" style={{ color: PALETTE.deep }}>{label}</p>
      <p className="text-xs mb-1.5" style={{ color: pColor.text }}>
        {d.president} ({d.party === 'R' ? 'Republican' : 'Democrat'})
      </p>
      <p className="font-bold text-base" style={{ color: PALETTE.deep }}>
        {d.value !== null ? formatValue(d.value, kpi) : 'N/A'}
        <span className="font-normal text-xs ml-1" style={{ color: PALETTE.medium }}>{kpi.unit}</span>
      </p>
      {cagrPayload && cagrResult && d.year >= cagrResult.startYear && (
        <p className="text-xs mt-1.5 pt-1.5 border-t" style={{ color: CAGR_LINE_COLOR, borderColor: PALETTE.beige }}>
          4yr CAGR trend: {formatValue(cagrPayload.value, kpi)}
        </p>
      )}
    </div>
  );
}

type ChartPoint = DataPoint & { cagrTrend?: number | null };

export default function KPIChart({ kpi, data, showPartyShading, showCagr, startYear, endYear }: Props) {
  const bands = useMemo(() => (showPartyShading ? getPartyBands(data) : []), [data, showPartyShading]);

  // Compute CAGR and augment data with trend line
  const { chartData, cagrResult } = useMemo<{ chartData: ChartPoint[]; cagrResult: CagrResult | null }>(() => {
    if (!showCagr || !kpi.cagr) return { chartData: data, cagrResult: null };

    const result = computeCagr(data, 4);
    if (!result) return { chartData: data, cagrResult: null };

    const augmented: ChartPoint[] = data.map((d) => {
      if (d.value === null || d.year < result.startYear || d.year > result.endYear) {
        return { ...d, cagrTrend: null };
      }
      const yearsElapsed = d.year - result.startYear;
      const trendVal = result.startValue * Math.pow(1 + result.rate, yearsElapsed);
      return { ...d, cagrTrend: trendVal };
    });

    return { chartData: augmented, cagrResult: result };
  }, [data, showCagr, kpi.cagr]);

  const values = data.map((d) => d.value).filter((v): v is number => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.12 || 1;
  const yMin = parseFloat((min - padding).toFixed(2));
  const yMax = parseFloat((max + padding).toFixed(2));

  const gradId = `grad-${kpi.id}`;
  const cagrPct = cagrResult ? (cagrResult.rate * 100) : null;
  const cagrPositive = cagrPct !== null && (kpi.higherIsBetter ? cagrPct > 0 : cagrPct < 0);
  const cagrLabel = cagrPct !== null
    ? `${cagrPct >= 0 ? '+' : ''}${cagrPct.toFixed(1)}% / yr`
    : null;

  return (
    <div className="w-full relative" style={{ height: 300 }}>
      {/* CAGR badge */}
      {cagrResult && cagrLabel && (
        <div
          className="absolute top-1 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border"
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderColor: CAGR_LINE_COLOR + '50',
            color: cagrPositive ? '#5a9e6f' : '#c45a52',
          }}
        >
          <span
            className="w-4 h-0.5 inline-block rounded"
            style={{ background: CAGR_LINE_COLOR, borderTop: `2px dashed ${CAGR_LINE_COLOR}` }}
          />
          4yr CAGR {cagrLabel}
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.mauve} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PALETTE.mauve} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.beige} strokeOpacity={0.6} vertical={false} />

          {showPartyShading && bands.map((b, i) => (
            <ReferenceArea
              key={i} x1={b.start} x2={b.end}
              fill={PARTY_COLORS[b.party].fill} fillOpacity={0.07} stroke="none"
            />
          ))}

          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: PALETTE.medium }}
            tickLine={false}
            axisLine={{ stroke: PALETTE.beige }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: PALETTE.medium }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => {
              if (kpi.format === 'dollar') return '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toFixed(0));
              if (kpi.format === 'number' && Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'k';
              return v.toFixed(kpi.decimals ?? 1);
            }}
          />

          <Tooltip content={<CustomTooltip kpi={kpi} cagrResult={cagrResult} />} />

          {min < 0 && max > 0 && (
            <ReferenceLine y={0} stroke={PALETTE.medium} strokeDasharray="4 4" strokeOpacity={0.4} />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={PALETTE.mauve}
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 5, fill: PALETTE.mauve, stroke: '#fff', strokeWidth: 2 }}
            connectNulls
          />

          {/* 4-year CAGR trend overlay */}
          {showCagr && kpi.cagr && cagrResult && (
            <Line
              type="monotone"
              dataKey="cagrTrend"
              stroke={CAGR_LINE_COLOR}
              strokeWidth={1.8}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
              connectNulls
              legendType="none"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
