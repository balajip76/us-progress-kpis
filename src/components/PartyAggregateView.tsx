'use client';

import type { Category, KPI } from '@/types';
import { filterByRange, computePartyStats, formatValue, PARTY_COLORS, PALETTE } from '@/lib/utils';

interface Props {
  categories: Category[];
  startYear: number;
  endYear: number;
}

interface KPIRow {
  kpi: KPI;
  dAvg: number | null;
  rAvg: number | null;
  dYears: number;
  rYears: number;
  winner: 'D' | 'R' | 'tie' | 'none';
  gap: number | null;
  gapPct: number | null;
}

function buildRows(categories: Category[], startYear: number, endYear: number): { cat: Category; rows: KPIRow[] }[] {
  return categories.map((cat) => {
    const rows: KPIRow[] = cat.kpis.map((kpi) => {
      const filtered = filterByRange(kpi.data, startYear, endYear);
      const stats = computePartyStats(filtered, kpi.higherIsBetter);
      const dAvg = stats.D.avg;
      const rAvg = stats.R.avg;
      let winner: KPIRow['winner'] = 'none';
      let gap: number | null = null;
      let gapPct: number | null = null;

      if (dAvg !== null && rAvg !== null) {
        gap = Math.abs(dAvg - rAvg);
        const base = (Math.abs(dAvg) + Math.abs(rAvg)) / 2;
        gapPct = base > 0 ? (gap / base) * 100 : 0;

        const dBetter = kpi.higherIsBetter ? dAvg > rAvg : dAvg < rAvg;
        const rBetter = kpi.higherIsBetter ? rAvg > dAvg : rAvg < dAvg;
        if (Math.abs(dAvg - rAvg) < 0.001 * Math.max(Math.abs(dAvg), Math.abs(rAvg), 1)) {
          winner = 'tie';
        } else if (dBetter) {
          winner = 'D';
        } else if (rBetter) {
          winner = 'R';
        }
      }

      return { kpi, dAvg, rAvg, dYears: stats.D.years, rYears: stats.R.years, winner, gap, gapPct };
    });
    return { cat, rows };
  });
}

function ScoreBar({ dAvg, rAvg, higherIsBetter }: { dAvg: number | null; rAvg: number | null; higherIsBetter: boolean }) {
  if (dAvg === null || rAvg === null) return null;
  const total = Math.abs(dAvg) + Math.abs(rAvg);
  if (total === 0) return null;

  // Fraction for the "better" side
  const dFrac = higherIsBetter
    ? Math.max(dAvg, 0) / (Math.max(dAvg, 0) + Math.max(rAvg, 0) + 0.001)
    : Math.max(rAvg, 0) / (Math.max(rAvg, 0) + Math.max(dAvg, 0) + 0.001);

  const dWins = higherIsBetter ? dAvg >= rAvg : dAvg <= rAvg;
  const dWidth = Math.round(dFrac * 100);
  const rWidth = 100 - dWidth;

  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-full" style={{ background: PALETTE.beige + '60' }}>
      {dWins ? (
        <>
          <div style={{ width: `${dWidth}%`, background: PARTY_COLORS.D.fill, borderRadius: '9999px 0 0 9999px' }} />
          <div style={{ width: `${rWidth}%`, background: PARTY_COLORS.R.fill, borderRadius: '0 9999px 9999px 0' }} />
        </>
      ) : (
        <>
          <div style={{ width: `${rWidth}%`, background: PARTY_COLORS.R.fill, borderRadius: '9999px 0 0 9999px' }} />
          <div style={{ width: `${dWidth}%`, background: PARTY_COLORS.D.fill, borderRadius: '0 9999px 9999px 0' }} />
        </>
      )}
    </div>
  );
}

export default function PartyAggregateView({ categories, startYear, endYear }: Props) {
  const data = buildRows(categories, startYear, endYear);

  // Summary counts
  let dWins = 0, rWins = 0, ties = 0, total = 0;
  for (const { rows } of data) {
    for (const r of rows) {
      if (r.winner === 'none') continue;
      total++;
      if (r.winner === 'D') dWins++;
      else if (r.winner === 'R') rWins++;
      else ties++;
    }
  }

  return (
    <div className="px-5 py-6 space-y-8">
      {/* Summary banner */}
      <div
        className="rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: 'rgba(255,255,255,0.8)', borderColor: PALETTE.beige + '80' }}
      >
        <div className="flex-1">
          <h2 className="text-base font-semibold mb-1" style={{ color: PALETTE.deep }}>
            Party Performance Summary
          </h2>
          <p className="text-xs" style={{ color: PALETTE.medium }}>
            Comparing averages across {total} measurable KPIs · {startYear}–{endYear} · data from reliable government sources
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: PARTY_COLORS.D.fill }}>{dWins}</div>
            <div className="text-xs mt-0.5" style={{ color: PALETTE.medium }}>Democrat</div>
          </div>
          <div className="text-center px-3 border-x" style={{ borderColor: PALETTE.beige }}>
            <div className="text-2xl font-bold" style={{ color: PALETTE.medium }}>{ties}</div>
            <div className="text-xs mt-0.5" style={{ color: PALETTE.medium }}>Tied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: PARTY_COLORS.R.fill }}>{rWins}</div>
            <div className="text-xs mt-0.5" style={{ color: PALETTE.medium }}>Republican</div>
          </div>
        </div>
        {/* Overall bar */}
        <div className="sm:w-40">
          <div className="flex h-2.5 rounded-full overflow-hidden">
            <div
              title={`Democrat: ${dWins}`}
              style={{ width: `${total ? (dWins / total) * 100 : 0}%`, background: PARTY_COLORS.D.fill }}
            />
            <div
              title={`Tied: ${ties}`}
              style={{ width: `${total ? (ties / total) * 100 : 0}%`, background: PALETTE.beige }}
            />
            <div
              title={`Republican: ${rWins}`}
              style={{ width: `${total ? (rWins / total) * 100 : 0}%`, background: PARTY_COLORS.R.fill }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: PALETTE.medium }}>
            <span style={{ color: PARTY_COLORS.D.text }}>D</span>
            <span style={{ color: PARTY_COLORS.R.text }}>R</span>
          </div>
        </div>
      </div>

      {/* Per-category tables */}
      {data.map(({ cat, rows }) => {
        const catDWins = rows.filter(r => r.winner === 'D').length;
        const catRWins = rows.filter(r => r.winner === 'R').length;

        return (
          <div key={cat.id}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{cat.icon}</span>
              <h3 className="font-semibold text-sm" style={{ color: PALETTE.deep }}>{cat.name}</h3>
              <span className="text-xs ml-auto" style={{ color: PALETTE.medium }}>
                <span style={{ color: PARTY_COLORS.D.text }}>D {catDWins}</span>
                {' · '}
                <span style={{ color: PARTY_COLORS.R.text }}>R {catRWins}</span>
              </span>
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: PALETTE.beige + '80' }}
            >
              {/* Table header */}
              <div
                className="grid text-xs font-semibold uppercase tracking-wide px-4 py-2.5 border-b"
                style={{
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                  background: PALETTE.beige + '40',
                  borderColor: PALETTE.beige + '80',
                  color: PALETTE.medium,
                }}
              >
                <span>Indicator</span>
                <span className="text-center" style={{ color: PARTY_COLORS.D.text }}>Democrat avg</span>
                <span className="text-center" style={{ color: PARTY_COLORS.R.text }}>Republican avg</span>
                <span className="text-center">Gap</span>
                <span className="text-center">Winner</span>
              </div>

              {rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;
                const noData = row.dAvg === null || row.rAvg === null;
                const winnerColor = row.winner === 'D' ? PARTY_COLORS.D : row.winner === 'R' ? PARTY_COLORS.R : null;

                return (
                  <div
                    key={row.kpi.id}
                    className="grid px-4 py-3 items-center"
                    style={{
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                      borderBottom: isLast ? 'none' : `1px solid ${PALETTE.beige}50`,
                      background: row.winner !== 'none' && winnerColor
                        ? winnerColor.light
                        : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {/* Name */}
                    <div>
                      <p className="text-xs font-medium" style={{ color: PALETTE.deep }}>{row.kpi.name}</p>
                      <p className="text-xs" style={{ color: PALETTE.medium }}>{row.kpi.unit}</p>
                    </div>

                    {/* Democrat avg */}
                    <div className="text-center">
                      {row.dAvg !== null ? (
                        <>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: row.winner === 'D' ? PARTY_COLORS.D.fill : PALETTE.deep }}
                          >
                            {formatValue(row.dAvg, row.kpi)}
                          </span>
                          <p className="text-xs" style={{ color: PALETTE.medium }}>{row.dYears} yrs</p>
                        </>
                      ) : <span className="text-xs italic" style={{ color: PALETTE.medium }}>–</span>}
                    </div>

                    {/* Republican avg */}
                    <div className="text-center">
                      {row.rAvg !== null ? (
                        <>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: row.winner === 'R' ? PARTY_COLORS.R.fill : PALETTE.deep }}
                          >
                            {formatValue(row.rAvg, row.kpi)}
                          </span>
                          <p className="text-xs" style={{ color: PALETTE.medium }}>{row.rYears} yrs</p>
                        </>
                      ) : <span className="text-xs italic" style={{ color: PALETTE.medium }}>–</span>}
                    </div>

                    {/* Gap + bar */}
                    <div className="text-center space-y-1">
                      {!noData && row.gap !== null ? (
                        <>
                          <p className="text-xs font-medium" style={{ color: PALETTE.deep }}>
                            {formatValue(row.gap, row.kpi)}
                          </p>
                          <ScoreBar dAvg={row.dAvg} rAvg={row.rAvg} higherIsBetter={row.kpi.higherIsBetter} />
                        </>
                      ) : <span className="text-xs italic" style={{ color: PALETTE.medium }}>–</span>}
                    </div>

                    {/* Winner badge */}
                    <div className="flex justify-center">
                      {row.winner === 'none' || noData ? (
                        <span className="text-xs italic" style={{ color: PALETTE.medium }}>–</span>
                      ) : row.winner === 'tie' ? (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                          style={{ color: PALETTE.medium, borderColor: PALETTE.beige }}
                        >tie</span>
                      ) : (
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: winnerColor!.fill, color: '#fff' }}
                        >
                          {row.winner === 'D' ? 'Dem' : 'Rep'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-center pb-4" style={{ color: PALETTE.medium }}>
        Averages computed over all years within the selected time range attributed to each party's president.
        A party "wins" a measure when its average is better per that metric's direction (higher or lower is better).
      </p>
    </div>
  );
}
