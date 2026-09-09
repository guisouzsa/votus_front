'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingAIButton from '@/components/FloatingAIButton';
import LegislativeTimeline from '@/components/LegislativeTimeline';
import InfoTooltip from '@/components/InfoTooltip';
import ProposicoesList from '@/components/ProposicoesList';
import { getSenador, type LegislatorDetail } from '@/services/senadoresService';
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

export default function ShowSenadoresPage() {
  const params = useParams<{ externalId: string }>();
  const externalId = params.externalId;

  const [senador, setSenador] = useState<LegislatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Visão geral');

  useEffect(() => {
    if (!externalId) return;

    let cancelado = false;
    setLoading(true);
    setError(null);

    getSenador(externalId)
      .then((data) => {
        if (!cancelado) setSenador(data);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? 'Senador não encontrado.'
            : 'Não foi possível carregar os dados deste senador agora.'
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
        <main className="flex min-h-screen items-center justify-center bg-[#FDFDFD] pl-24">
          <p className="text-sm font-semibold text-[#8d0801]">Carregando dados do senador...</p>
        </main>
      </div>
    );
  }

  if (error || !senador) {
    return (
      <div className="min-h-screen">
        <Sidebar />
        <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#FDFDFD] pl-24">
          <p className="text-sm font-semibold text-[#8d0801]">{error ?? 'Senador não encontrado.'}</p>
          <Link href="/SenadoresPage" className="text-sm text-[#1b623a] underline">
            Voltar para a lista
          </Link>
        </main>
      </div>
    );
  }

  const effectivenessPct =
    senador.effectiveness_rate !== null ? `${Math.round(Number(senador.effectiveness_rate) * 100)}%` : '—';

  const tabContent: Record<Tab, React.ReactNode> = {
    'Visão geral': (
      <>
        <p>Nome: {senador.parliamentary_name}</p>
        <p>Cargo: Senador(a)</p>
        <p>Partido: {senador.party ?? '—'}</p>
        {senador.legislature && <p>Legislatura: {senador.legislature}ª</p>}
        <p>Estado: {senador.state ?? '—'}</p>
        <p>Situação: {STATUS_LABELS[senador.status ?? ''] ?? senador.status ?? '—'}</p>
        {senador.email && <p>E-mail: {senador.email}</p>}
        {senador.phone && <p>Telefone: {senador.phone}</p>}
        {senador.professions.length > 0 && (
          <>
            <p className="mt-3 font-bold">Profissão:</p>
            <p>{senador.professions.map((p) => p.pivot.original_name ?? p.normalized_name).join(', ')}</p>
          </>
        )}
      </>
    ),
    'Comissões':
      senador.committees.length > 0 ? (
        <ul className="flex max-h-80 flex-col gap-2 scrollbar-hide overflow-y-auto pr-2">
          {senador.committees.map((committee) => (
            <li key={committee.id}>
              <strong>{committee.acronym}</strong> — {committee.name}
              {committee.pivot.role && ` (${committee.pivot.role})`}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma comissão registrada.</p>
      ),
    'Proposições': <ProposicoesList bills={senador.bills} />,
    'Linha do tempo': <LegislativeTimeline bills={senador.bills} />,
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen bg-[#FDFDFD] text-[#1b623a] pl-24">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
          <Link
            href="/SenadoresPage"
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>

          <section id="perfil" className="grid gap-3 md:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
            <div className="flex min-h-[145px] items-center gap-3 rounded-[10px] p-3">
              <div className="relative h-[195px] w-[170px] shrink-0 overflow-hidden rounded-lg border-4 border-[#8d0801] shadow-sm">
                <Image
                  src={senador.photo_url || '/senadores.png'}
                  alt={senador.parliamentary_name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase text-[#8d0801]">{senador.parliamentary_name}</h1>
                <p className="mt-1 font-bold uppercase text-[#8d0801]">
                  {senador.party ?? '—'} - {senador.state ?? '—'}
                </p>
                <p className="mt-3 text-xs font-semibold text-[#8d0801]">Representante do Ceará no Senado Federal</p>
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
                      {senador.effectiveness_advanced_bills ?? 0} de {senador.effectiveness_total_bills ?? 0}{' '}
                      proposições apresentadas avançaram na tramitação.
                    </p>
                  </InfoTooltip>
                </div>
              </div>
            </div>
            <div className="flex min-h-[145px] flex-col items-center justify-center rounded-[10px] bg-[#ff7700] p-3 text-center text-white">
              <p className="text-lg font-black uppercase">Proposições</p>
              <p className="text-3xl font-black">{senador.effectiveness_total_bills ?? senador.bills.length}</p>
            </div>
            <div className="flex min-h-[145px] flex-col items-center justify-center rounded-[10px] bg-[#1b623a] p-3 text-center text-white">
              <p className="text-lg font-black uppercase">Comissões</p>
              <p className="text-3xl font-black">{senador.committees.length}</p>
            </div>
          </section>

          <section id="visao-geral" className="mt-4 grid gap-3 md:grid-cols-[160px_1fr]">
            <div className="h-[338px] w-[160px] overflow-hidden rounded-[10px] border-4 border-[#1b623a] bg-white">
              {tabs.map((tab) => {
                const isActiveTab = activeTab === tab;
                const count = tab === 'Proposições' ? senador.bills.length : null;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex h-[60px] w-full items-center justify-between border-b border-[#1b623a] px-3 text-left text-sm font-semibold last:border-0 ${
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
