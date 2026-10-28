'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { ChevronDown, Info, RotateCcw } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import BrazilStateMap, { type MapStateInfo } from '@/components/radar/BrazilStateMap';
import RadarIndicators from '@/components/radar/RadarIndicators';
import RadarLegislative from '@/components/radar/RadarLegislative';
import RadarStateSummary from '@/components/radar/RadarStateSummary';
import RadarTimeline from '@/components/radar/RadarTimeline';
import { formatIndicator } from '@/components/radar/RadarParts';
import { stateColor } from '@/components/radar/radarPalette';
import { useSsrDetail } from '@/hooks/useSsrDetail';
import { getRadarOverview, getRadarState, type RadarOverview } from '@/services/radarService';

// O Votus nasceu no Ceará: é a UF aberta por padrão.
const DEFAULT_UF = 'CE';
const DEFAULT_PERIOD = 'legislature';

function periodLabel(option: string): string {
  return option === 'legislature' ? 'Legislatura toda' : option;
}

// Esqueleto do painel do estado, no padrão dos skeletons do Votus.
function PanelSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className="space-y-4">
      <p className="text-sm font-semibold text-[#1B623A]">{label}</p>
      <div className="animate-pulse space-y-4" aria-hidden="true">
        <div className="h-8 w-2/3 rounded-lg bg-[#eee6d8]" />
        <div className="h-36 rounded-2xl bg-[#eee6d8]" />
        <div className="h-72 rounded-2xl bg-[#eee6d8]" />
      </div>
    </div>
  );
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

  const periodOptions = useMemo(
    () => overview.data?.period.options ?? initialData?.period.options ?? [DEFAULT_PERIOD],
    [overview.data, initialData]
  );
  const years = useMemo(() => periodOptions.filter((o) => o !== 'legislature').map(Number), [periodOptions]);

  // Evolução anual: a visão geral de cada ano (as mesmas respostas usadas
  // ao escolher um ano no período). Um ano que falhar vira "em preparação".
  const timeline = useSWR(
    years.length > 0 ? ['radar-timeline', years.join(',')] : null,
    () => Promise.all(years.map((y) => getRadarOverview(String(y)).catch(() => null))),
    { revalidateOnFocus: false }
  );

  const states = overview.data?.states ?? initialData?.states;
  const methodology = overview.data?.methodology ?? initialData?.methodology;

  // Nome, região e um resumo curto para o tooltip e o nome acessível de cada UF.
  const mapStates = useMemo<Record<string, MapStateInfo>>(
    () =>
      Object.fromEntries(
        (states ?? []).map((s) => {
          const facts: string[] = [];
          if (s.indicators?.population != null) facts.push(`População: ${formatIndicator(s.indicators.population, 'Pessoas')}`);
          if (s.camara) facts.push(`${s.camara.propositions.toLocaleString('pt-BR')} proposições na Câmara`);
          return [s.uf, { name: s.name, region: s.region, facts }];
        })
      ),
    [states]
  );

  const selectedName = mapStates[selectedUf]?.name ?? selectedUf;
  // keepPreviousData: enquanto o novo estado (ou período) carrega, o painel
  // anterior fica esmaecido, com aviso — nunca com o nome errado sem aviso.
  // Se a nova consulta falhar, o SWR continua devolvendo o dado anterior;
  // por isso o erro é checado também quando o dado exibido é de outra seleção.
  const shownDetail = detail.data;
  const stale = Boolean(shownDetail && (shownDetail.state.uf !== selectedUf || shownDetail.period.key !== period));
  const failed = Boolean(detail.error) && (!shownDetail || stale);

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-4 py-8 sm:px-10">
          {/* Cabeçalho padrão das páginas do Votus (Inicial, Notícias, Transparência...). */}
          <DashboardHeader
            titleText="Radar do Brasil"
            titleColor="text-brasil-green"
            subtitle="Explore seu estado, descubra o que seus representantes estão propondo e conheça indicadores da realidade local."
          />
          <p className="mt-3 flex max-w-3xl items-start gap-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
            <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[#1B623A]" />
            <span>
              {methodology?.what_it_measures ??
                'Temas mais frequentes nas proposições dos parlamentares de cada estado. Mostra a atividade legislativa, não as prioridades da população.'}{' '}
              <a href="#radar-metodologia" className="font-semibold text-[#1B623A] underline underline-offset-2">
                Como os números são calculados
              </a>
            </span>
          </p>

          {/* Faixa 1: mapa e resumo do estado lado a lado, em metades — as duas
              colunas têm altura parecida, então não sobra vazio sob o mapa. As
              demais seções usam a largura toda logo abaixo. */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start xl:gap-10">
            {/* Exploração: mapa (protagonista), seletor e período. */}
            <section aria-labelledby="radar-explorar">
              <div className="rounded-3xl bg-[radial-gradient(circle_at_30%_20%,#ffffff_0%,#fbf6ec_60%,#f4ecdc_100%)] p-3 sm:p-5">
                <h2 id="radar-explorar" className="text-sm font-black uppercase tracking-wide text-[#1B623A]">
                  Escolha um estado
                </h2>

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="block min-w-0 text-[11px] font-bold uppercase tracking-wide text-ink-soft" htmlFor="radar-uf">
                    Estado
                    <span className="relative mt-1 block">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: stateColor(selectedUf).color }}
                      />
                      <select
                        id="radar-uf"
                        value={selectedUf}
                        onChange={(event) => setSelectedUf(event.target.value)}
                        className="h-10 w-full appearance-none rounded-full border border-[#EDDBBA] bg-[#FDF8EE] pl-9 pr-9 text-sm font-semibold normal-case tracking-normal text-ink outline-none focus:ring-2 focus:ring-[#1B623A]/30"
                      >
                        {(states ?? []).map((s) => (
                          <option key={s.uf} value={s.uf}>
                            {s.name} ({s.uf})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1B623A]" />
                    </span>
                  </label>

                  <div>
                    <span id="radar-periodo" className="block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                      Período
                    </span>
                    <div
                      role="radiogroup"
                      aria-labelledby="radar-periodo"
                      className="mt-1 flex max-w-full gap-1 overflow-x-auto rounded-full border border-[#EDDBBA] bg-[#FDF8EE] p-1 scrollbar-hide"
                    >
                      {periodOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={option === period}
                          onClick={() => setPeriod(option)}
                          className={`h-8 shrink-0 rounded-full px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1B623A] ${
                            option === period ? 'bg-[#1B623A] text-white' : 'text-[#1B623A] hover:bg-[#EDDBBA]/60'
                          }`}
                        >
                          {periodLabel(option)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {overview.isLoading && !states ? (
                    <div className="aspect-[1090/1027] w-full animate-pulse rounded-2xl bg-[#eee6d8]" role="status">
                      <span className="sr-only">Carregando o mapa...</span>
                    </div>
                  ) : (
                    <BrazilStateMap selected={selectedUf} states={mapStates} onSelect={setSelectedUf} />
                  )}
                </div>

                {overview.error && !states && (
                  <div role="alert" className="mt-2 text-sm">
                    <p className="text-[#8d0801]">Não foi possível carregar os dados do mapa agora.</p>
                    <button type="button" onClick={() => overview.mutate()} className="mt-1 font-bold text-[#1B623A] underline">
                      Tentar novamente
                    </button>
                  </div>
                )}

                <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                  Toque ou clique num estado (no teclado: setas para andar, Enter para escolher). As cores são inspiradas nas
                  bandeiras estaduais e só identificam cada estado — não representam números.
                </p>
              </div>
            </section>

            {/* Resumo do estado selecionado, com o tema principal em destaque. */}
            <div className="min-w-0">
              {failed ? (
                <div role="alert" className="rounded-2xl border border-[#e0d6c4] bg-white p-5 text-sm">
                  <p className="font-semibold text-[#8d0801]">Não foi possível carregar os dados de {selectedName} agora.</p>
                  <p className="mt-1 text-ink-soft">Pode ser uma instabilidade momentânea do servidor.</p>
                  <button
                    type="button"
                    onClick={() => detail.mutate()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1B623A] px-4 py-2 text-xs font-bold text-white hover:bg-[#103D23]"
                  >
                    <RotateCcw size={14} aria-hidden="true" /> Tentar novamente
                  </button>
                </div>
              ) : !shownDetail || stale ? (
                // Enquanto o estado/período novo carrega, nada do anterior
                // fica na tela: nem o tema nem os números de outra seleção.
                <PanelSkeleton label={`Carregando ${selectedName}${period === 'legislature' ? ' (legislatura toda)' : ` (${period})`}…`} />
              ) : (
                <RadarStateSummary
                  detail={shownDetail}
                  states={states ?? []}
                  updating={detail.isValidating}
                  onSelect={setSelectedUf}
                />
              )}
            </div>
          </div>

          {/* Só com o dado do estado/período atual na tela: durante a troca ou
              num erro, o esqueleto e o aviso acima bastam. */}
          {shownDetail && !stale && !failed && (
            <>
              {/* Faixa 2: Câmara e Senado lado a lado, na largura toda. */}
              <div className="mt-10">
                <RadarLegislative detail={shownDetail} />
              </div>

              {/* Faixa 3: evolução anual (mais larga) e indicadores do IBGE. */}
              <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <RadarTimeline
                  uf={shownDetail.state.uf}
                  stateName={shownDetail.state.name}
                  years={years}
                  overviews={timeline.data}
                  loading={timeline.isLoading}
                  selectedPeriod={period}
                  onPickYear={setPeriod}
                />
                <RadarIndicators detail={shownDetail} />
              </div>
            </>
          )}

          {/* Faixa 4: metodologia, recolhida, sem moldura. */}
          <div className="mt-10">
              {methodology && (
                <details id="radar-metodologia" className="group border-y border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B623A]">
                    Como os números são calculados
                    <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-[#1B623A] transition-transform group-open:rotate-180" />
                  </summary>
                  <dl className="grid grid-cols-1 gap-x-10 gap-y-3 border-t border-line py-4 text-sm leading-relaxed text-ink-soft lg:grid-cols-2">
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
                    <div>
                      <dt className="font-bold text-ink">Limites</dt>
                      <dd>
                        Proposição apresentada não é proposição aprovada, e tema frequente não é o mesmo que prioridade da
                        população. O Radar não cria notas nem rankings de estados.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-ink">Cores do mapa</dt>
                      <dd>
                        Escolha de design do Votus inspirada nas bandeiras estaduais, conforme a publicação do IBGE{' '}
                        <a
                          href="https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv101632.pdf"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-semibold text-[#1B623A] underline underline-offset-2"
                        >
                          “A Bandeira do Brasil e outros símbolos nacionais”
                        </a>
                        . Não são cores oficiais dos estados e não representam dados.
                      </dd>
                    </div>
                  </dl>
                </details>
              )}
          </div>
        </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
