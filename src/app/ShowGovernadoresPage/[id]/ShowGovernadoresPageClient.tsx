'use client';

import { useSsrDetail } from '@/hooks/useSsrDetail';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import Footer from '@/components/Footer';
import LegislatorDetailSkeleton from '@/components/LegislatorDetailSkeleton';
import LegislatorPhoto from '@/components/LegislatorPhoto';
import { getGovernor } from '@/services/executivesService';
import { ApiError } from '@/services/apiClient';

const OFFICE_LABELS: Record<string, string> = {
  governor: 'Governador(a)',
  vice_governor: 'Vice-Governador(a)',
};

function formatData(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function tituloCaso(texto: string | null): string {
  if (!texto) return '—';

  return texto
    .toLowerCase()
    .split(' ')
    .map((palavra) => (palavra.length > 2 ? palavra[0].toUpperCase() + palavra.slice(1) : palavra))
    .join(' ');
}

export default function ShowGovernadoresPageClient({
  initialData,
}: {
  initialData?: Awaited<ReturnType<typeof getGovernor>>;
}) {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    data: executivo,
    error: swrError,
    isLoading,
  } = useSsrDetail(id ? ['governador', id] : null, () => getGovernor(id), initialData);

  if (isLoading) {
    return <LegislatorDetailSkeleton />;
  }

  if (swrError || !executivo) {
    const errorMessage =
      swrError instanceof ApiError && swrError.status === 404
        ? 'Registro não encontrado.'
        : 'Não foi possível carregar os dados agora.';

    return (
      <div className="min-h-dvh">
        <Sidebar />
        <MobileBottomNav />
        <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[#FDFDFD] px-6 pb-24 text-center md:pb-0 md:pl-24">
          <p className="text-sm font-semibold text-[#8d0801]">{errorMessage}</p>
          <Link href="/GovernadoresPage" className="text-sm text-[#1b623a] underline">
            Voltar para a lista
          </Link>
        </main>
      </div>
    );
  }

  const acoes = executivo.actions ?? [];

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 text-[#1b623a] md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <Link
            href="/GovernadoresPage"
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-[1.35fr_repeat(2,minmax(0,1fr))]">
            <div className="flex min-h-[145px] flex-col items-center gap-3 rounded-[10px] p-3 text-center sm:col-span-3 sm:flex-row sm:text-left md:col-span-1">
              <div className="relative h-[195px] w-[170px] shrink-0 overflow-hidden rounded-lg border-4 border-[#8d0801] shadow-sm">
                <LegislatorPhoto
                  src={executivo.photo_url}
                  alt={executivo.display_name}
                  fallbackSrc="/deputados.png"
                  sizes="170px"
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase text-[#8d0801] sm:text-xl">{executivo.display_name}</h1>
                <p className="mt-1 font-bold uppercase text-[#8d0801]">{executivo.party.acronym ?? '—'}</p>
                <p className="mt-3 text-xs font-semibold text-[#8d0801]">
                  {OFFICE_LABELS[executivo.office] ?? executivo.office}
                </p>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#e0d6c4] bg-white p-4 text-sm sm:p-6 md:col-span-2">
              <h2 className="text-base font-black uppercase text-[#1b623a]">Perfil</h2>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Nascimento</dt>
                  <dd className="text-right font-semibold">{formatData(executivo.birth_date) ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Naturalidade</dt>
                  <dd className="text-right font-semibold">{tituloCaso(executivo.birth_place)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Ocupação</dt>
                  <dd className="text-right font-semibold">{tituloCaso(executivo.occupation)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Escolaridade</dt>
                  <dd className="text-right font-semibold">{tituloCaso(executivo.education)}</dd>
                </div>
              </dl>

              {executivo.biography && (
                <p className="mt-4 text-sm leading-relaxed text-[#4d4d4d]">{executivo.biography}</p>
              )}
            </div>
          </section>

          <section className="mt-4 rounded-[10px] border border-[#e0d6c4] bg-white p-4 text-sm sm:p-6">
            <h2 className="text-base font-black uppercase text-[#1b623a]">
              Ações recentes {acoes.length > 0 && <span className="text-[#4d4d4d]">({acoes.length})</span>}
            </h2>

            {acoes.length === 0 ? (
              <p className="mt-2 text-[#4d4d4d]">Nenhuma ação registrada.</p>
            ) : (
              <ul className="mt-3 flex max-h-[32rem] flex-col gap-2 overflow-y-auto pr-1 scrollbar-hide">
                {acoes.map((acao) => (
                  <li key={acao.id} className="rounded-lg border border-[#e0d6c4] px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[#103D23]">{acao.title}</span>
                      {formatData(acao.occurred_at) && (
                        <span className="shrink-0 text-xs text-[#4d4d4d]">{formatData(acao.occurred_at)}</span>
                      )}
                    </div>
                    {acao.summary && <p className="mt-1 text-xs text-[#4d4d4d]">{acao.summary}</p>}
                    {acao.source.url && (
                      <a
                        href={acao.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1b623a] hover:underline"
                      >
                        {acao.source.name ?? 'Fonte'}
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <Footer />
      </main>
      <FloatingAIButton />
    </div>
  );
}
