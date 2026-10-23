'use client';

import { UF_SHAPES } from '@/data/brazilUfShapes';

// A malha ocupa 0..1000 na horizontal; a faixa extra à direita é oceano,
// onde ficam as siglas externas do litoral do Nordeste.
const VIEWBOX = '0 0 1090 1027';

// UFs estreitas demais para a sigla caber dentro do contorno: no litoral do
// Nordeste a sigla de uma invadia as vizinhas. A sigla vai para fora (no
// oceano, ou num ponto livre no caso do DF), ligada à UF por uma linha, como
// em mapa impresso. `from` = ponto dentro da UF onde a linha começa; `x/y` =
// posição da sigla. A sigla externa também é clicável.
const CALLOUTS: Record<string, { from: [number, number]; x: number; y: number }> = {
  RN: { from: [980, 292], x: 1030, y: 262 },
  PB: { from: [985, 326], x: 1030, y: 300 },
  PE: { from: [975, 358], x: 1030, y: 338 },
  AL: { from: [970, 392], x: 1030, y: 376 },
  SE: { from: [948, 418], x: 1030, y: 414 },
  ES: { from: [862, 654], x: 925, y: 650 },
  RJ: { from: [812, 722], x: 890, y: 768 },
  DF: { from: [668, 554], x: 700, y: 508 },
};

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
    <svg viewBox={VIEWBOX} role="group" aria-label="Mapa do Brasil por unidade federativa" className="h-auto w-full">
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
        CALLOUTS[uf] ? null : (
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

      {Object.entries(CALLOUTS).map(([uf, { from, x, y }]) => {
        const isSelected = uf === selected;

        return (
          <g key={`callout-${uf}`} aria-hidden="true" onClick={() => onSelect(uf)} className="cursor-pointer">
            <line
              x1={from[0]}
              y1={from[1]}
              x2={x - 4}
              y2={y}
              className={isSelected ? 'stroke-[#1B623A]' : 'stroke-[#8a7d66]'}
              strokeWidth={1.5}
            />
            <circle cx={from[0]} cy={from[1]} r={3} className={isSelected ? 'fill-white' : 'fill-[#5b513f]'} />
            <text
              x={x}
              y={y}
              dominantBaseline="central"
              className={`select-none text-[20px] font-bold ${
                isSelected ? 'fill-[#1B623A] underline' : 'fill-[#5b513f] hover:fill-[#1B623A]'
              }`}
            >
              {uf}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
