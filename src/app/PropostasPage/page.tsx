'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import SearchBar from '@/components/SearchBar';
import ProposalCard from '@/components/ProposalCard';
import ProposalFormModal from '@/components/ProposalFormModal';
import { ProposalListSkeleton } from '@/components/ProposalCardSkeleton';
import Pagination from '@/components/Pagination';
import { getProposals } from '@/services/proposalsService';
import { getCategories } from '@/services/categoriesService';
import { ApiError } from '@/services/apiClient';
import type { Proposal } from '@/services/types';

export default function PropostasPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

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

  const proposals = useMemo(() => response?.data ?? [], [response]);
  const lastPage = response?.meta.last_page ?? 1;

  const { data: categoriesResponse } = useSWR('proposal-categories', () => getCategories(), {
    revalidateOnFocus: false,
  });

  const categories = useMemo(
    () => (categoriesResponse?.data ?? []).map((category) => category.name),
    [categoriesResponse]
  );

  const filteredProposals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return proposals.filter((proposal) => {
      const matchesQuery = !query || proposal.title.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) => proposal.categories.includes(category));

      return matchesQuery && matchesCategory;
    });
  }, [proposals, search, selectedCategories]);

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

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

  const handleCreated = () => {
    mutate();
    globalMutate('proposal-categories');
  };

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Simulador de propostas"
            subtitle="Cadastre uma ideia de proposta legislativa e acesse outras propostas que outras pessoas cadastraram."
          />

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-start">
            <div className="flex-1">
              <SearchBar
                searchValue={search}
                onSearchChange={setSearch}
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
                placeholder="Buscar propostas..."
                borderColor="#1b623a"
                bgColor="#ffffff"
                accentColor="#1b623a"
                badgeColor="#8d0801"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#1b623a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#164f30] md:mt-6 md:w-auto"
            >
              <Plus size={16} strokeWidth={2.5} />
              Cadastrar uma Proposta
            </button>
          </div>

          <div className="mt-6">
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

            {!loading && !error && filteredProposals.length === 0 && (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                <p className="text-sm font-bold text-[#8d0801]">Nenhuma proposta encontrada</p>
              </div>
            )}

            {!loading && !error && filteredProposals.length > 0 && (
              <div className="flex flex-col gap-4">
                {filteredProposals.map((proposal, index) => (
                  <ProposalCard key={proposal.id} proposal={proposal} index={index} onVoted={handleVoted} />
                ))}
              </div>
            )}

            <div className="mt-6">
              <Pagination page={page} lastPage={lastPage} onChange={setPage} />
            </div>
          </div>
        </div>
      </main>
      <FloatingAIButton />

      {showForm && <ProposalFormModal onClose={() => setShowForm(false)} onCreated={handleCreated} />}
    </div>
  );
}
