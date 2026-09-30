'use client';

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import Footer from '@/components/Footer';
import LegislatorFilterFrame from '@/components/LegislatorFilterFrame';
import LegislatorPhoto from '@/components/LegislatorPhoto';
import { LegislatorGridSkeleton } from '@/components/LegislatorCardSkeleton';
import Pagination from '@/components/Pagination';
import PageTransitionOverlay from '@/components/PageTransitionOverlay';
import StatCard from '@/components/StatCard';
import DataSourceNote from '@/components/DataSourceNote';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  CANDIDATE_OFFICES,
  getCandidates,
  type CandidateOfficeSlug,
  type CandidatesResponse,
} from '@/services/candidatesService';
import { ApiError } from '@/services/apiClient';
import { useSsrPaginatedList } from '@/hooks/useSsrPaginatedList';

const FILTROS_VAZIOS = { search: '', party: '' };
type Filtros = typeof FILTROS_VAZIOS;

// Filtros aplicados e página moram na URL (?partido=PT&busca=joao&pagina=2):
// ao abrir um candidato e voltar, a lista reaparece do jeito que estava, e o
// link filtrado pode ser compartilhado. Lidos só no navegador (no servidor o
// snapshot é vazio = sem filtro), pra página continuar em cache ISR — ver
// page.tsx. replaceState não avisa ninguém, daí o evento próprio.
const EVENTO_URL = 'votus:candidatos-url';

function assinarUrl(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener(EVENTO_URL, callback);

  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(EVENTO_URL, callback);
  };
}

const lerQueryAtual = () => window.location.search;
const lerQueryServidor = () => '';

function interpretarQuery(query: string): { filtros: Filtros; page: number } {
  const params = new URLSearchParams(query);

  return {
    filtros: { search: params.get('busca') ?? '', party: params.get('partido') ?? '' },
    page: Math.max(1, Math.floor(Number(params.get('pagina'))) || 1),
  };
}

function gravarNaUrl(filtros: Filtros, page: number) {
  const params = new URLSearchParams();
  if (filtros.search.trim()) params.set('busca', filtros.search.trim());
  if (filtros.party) params.set('partido', filtros.party);
  if (page > 1) params.set('pagina', String(page));

  const query = params.toString();
  window.history.replaceState(window.history.state, '', query ? `?${query}` : window.location.pathname);
  window.dispatchEvent(new Event(EVENTO_URL));
}

export default function CandidatosListClient({
  office,
  initialData,
}: {
  office: CandidateOfficeSlug;
  initialData?: CandidatesResponse;
}) {
  const config = CANDIDATE_OFFICES[office];

  const query = useSyncExternalStore(assinarUrl, lerQueryAtual, lerQueryServidor);
  const { filtros: aplicados, page } = useMemo(() => interpretarQuery(query), [query]);
  const semFiltro = !aplicados.search.trim() && !aplicados.party;

  // "filtros" é o que está digitado/selecionado nos campos; "aplicados" é o
  // que de fato foi pra API. Separados pra não disparar uma requisição a
  // cada tecla — só ao clicar em "Aplicar filtros" (ou Enter na busca).
  // Quando a URL muda (ex: voltar pra essa tela), os campos acompanham.
  const [filtros, setFiltros] = useState<Filtros>(aplicados);
  const [queryDosCampos, setQueryDosCampos] = useState(query);
  if (queryDosCampos !== query) {
    setQueryDosCampos(query);
    setFiltros(aplicados);
  }

  const {
    data: response,
    error: swrError,
    mutate,
    loading,
    isValidating,
  } = useSsrPaginatedList(
    ['candidatos', office, page, aplicados.party, aplicados.search.trim()],
    () => getCandidates(office, page, aplicados),
    // O que veio do servidor é só a página 1 sem filtro.
    page === 1 && semFiltro ? initialData : undefined
  );

  // A lista de partidos é a mesma pra qualquer página/filtro do cargo; com
  // keepPreviousData ela não some enquanto a próxima resposta carrega.
  const partidos = response?.filters?.parties ?? initialData?.filters?.parties ?? [];
  // Só Presidente e Governador são obrigados a registrar plano de governo no
  // TSE — nos demais cargos isso vem sempre 0, então a linha de estatística
  // só aparece quando fizer sentido (ver comPropostaByOffice no backend).
  const comProposta = response?.filters?.com_proposta ?? initialData?.filters?.com_proposta ?? 0;
  const comEnsinoSuperior = response?.filters?.com_ensino_superior ?? initialData?.filters?.com_ensino_superior ?? 0;
  // Só existe vice/suplente pra Presidente/Governador/Senador — Deputado
  // Federal/Estadual não tem chapa, então vem sempre 0 (ver comChapaByOffice).
  const comChapa = response?.filters?.com_chapa ?? initialData?.filters?.com_chapa ?? 0;
  const jaFoiParlamentar = response?.filters?.ja_foi_parlamentar ?? initialData?.filters?.ja_foi_parlamentar ?? 0;

  // As duas primeiras (Candidatos/Partidos) ficam sempre visíveis; estas
  // quatro só existem pra alguns cargos (chapa/plano de governo) e, mesmo
  // quando existem todas, 6 cardizinhos de uma vez ficava poluído — por
  // isso entram atrás de "Ver mais estatísticas" em vez de sempre visíveis.
  const estatisticasExtras = [
    comProposta > 0 && {
      value: comProposta.toString().padStart(2, '0'),
      label: 'Com plano de governo',
      valueColor: 'text-[#8d0801]',
      tooltip: (
        <p>
          Quantidade de candidatos que anexaram plano de governo no registro do TSE. Só é obrigatório para
          Presidente e Governador.
        </p>
      ),
    },
    {
      value: comEnsinoSuperior.toString().padStart(2, '0'),
      label: 'Ensino superior completo',
      valueColor: 'text-[#1B623A]',
      tooltip: <p>Quantidade de candidatos que declararam ensino superior completo ao TSE.</p>,
    },
    comChapa > 0 && {
      value: comChapa.toString().padStart(2, '0'),
      label: 'Com chapa completa',
      valueColor: 'text-[#F07A00]',
      tooltip: <p>Quantidade de candidatos com vice ou suplentes já registrados na chapa.</p>,
    },
    jaFoiParlamentar > 0 && {
      value: jaFoiParlamentar.toString().padStart(2, '0'),
      label: 'Já foi parlamentar',
      valueColor: 'text-[#8d0801]',
      tooltip: <p>Quantidade de candidatos que já foram eleitos antes, para qualquer cargo.</p>,
    },
  ].filter((item): item is Exclude<typeof item, false> => item !== false);

  const [mostrarEstatisticasExtras, setMostrarEstatisticasExtras] = useState(false);

  const setPage = (novaPagina: number) => gravarNaUrl(aplicados, novaPagina);

  function aplicarFiltros() {
    gravarNaUrl({ search: filtros.search.trim(), party: filtros.party }, 1);
  }

  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS);
    gravarNaUrl(FILTROS_VAZIOS, 1);
  }

  const error = swrError
    ? swrError instanceof ApiError
      ? `Não foi possível carregar os candidatos a ${config.label} agora. Tente novamente em instantes.`
      : 'Ocorreu um erro inesperado ao carregar os candidatos.'
    : null;

  const candidatos = response?.data ?? [];
  const lastPage = response?.meta.last_page ?? 1;
  const totalCandidatos = response?.meta.total ?? initialData?.meta.total;

  // Página inexistente (ex: URL editada à mão, ou um filtro reduziu o total
  // enquanto o usuário estava numa página alta) — volta pra última válida
  // em vez de mostrar uma lista vazia presa numa página que não existe.
  useEffect(() => {
    if (response && page > lastPage) {
      gravarNaUrl(aplicados, lastPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, page, lastPage]);

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="min-h-dvh">
          <div className="w-full px-6 py-8 sm:px-10">
            <section className="rounded-lg bg-[#1B623A] px-4 py-3 text-white sm:px-6 sm:py-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80 sm:text-xs">
                Eleições 2026
              </p>
              <h1 className="mt-0.5 text-lg font-black uppercase leading-tight tracking-tight sm:text-xl md:text-2xl">
                Candidatos 2026 a {config.label} {config.regiao}
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-snug text-white/90 sm:text-sm">
                Quem está concorrendo nas eleições de 2026, segundo o registro de candidaturas do TSE. Cada perfil
                traz partido, número na urna e, quando houver, a chapa completa (vice ou suplentes).
              </p>
            </section>

            {/* Abas por cargo: trocar de cargo sem voltar pra sidebar. */}
            <nav aria-label="Cargos em disputa em 2026" className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(Object.keys(CANDIDATE_OFFICES) as CandidateOfficeSlug[]).map((slug) => {
                const ativo = slug === office;
                return (
                  <Link
                    key={slug}
                    href={`/CandidatosPage/${slug}`}
                    // scroll={false}: trocar de cargo é uma navegação de
                    // verdade (rota /CandidatosPage/[office] muda) — sem
                    // isso o Next rolava a página de volta pro topo a cada
                    // clique, e no mobile isso parecia "a página voltou pro
                    // início" mesmo com o cargo certo já selecionado.
                    scroll={false}
                    aria-current={ativo ? 'page' : undefined}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                      ativo
                        ? 'border-brasil-green bg-brasil-green text-white'
                        : 'border-line bg-white text-ink hover:border-brasil-green/40 hover:text-brasil-green'
                    }`}
                  >
                    {CANDIDATE_OFFICES[slug].label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard
                value={totalCandidatos !== undefined ? String(totalCandidatos).padStart(2, '0') : '—'}
                label="Candidatos"
                valueColor="text-[#1B623A]"
                tooltip={<p>Quantidade de candidatos a {config.label} com candidatura deferida pelo TSE.</p>}
              />
              <StatCard
                value={partidos.length.toString().padStart(2, '0')}
                label="Partidos"
                valueColor="text-[#F07A00]"
                tooltip={<p>Quantidade de partidos diferentes com candidatos a {config.label} nesta lista.</p>}
              />
            </div>

            {estatisticasExtras.length > 0 && (
              <div className="mt-2">
                {mostrarEstatisticasExtras ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {estatisticasExtras.map((item) => (
                      <StatCard key={item.label} {...item} />
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMostrarEstatisticasExtras(true)}
                    className="text-xs font-semibold text-[#1b623a] underline underline-offset-2"
                  >
                    Ver mais estatísticas
                  </button>
                )}
              </div>
            )}

            <LegislatorFilterFrame
              searchValue={filtros.search}
              onSearchChange={(value) => setFiltros((atual) => ({ ...atual, search: value }))}
              searchPlaceholder="Pesquisar por nome, partido ou número..."
              partyValue={filtros.party}
              onPartyChange={(value) => setFiltros((atual) => ({ ...atual, party: value }))}
              partyOptions={partidos}
              onApply={aplicarFiltros}
              onClear={limparFiltros}
              busy={isValidating && !loading}
            />

            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black uppercase text-[#f07a00] sm:text-2xl md:text-3xl">
                  {config.label.toUpperCase()}
                </h2>
                <Pagination page={page} lastPage={lastPage} onChange={setPage} />
              </div>

              {loading && <LegislatorGridSkeleton />}

              {!loading && error && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                  <p className="text-sm font-semibold text-[#8d0801]">{error}</p>
                  <button
                    type="button"
                    onClick={() => mutate()}
                    className="mt-1 rounded-full bg-[#8d0801] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {!loading && !error && candidatos.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                  <p className="text-sm font-bold text-[#8d0801]">Nenhum candidato encontrado</p>
                  {semFiltro ? (
                    <p className="text-xs text-[#4d4d4d]">Os dados desta candidatura ainda não foram publicados.</p>
                  ) : (
                    <>
                      <p className="text-xs text-[#4d4d4d]">Nenhum resultado para os filtros aplicados.</p>
                      <button
                        type="button"
                        onClick={limparFiltros}
                        className="mt-2 rounded-full border border-[#8d0801] px-4 py-2 text-xs font-semibold text-[#8d0801]"
                      >
                        Limpar filtros
                      </button>
                    </>
                  )}
                </div>
              )}

              {!loading && !error && candidatos.length > 0 && (
                <div className="relative">
                  {isValidating && <PageTransitionOverlay />}
                  <div
                    aria-busy={isValidating}
                    className={`grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 md:grid-cols-[repeat(5,minmax(0,1fr))] md:gap-5 ${
                      isValidating ? 'opacity-60' : ''
                    }`}
                  >
                  {candidatos.map((candidato) => (
                    <Link
                      key={candidato.id}
                      href={`/CandidatosPage/${office}/${candidato.id}`}
                      aria-label={`Ver detalhes de ${candidato.ballot_name}`}
                      className="flex h-full flex-col overflow-hidden rounded-[12px] border border-[#e0d6c4] bg-white shadow-sm"
                    >
                      <div className="flex h-36 shrink-0 items-center justify-center bg-white p-3 sm:h-44 sm:p-4 md:h-56">
                        <div className="relative h-full w-full overflow-hidden bg-white">
                          <div className="absolute inset-2 sm:inset-3">
                            <LegislatorPhoto
                              src={candidato.photo_url}
                              alt={`Foto de ${candidato.ballot_name}`}
                              fallbackSrc={config.fallbackPhoto}
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#e0d6c4]">
                        <div className="flex flex-1 flex-col justify-center bg-white p-3 pb-4 text-center sm:p-4 sm:pb-5">
                          <div className="text-sm font-black uppercase text-[#1b623a] sm:text-base md:text-xl">
                            {candidato.ballot_name}
                          </div>
                          <div className="mt-1 text-xs text-[#4d4d4d] sm:text-sm">
                            {candidato.party.acronym ?? '—'}
                          </div>
                          {/* Mesma 3ª linha (Estado) do card de cargos atuais
                              (Senadores/Deputados) — mantém os dois tipos de
                              card consistentes. */}
                          <div className="mt-2 text-xs font-medium text-[#4d4d4d] sm:text-sm">
                            {candidato.state ?? '—'}
                          </div>
                          <div className="mt-2 text-xs font-medium text-[#4d4d4d] sm:text-sm">
                            Nº {candidato.ballot_number ?? '—'}
                          </div>
                          {candidato.judgment_status && (
                            <div className="mt-2 inline-block self-center rounded-full border border-[#e0d6c4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1b623a]">
                              {candidato.judgment_status}
                            </div>
                          )}
                        </div>

                        <div className="h-3 w-full shrink-0 bg-[url('/sidebar.svg')] bg-repeat-x bg-[length:auto_100%]" />
                      </div>
                    </Link>
                  ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Pagination page={page} lastPage={lastPage} onChange={setPage} />
              </div>

            </div>

            <div className="mt-10">
              <DataSourceNote variant="prominent" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
      <FloatingAIButton />
    </div>
  );
}
