'use client';

import { useState } from 'react';
import { PALETTE } from '@/lib/utils';

export type RangePreset = '5yr' | '10yr' | '20yr' | '50yr' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s' | 'custom';

interface Props {
  preset: RangePreset;
  customStart: number;
  customEnd: number;
  showPartyShading: boolean;
  onPresetChange: (p: RangePreset) => void;
  onCustomChange: (start: number, end: number) => void;
  onToggleShading: () => void;
}

const PRESETS: { label: string; value: RangePreset }[] = [
  { label: '5 yr',   value: '5yr' },
  { label: '10 yr',  value: '10yr' },
  { label: '20 yr',  value: '20yr' },
  { label: '50 yr',  value: '50yr' },
  { label: '1970s',  value: '1970s' },
  { label: '1980s',  value: '1980s' },
  { label: '1990s',  value: '1990s' },
  { label: '2000s',  value: '2000s' },
  { label: '2010s',  value: '2010s' },
  { label: '2020s',  value: '2020s' },
  { label: 'Custom', value: 'custom' },
];

export default function TimeRangeFilter({
  preset, customStart, customEnd,
  showPartyShading, onPresetChange, onCustomChange, onToggleShading,
}: Props) {
  const [localStart, setLocalStart] = useState(customStart);
  const [localEnd, setLocalEnd] = useState(customEnd);

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-5 py-3 sticky top-0 z-20 border-b"
      style={{ background: `${PALETTE.warm}f8`, borderColor: `${PALETTE.beige}60`, backdropFilter: 'blur(8px)' }}
    >
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const isActive = preset === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onPresetChange(p.value)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: isActive ? PALETTE.mauve : PALETTE.beige + '60',
                color: isActive ? '#fff' : PALETTE.deep,
                border: `1px solid ${isActive ? PALETTE.mauve : PALETTE.beige}`,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom range inputs */}
      {preset === 'custom' && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="number"
            min={1975}
            max={localEnd}
            value={localStart}
            onChange={(e) => setLocalStart(Number(e.target.value))}
            onBlur={() => onCustomChange(localStart, localEnd)}
            className="w-16 text-xs px-2 py-1 rounded-lg border outline-none"
            style={{ borderColor: PALETTE.beige, color: PALETTE.deep, background: '#fff' }}
          />
          <span className="text-xs" style={{ color: PALETTE.medium }}>–</span>
          <input
            type="number"
            min={localStart}
            max={2024}
            value={localEnd}
            onChange={(e) => setLocalEnd(Number(e.target.value))}
            onBlur={() => onCustomChange(localStart, localEnd)}
            className="w-16 text-xs px-2 py-1 rounded-lg border outline-none"
            style={{ borderColor: PALETTE.beige, color: PALETTE.deep, background: '#fff' }}
          />
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Party shading toggle */}
      <button
        onClick={onToggleShading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
        style={{
          background: showPartyShading ? PALETTE.deep : 'transparent',
          color: showPartyShading ? '#fff' : PALETTE.deep,
          borderColor: PALETTE.deep + '40',
        }}
      >
        <span
          className="w-3 h-3 rounded-sm inline-block"
          style={{ background: showPartyShading ? '#fff' : PALETTE.deep }}
        />
        Party shading
      </button>
    </div>
  );
}
