'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { BRAZIL_REGIONS, STATE_NAMES, findRegionByState } from '@/data/brazilRegions';

// Mesma linguagem visual já usada no resto do Votus (pílula, borda, verde
// quando ativo), só com hierarquia mais clara: região é o controle
// principal de localização (mesmo peso das abas de cargo); estado é um
// controle secundário mais compacto (sigla + ícone, nome completo só no
// tooltip) — não uma segunda fileira de pills do mesmo tamanho.
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

      <div className="mt-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-soft">Região</span>
        <nav aria-label="Selecionar região" className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {BRAZIL_REGIONS.map((region) => {
            const ativo = region.id === selectedRegionId;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegionId(region.id)}
                aria-current={ativo ? 'true' : undefined}
                className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors sm:text-xs ${
                  ativo
                    ? 'border-brasil-green bg-brasil-green text-white'
                    : 'border-line bg-white text-ink-soft hover:border-brasil-green/40 hover:text-brasil-green'
                }`}
              >
                {region.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-soft">Estado</span>
        <div aria-label="Selecionar estado" className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedRegion.states.map((uf) => {
            const ativo = uf === selectedState;
            return (
              <button
                key={uf}
                type="button"
                onClick={() => onSelectState(uf)}
                aria-current={ativo ? 'true' : undefined}
                aria-label={STATE_NAMES[uf]}
                title={STATE_NAMES[uf]}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors sm:text-xs ${
                  ativo
                    ? 'border-brasil-green bg-brasil-green text-white'
                    : 'border-line bg-white text-ink-soft hover:border-brasil-green/40 hover:text-brasil-green'
                }`}
              >
                <Flag size={11} className={ativo ? 'text-white' : 'text-ink-soft/70'} aria-hidden="true" />
                {uf}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
