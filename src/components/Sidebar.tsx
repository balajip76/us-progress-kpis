'use client';

import type { Category } from '@/types';
import { PALETTE } from '@/lib/utils';

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ categories, activeId, onSelect }: Props) {
  return (
    <aside
      className="hidden lg:flex flex-col gap-1 w-56 shrink-0 sticky top-0 h-screen overflow-y-auto pt-6 pb-10 pr-2"
      style={{ borderRight: `1px solid ${PALETTE.beige}60` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-3" style={{ color: PALETTE.medium }}>
        Categories
      </p>
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 w-full group"
            style={{
              background: isActive ? PALETTE.beige + '80' : 'transparent',
              color: isActive ? PALETTE.deep : PALETTE.medium,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span className="text-sm leading-snug">{cat.name}</span>
          </button>
        );
      })}
    </aside>
  );
}
