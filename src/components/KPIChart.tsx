'use client';

import { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { KPI, DataPoint, CagrResult } from '@/types';
import { formatValue, PARTY_COLORS, PALETTE, CAGR_LINE_COLOR } from '@/lib/utils';

interface Props {
  kpi: KPI;
  data: DataPoint[];
  showPartyShading: boolean;
  cagrResult: CagrResult | null; // pre-computed by KPICard; null = no overlay
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
function CustomTooltip({ active, payload, label, kpi }: any) {
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
      {cagrPayload?.value != null && (
        <p className="text-xs mt-1.5 pt-1.5 border-t" style={{ color: CAGR_LINE_COLOR, borderColor: PALETTE.beige }}>
          CAGR trend: {formatValue(cagrPayload.value, kpi)}
        </p>
      )}
    </div>
  );
}

type ChartPoint = DataPoint & { cagrTrend?: number | null };

export default function KPIChart({ kpi, data, showPartyShading, cagrResult, startYear, endYear }: Props) {
  const bands = useMemo(() => (showPartyShading ? getPartyBands(data) : []), [data, showPartyShading]);

  // Augment data with CAGR trend values for the overlay line
  const chartData: ChartPoint[] = useMemo(() => {
    if (!cagrResult) return data;
    return data.map((d) => {
      if (d.value === null || d.year < cagrResult.startYear || d.year > cagrResult.endYear) {
        return { ...d, cagrTrend: null };
      }
      const yearsElapsed = d.year - cagrResult.startYear;
      return { ...d, cagrTrend: cagrResult.startValue * Math.pow(1 + cagrResult.rate, yearsElapsed) };
    });
  }, [data, cagrResult]);

  const values = data.map((d) => d.value).filter((v): v is number => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.12 || 1;
  const yMin = parseFloat((min - padding).toFixed(2));
  const yMax = parseFloat((max + padding).toFixed(2));

  const gradId = `grad-${kpi.id}`;

  return (
    <div className="w-full" style={{ height: 300 }}>
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

          <Tooltip content={<CustomTooltip kpi={kpi} />} />

          {min < 0 && max > 0 && (
            <ReferenceLine y={0} stroke={PALETTE.medium} strokeDasharray="4 4" strokeOpacity={0.4} />
          )}

          {/* Main area */}
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
          {cagrResult && (
            <Line
              type="monotone"
              dataKey="cagrTrend"
              stroke={CAGR_LINE_COLOR}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4, fill: CAGR_LINE_COLOR, stroke: '#fff', strokeWidth: 1.5 }}
              connectNulls
              legendType="none"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
