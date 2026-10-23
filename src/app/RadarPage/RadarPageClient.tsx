'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import PageHeader from '@/components/PageHeader';
import BrazilStateMap from '@/components/radar/BrazilStateMap';
import RadarStatePanel from '@/components/radar/RadarStatePanel';
import { useSsrDetail } from '@/hooks/useSsrDetail';
import { getRadarOverview, getRadarState, type RadarOverview } from '@/services/radarService';

// O Votus nasceu no Ceará: é a UF aberta por padrão.
const DEFAULT_UF = 'CE';
const DEFAULT_PERIOD = 'legislature';

function periodLabel(option: string): string {
  return option === 'legislature' ? 'Legislatura' : option;
}

export default function RadarPageClient({ initialData }: { initialData?: RadarOverview }) {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [selectedUf, setSelectedUf] = useState(DEFAULT_UF);

  // Período padrão já vem do servidor (page.tsx); os outros buscam no client.
  const overview = useSsrDetail(
    ['radar', period],
    () => getRadarOverview(period),
    period === DEFAULT_PERIOD ? initialData : undefined
  );

  const detail = useSWR(['radar', selectedUf, period], () => getRadarState(selectedUf, period), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const states = overview.data?.states;
  const names = useMemo(
    () => Object.fromEntries((states ?? []).map((s) => [s.uf, s.name])),
    [states]
  );
  const periodOptions = overview.data?.period.options ?? [DEFAULT_PERIOD];
  const methodology = overview.data?.methodology;

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-4 py-8 sm:px-10">
          <PageHeader
            eyebrow="Dados públicos"
            title="Radar do Brasil"
            description="Escolha um estado para ver indicadores do IBGE e os temas mais frequentes nas proposições apresentadas pelos seus deputados federais e senadores."
            note={
              methodology?.what_it_measures ??
              'Temas mais frequentes nas proposições dos parlamentares de cada estado. Mostra a atividade legislativa, não as prioridades da população.'
            }
            noteDetailsLabel="Como os números são calculados"
            noteDetails={
              methodology && (
                <dl className="space-y-2">
                  <div>
                    <dt className="font-bold text-ink">Siglas</dt>
                    <dd>
                      PL = projeto de lei; PEC = proposta de emenda à Constituição; UF = unidade federativa (estado ou
                      Distrito Federal); IBGE = Instituto Brasileiro de Geografia e Estatística.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">Câmara dos Deputados</dt>
                    <dd>{methodology.camara}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">Senado Federal</dt>
                    <dd>{methodology.senado}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">Vários temas</dt>
                    <dd>{methodology.multiple_topics}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">Períodos</dt>
                    <dd>{methodology.periods}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">IBGE</dt>
                    <dd>{methodology.ibge}</dd>
                  </div>
                </dl>
              )
            }
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span id="radar-periodo" className="mr-1 text-xs font-bold uppercase text-ink-soft">
              Período
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="radar-periodo">
              {periodOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={option === period}
                  onClick={() => setPeriod(option)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                    option === period
                      ? 'border-[#1B623A] bg-[#1B623A] text-white'
                      : 'border-[#e0d6c4] bg-white text-[#1B623A] hover:bg-[#EDDBBA]/40'
                  }`}
                >
                  {periodLabel(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div>
              <div className="rounded-2xl border border-[#e0d6c4] bg-white p-3 sm:p-4 lg:sticky lg:top-4">
                <label className="block text-xs font-bold uppercase text-ink-soft" htmlFor="radar-uf">
                  Estado
                </label>
                <select
                  id="radar-uf"
                  value={selectedUf}
                  onChange={(event) => setSelectedUf(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#e0d6c4] bg-white px-3 py-2 text-sm font-semibold text-ink"
                >
                  {(states ?? []).map((s) => (
                    <option key={s.uf} value={s.uf}>
                      {s.name} ({s.uf})
                    </option>
                  ))}
                </select>

                <div className="mt-3">
                  {overview.isLoading && !states ? (
                    <div className="aspect-[1090/1027] w-full animate-pulse rounded-xl bg-[#eee6d8]" role="status">
                      <span className="sr-only">Carregando o mapa...</span>
                    </div>
                  ) : (
                    <BrazilStateMap selected={selectedUf} names={names} onSelect={setSelectedUf} />
                  )}
                </div>

                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft" aria-label="Legenda do mapa">
                  <li className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-[#1B623A]" aria-hidden="true" /> Estado selecionado
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-[#d9cdb5]" aria-hidden="true" /> Demais estados
                  </li>
                  <li>O mapa serve para escolher o estado: as cores não representam números.</li>
                </ul>
              </div>

              {overview.error && !states && (
                <div role="alert" className="mt-3 text-sm">
                  <p className="text-[#8d0801]">Não foi possível carregar o mapa agora.</p>
                  <button type="button" onClick={() => overview.mutate()} className="mt-1 font-bold text-[#1B623A] underline">
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>

            <div>
              <RadarStatePanel
                detail={detail.data}
                loading={detail.isLoading && !detail.data}
                updating={detail.isValidating && Boolean(detail.data)}
                error={
                  detail.error && !detail.data
                    ? 'Não foi possível carregar os dados deste estado agora.'
                    : null
                }
                onRetry={() => detail.mutate()}
              />
            </div>
          </div>
        </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
