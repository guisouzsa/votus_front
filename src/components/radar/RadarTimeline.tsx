'use client';

import { TrendingUp } from 'lucide-react';
import type { RadarOverview } from '@/services/radarService';
import { SOURCE_COLORS } from './radarPalette';
import { Pending, RadarCard } from './RadarParts';

interface YearPoint {
  year: number;
  /** null = sem número (ainda não calculado ou consulta falhou), nunca zero. */
  propositions: number | null;
  /** A consulta deste ano falhou (diferente de "em preparação" na API). */
  failed: boolean;
  topTopic: string | null;
}

const W = 420;
const H = 170;
const PAD_X = 34;
const PAD_TOP = 30;
const PAD_BOTTOM = 34;

/**
 * Proposições de deputados da UF por ano (Câmara), a partir da visão geral
 * de cada ano que a API já publica. Linha para a evolução, número escrito em
 * cada ponto e o tema mais frequente do ano — tudo também em texto.
 */
export default function RadarTimeline({
  uf,
  stateName,
  years,
  overviews,
  loading,
  selectedPeriod,
  onPickYear,
}: {
  uf: string;
  stateName: string;
  years: number[];
  overviews: (RadarOverview | null)[] | undefined;
  loading: boolean;
  selectedPeriod: string;
  onPickYear: (year: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const points: YearPoint[] = years.map((year, i) => {
    const overview = overviews?.[i];
    const state = overview?.camara.status === 'ok' ? overview.states.find((s) => s.uf === uf) : undefined;

    return {
      year,
      propositions: state?.camara ? state.camara.propositions : null,
      failed: Boolean(overviews) && overview === null,
      topTopic: state?.camara?.top_topics[0]?.name ?? null,
    };
  });
  const allFailed = points.length > 0 && points.every((p) => p.failed);
  const known = points.filter((p) => p.propositions !== null);
  const max = Math.max(1, ...known.map((p) => p.propositions!));
  const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / Math.max(1, years.length - 1);
  const y = (v: number) => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOTTOM);
  // Só liga anos consecutivos com número: um ano faltando quebra a linha, em
  // vez de sugerir uma continuidade que o dado não mostra.
  const segments = points.slice(1).flatMap((p, k) => {
    const prev = points[k];
    return prev.propositions === null || p.propositions === null
      ? []
      : [{ key: p.year, x1: x(k), y1: y(prev.propositions), x2: x(k + 1), y2: y(p.propositions) }];
  });

  return (
    <RadarCard
      id="radar-evolucao"
      title="Ano a ano na Câmara"
      source="Dados Abertos da Câmara"
      color={SOURCE_COLORS.camara}
      icon={<TrendingUp size={15} />}
    >
      {loading && !overviews ? (
        <div role="status" className="h-40 animate-pulse rounded-xl bg-[#eee6d8]">
          <span className="sr-only">Carregando a evolução anual...</span>
        </div>
      ) : allFailed ? (
        <p role="alert" className="rounded-xl bg-[#f7f5f2] p-3 text-sm text-[#8d0801]">
          Não foi possível carregar a evolução anual agora. Os demais dados do estado não são afetados.
        </p>
      ) : known.length === 0 ? (
        <Pending>A evolução anual ainda está sendo preparada. Volte em alguns minutos.</Pending>
      ) : (
        <>
          <p className="text-sm text-ink-soft">
            Proposições (PL e PEC) com tema oficial apresentadas por deputados de {stateName}, por ano. Toque em um ano para
            ver os temas dele.
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" aria-hidden="true">
            <line x1={PAD_X} x2={W - PAD_X} y1={H - PAD_BOTTOM} y2={H - PAD_BOTTOM} stroke="#e0d6c4" />
            {segments.map((s) => (
              <line key={s.key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={SOURCE_COLORS.camara} strokeWidth={3} strokeLinecap="round" />
            ))}
            {points.map((p, i) =>
              p.propositions === null ? null : (
                <g key={p.year}>
                  <circle
                    cx={x(i)}
                    cy={y(p.propositions)}
                    r={selectedPeriod === String(p.year) ? 7 : 5}
                    fill={selectedPeriod === String(p.year) ? SOURCE_COLORS.camara : '#ffffff'}
                    stroke={SOURCE_COLORS.camara}
                    strokeWidth={3}
                  />
                  <text x={x(i)} y={y(p.propositions) - 13} textAnchor="middle" className="fill-[#22201b] text-[13px] font-black">
                    {p.propositions.toLocaleString('pt-BR')}
                  </text>
                </g>
              ),
            )}
            {points.map((p, i) => (
              <text key={`ano-${p.year}`} x={x(i)} y={H - 12} textAnchor="middle" className="fill-[#6b6255] text-[12px] font-bold">
                {p.year}
                {p.year === currentYear ? '*' : ''}
              </text>
            ))}
          </svg>

          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Proposições e tema mais frequente por ano">
            {points.map((p) => {
              const active = selectedPeriod === String(p.year);

              return (
                <li key={p.year}>
                  <button
                    type="button"
                    onClick={() => onPickYear(String(p.year))}
                    aria-pressed={active}
                    className={`h-full w-full rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A] ${
                      active ? 'border-[#1B623A] bg-[#1B623A]/[0.07]' : 'border-[#e0d6c4] bg-white hover:border-[#1B623A]/40'
                    }`}
                  >
                    <span className="block text-xs font-black text-[#1B623A]">
                      {p.year}
                      {p.year === currentYear && <span className="font-semibold text-ink-soft"> (em curso)</span>}
                    </span>
                    <span className="block text-sm font-bold tabular-nums text-ink">
                      {p.propositions !== null
                        ? `${p.propositions.toLocaleString('pt-BR')} proposições`
                        : p.failed
                          ? 'Indisponível agora'
                          : 'Em preparação'}
                    </span>
                    {p.topTopic && <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">Mais frequente: {p.topTopic}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
            {years.includes(currentYear) && `* ${currentYear} ainda está em curso: o número vai crescer até o fim do ano. `}
            Cada proposição conta no ano em que foi apresentada; 2023 inclui janeiro, ainda na legislatura anterior. Só entram
            proposições que já receberam tema oficial da Câmara.
          </p>
        </>
      )}
    </RadarCard>
  );
}
