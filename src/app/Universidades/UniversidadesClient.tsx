'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, Search, ExternalLink, MapPin } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import Pagination from '@/components/Pagination';
import { ProposalListSkeleton } from '@/components/ProposalCardSkeleton';
import { useSsrPaginatedList } from '@/hooks/useSsrPaginatedList';
import {
  getCourseOfferings,
  getMunicipalities,
  getCourses,
  type CourseOfferingFilters,
  type CourseOfferingListResponse,
} from '@/services/universitiesService';
import { ApiError } from '@/services/apiClient';

interface FiltrosState {
  estado: string;
  municipio: string;
  curso: string;
  modalidade: string;
  setor: string;
}

const SETOR_LABELS: Record<string, string> = { public: 'Pública', private: 'Privada' };

export default function UniversidadesClient({
  initialData,
  estadoPadrao,
}: {
  initialData?: CourseOfferingListResponse;
  estadoPadrao: string;
}) {
  const filtrosIniciais: FiltrosState = { estado: estadoPadrao, municipio: '', curso: '', modalidade: '', setor: '' };

  const [filtros, setFiltros] = useState<FiltrosState>(filtrosIniciais);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosState>(filtrosIniciais);
  const [page, setPage] = useState(1);

  const [municipios, setMunicipios] = useState<{ ibge_city_code: string; city: string }[]>([]);
  const [cursosDisponiveis, setCursosDisponiveis] = useState<{ name: string; normalized_name: string }[]>([]);

  // Município fica disponível assim que um estado é escolhido no filtro (não
  // precisa esperar o "Buscar") — busca separada, só pra popular o select.
  useEffect(() => {
    if (!filtros.estado) {
      setMunicipios([]);
      return;
    }

    let cancelado = false;
    getMunicipalities(filtros.estado)
      .then((lista) => !cancelado && setMunicipios(lista))
      .catch(() => !cancelado && setMunicipios([]));

    return () => {
      cancelado = true;
    };
  }, [filtros.estado]);

  // Curso só fica disponível depois que estado + município estão escolhidos.
  useEffect(() => {
    if (!filtros.estado || !filtros.municipio) {
      setCursosDisponiveis([]);
      return;
    }

    let cancelado = false;
    getCourses(filtros.estado, filtros.municipio)
      .then((lista) => !cancelado && setCursosDisponiveis(lista))
      .catch(() => !cancelado && setCursosDisponiveis([]));

    return () => {
      cancelado = true;
    };
  }, [filtros.estado, filtros.municipio]);

  const queryFilters: CourseOfferingFilters = {
    state: filtrosAplicados.estado || undefined,
    city_code: filtrosAplicados.municipio || undefined,
    course: filtrosAplicados.curso || undefined,
    modality: filtrosAplicados.modalidade || undefined,
    sector: filtrosAplicados.setor || undefined,
    page,
  };

  const {
    data: response,
    error: swrError,
    loading,
  } = useSsrPaginatedList(
    ['course-offerings', JSON.stringify(queryFilters)],
    () => getCourseOfferings(queryFilters),
    page === 1 && JSON.stringify(filtrosAplicados) === JSON.stringify(filtrosIniciais) ? initialData : undefined
  );

  const ofertas = response?.data ?? [];
  const lastPage = response?.links.next ? page + 1 : page;
  const modalidades = response?.filter_options.modalities ?? [];
  const error = swrError
    ? swrError instanceof ApiError
      ? 'Não foi possível carregar os cursos agora. Tente novamente em instantes.'
      : 'Ocorreu um erro inesperado ao carregar os cursos.'
    : null;

  function aplicarFiltros() {
    setFiltrosAplicados(filtros);
    setPage(1);
  }

  function limparFiltros() {
    setFiltros(filtrosIniciais);
    setFiltrosAplicados(filtrosIniciais);
    setPage(1);
  }

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <Link
            href="/Juventude"
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>

          <DashboardHeader
            titleText="Painel Universidades"
            titleColor="text-[#8C0801]"
            titleClassName="font-heading"
            subtitle="Encontre universidades e cursos pelo Ceará."
          />

          {/* Filtros */}
          <div className="mt-6 rounded-2xl border border-[#D9C29B] bg-[#FDF8EE] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#1B623A]">
                Município
                <select
                  value={filtros.municipio}
                  disabled={!filtros.estado}
                  onChange={(event) =>
                    setFiltros((atual) => ({ ...atual, municipio: event.target.value, curso: '' }))
                  }
                  className="w-full rounded-lg border border-[#D9C29B] bg-[#EDDBBA] px-3 py-2 text-xs font-normal text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20 disabled:opacity-50"
                >
                  <option value="">Todos os municípios</option>
                  {municipios.map((m) => (
                    <option key={m.ibge_city_code} value={m.ibge_city_code}>
                      {m.city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#1B623A]">
                Curso
                <select
                  value={filtros.curso}
                  disabled={!filtros.municipio}
                  onChange={(event) => setFiltros((atual) => ({ ...atual, curso: event.target.value }))}
                  className="w-full rounded-lg border border-[#D9C29B] bg-[#EDDBBA] px-3 py-2 text-xs font-normal text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20 disabled:opacity-50"
                >
                  <option value="">Todos os cursos</option>
                  {cursosDisponiveis.map((c) => (
                    <option key={c.normalized_name} value={c.normalized_name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#1B623A]">
                Modalidade
                <select
                  value={filtros.modalidade}
                  onChange={(event) => setFiltros((atual) => ({ ...atual, modalidade: event.target.value }))}
                  className="w-full rounded-lg border border-[#D9C29B] bg-[#EDDBBA] px-3 py-2 text-xs font-normal text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
                >
                  <option value="">Todas as modalidades</option>
                  {modalidades.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#1B623A]">
                Tipo de instituição
                <select
                  value={filtros.setor}
                  onChange={(event) => setFiltros((atual) => ({ ...atual, setor: event.target.value }))}
                  className="w-full rounded-lg border border-[#D9C29B] bg-[#EDDBBA] px-3 py-2 text-xs font-normal text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
                >
                  <option value="">Todas</option>
                  <option value="public">Pública</option>
                  <option value="private">Privada</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-row items-center gap-2">
              <button
                type="button"
                onClick={aplicarFiltros}
                className="flex items-center justify-center gap-2 rounded-full bg-[#1B623A] px-5 py-2.5 text-sm font-semibold text-[#FDF8EE] transition-colors hover:bg-[#103D23]"
              >
                <Search size={16} />
                Buscar universidades
              </button>
              <button
                type="button"
                onClick={limparFiltros}
                className="flex items-center justify-center rounded-full border border-[#D9C29B] bg-[#EDDBBA] px-5 py-2.5 text-sm font-semibold text-[#1B623A] transition-colors hover:bg-[#E3CFA4]"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="mt-6">
            {loading && <ProposalListSkeleton />}

            {!loading && error && (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                <p className="text-sm font-semibold text-[#8d0801]">{error}</p>
              </div>
            )}

            {!loading && !error && ofertas.length === 0 && (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#D9C29B] bg-[#EDDBBA]/60 p-10 text-center">
                <Landmark size={56} className="text-[#1B623A]" strokeWidth={1.5} />
                <h2 className="text-xl font-black uppercase leading-tight text-[#1B623A]">
                  Nenhum curso encontrado
                </h2>
                <p className="max-w-md text-sm text-[#8D0801]">Tente ajustar os filtros de busca.</p>
              </div>
            )}

            {!loading && !error && ofertas.length > 0 && (
              <>
                <div className="mb-4 flex justify-end">
                  <Pagination page={page} lastPage={lastPage} onChange={setPage} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {ofertas.map((oferta) => {
                    const universidade = oferta.campus?.university;
                    const linkIngresso = universidade?.admission_methods?.[0]?.official_url;

                    return (
                      <article
                        key={oferta.id}
                        className="flex flex-col gap-2 rounded-[12px] border border-[#e0d6c4] bg-white p-4 shadow-sm sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base font-bold text-[#1b623a] sm:text-lg">{oferta.name}</h3>
                          {universidade?.sector && (
                            <span className="shrink-0 rounded-full bg-[#EDDBBA] px-2.5 py-1 text-[10px] font-bold uppercase text-[#8D0801]">
                              {SETOR_LABELS[universidade.sector] ?? universidade.sector}
                            </span>
                          )}
                        </div>

                        {universidade && (
                          <p className="text-sm font-semibold text-[#4d4d4d]">
                            {universidade.name}
                            {universidade.acronym && ` (${universidade.acronym})`}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#6b6255]">
                          {oferta.campus && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {oferta.campus.city} - {oferta.campus.state}
                            </span>
                          )}
                          {oferta.modality && <span>{oferta.modality}</span>}
                          {oferta.authorized_vacancies !== null && <span>{oferta.authorized_vacancies} vagas</span>}
                        </div>

                        {linkIngresso && (
                          <a
                            href={linkIngresso}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1B623A] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#164f30]"
                          >
                            Como ingressar
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </article>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-center">
                  <Pagination page={page} lastPage={lastPage} onChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
