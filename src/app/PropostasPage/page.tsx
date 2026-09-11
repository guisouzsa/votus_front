'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import FloatingAIButton from '@/components/FloatingAIButton';
import ProposalCard from '@/components/ProposalCard';
import { ProposalListSkeleton } from '@/components/ProposalCardSkeleton';
import { getProposals } from '@/services/proposalsService';
import { ApiError } from '@/services/apiClient';
import type { Proposal } from '@/services/types';

export default function PropostasPage() {
  const [page, setPage] = useState(1);

  const {
    data: response,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR(['proposals', page], () => getProposals({ page }), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const loading = isLoading;
  const error = swrError
    ? swrError instanceof ApiError
      ? 'Não foi possível carregar as propostas agora. Tente novamente em instantes.'
      : 'Ocorreu um erro inesperado ao carregar as propostas.'
    : null;

  const proposals = response?.data ?? [];
  const total = response?.meta.total ?? null;
  const lastPage = response?.meta.last_page ?? 1;

  const handleVoted = (updated: Proposal) => {
    mutate(
      (current) =>
        current && {
          ...current,
          data: current.data.map((proposal) => (proposal.id === updated.id ? updated : proposal)),
        },
      { revalidate: false }
    );
  };

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="min-h-dvh">
          <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
            <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
          </header>

          <div className="w-full px-6 py-8 sm:px-10">
            <section className="overflow-hidden rounded-[10px] bg-[#1b623a] text-white shadow-sm">
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex-1">
                  <h1 className="text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl md:text-4xl md:leading-none">
                    Propostas
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base md:text-xl">
                    Conheça propostas e veja como a comunidade está reagindo a cada uma delas.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black uppercase text-[#8d0801] sm:text-2xl md:text-3xl">
                  PROPOSTAS{total !== null ? ` (${total})` : ''}
                </h2>
                {lastPage > 1 && (
                  <div className="flex items-center gap-3 text-sm font-semibold uppercase text-[#8d0801]">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="disabled:opacity-40"
                    >
                      ← Anterior
                    </button>
                    <span>
                      Página {page} de {lastPage}
                    </span>
                    <button
                      type="button"
                      disabled={page >= lastPage}
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      className="disabled:opacity-40"
                    >
                      Próxima →
                    </button>
                  </div>
                )}
              </div>

              {loading && <ProposalListSkeleton />}

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

              {!loading && !error && proposals.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                  <p className="text-sm font-bold text-[#8d0801]">Nenhuma proposta encontrada</p>
                </div>
              )}

              {!loading && !error && proposals.length > 0 && (
                <div className="flex flex-col gap-4">
                  {proposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} onVoted={handleVoted} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
