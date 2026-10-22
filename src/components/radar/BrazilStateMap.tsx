'use client';

import { BRAZIL_MAP_VIEWBOX, UF_SHAPES } from '@/data/brazilUfShapes';

// UFs pequenas demais para caber a sigla dentro do contorno sem cobrir as
// vizinhas. Continuam clicáveis e aparecem na lista de UFs da página.
const HIDDEN_LABELS = new Set(['DF', 'SE', 'AL', 'RN', 'PB', 'ES', 'RJ']);

/**
 * Mapa das 27 UFs a partir da malha oficial do IBGE (src/data/brazilUfShapes.ts).
 * Sem coloração por volume de proposições de propósito: números absolutos
 * acompanham o tamanho da bancada, e pintar o mapa por eles sugeriria um
 * ranking que os dados não sustentam.
 */
export default function BrazilStateMap({
  selected,
  names,
  onSelect,
}: {
  selected: string | null;
  names: Record<string, string>;
  onSelect: (uf: string) => void;
}) {
  return (
    <svg viewBox={BRAZIL_MAP_VIEWBOX} role="group" aria-label="Mapa do Brasil por unidade federativa" className="h-auto w-full">
      {Object.entries(UF_SHAPES).map(([uf, shape]) => {
        const isSelected = uf === selected;

        return (
          <path
            key={uf}
            d={shape.path}
            role="button"
            tabIndex={0}
            aria-label={names[uf] ?? uf}
            aria-pressed={isSelected}
            onClick={() => onSelect(uf)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(uf);
              }
            }}
            className={`cursor-pointer stroke-white transition-colors outline-none focus-visible:fill-[#F07A00] ${
              isSelected ? 'fill-[#1B623A]' : 'fill-[#d9cdb5] hover:fill-[#b9c9a4]'
            }`}
            strokeWidth={2}
            strokeLinejoin="round"
          >
            <title>{names[uf] ?? uf}</title>
          </path>
        );
      })}

      {Object.entries(UF_SHAPES).map(([uf, shape]) =>
        HIDDEN_LABELS.has(uf) ? null : (
          <text
            key={`label-${uf}`}
            x={shape.labelX}
            y={shape.labelY}
            textAnchor="middle"
            dominantBaseline="central"
            aria-hidden="true"
            className={`pointer-events-none select-none text-[22px] font-bold ${
              uf === selected ? 'fill-white' : 'fill-[#5b513f]'
            }`}
          >
            {uf}
          </text>
        )
      )}
    </svg>
  );
}
