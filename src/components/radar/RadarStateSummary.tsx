'use client';

import type { RadarCamaraTopic, RadarOverviewState, RadarStateDetail } from '@/services/radarService';
import { SOURCE_COLORS, stateColor } from './radarPalette';
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
    <div className="min-w-0 py-1 sm:px-4 sm:first:pl-0">
      <dt className="text-[11px] font-bold uppercase leading-tight text-ink-soft">{label}</dt>
      <dd className={`mt-0.5 font-black tabular-nums ${value === null ? 'text-sm text-ink-soft' : 'text-lg text-ink'}`}>
        {value ?? emptyLabel}
      </dd>
      {note && <dd className="text-[11px] leading-snug text-ink-soft">{note}</dd>}
    </div>
  );
}

/**
 * Tema mais frequente na Câmara no estado e período escolhidos — o destaque
 * principal do resumo. Vem pronto da API (temas ordenados por contagem); aqui
 * só se lê o primeiro e se checa empate com os seguintes. Sem dado, diz por
 * quê — nunca inventa um tema.
 */
function TopTopic({ detail }: { detail: RadarStateDetail }) {
  const { camara, period, state } = detail;
  const data = camara.status === 'ok' ? camara.data : null;
  const label = (
    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
      Tema mais frequente na Câmara · {period.key === 'legislature' ? period.label : period.key}
    </p>
  );

  if (!data) {
    return (
      <div>
        {label}
        <p className="mt-1 text-sm text-ink-soft">
          {camara.last_failed_at
            ? 'Indisponível agora: a última consulta aos arquivos da Câmara falhou.'
            : 'Em preparação: os dados da Câmara deste período ainda estão sendo calculados.'}
        </p>
      </div>
    );
  }

  if (data.propositions === 0 || data.topics.length === 0) {
    return (
      <div>
        {label}
        <p className="mt-1 text-sm text-ink-soft">
          Nenhuma proposição de deputados de {state.uf} com tema oficial {periodPhrase(period)}.
        </p>
      </div>
    );
  }

  const top = data.topics[0];
  const tied: RadarCamaraTopic[] = data.topics.filter((t) => t.count === top.count);
  const share = top.share;

  return (
    <div>
      {label}
      <p className="mt-1 break-words font-heading text-2xl font-black leading-tight text-ink sm:text-3xl">
        {tied.length > 1 ? tied.map((t) => t.name).join(' · ') : top.name}
      </p>
      {tied.length > 1 && (
        <p className="mt-0.5 text-xs font-semibold text-[#7a4a00]">Empate entre {tied.length} temas com a mesma contagem.</p>
      )}
      <p className="mt-1.5 text-sm text-ink">
        <strong className="tabular-nums">{top.count.toLocaleString('pt-BR')}</strong> de{' '}
        <span className="tabular-nums">{data.propositions.toLocaleString('pt-BR')}</span> proposições
        {tied.length > 1 ? ' cada' : ''} · <strong className="tabular-nums">{share.toLocaleString('pt-BR')}%</strong>
      </p>
      {/* Barra = parte das proposições do período com este tema (o mesmo %). */}
      <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-[#ece5d6]" aria-hidden="true">
        <div className="h-full rounded-full" style={{ width: `${Math.max(share, 1)}%`, backgroundColor: SOURCE_COLORS.camara }} />
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
        Uma proposição pode ter vários temas, então os percentuais dos temas somam mais de 100%. Tema frequente mostra a
        atividade legislativa, não as prioridades da população.
      </p>
    </div>
  );
}

/**
 * Resumo do estado selecionado: identificação, o tema mais frequente em
 * destaque e poucos números de apoio. Dado ausente aparece como "Em
 * preparação" ou "Indisponível", nunca como zero.
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
  const neighbors = states.filter((s) => s.region === state.region && s.uf !== state.uf);

  return (
    <section aria-labelledby="radar-estado-titulo" className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Região {state.region}</p>
      <h2 id="radar-estado-titulo" className="mt-0.5 flex flex-wrap items-center gap-2 text-2xl font-black leading-tight text-ink sm:text-3xl">
        {state.name}
        <span className="rounded-md px-2 py-0.5 text-base font-black" style={{ backgroundColor: color, color: onColor }}>
          {state.uf}
        </span>
      </h2>
      <p className="mt-1 text-sm text-ink-soft" aria-live="polite">
        Período: <strong className="text-ink">{period.label}</strong>
        {updating && <span className="ml-2 text-xs font-semibold text-[#1B623A]">Atualizando…</span>}
      </p>

      <div className="mt-4 rounded-2xl bg-[#f7f3ea] px-4 py-4 sm:px-5">
        <TopTopic detail={detail} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-0 sm:divide-x sm:divide-line">
        <Stat
          label="População"
          value={population === null ? null : formatIndicator(population, populationMeta?.unit ?? 'Pessoas')}
          note={populationMeta ? `IBGE, ${populationMeta.period}` : undefined}
          emptyLabel={ibge.status !== 'ok' && ibge.last_failed_at ? 'Indisponível no IBGE agora' : undefined}
        />
        <Stat
          label="Proposições na Câmara"
          value={camaraData ? camaraData.propositions.toLocaleString('pt-BR') : null}
          note={camaraData?.deputies != null ? `de ${camaraData.deputies} deputados autores` : 'PL e PEC de deputados'}
        />
        <Stat label="Temas na Câmara" value={camaraData ? camaraData.topics.length.toLocaleString('pt-BR') : null} />
        <Stat
          label="Proposições no Senado"
          value={senadoData ? senadoData.propositions.toLocaleString('pt-BR') : null}
          note={senadoData ? `${senadoData.senators.length} senadores em exercício` : undefined}
        />
      </dl>

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
