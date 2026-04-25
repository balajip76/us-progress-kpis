import { CATEGORIES } from '@/data/kpis';
import Dashboard from '@/components/Dashboard';
import { PALETTE, PARTY_COLORS } from '@/lib/utils';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* App Header */}
      <header
        className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.deep} 0%, ${PALETTE.medium} 100%)`,
          borderColor: PALETTE.deep,
        }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">USA Progress KPIs</h1>
          <p className="text-xs mt-0.5 opacity-70 text-white">
            50 years of data · {CATEGORIES.length} categories · {CATEGORIES.reduce((a, c) => a + c.kpis.length, 0)} indicators
          </p>
        </div>

        {/* Party legend */}
        <div className="flex items-center gap-4 text-xs text-white/80">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: PARTY_COLORS.R.fill }} />
            Republican
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: PARTY_COLORS.D.fill }} />
            Democrat
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <Dashboard categories={CATEGORIES} />
    </div>
  );
}
