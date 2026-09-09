'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import FloatingAIButton from '@/components/FloatingAIButton';
import LegislatorFilterFrame from '@/components/LegislatorFilterFrame';
import { getDeputados } from '@/services/deputadosService';
import { ApiError } from '@/services/apiClient';
import type { Legislator } from '@/services/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Ativo' },
  { value: 'on_leave', label: 'Licenciado' },
  { value: 'former', label: 'Ex-mandato' },
];

const FILTROS_VAZIOS = { search: '', status: '', party: '' };

export default function DeputadosPage() {
  const [deputados, setDeputados] = useState<Legislator[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VAZIOS);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    getDeputados({ page })
      .then((response) => {
        if (cancelado) return;
        const ativos = response.data.filter((deputado) => deputado.status !== 'inactive');
        setDeputados(ativos);
        setTotal(ativos.length);
        setLastPage(response.meta.last_page);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof ApiError
            ? 'Não foi possível carregar os deputados agora. Tente novamente em instantes.'
            : 'Ocorreu um erro inesperado ao carregar os deputados.'
        );
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [page, reloadToken]);

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

  const statCards = [
    { label: 'DEPUTADOS', value: total !== null ? String(total).padStart(2, '0') : '—', color: 'bg-[#F4C400]' },
    { label: 'PRESSES POLÍTICOS', value: '91', color: 'bg-[#1C5D45]' },
    { label: 'PROPOSTAS', value: '324', color: 'bg-[#EDDBBA]' },
    { label: 'EMENDAS', value: '96', color: 'bg-[#8d0801]' },
  ];

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen bg-[#FDFDFD] md:pl-24">
      <div className="min-h-screen">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image
            src="/sidebar.svg"
            alt="Menu superior"
            fill
            priority
            className="object-cover"
          />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
            <section className="overflow-hidden rounded-[10px] bg-[#F07A00] text-white shadow-sm">
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex-1">
                  <h1 className="text-3xl font-black uppercase leading-none tracking-tight md:text-4xl">
                    ENCONTRE E ACOMPANHE OS Deputados DO CEARÁ
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/90 md:text-xl">
                    Consulte informações públicas sobre mandato, votações, projetos, recursos e registros oficiais.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {statCards.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} flex min-h-[120px] flex-col justify-center rounded-md border border-[#d8cdb8] px-4 py-3`}
                >
                  <div className="text-right text-base font-black uppercase tracking-wide text-white md:text-xl">
                    {item.label}
                  </div>
                  <div className="mt-3 text-left text-3xl font-black uppercase text-white md:text-5xl">
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase text-[#8d0801]">DEPUTADOS</h2>
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

              {loading && (
                <div className="flex min-h-[200px] items-center justify-center rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] text-sm font-semibold text-[#8d0801]">
                  Carregando deputados...
                </div>
              )}

              {!loading && error && (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-6 text-center">
                  <p className="text-sm font-semibold text-[#8d0801]">{error}</p>
                  <button
                    type="button"
                    onClick={() => setReloadToken((token) => token + 1)}
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
                <div className="grid gap-5 md:grid-cols-[repeat(5,minmax(0,1fr))]">
                  {deputadosFiltrados.map((deputado) => (
                    <Link
                      key={deputado.external_id}
                      href={`/ShowDeputadosPage/${deputado.external_id}`}
                      aria-label={`Ver detalhes de ${deputado.parliamentary_name}`}
                      className="overflow-hidden rounded-[12px] border border-[#8d0801] bg-[#f7f5f2] shadow-sm"
                    >
                      <div className="flex h-56 items-center justify-center bg-[#ecb8b5] p-4">
                        <div className="relative h-56 w-full overflow-hidden bg-[#ecb8b5]">
                          <div className="absolute inset-3">
                            <Image
                              src={deputado.photo_url || '/deputados.png'}
                              alt={`Foto de ${deputado.parliamentary_name}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 20vw"
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="relative rounded-lg border border-[#8d0801] overflow-hidden">
                        <div className="bg-[#f7f5f2] p-4 pb-5 text-center">
                          <div className="text-xl font-black uppercase text-[#F07A00]">
                            {deputado.parliamentary_name}
                          </div>
                          <div className="mt-1 text-sm text-[#4d4d4d]">{deputado.party ?? '—'}</div>
                          <div className="mt-2 text-sm font-medium text-[#4d4d4d]">{deputado.state ?? '—'}</div>
                        </div>

                        <div className="absolute bottom-0 left-0 h-3 w-full bg-[url('/sidebar.svg')] bg-repeat-x bg-[length:auto_100%]" />
                      </div>
                    </Link>
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
