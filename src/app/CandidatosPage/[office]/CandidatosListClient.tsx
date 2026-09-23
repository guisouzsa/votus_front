'use client';

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import LegislatorPhoto from '@/components/LegislatorPhoto';
import { LegislatorGridSkeleton } from '@/components/LegislatorCardSkeleton';
import Pagination from '@/components/Pagination';
import { useState } from 'react';
import { CANDIDATE_OFFICES, getCandidates, type CandidateOfficeSlug } from '@/services/candidatesService';
import { ApiError } from '@/services/apiClient';
import { useSsrPaginatedList } from '@/hooks/useSsrPaginatedList';
import type { SimplePaginatedResponse, Candidate } from '@/services/types';

export default function CandidatosListClient({
  office,
  initialData,
}: {
  office: CandidateOfficeSlug;
  initialData?: SimplePaginatedResponse<Candidate>;
}) {
  const [page, setPage] = useState(1);
  const config = CANDIDATE_OFFICES[office];

  const {
    data: response,
    error: swrError,
    mutate,
    loading,
  } = useSsrPaginatedList(
    ['candidatos', office, page],
    () => getCandidates(office, page),
    page === 1 ? initialData : undefined
  );

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
                  <h1 className="text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl md:text-4xl md:leading-none">
                    Candidatos a {config.label} no Ceará
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base md:text-xl">
                    Conheça quem está concorrendo nas eleições de 2026. Cada perfil traz partido, número na urna e,
                    quando houver, a chapa completa (vice ou suplentes).
                  </p>
                </div>
              </div>
            </section>

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
                  <p className="text-xs text-[#4d4d4d]">Os dados desta candidatura ainda não foram publicados.</p>
                </div>
              )}

              {!loading && !error && candidatos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-[repeat(5,minmax(0,1fr))] md:gap-5">
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
      </main>
      <FloatingAIButton />
    </div>
  );
}
