'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import LegislatorPhoto from '@/components/LegislatorPhoto';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import LegislatorFilterFrame from '@/components/LegislatorFilterFrame';
import { LegislatorGridSkeleton } from '@/components/LegislatorCardSkeleton';
import DataSourceNote from '@/components/DataSourceNote';
import Pagination from '@/components/Pagination';
import { getSenadores } from '@/services/senadoresService';
import { ApiError } from '@/services/apiClient';

const STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Ativo' },
  { value: 'on_leave', label: 'Licenciado' },
  { value: 'former', label: 'Ex-mandato' },
];

const FILTROS_VAZIOS = { search: '', status: '', party: '' };

export default function SenadoresPageClient() {
  const [page, setPage] = useState(1);

  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VAZIOS);

  const {
    data: response,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR(['senadores', page], () => getSenadores({ page }), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const loading = isLoading;
  const error = swrError
    ? swrError instanceof ApiError
      ? 'Não foi possível carregar os senadores agora. Tente novamente em instantes.'
      : 'Ocorreu um erro inesperado ao carregar os senadores.'
    : null;

  const senadores = useMemo(
    () => (response?.data ?? []).filter((senador) => senador.status !== 'inactive'),
    [response]
  );
  // response.meta.total é o total bruto da API (inclui inativos/suplentes,
  // como o senador substituto). O card do topo mostra a mesma lista que
  // aparece embaixo, então usa a contagem já filtrada — como a API cabe
  // numa página só (4 senadores), isso reflete o total real exibido.
  const total = response ? senadores.length : null;
  const lastPage = response?.meta.last_page ?? 1;

  const partidos = useMemo(
    () => Array.from(new Set(senadores.map((s) => s.party).filter((p): p is string => Boolean(p)))).sort(),
    [senadores]
  );

  const senadoresFiltrados = useMemo(() => {
    const busca = filtrosAplicados.search.trim().toLowerCase();

    return senadores.filter((senador) => {
      const bateBusca =
        !busca ||
        senador.parliamentary_name.toLowerCase().includes(busca) ||
        (senador.party ?? '').toLowerCase().includes(busca);
      const bateStatus = !filtrosAplicados.status || senador.status === filtrosAplicados.status;
      const batePartido = !filtrosAplicados.party || senador.party === filtrosAplicados.party;

      return bateBusca && bateStatus && batePartido;
    });
  }, [senadores, filtrosAplicados]);

  // Soma real de propostas (PL/PEC — metrics.effectiveness.total_bills já
  // vem filtrado por tipo na origem, ver SenateApiService) entre os
  // senadores ativos exibidos. "Emenda" é uma alteração a uma proposta já
  // existente de outro parlamentar — um dado diferente de "proposta" e que
  // não é coletado das APIs oficiais (só PL/PEC), então não existe nenhum
  // valor real pra esse card, e não deve reaproveitar o número de propostas
  // como se fossem a mesma coisa.
  const totalProposicoes = senadores.reduce(
    (soma, senador) => soma + (senador.metrics.effectiveness.total_bills ?? 0),
    0
  );

  const statCards = [
    { label: 'SENADORES', value: total !== null ? String(total).padStart(2, '0') : '—', color: 'bg-[#1C5D45]' },
    { label: 'PROPOSTAS', value: String(totalProposicoes), color: 'bg-[#F07A00]' },
  ];

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
      <div className="min-h-dvh">
        <div className="w-full px-6 py-8 sm:px-10">
            <section className="overflow-hidden rounded-[10px] bg-[#8d0801] text-white shadow-sm">
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex-1">
                  <h1 className="text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl md:text-4xl md:leading-none">
                    ENCONTRE E ACOMPANHE OS SENADORES DO CEARÁ
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base md:text-xl">
                    Consulte informações públicas sobre mandato, votações, projetos, recursos e registros oficiais.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {statCards.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} flex min-h-[100px] flex-col justify-center rounded-md border border-[#d8cdb8] px-4 py-3 sm:min-h-[120px]`}
                >
                  <div className="text-right text-sm font-black uppercase tracking-wide text-white sm:text-base md:text-xl">
                    {item.label}
                  </div>
                  <div className="mt-3 text-left text-2xl font-black uppercase text-white sm:text-3xl md:text-5xl">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <LegislatorFilterFrame
              searchValue={filtros.search}
              onSearchChange={(value) => setFiltros((atual) => ({ ...atual, search: value }))}
              statusValue={filtros.status}
              onStatusChange={(value) => setFiltros((atual) => ({ ...atual, status: value }))}
              statusOptions={STATUS_OPTIONS}
              partyValue={filtros.party}
              onPartyChange={(value) => setFiltros((atual) => ({ ...atual, party: value }))}
              partyOptions={partidos}
              onApply={() => setFiltrosAplicados(filtros)}
              onClear={() => {
                setFiltros(FILTROS_VAZIOS);
                setFiltrosAplicados(FILTROS_VAZIOS);
              }}
            />

            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black uppercase text-[#f07a00] sm:text-2xl md:text-3xl">SENADORES</h2>
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

              {!loading && !error && senadoresFiltrados.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                  <p className="text-sm font-bold text-[#8d0801]">Nenhum senador encontrado</p>
                  <p className="text-xs text-[#4d4d4d]">Tente ajustar os filtros de busca.</p>
                </div>
              )}

              {!loading && !error && senadoresFiltrados.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-[repeat(5,minmax(0,1fr))] md:gap-5">
                  {senadoresFiltrados.map((senador) => (
                    <Link
                      key={senador.external_id}
                      href={`/ShowSenadoresPage/${senador.external_id}`}
                      aria-label={`Ver detalhes de ${senador.parliamentary_name}`}
                      className="flex h-full flex-col overflow-hidden rounded-[12px] border border-[#e0d6c4] bg-white shadow-sm"
                    >
                      <div className="flex h-36 shrink-0 items-center justify-center bg-white p-3 sm:h-44 sm:p-4 md:h-56">
                        <div className="relative h-full w-full overflow-hidden bg-white">
                          <div className="absolute inset-2 sm:inset-3">
                            <LegislatorPhoto
                              src={senador.photo_url}
                              alt={`Foto de ${senador.parliamentary_name}`}
                              fallbackSrc="/senadores.png"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#e0d6c4]">
                        <div className="flex flex-1 flex-col justify-center bg-white p-3 pb-4 text-center sm:p-4 sm:pb-5">
                          <div className="text-sm font-black uppercase text-[#1b623a] sm:text-base md:text-xl">
                            {senador.parliamentary_name}
                          </div>
                          <div className="mt-1 text-xs text-[#4d4d4d] sm:text-sm">{senador.party ?? '—'}</div>
                          <div className="mt-2 text-xs font-medium text-[#4d4d4d] sm:text-sm">{senador.state ?? '—'}</div>
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
      </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
