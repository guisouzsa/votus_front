'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import FloatingAIButton from '@/components/FloatingAIButton';
import LegislativeTimeline from '@/components/LegislativeTimeline';
import LegislatorDetailSkeleton from '@/components/LegislatorDetailSkeleton';
import InfoTooltip from '@/components/InfoTooltip';
import ProposicoesList from '@/components/ProposicoesList';
import { getDeputado } from '@/services/deputadosService';
import { ApiError } from '@/services/apiClient';

const tabs = ['Visão geral', 'Comissões', 'Proposições', 'Linha do tempo'] as const;
type Tab = (typeof tabs)[number];

const tabActiveBg: Record<Tab, string> = {
  'Visão geral': 'bg-[#a70700]',
  'Comissões': 'bg-[#fbc000]',
  'Proposições': 'bg-[#0f3d22]',
  'Linha do tempo': 'bg-[#ff7700]',
};

const tabPanelColors: Record<Tab, string> = {
  'Visão geral': 'bg-[#a70700]',
  'Comissões': 'bg-[#fbc000]',
  'Proposições': 'bg-[#1c623a]',
  'Linha do tempo': 'bg-[#ff7700]',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  on_leave: 'Licenciado',
  former: 'Ex-mandato',
  unknown: 'Desconhecido',
};

export default function ShowDeputadosPage() {
  const params = useParams<{ externalId: string }>();
  const externalId = params.externalId;

  const [activeTab, setActiveTab] = useState<Tab>('Visão geral');

  const {
    data: deputado,
    error: swrError,
    isLoading,
  } = useSWR(externalId ? ['deputado', externalId] : null, () => getDeputado(externalId), {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return <LegislatorDetailSkeleton />;
  }

  if (swrError || !deputado) {
    const errorMessage =
      swrError instanceof ApiError && swrError.status === 404
        ? 'Deputado não encontrado.'
        : 'Não foi possível carregar os dados deste deputado agora.';

    return (
      <div className="min-h-dvh">
        <Sidebar />
        <MobileBottomNav />
        <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[#FDFDFD] px-6 pb-24 text-center md:pb-0 md:pl-24">
          <p className="text-sm font-semibold text-[#8d0801]">{errorMessage}</p>
          <Link href="/DeputadosPage" className="text-sm text-[#1b623a] underline">
            Voltar para a lista
          </Link>
        </main>
      </div>
    );
  }

  const effectivenessPct =
    deputado.effectiveness_rate !== null ? `${Math.round(Number(deputado.effectiveness_rate) * 100)}%` : '—';

  const tabContent: Record<Tab, React.ReactNode> = {
    'Visão geral': (
      <>
        <p>Nome: {deputado.parliamentary_name}</p>
        <p>Cargo: Deputado(a) Federal</p>
        <p>Partido: {deputado.party ?? '—'}</p>
        {deputado.legislature && <p>Legislatura: {deputado.legislature}ª</p>}
        <p>Estado: {deputado.state ?? '—'}</p>
        <p>Situação: {STATUS_LABELS[deputado.status ?? ''] ?? deputado.status ?? '—'}</p>
        {deputado.email && <p>E-mail: {deputado.email}</p>}
        {deputado.phone && <p>Telefone: {deputado.phone}</p>}
        {deputado.professions.length > 0 && (
          <>
            <p className="mt-3 font-bold">Profissão:</p>
            <p>{deputado.professions.map((p) => p.pivot.original_name ?? p.normalized_name).join(', ')}</p>
          </>
        )}
      </>
    ),
    'Comissões':
      deputado.committees.length > 0 ? (
        <ul className="flex max-h-80 flex-col gap-2 scrollbar-hide overflow-y-auto pr-2">
          {deputado.committees.map((committee) => (
            <li key={committee.id}>
              <strong>{committee.acronym}</strong> — {committee.name}
              {committee.pivot.role && ` (${committee.pivot.role})`}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma comissão registrada.</p>
      ),
    'Proposições': <ProposicoesList bills={deputado.bills} />,
    'Linha do tempo': <LegislativeTimeline bills={deputado.bills} />,
  };

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 text-[#1b623a] md:pb-0 md:pl-24">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
          <Link
            href="/DeputadosPage"
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>

          <section id="perfil" className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
            <div className="flex min-h-[145px] flex-col items-center gap-3 rounded-[10px] p-3 text-center sm:col-span-3 sm:flex-row sm:text-left md:col-span-1">
              <div className="relative h-[195px] w-[170px] shrink-0 overflow-hidden rounded-lg border-4 border-[#8d0801] shadow-sm">
                <Image
                  src={deputado.photo_url || '/deputados.png'}
                  alt={deputado.parliamentary_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase text-[#8d0801] sm:text-xl">{deputado.parliamentary_name}</h1>
                <p className="mt-1 font-bold uppercase text-[#8d0801]">
                  {deputado.party ?? '—'} - {deputado.state ?? '—'}
                </p>
                <p className="mt-3 text-xs font-semibold text-[#8d0801]">Representante do Ceará na Câmara dos Deputados</p>
              </div>
            </div>
            <div className="flex min-h-[120px] items-center justify-center rounded-[10px] bg-[#fbc000] p-3 text-center text-white sm:min-h-[145px]">
              <div>
                <p className="text-base font-black uppercase sm:text-lg">Efetividade Legislativa</p>
                <div className="flex items-center justify-center gap-1.5 text-2xl font-black sm:text-3xl">
                  {effectivenessPct}
                  <InfoTooltip label="Como a efetividade é calculada">
                    <p className="font-bold text-[#8d0801]">Proposições que avançaram</p>
                    <p className="mt-1">
                      {deputado.effectiveness_advanced_bills ?? 0} de {deputado.effectiveness_total_bills ?? 0}{' '}
                      proposições apresentadas avançaram na tramitação.
                    </p>
                  </InfoTooltip>
                </div>
              </div>
            </div>
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-[10px] bg-[#ff7700] p-3 text-center text-white sm:min-h-[145px]">
              <p className="text-base font-black uppercase sm:text-lg">Proposições</p>
              <p className="text-2xl font-black sm:text-3xl">{deputado.effectiveness_total_bills ?? deputado.bills.length}</p>
            </div>
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-[10px] bg-[#1b623a] p-3 text-center text-white sm:min-h-[145px]">
              <p className="text-base font-black uppercase sm:text-lg">Comissões</p>
              <p className="text-2xl font-black sm:text-3xl">{deputado.committees.length}</p>
            </div>
          </section>

          <section id="visao-geral" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
            <div className="flex gap-2 overflow-x-auto rounded-[10px] border-4 border-[#1b623a] bg-white p-2 md:h-[338px] md:w-[160px] md:flex-col md:gap-0 md:overflow-visible md:p-0">
              {tabs.map((tab) => {
                const isActiveTab = activeTab === tab;
                const count = tab === 'Proposições' ? deputado.bills.length : null;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold md:h-[60px] md:w-full md:shrink md:justify-between md:rounded-none md:border-b md:border-[#1b623a] md:px-3 md:text-left last:md:border-0 ${
                      isActiveTab ? `${tabActiveBg[tab]} text-white` : 'text-[#1b623a]'
                    }`}
                  >
                    <span>{tab}</span>
                    {count !== null && (
                      <span className={`text-xs font-bold ${isActiveTab ? 'text-white/80' : 'text-[#1b623a]/70'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <article className={`min-h-[280px] rounded-[10px] p-4 text-white sm:p-6 ${tabPanelColors[activeTab]}`}>
              <h2 className="text-xl font-black uppercase sm:text-2xl md:text-3xl">{activeTab}</h2>
              <div
                className={`mt-3 text-sm leading-relaxed ${
                  activeTab === 'Linha do tempo' ? 'w-full' : 'max-w-4xl'
                }`}
              >
                {tabContent[activeTab]}
              </div>
            </article>
          </section>
        </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
