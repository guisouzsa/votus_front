'use client';

import Link from 'next/link';
import { Briefcase, ExternalLink, MapPin, Award } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import Pagination from '@/components/Pagination';
import { ProposalListSkeleton } from '@/components/ProposalCardSkeleton';
import { useSsrPaginatedList } from '@/hooks/useSsrPaginatedList';
import { getOpportunities, getPublicOpportunities } from '@/services/opportunitiesService';
import { ApiError } from '@/services/apiClient';
import { useState } from 'react';
import type { Opportunity, PublicOpportunity, PublicOpportunityStatus, SimplePaginatedResponse } from '@/services/types';

const STATUS_LABELS: Record<PublicOpportunityStatus, { label: string; className: string }> = {
  aberto: { label: 'Inscrições abertas', className: 'bg-[#1B623A] text-white' },
  em_breve: { label: 'Em breve', className: 'bg-[#FCC100] text-[#5c4400]' },
  encerrado: { label: 'Encerrado', className: 'bg-[#6b6255] text-white' },
  indefinido: { label: 'Data não informada', className: 'bg-[#EDDBBA] text-[#6b6255]' },
};

function formatSalario(min: string | null, max: string | null): string | null {
  if (!min && !max) return null;

  const fmt = (v: string) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  if (min && max && min !== max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt(min ?? max!);
}

function formatData(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function JuventudeClient({
  initialOpportunities,
  initialPublicOpportunities,
}: {
  initialOpportunities?: SimplePaginatedResponse<Opportunity>;
  initialPublicOpportunities?: SimplePaginatedResponse<PublicOpportunity>;
}) {
  const [pageVagas, setPageVagas] = useState(1);
  const [pageConcursos, setPageConcursos] = useState(1);

  const {
    data: vagasResponse,
    error: vagasError,
    loading: vagasLoading,
  } = useSsrPaginatedList(
    ['opportunities', pageVagas],
    () => getOpportunities(pageVagas),
    pageVagas === 1 ? initialOpportunities : undefined
  );

  const {
    data: concursosResponse,
    error: concursosError,
    loading: concursosLoading,
  } = useSsrPaginatedList(
    ['public-opportunities', pageConcursos],
    () => getPublicOpportunities(pageConcursos),
    pageConcursos === 1 ? initialPublicOpportunities : undefined
  );

  const vagas = vagasResponse?.data ?? [];
  const vagasLastPage = vagasResponse?.links.next ? pageVagas + 1 : pageVagas;

  const concursos = concursosResponse?.data ?? [];
  const concursosLastPage = concursosResponse?.links.next ? pageConcursos + 1 : pageConcursos;

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Juventude em Pauta"
            titleColor="text-[#8C0801]"
            titleClassName="font-heading"
            subtitle="Vagas de emprego e concursos públicos abertos, pensados para quem está entrando no mercado de trabalho."
          />

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-black uppercase text-[#FF7700] sm:text-2xl">
                <Briefcase size={22} />
                Vagas de emprego
              </h2>
              <Pagination page={pageVagas} lastPage={vagasLastPage} onChange={setPageVagas} />
            </div>

            {vagasLoading && <ProposalListSkeleton />}

            {!vagasLoading && vagasError && (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                <p className="text-sm font-semibold text-[#8d0801]">
                  {vagasError instanceof ApiError
                    ? 'Não foi possível carregar as vagas agora. Tente novamente em instantes.'
                    : 'Ocorreu um erro inesperado ao carregar as vagas.'}
                </p>
              </div>
            )}

            {!vagasLoading && !vagasError && vagas.length === 0 && (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                <p className="text-sm font-bold text-[#8d0801]">Nenhuma vaga encontrada no momento</p>
              </div>
            )}

            {!vagasLoading && !vagasError && vagas.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {vagas.map((vaga) => {
                  const salario = formatSalario(vaga.salary_min, vaga.salary_max);

                  return (
                    <article
                      key={vaga.external_id}
                      className="flex flex-col gap-2 rounded-[12px] border border-[#e0d6c4] bg-white p-4 shadow-sm sm:p-5"
                    >
                      <h3 className="font-display text-base font-bold text-[#1b623a] sm:text-lg">{vaga.title}</h3>
                      {vaga.company && <p className="text-sm font-semibold text-[#4d4d4d]">{vaga.company}</p>}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6b6255]">
                        {vaga.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {vaga.location}
                          </span>
                        )}
                        {salario && <span className="font-semibold text-[#1b623a]">{salario}</span>}
                      </div>

                      {vaga.description && (
                        <p className="line-clamp-2 text-sm text-[#4d4d4d]">{vaga.description}</p>
                      )}

                      {vaga.external_url && (
                        <a
                          href={vaga.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FF7700] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e66c00]"
                        >
                          Ver vaga
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xl font-black uppercase text-[#1B623A] sm:text-2xl">
                <Award size={22} />
                Concursos e processos seletivos
              </h2>
              <Pagination page={pageConcursos} lastPage={concursosLastPage} onChange={setPageConcursos} />
            </div>

            {concursosLoading && <ProposalListSkeleton count={2} />}

            {!concursosLoading && concursosError && (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                <p className="text-sm font-semibold text-[#8d0801]">
                  {concursosError instanceof ApiError
                    ? 'Não foi possível carregar os concursos agora. Tente novamente em instantes.'
                    : 'Ocorreu um erro inesperado ao carregar os concursos.'}
                </p>
              </div>
            )}

            {!concursosLoading && !concursosError && concursos.length === 0 && (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                <p className="text-sm font-bold text-[#8d0801]">Nenhum concurso encontrado no momento</p>
              </div>
            )}

            {!concursosLoading && !concursosError && concursos.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {concursos.map((concurso) => {
                  const statusInfo = STATUS_LABELS[concurso.status];
                  const salario = formatSalario(concurso.salary_min, concurso.salary_max);
                  const prazo = formatData(concurso.registration_end);

                  return (
                    <article
                      key={concurso.source_key}
                      className="flex flex-col gap-2 rounded-[12px] border border-[#e0d6c4] bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-[#1b623a] sm:text-lg">{concurso.title}</h3>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {concurso.agency && <p className="text-sm font-semibold text-[#4d4d4d]">{concurso.agency}</p>}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6b6255]">
                        {(concurso.municipality || concurso.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {[concurso.municipality, concurso.state].filter(Boolean).join(' - ')}
                          </span>
                        )}
                        {concurso.vacancies !== null && <span>{concurso.vacancies} vaga(s)</span>}
                        {salario && <span className="font-semibold text-[#1b623a]">{salario}</span>}
                      </div>

                      {concurso.positions.length > 0 && (
                        <p className="text-xs text-[#4d4d4d]">{concurso.positions.join(', ')}</p>
                      )}

                      {prazo && (
                        <p className="text-xs text-[#6b6255]">
                          Inscrições até <strong>{prazo}</strong>
                        </p>
                      )}

                      {concurso.registration_url && (
                        <Link
                          href={concurso.registration_url.startsWith('http') ? concurso.registration_url : `https://${concurso.registration_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1B623A] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#164f30]"
                        >
                          Ver edital
                          <ExternalLink size={13} />
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
