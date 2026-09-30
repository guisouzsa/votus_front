'use client';

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import Footer from '@/components/Footer';
import CargoQuickNav from '@/components/CargoQuickNav';
import LegislatorPhoto from '@/components/LegislatorPhoto';
import { LegislatorGridSkeleton } from '@/components/LegislatorCardSkeleton';
import DataSourceNote from '@/components/DataSourceNote';
import StatCard from '@/components/StatCard';
import { getGovernadores } from '@/services/executivesService';
import { ApiError } from '@/services/apiClient';
import { useSsrPaginatedList } from '@/hooks/useSsrPaginatedList';
import type { PaginatedResponse, Executive } from '@/services/types';

const OFFICE_LABELS: Record<string, string> = {
  governor: 'Governador(a)',
  vice_governor: 'Vice-Governador(a)',
};

export default function GovernadoresPageClient({
  initialData,
}: {
  initialData?: PaginatedResponse<Executive>;
}) {
  const {
    data: response,
    error: swrError,
    mutate,
    loading,
  } = useSsrPaginatedList(['governadores'], () => getGovernadores(), initialData);
  const error = swrError
    ? swrError instanceof ApiError
      ? 'Não foi possível carregar os dados agora. Tente novamente em instantes.'
      : 'Ocorreu um erro inesperado ao carregar os dados.'
    : null;

  const executivos = response?.data ?? [];

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
      <div className="min-h-dvh">
        <div className="w-full px-6 py-8 sm:px-10">
            <section className="rounded-lg bg-[#8d0801] px-4 py-3 text-white sm:px-6 sm:py-4">
              <h1 className="text-lg font-black uppercase leading-tight tracking-tight sm:text-xl md:text-2xl">
                ENCONTRE E ACOMPANHE O GOVERNO DO CEARÁ
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-snug text-white/90 sm:text-sm">
                Consulte informações públicas sobre mandato e ações do governador e vice-governador em exercício.
              </p>
            </section>

            <CargoQuickNav atual="GovernadoresPage" />

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard
                value={executivos.length ? String(executivos.length).padStart(2, '0') : '—'}
                label="Em exercício"
                valueColor="text-[#1C5D45]"
                tooltip={<p>Governador e vice-governador em exercício.</p>}
              />
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-black uppercase text-[#8d0801] sm:text-2xl md:text-3xl">
                GOVERNO DO ESTADO
              </h2>

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

              {!loading && !error && executivos.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                  <p className="text-sm font-bold text-[#8d0801]">Nenhum registro encontrado</p>
                </div>
              )}

              {!loading && !error && executivos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-[repeat(5,minmax(0,1fr))] md:gap-5">
                  {executivos.map((executivo) => (
                    <Link
                      key={executivo.id}
                      href={`/ShowGovernadoresPage/${executivo.id}`}
                      aria-label={`Ver detalhes de ${executivo.display_name}`}
                      className="flex h-full flex-col overflow-hidden rounded-[12px] border border-[#e0d6c4] bg-white shadow-sm"
                    >
                      <div className="flex h-36 shrink-0 items-center justify-center bg-white p-3 sm:h-44 sm:p-4 md:h-56">
                        <div className="relative h-full w-full overflow-hidden bg-white">
                          <div className="absolute inset-2 sm:inset-3">
                            <LegislatorPhoto
                              src={executivo.photo_url}
                              alt={`Foto de ${executivo.display_name}`}
                              fallbackSrc="/deputados.png"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#e0d6c4]">
                        <div className="flex flex-1 flex-col justify-center bg-white p-3 pb-4 text-center sm:p-4 sm:pb-5">
                          <div className="text-sm font-black uppercase text-[#1b623a] sm:text-base md:text-xl">
                            {executivo.display_name}
                          </div>
                          <div className="mt-1 text-xs text-[#4d4d4d] sm:text-sm">
                            {executivo.party.acronym ?? '—'}
                          </div>
                          <div className="mt-2 text-xs font-medium text-[#4d4d4d] sm:text-sm">
                            {OFFICE_LABELS[executivo.office] ?? executivo.office}
                            {executivo.state ? ` · ${executivo.state}` : ''}
                          </div>
                        </div>

                        <div className="h-3 w-full shrink-0 bg-[url('/sidebar.svg')] bg-repeat-x bg-[length:auto_100%]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-10">
              <DataSourceNote variant="prominent" />
            </div>
        </div>
        <Footer />
      </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
