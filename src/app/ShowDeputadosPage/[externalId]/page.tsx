'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import FloatingAIButton from '@/components/FloatingAIButton';
import LegislativeTimeline from '@/components/LegislativeTimeline';
import InfoTooltip from '@/components/InfoTooltip';
import ProposicoesList from '@/components/ProposicoesList';
import { getDeputado, type LegislatorDetail } from '@/services/deputadosService';
import { ApiError } from '@/services/apiClient';

const tabs = ['Visão geral', 'Comissões', 'Proposições', 'Linha do tempo'] as const;
type Tab = (typeof tabs)[number];

const tabColors: Record<Tab, string> = {
  'Visão geral': 'text-[#8d0801]',
  'Comissões': 'text-[#fbc000]',
  'Proposições': 'text-[#1c623a]',
  'Linha do tempo': 'text-[#ff7700]',
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

  const [deputado, setDeputado] = useState<LegislatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Visão geral');

  useEffect(() => {
    if (!externalId) return;

    let cancelado = false;
    setLoading(true);
    setError(null);

    getDeputado(externalId)
      .then((data) => {
        if (!cancelado) setDeputado(data);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? 'Deputado não encontrado.'
            : 'Não foi possível carregar os dados deste deputado agora.'
        );
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [externalId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <main className="flex min-h-screen items-center justify-center bg-[#FDFDFD] md:pl-24">
          <p className="text-sm font-semibold text-[#8d0801]">Carregando dados do deputado...</p>
        </main>
      </div>
    );
  }

  if (error || !deputado) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#FDFDFD] md:pl-24">
          <p className="text-sm font-semibold text-[#8d0801]">{error ?? 'Deputado não encontrado.'}</p>
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
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen bg-[#FDFDFD] text-[#1b623a] md:pl-24">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
          <section id="perfil" className="grid gap-3 md:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
            <div className="flex min-h-[145px] items-center gap-3 rounded-[10px] p-3">
              <div className="relative h-[195px] w-[170px] shrink-0 overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src={deputado.photo_url || '/deputados.png'}
                  alt={deputado.parliamentary_name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase text-[#8d0801]">{deputado.parliamentary_name}</h1>
                <p className="mt-1 font-bold uppercase text-[#8d0801]">
                  {deputado.party ?? '—'} - {deputado.state ?? '—'}
                </p>
                <p className="mt-3 text-xs font-semibold text-[#8d0801]">Representante do Ceará na Câmara dos Deputados</p>
              </div>
            </div>
            <div className="flex min-h-[145px] items-center justify-center rounded-[10px] bg-[#fbc000] p-3 text-center text-white">
              <div>
                <p className="text-lg font-black uppercase">Efetividade Legislativa</p>
                <div className="flex items-center justify-center gap-1.5 text-3xl font-black">
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
            <div className="flex min-h-[145px] flex-col items-center justify-center rounded-[10px] bg-[#ff7700] p-3 text-center text-white">
              <p className="text-lg font-black uppercase">Proposições</p>
              <p className="text-3xl font-black">{deputado.effectiveness_total_bills ?? deputado.bills.length}</p>
            </div>
            <div className="flex min-h-[145px] flex-col items-center justify-center rounded-[10px] bg-[#1b623a] p-3 text-center text-white">
              <p className="text-lg font-black uppercase">Comissões</p>
              <p className="text-3xl font-black">{deputado.committees.length}</p>
            </div>
          </section>

          <section id="visao-geral" className="mt-4 grid gap-3 md:grid-cols-[160px_1fr]">
            <div className="h-[338px] w-[160px] overflow-hidden rounded-[10px] border-4 border-[#1b623a] bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`block h-[60px] w-full border-b border-[#1b623a] px-3 text-left text-sm font-semibold last:border-0 ${
                    activeTab === tab ? tabColors[tab] : 'text-[#1b623a]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <article className={`min-h-[280px] rounded-[10px] p-6 text-white ${tabPanelColors[activeTab]}`}>
              <h2 className="text-3xl font-black uppercase">{activeTab}</h2>
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
