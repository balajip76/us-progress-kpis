'use client';

import { useState, useRef, useEffect } from 'react';
import type { Category } from '@/types';
import { filterByRange, getYearRange, PALETTE } from '@/lib/utils';
import Sidebar from './Sidebar';
import TimeRangeFilter, { type RangePreset } from './TimeRangeFilter';
import KPICard from './KPICard';
import PartyAggregateView from './PartyAggregateView';

type ViewMode = 'kpis' | 'party';

interface Props {
  categories: Category[];
}

export default function Dashboard({ categories }: Props) {
  const [preset, setPreset]           = useState<RangePreset>('50yr');
  const [customStart, setCustomStart] = useState(1975);
  const [customEnd, setCustomEnd]     = useState(2026);
  const [showShading, setShowShading] = useState(true);
  const [showCagr, setShowCagr]       = useState(false);
  const [viewMode, setViewMode]       = useState<ViewMode>('kpis');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [startYear, endYear] = getYearRange(preset, customStart, customEnd);

  useEffect(() => {
    if (viewMode !== 'kpis') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace('section-', ''));
          }
        }
      },
      { threshold: 0.2 },
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [viewMode]);

  function scrollToCategory(id: string) {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex min-h-0 flex-1" style={{ background: PALETTE.warm }}>
      {/* Sidebar only in KPI view */}
      {viewMode === 'kpis' && (
        <Sidebar categories={categories} activeId={activeCategory} onSelect={scrollToCategory} />
      )}

      <main className="flex-1 min-w-0">
        {/* Controls bar */}
        <div
          className="flex flex-wrap items-center gap-0 sticky top-0 z-20 border-b"
          style={{ borderColor: `${PALETTE.beige}60` }}
        >
          {/* View toggle */}
          <div
            className="flex shrink-0 border-r px-3 py-3 gap-1.5"
            style={{ borderColor: `${PALETTE.beige}60` }}
          >
            {(['kpis', 'party'] as ViewMode[]).map((mode) => {
              const isActive = viewMode === mode;
              const label = mode === 'kpis' ? '📊 KPI Charts' : '⚖️ Party Comparison';
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
                  style={{
                    background: isActive ? PALETTE.deep : 'transparent',
                    color: isActive ? '#fff' : PALETTE.deep,
                    border: `1px solid ${isActive ? PALETTE.deep : PALETTE.beige}`,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Time range + toggles */}
          <TimeRangeFilter
            preset={preset}
            customStart={customStart}
            customEnd={customEnd}
            showPartyShading={showShading}
            showCagr={showCagr}
            onPresetChange={(p) => setPreset(p)}
            onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
            onToggleShading={() => setShowShading((v) => !v)}
            onToggleCagr={() => setShowCagr((v) => !v)}
          />
        </div>

        {/* KPI Charts view */}
        {viewMode === 'kpis' && (
          <div className="px-5 py-6 space-y-12">
            {categories.map((cat) => (
              <section
                key={cat.id}
                id={`section-${cat.id}`}
                ref={(el) => { sectionRefs.current[cat.id] = el; }}
                className="scroll-mt-16"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl leading-none">{cat.icon}</span>
                  <h2 className="text-xl font-semibold" style={{ color: PALETTE.deep }}>{cat.name}</h2>
                </div>
                <p className="text-sm mb-5 ml-9" style={{ color: PALETTE.medium }}>{cat.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {cat.kpis.map((kpi) => {
                    const filtered = filterByRange(kpi.data, startYear, endYear);
                    if (!filtered.length) return null;
                    return (
                      <KPICard
                        key={kpi.id}
                        kpi={kpi}
                        data={filtered}
                        showPartyShading={showShading}
                        showCagr={showCagr}
                        startYear={startYear}
                        endYear={endYear}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Party Comparison view */}
        {viewMode === 'party' && (
          <PartyAggregateView
            categories={categories}
            startYear={startYear}
            endYear={endYear}
          />
        )}
      </main>
    </div>
  );
}
