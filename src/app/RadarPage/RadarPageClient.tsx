'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import LoadingState from '@/components/LoadingState';
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
          <section className="rounded-lg bg-[#1B623A] px-4 py-3 text-white sm:px-6 sm:py-4">
            <h1 className="text-lg font-black uppercase leading-tight tracking-tight sm:text-xl md:text-2xl">
              RADAR DO BRASIL
            </h1>
            <p className="mt-1 max-w-3xl text-xs leading-snug text-white/90 sm:text-sm">
              Escolha um estado para ver indicadores do IBGE e os temas mais frequentes nas proposições apresentadas
              pelos seus deputados federais e senadores.
            </p>
          </section>

          {methodology && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-[#e0d6c4] bg-[#f7f5f2] p-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
              <Info size={16} className="mt-0.5 shrink-0 text-[#1B623A]" />
              <span>{methodology.what_it_measures}</span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Período">
            {periodOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={option === period}
                onClick={() => setPeriod(option)}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${
                  option === period
                    ? 'border-[#1B623A] bg-[#1B623A] text-white'
                    : 'border-[#e0d6c4] bg-white text-[#1B623A] hover:bg-[#EDDBBA]/40'
                }`}
              >
                {periodLabel(option)}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-[#e0d6c4] bg-white p-3 sm:p-4">
                {overview.isLoading && !states ? (
                  <LoadingState message="Carregando o mapa..." />
                ) : (
                  <BrazilStateMap selected={selectedUf} names={names} onSelect={setSelectedUf} />
                )}

                <label className="mt-3 block text-xs font-bold uppercase text-ink-soft" htmlFor="radar-uf">
                  Ou escolha na lista
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
              </div>

              {overview.error && (
                <p role="alert" className="mt-3 text-sm text-[#8d0801]">
                  Não foi possível carregar o Radar agora. Tente novamente em instantes.
                </p>
              )}

              {methodology && (
                <details className="mt-4 rounded-2xl border border-[#e0d6c4] bg-white p-4 text-sm">
                  <summary className="cursor-pointer font-bold text-[#1B623A]">Como os números são calculados</summary>
                  <dl className="mt-3 space-y-3 text-[13px] leading-relaxed text-ink-soft">
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
                </details>
              )}
            </div>

            <div className="lg:col-span-3">
              <RadarStatePanel
                detail={detail.data}
                loading={detail.isLoading && !detail.data}
                error={
                  detail.error && !detail.data
                    ? 'Não foi possível carregar os dados deste estado agora. Tente novamente em instantes.'
                    : null
                }
              />
            </div>
          </div>
        </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
