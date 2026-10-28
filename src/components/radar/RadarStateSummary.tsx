'use client';

import { Sparkles } from 'lucide-react';
import type { RadarOverviewState, RadarStateDetail } from '@/services/radarService';
import { stateColor, tint } from './radarPalette';
import { formatIndicator, periodPhrase } from './RadarParts';

function Stat({
  label,
  value,
  note,
  emptyLabel = 'Em preparação',
}: {
  label: string;
  value: string | null;
  note?: string;
  /** Texto quando não há número: "Em preparação" (ainda não calculado) ou "Indisponível" (fonte falhou). */
  emptyLabel?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-white/80 p-3 ring-1 ring-black/5">
      <dt className="text-[11px] font-bold uppercase leading-tight text-ink-soft">{label}</dt>
      <dd className={`mt-1 font-black tabular-nums ${value === null ? 'text-sm text-ink-soft' : 'text-xl text-ink'}`}>
        {value ?? emptyLabel}
      </dd>
      {note && <dd className="mt-0.5 text-[11px] leading-snug text-ink-soft">{note}</dd>}
    </div>
  );
}

/**
 * Resumo do estado selecionado: poucos números de alto valor. Dado ausente
 * aparece como "Em preparação", nunca como zero.
 */
export default function RadarStateSummary({
  detail,
  states,
  updating,
  onSelect,
}: {
  detail: RadarStateDetail;
  states: RadarOverviewState[];
  updating: boolean;
  onSelect: (uf: string) => void;
}) {
  const { state, ibge, camara, senado, period } = detail;
  const { color, onColor, flag } = stateColor(state.uf);
  const population = ibge.status === 'ok' ? ibge.values?.population ?? null : null;
  const populationMeta = ibge.indicators?.population;
  const camaraData = camara.status === 'ok' ? camara.data : null;
  const senadoData = senado.status === 'ok' ? senado.data : null;
  const topTopic = camaraData?.topics[0];
  const neighbors = states.filter((s) => s.region === state.region && s.uf !== state.uf);

  return (
    <section
      aria-labelledby="radar-estado-titulo"
      className="relative overflow-hidden rounded-2xl border border-[#e0d6c4] p-4 sm:p-5"
      style={{ backgroundColor: tint(color, 0.12) }}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: color }} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Região {state.region}</p>
          <h2 id="radar-estado-titulo" className="mt-0.5 flex flex-wrap items-center gap-2 text-2xl font-black leading-tight text-ink sm:text-3xl">
            {state.name}
            <span className="rounded-lg px-2 py-0.5 text-base font-black" style={{ backgroundColor: color, color: onColor }}>
              {state.uf}
            </span>
          </h2>
          <p className="mt-1 text-sm text-ink-soft" aria-live="polite">
            Período: <strong className="text-ink">{period.label}</strong>
            {updating && <span className="ml-2 text-xs font-semibold text-[#1B623A]">Atualizando…</span>}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat
          label="População"
          value={population === null ? null : formatIndicator(population, populationMeta?.unit ?? 'Pessoas')}
          note={populationMeta ? `IBGE, ${populationMeta.period}` : undefined}
          emptyLabel={ibge.status !== 'ok' && ibge.last_failed_at ? 'Indisponível no IBGE agora' : undefined}
        />
        <Stat
          label="Proposições na Câmara"
          value={camaraData ? camaraData.propositions.toLocaleString('pt-BR') : null}
          note={camaraData ? `PL e PEC de deputados, ${periodPhrase(period)}` : undefined}
        />
        <Stat
          label="Temas na Câmara"
          value={camaraData ? camaraData.topics.length.toLocaleString('pt-BR') : null}
          note={camaraData?.deputies != null ? `${camaraData.deputies} deputados autores` : undefined}
        />
        <Stat
          label="Proposições no Senado"
          value={senadoData ? senadoData.propositions.toLocaleString('pt-BR') : null}
          note={senadoData ? `${senadoData.senators.length} senadores em exercício` : undefined}
        />
      </dl>

      {topTopic && camaraData && camaraData.propositions > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-ink ring-1 ring-black/5">
          <Sparkles size={16} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color }} />
          <span>
            Na Câmara, o tema mais frequente nas proposições de deputados de {state.uf} {periodPhrase(period)} foi{' '}
            <strong>{topTopic.name}</strong>: {topTopic.count.toLocaleString('pt-BR')} de{' '}
            {camaraData.propositions.toLocaleString('pt-BR')} proposições ({topTopic.share.toLocaleString('pt-BR')}%).
          </span>
        </p>
      )}

      {neighbors.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Explore a região {state.region}</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {neighbors.map((s) => (
              <li key={s.uf}>
                <button
                  type="button"
                  onClick={() => onSelect(s.uf)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#e0d6c4] bg-white px-3 text-xs font-bold text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]"
                >
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stateColor(s.uf).color }} />
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {flag && (
        <p className="mt-3 text-[11px] text-ink-soft">
          Cor do estado no Radar inspirada na bandeira de {state.name} ({flag}) — só identifica o estado, não indica
          desempenho.
        </p>
      )}
    </section>
  );
}
