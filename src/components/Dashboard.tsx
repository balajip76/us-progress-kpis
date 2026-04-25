'use client';

import { useState, useRef, useEffect } from 'react';
import type { Category } from '@/types';
import { filterByRange, getYearRange, PALETTE } from '@/lib/utils';
import Sidebar from './Sidebar';
import TimeRangeFilter, { type RangePreset } from './TimeRangeFilter';
import KPICard from './KPICard';

interface Props {
  categories: Category[];
}

export default function Dashboard({ categories }: Props) {
  const [preset, setPreset]           = useState<RangePreset>('50yr');
  const [customStart, setCustomStart] = useState(1975);
  const [customEnd, setCustomEnd]     = useState(2024);
  const [showShading, setShowShading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? '');

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [startYear, endYear] = getYearRange(
    preset, customStart, customEnd,
  );

  // Observe which section is in view to highlight sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace('section-', ''));
          }
        }
      },
      { threshold: 0.25 },
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  function scrollToCategory(id: string) {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex min-h-0 flex-1" style={{ background: PALETTE.warm }}>
      <Sidebar
        categories={categories}
        activeId={activeCategory}
        onSelect={scrollToCategory}
      />

      <main className="flex-1 min-w-0">
        <TimeRangeFilter
          preset={preset}
          customStart={customStart}
          customEnd={customEnd}
          showPartyShading={showShading}
          onPresetChange={(p) => setPreset(p)}
          onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
          onToggleShading={() => setShowShading((v) => !v)}
        />

        <div className="px-5 py-6 space-y-12">
          {categories.map((cat) => {
            return (
              <section
                key={cat.id}
                id={`section-${cat.id}`}
                ref={(el) => { sectionRefs.current[cat.id] = el; }}
                className="scroll-mt-16"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl leading-none">{cat.icon}</span>
                  <h2 className="text-xl font-semibold" style={{ color: PALETTE.deep }}>{cat.name}</h2>
                </div>
                <p className="text-sm mb-5 ml-9" style={{ color: PALETTE.medium }}>{cat.description}</p>

                {/* KPI grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {cat.kpis.map((kpi) => {
                    const filtered = filterByRange(kpi.data, startYear, endYear);
                    if (!filtered.length) return null;
                    return (
                      <KPICard
                        key={kpi.id}
                        kpi={kpi}
                        data={filtered}
                        showPartyShading={showShading}
                        startYear={startYear}
                        endYear={endYear}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
