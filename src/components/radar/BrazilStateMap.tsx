'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { UF_SHAPES } from '@/data/brazilUfShapes';
import { INK, stateColor, tint } from './radarPalette';

// A malha ocupa 0..1000 na horizontal; a faixa extra à direita é oceano,
// onde ficam as siglas externas do litoral do Nordeste.
const VIEW_W = 1090;
const VIEW_H = 1027;

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

// Tons: clareado nos demais estados, mais forte sob o cursor/foco e cheio no
// selecionado — a seleção nunca depende só da cor (contorno escuro também).
const DEFAULT_TINT = 0.5;
const HOVER_TINT = 0.78;

// Ordem fixa dos <path>: reordenar o DOM tiraria o foco do teclado. Os
// contornos de destaque vão numa camada por cima (ver "Destaques").
const UFS = Object.keys(UF_SHAPES);

type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

// Próximo estado na direção da seta: o centro mais próximo dentro de um cone
// de 45° para aquele lado. Assim as setas "andam" pelo mapa.
function neighbor(from: string, direction: Direction): string | null {
  const origin = UF_SHAPES[from];
  let best: { uf: string; score: number } | null = null;

  for (const [uf, shape] of Object.entries(UF_SHAPES)) {
    if (uf === from) continue;
    const dx = shape.labelX - origin.labelX;
    const dy = shape.labelY - origin.labelY;
    const [main, side] =
      direction === 'ArrowRight' ? [dx, dy] : direction === 'ArrowLeft' ? [-dx, dy] : direction === 'ArrowDown' ? [dy, dx] : [-dy, dx];
    if (main <= 0 || Math.abs(side) > main) continue;
    const score = main + Math.abs(side) * 2;
    if (!best || score < best.score) best = { uf, score };
  }

  return best?.uf ?? null;
}

export interface MapStateInfo {
  name: string;
  region: string;
  /** Uma ou duas linhas de resumo no tooltip (ex.: população, proposições). */
  facts?: string[];
}

/**
 * Mapa das 27 UFs a partir da malha oficial do IBGE (src/data/brazilUfShapes.ts).
 * Cada UF tem a cor da paleta do Radar (radarPalette.ts, inspirada nas
 * bandeiras estaduais) — identidade, não dado: o mapa não é colorido por
 * volume de proposições, que acompanha o tamanho da bancada e sugeriria um
 * ranking que os dados não sustentam.
 *
 * Teclado: Tab entra no mapa pelo estado selecionado; as setas andam entre
 * estados vizinhos e Enter/Espaço seleciona. O seletor em lista ao lado é a
 * alternativa ao mapa.
 */
export default function BrazilStateMap({
  selected,
  states,
  onSelect,
}: {
  selected: string;
  states: Record<string, MapStateInfo>;
  onSelect: (uf: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const refs = useRef<Record<string, SVGPathElement | null>>({});

  // Estado em destaque no tooltip: o do foco (teclado) tem prioridade.
  const active = focused ?? hovered;


  const label = (uf: string) => {
    const info = states[uf];
    return info ? [`${info.name} (${uf}), região ${info.region}`, ...(info.facts ?? [])].join('. ') : uf;
  };

  const onKeyDown = (event: KeyboardEvent, uf: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(uf);
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = neighbor(uf, event.key);
      if (next) refs.current[next]?.focus();
    }
  };

  const fillOf = (uf: string) => {
    const { color } = stateColor(uf);
    if (uf === selected) return color;
    return tint(color, uf === active ? HOVER_TINT : DEFAULT_TINT);
  };

  const tooltip = active ? UF_SHAPES[active] : null;
  const tipX = tooltip ? ((CALLOUTS[active!]?.x ?? tooltip.labelX) / VIEW_W) * 100 : 0;
  const tipY = tooltip ? ((CALLOUTS[active!]?.y ?? tooltip.labelY) / VIEW_H) * 100 : 0;

  return (
    <div className="relative" onPointerLeave={() => setHovered(null)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="group"
        aria-label="Mapa do Brasil: escolha um estado. Use as setas para navegar e Enter para selecionar."
        className="h-auto w-full drop-shadow-[0_6px_14px_rgba(34,32,27,0.12)]"
      >
        {UFS.map((uf) => {
          const isSelected = uf === selected;

          return (
            <path
              key={uf}
              ref={(el) => {
                refs.current[uf] = el;
              }}
              d={UF_SHAPES[uf].path}
              role="button"
              tabIndex={isSelected ? 0 : -1}
              aria-label={label(uf)}
              aria-pressed={isSelected}
              onClick={() => onSelect(uf)}
              onKeyDown={(event) => onKeyDown(event, uf)}
              onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(uf)}
              onFocus={() => setFocused(uf)}
              onBlur={() => setFocused((f) => (f === uf ? null : f))}
              fill={fillOf(uf)}
              stroke="#ffffff"
              strokeWidth={1.6}
              strokeLinejoin="round"
              className="cursor-pointer outline-none motion-safe:transition-[fill] motion-safe:duration-200"
            />
          );
        })}

        {/* Destaques: contorno do estado sob o cursor/foco (tracejado no foco
            do teclado) e do selecionado, desenhados acima dos vizinhos. */}
        <g aria-hidden="true" className="pointer-events-none" fill="none" strokeLinejoin="round">
          {active && active !== selected && (
            <path d={UF_SHAPES[active].path} stroke="#3d382f" strokeWidth={3} strokeDasharray={focused === active ? '10 6' : undefined} />
          )}
          <path d={UF_SHAPES[selected].path} stroke={INK} strokeWidth={4.5} strokeDasharray={focused === selected ? '14 6' : undefined} />
        </g>

        {Object.entries(UF_SHAPES).map(([uf, shape]) => {
          if (CALLOUTS[uf]) return null;
          const isSelected = uf === selected;

          return (
            <text
              key={`label-${uf}`}
              x={shape.labelX}
              y={shape.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              aria-hidden="true"
              fill={isSelected ? stateColor(uf).onColor : '#2f2a22'}
              className={`pointer-events-none select-none font-black ${isSelected ? 'text-[26px]' : 'text-[21px]'}`}
            >
              {uf}
            </text>
          );
        })}

        {Object.entries(CALLOUTS).map(([uf, { from, x, y }]) => {
          const isSelected = uf === selected;
          const { color, onColor } = stateColor(uf);

          return (
            <g
              key={`callout-${uf}`}
              aria-hidden="true"
              onClick={() => onSelect(uf)}
              onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(uf)}
              className="cursor-pointer"
            >
              <line x1={from[0]} y1={from[1]} x2={x - 4} y2={y} stroke={isSelected ? INK : '#8a7d66'} strokeWidth={isSelected ? 2.5 : 1.5} />
              <circle cx={from[0]} cy={from[1]} r={isSelected ? 5 : 3.5} fill={isSelected ? INK : '#5b513f'} />
              {/* Pílula maior que o texto: alvo de toque confortável para os estados pequenos. */}
              <rect
                x={x - 6}
                y={y - 17}
                width={50}
                height={34}
                rx={17}
                fill={isSelected ? color : uf === active ? tint(color, HOVER_TINT) : tint(color, 0.35)}
                stroke={isSelected ? INK : 'none'}
                strokeWidth={2.5}
              />
              <text
                x={x + 19}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? onColor : '#2f2a22'}
                className="select-none text-[20px] font-black"
              >
                {uf}
              </text>
            </g>
          );
        })}
      </svg>

      {active && states[active] && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 w-max max-w-[min(15rem,44%)] rounded-xl border border-[#e0d6c4] bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${tipX}%`,
            top: `${tipY}%`,
            // Abre para o lado com mais espaço e cabe na metade livre do mapa
            // (largura máx. 44%); perto do topo (RR, AP) abre para baixo e
            // perto da base (Sul), para cima.
            transform: `translate(${tipX > 50 ? 'calc(-100% - 14px)' : '14px'}, ${tipY < 20 ? '8px' : tipY > 70 ? 'calc(-100% - 8px)' : '-50%'})`,
          }}
        >
          <p className="flex items-center gap-1.5 font-black text-ink">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stateColor(active).color }} />
            {states[active].name} ({active})
          </p>
          <p className="text-[11px] text-ink-soft">Região {states[active].region}</p>
          {states[active].facts?.map((fact) => (
            <p key={fact} className="mt-0.5 text-[11px] font-semibold text-ink">
              {fact}
            </p>
          ))}
          {active !== selected && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#1B623A]">Clique ou Enter para ver</p>}
        </div>
      )}
    </div>
  );
}
