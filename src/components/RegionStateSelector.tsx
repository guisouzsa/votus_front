'use client';

import { useState } from 'react';
import { BRAZIL_REGIONS, STATE_NAMES, findRegionByState } from '@/data/brazilRegions';

// Mesmo padrão visual das abas de cargo em CandidatosListClient (pílula,
// borda, cor ativa em verde) — não é um componente novo de design, só
// aplica o padrão já existente a região/estado.
export default function RegionStateSelector({
  selectedState,
  onSelectState,
}: {
  selectedState: string | null;
  onSelectState: (uf: string) => void;
}) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    () => findRegionByState(selectedState ?? '')?.id ?? BRAZIL_REGIONS[0].id
  );

  const selectedRegion = BRAZIL_REGIONS.find((region) => region.id === selectedRegionId) ?? BRAZIL_REGIONS[0];

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-[#4d4d4d]">
        Brasil
        {' / '}
        {selectedRegion.name}
        {selectedState && (
          <>
            {' / '}
            <span className="text-[#1b623a]">{STATE_NAMES[selectedState] ?? selectedState}</span>
          </>
        )}
      </p>

      <nav aria-label="Selecionar região" className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {BRAZIL_REGIONS.map((region) => {
          const ativo = region.id === selectedRegionId;
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => setSelectedRegionId(region.id)}
              aria-current={ativo ? 'true' : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                ativo
                  ? 'border-brasil-green bg-brasil-green text-white'
                  : 'border-line bg-white text-ink hover:border-brasil-green/40 hover:text-brasil-green'
              }`}
            >
              {region.name}
            </button>
          );
        })}
      </nav>

      <div aria-label="Selecionar estado" className="mt-2 flex flex-wrap gap-2">
        {selectedRegion.states.map((uf) => {
          const ativo = uf === selectedState;
          return (
            <button
              key={uf}
              type="button"
              onClick={() => onSelectState(uf)}
              aria-current={ativo ? 'true' : undefined}
              title={STATE_NAMES[uf]}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
                ativo
                  ? 'border-brasil-green bg-brasil-green text-white'
                  : 'border-line bg-white text-ink hover:border-brasil-green/40 hover:text-brasil-green'
              }`}
            >
              {uf}
              <span className={`font-medium ${ativo ? 'text-white/85' : 'text-ink-soft'}`}>{STATE_NAMES[uf]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
