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
import { useMemo, useState, useSyncExternalStore } from 'react';
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
  // A API não faz mais a query de contar o total (ver getCandidates) — sem
  // "last_page" pronto, estimamos pelo link "next": se não tem próxima
  // página, a atual já é a última.
  const lastPage = response?.links.next ? page + 1 : page;

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="min-h-dvh">
          <div className="w-full px-6 py-8 sm:px-10">
            <section className="overflow-hidden rounded-[10px] bg-[#1B623A] text-white shadow-sm">
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 sm:text-sm">
                    Eleições 2026
                  </p>
                  <h1 className="mt-1 text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl md:text-4xl md:leading-none">
                    Candidatos 2026 a {config.label} {config.regiao}
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base md:text-xl">
                    Quem está concorrendo nas eleições de 2026, segundo o registro de candidaturas do TSE. Cada perfil
                    traz partido, número na urna e, quando houver, a chapa completa (vice ou suplentes).
                  </p>
                </div>
              </div>
            </section>

            {/* Abas por cargo: trocar de cargo sem voltar pra sidebar. */}
            <nav aria-label="Cargos em disputa em 2026" className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(Object.keys(CANDIDATE_OFFICES) as CandidateOfficeSlug[]).map((slug) => {
                const ativo = slug === office;
                return (
                  <Link
                    key={slug}
                    href={`/CandidatosPage/${slug}`}
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
                          <div className="mt-2 text-xs font-medium text-[#4d4d4d] sm:text-sm">
                            Nº {candidato.ballot_number ?? '—'}
                          </div>
                        </div>

                        <div className="h-3 w-full shrink-0 bg-[url('/sidebar.svg')] bg-repeat-x bg-[length:auto_100%]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Pagination page={page} lastPage={lastPage} onChange={setPage} />
              </div>

            </div>
          </div>
        </div>
        <Footer />
      </main>
      <FloatingAIButton />
    </div>
  );
}
