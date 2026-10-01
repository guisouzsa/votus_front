'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import Footer from '@/components/Footer';
import LegislatorFilterFrame from '@/components/LegislatorFilterFrame';
import OfficeQuickNav from '@/components/OfficeQuickNav';
import LegislatorPhoto from '@/components/LegislatorPhoto';
import { LegislatorGridSkeleton } from '@/components/LegislatorCardSkeleton';
import DataSourceNote from '@/components/DataSourceNote';
import StatCard from '@/components/StatCard';
import { getAllStateDeputies } from '@/services/stateDeputiesService';
import { ApiError } from '@/services/apiClient';
import { useSsrPaginatedList } from '@/hooks/useSsrPaginatedList';
import type { PaginatedResponse, Legislator } from '@/services/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Ativo' },
  { value: 'on_leave', label: 'Licenciado' },
  { value: 'former', label: 'Ex-mandato' },
];

const FILTROS_VAZIOS = { search: '', status: '', party: '' };

export default function DeputadosEstaduaisPageClient({
  initialData,
}: {
  initialData?: PaginatedResponse<Legislator>;
}) {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VAZIOS);

  // Time inteiro de uma vez (ver getAllStateDeputies) — não é uma "página"
  // de verdade, por isso não há Pagination aqui (igual a Senadores, que com
  // só 4 pessoas também nunca precisou).
  const {
    data: response,
    error: swrError,
    mutate,
    loading,
  } = useSsrPaginatedList(['deputados-estaduais'], () => getAllStateDeputies(), initialData);
  const error = swrError
    ? swrError instanceof ApiError
      ? 'Não foi possível carregar os deputados estaduais agora. Tente novamente em instantes.'
      : 'Ocorreu um erro inesperado ao carregar os deputados estaduais.'
    : null;

  const deputados = useMemo(
    () => (response?.data ?? []).filter((deputado) => deputado.status !== 'inactive'),
    [response]
  );
  const total = response ? deputados.length : null;

  const partidos = useMemo(
    () => Array.from(new Set(deputados.map((d) => d.party).filter((p): p is string => Boolean(p)))).sort(),
    [deputados]
  );

  const deputadosFiltrados = useMemo(() => {
    const busca = filtrosAplicados.search.trim().toLowerCase();

    return deputados.filter((deputado) => {
      const bateBusca =
        !busca ||
        deputado.parliamentary_name.toLowerCase().includes(busca) ||
        (deputado.party ?? '').toLowerCase().includes(busca);
      const bateStatus = !filtrosAplicados.status || deputado.status === filtrosAplicados.status;
      const batePartido = !filtrosAplicados.party || deputado.party === filtrosAplicados.party;

      return bateBusca && bateStatus && batePartido;
    });
  }, [deputados, filtrosAplicados]);

  const totalProposicoes = deputados.reduce(
    (soma, deputado) => soma + (deputado.metrics.effectiveness.total_bills ?? 0),
    0
  );

  const taxasEfetividade = deputados
    .map((d) => d.metrics.effectiveness.rate)
    .filter((r): r is number => r !== null);
  const efetividadeMedia =
    taxasEfetividade.length > 0
      ? Math.round((taxasEfetividade.reduce((soma, r) => soma + r, 0) / taxasEfetividade.length) * 100)
      : null;

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
                ENCONTRE E ACOMPANHE OS DEPUTADOS ESTADUAIS DO CEARÁ
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-snug text-white/90 sm:text-sm">
                Consulte informações públicas sobre mandato, votações, projetos, recursos e registros oficiais na
                Assembleia Legislativa do Ceará (ALECE).
              </p>
            </section>

            <OfficeQuickNav current="DeputadosEstaduaisPage" />

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard
                value={total !== null ? String(total).padStart(2, '0') : '—'}
                label="Deputados Estaduais"
                valueColor="text-[#8D0801]"
                tooltip={<p>Quantidade de deputados estaduais em mandato ativo na ALECE, exibidos nesta lista.</p>}
              />
              <StatCard
                value={String(totalProposicoes)}
                label="Propostas"
                valueColor="text-[#1B623A]"
                tooltip={<p>Soma das proposições (projetos de lei e PECs) apresentadas por quem está nesta lista.</p>}
              />
              <StatCard
                value={partidos.length.toString().padStart(2, '0')}
                label="Partidos"
                valueColor="text-[#B98A00]"
                tooltip={<p>Quantidade de partidos diferentes representados entre os deputados desta lista.</p>}
              />
              <StatCard
                value={efetividadeMedia !== null ? `${efetividadeMedia}%` : '—'}
                label="Efetividade média"
                valueColor="text-[#8C6A2A]"
                tooltip={
                  <p>
                    Média da taxa de efetividade legislativa (proposições que avançaram na tramitação) entre os
                    deputados desta lista.
                  </p>
                }
              />
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
                <h2 className="text-xl font-black uppercase text-[#8d0801] sm:text-2xl md:text-3xl">DEPUTADOS ESTADUAIS</h2>
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

              {!loading && !error && deputadosFiltrados.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                  <p className="text-sm font-bold text-[#8d0801]">Nenhum deputado encontrado</p>
                  <p className="text-xs text-[#4d4d4d]">Tente ajustar os filtros de busca.</p>
                </div>
              )}

              {!loading && !error && deputadosFiltrados.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-[repeat(5,minmax(0,1fr))] md:gap-5">
                  {deputadosFiltrados.map((deputado) => (
                    <Link
                      key={deputado.source_slug ?? deputado.external_id}
                      href={`/ShowDeputadosEstaduaisPage/${deputado.source_slug}`}
                      aria-label={`Ver detalhes de ${deputado.parliamentary_name}`}
                      className="flex h-full flex-col overflow-hidden rounded-[12px] border border-[#e0d6c4] bg-white shadow-sm"
                    >
                      <div className="flex h-36 shrink-0 items-center justify-center bg-white p-3 sm:h-44 sm:p-4 md:h-56">
                        <div className="relative h-full w-full overflow-hidden bg-white">
                          <div className="absolute inset-2 sm:inset-3">
                            <LegislatorPhoto
                              src={deputado.photo_url}
                              alt={`Foto de ${deputado.parliamentary_name}`}
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
                            {deputado.parliamentary_name}
                          </div>
                          <div className="mt-1 text-xs text-[#4d4d4d] sm:text-sm">{deputado.party ?? '—'}</div>
                          <div className="mt-2 text-xs font-medium text-[#4d4d4d] sm:text-sm">{deputado.state ?? '—'}</div>
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
