'use client';

import { useSsrDetail } from '@/hooks/useSsrDetail';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import Footer from '@/components/Footer';
import LegislatorDetailSkeleton from '@/components/LegislatorDetailSkeleton';
import LegislatorPhoto from '@/components/LegislatorPhoto';
import CandidateExpensesSection from '@/components/CandidateExpensesSection';
import { CANDIDATE_OFFICES, getCandidate, type CandidateOfficeSlug } from '@/services/candidatesService';
import { ApiError } from '@/services/apiClient';

const RACE_COLOR_LABELS: Record<string, string> = {
  BRANCA: 'Branca',
  PRETA: 'Preta',
  PARDA: 'Parda',
  AMARELA: 'Amarela',
  INDÍGENA: 'Indígena',
};

function foiEleito(resultado: string | null): boolean {
  if (!resultado) return false;

  const normalizado = resultado.toLowerCase();
  return normalizado.includes('eleito') && !normalizado.includes('não eleito') && !normalizado.includes('nao eleito');
}

const CHAMBER_LABELS: Record<string, string> = {
  lower_house: 'Deputado(a) Federal',
  senate: 'Senador(a)',
  state_house: 'Deputado(a) Estadual',
};

// Link pro perfil completo de parlamentar em exercício — onde a lista
// inteira de proposições já existe, pra não duplicar aqui. state_house
// (ALECE) não entra: a rota de perfil usa um slug que esse resumo não tem,
// só o id numérico (external_id).
function linkDoMandato(mandato: { chamber: string; id: number }): string | null {
  if (mandato.chamber === 'lower_house') return `/ShowDeputadosPage/${mandato.id}`;
  if (mandato.chamber === 'senate') return `/ShowSenadoresPage/${mandato.id}`;
  return null;
}

function contarPorTipo(bills: { type: string }[]): string {
  const contagem = new Map<string, number>();
  bills.forEach((bill) => contagem.set(bill.type, (contagem.get(bill.type) ?? 0) + 1));

  return Array.from(contagem.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, qtd]) => `${qtd} ${tipo}`)
    .join(', ');
}

function tituloCaso(texto: string | null): string {
  if (!texto) return '—';

  return texto
    .toLowerCase()
    .split(' ')
    .map((palavra) => (palavra.length > 2 ? palavra[0].toUpperCase() + palavra.slice(1) : palavra))
    .join(' ');
}

export default function CandidatoDetailClient({
  office,
  initialData,
}: {
  office: CandidateOfficeSlug;
  initialData?: Awaited<ReturnType<typeof getCandidate>>;
}) {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const config = CANDIDATE_OFFICES[office];

  const {
    data: candidato,
    error: swrError,
    isLoading,
  } = useSsrDetail(id ? ['candidato', office, id] : null, () => getCandidate(office, id), initialData);

  if (isLoading) {
    return <LegislatorDetailSkeleton />;
  }

  if (swrError || !candidato) {
    const errorMessage =
      swrError instanceof ApiError && swrError.status === 404
        ? 'Candidato não encontrado.'
        : 'Não foi possível carregar os dados deste candidato agora.';

    return (
      <div className="min-h-dvh">
        <Sidebar />
        <MobileBottomNav />
        <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[#FDFDFD] px-6 pb-24 text-center md:pb-0 md:pl-24">
          <p className="text-sm font-semibold text-[#8d0801]">{errorMessage}</p>
          <Link href={`/CandidatosPage/${office}`} className="text-sm text-[#1b623a] underline">
            Voltar para a lista
          </Link>
        </main>
      </div>
    );
  }

  const runningMates = candidato.running_mates ?? [];
  const candidacyHistory = candidato.candidacy_history ?? [];
  const previousMandates = candidato.previous_mandates ?? [];

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 text-[#1b623a] md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <Link
            href={`/CandidatosPage/${office}`}
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-[1.35fr_repeat(2,minmax(0,1fr))]">
            <div className="flex min-h-[145px] flex-col items-center gap-3 rounded-[10px] p-3 text-center sm:col-span-3 sm:flex-row sm:text-left md:col-span-1">
              <div className="relative h-[195px] w-[170px] shrink-0 overflow-hidden rounded-lg border-4 border-[#8d0801] shadow-sm">
                <LegislatorPhoto
                  src={candidato.photo_url}
                  alt={candidato.ballot_name}
                  fallbackSrc={config.fallbackPhoto}
                  sizes="170px"
                  className="object-cover"
                  optimize={false}
                />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase text-[#8d0801] sm:text-xl">{candidato.ballot_name}</h1>
                <p className="mt-1 text-xs font-semibold text-[#4d4d4d]">{tituloCaso(candidato.civil_name)}</p>
                <p className="mt-2 font-bold uppercase text-[#8d0801]">
                  {candidato.party.acronym ?? '—'} - {candidato.state ?? '—'}
                </p>
                <p className="mt-3 text-xs font-semibold text-[#8d0801]">
                  Candidato(a) a {config.label} nas eleições de 2026
                </p>
              </div>
            </div>

            <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-[10px] bg-[#f07a00] p-3 text-center text-white sm:min-h-[145px]">
              <p className="text-base font-black uppercase sm:text-lg">Número na urna</p>
              <div className="text-2xl font-black sm:text-3xl">{candidato.ballot_number ?? '—'}</div>
            </div>

            <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-[10px] bg-[#1b623a] p-3 text-center text-white sm:min-h-[145px]">
              <p className="text-base font-black uppercase sm:text-lg">Partido</p>
              <div className="text-sm font-black sm:text-base">{candidato.party.name ?? '—'}</div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[10px] border border-[#e0d6c4] bg-white p-4 text-sm sm:p-6">
              <h2 className="text-base font-black uppercase text-[#1b623a]">Perfil</h2>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Escolaridade</dt>
                  <dd className="text-right font-semibold">{tituloCaso(candidato.education_level)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Ocupação</dt>
                  <dd className="text-right font-semibold">{tituloCaso(candidato.occupation)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Cor/raça (autodeclarada)</dt>
                  <dd className="text-right font-semibold">
                    {candidato.race_color ? RACE_COLOR_LABELS[candidato.race_color] ?? tituloCaso(candidato.race_color) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#4d4d4d]">Situação da candidatura (TSE)</dt>
                  <dd className="text-right font-semibold">{tituloCaso(candidato.judgment_status)}</dd>
                </div>
              </dl>

              {candidato.proposal_document_url && (
                <a
                  href={candidato.proposal_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8d0801] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#6d0601]"
                >
                  <FileText size={14} />
                  Ver plano de governo
                </a>
              )}
            </div>

            <div className="rounded-[10px] border border-[#e0d6c4] bg-white p-4 text-sm sm:p-6">
              <h2 className="text-base font-black uppercase text-[#1b623a]">Histórico de candidaturas</h2>

              {candidacyHistory.length === 0 ? (
                <p className="mt-2 text-[#4d4d4d]">Sem candidatura anterior registrada no TSE.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {candidacyHistory.map((historico) => (
                    <li
                      key={historico.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#e0d6c4] px-3 py-2"
                    >
                      <div>
                        <span className="font-semibold">{tituloCaso(historico.office)}</span>
                        <span className="ml-1.5 text-xs text-[#4d4d4d]">
                          {historico.election_year} · {historico.party.acronym ?? '—'}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          foiEleito(historico.result_status) ? 'bg-[#1B623A] text-white' : 'bg-[#EDDBBA] text-[#6b6255]'
                        }`}
                      >
                        {historico.result_status ?? '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {previousMandates.length > 0 && (
            <section className="mt-4 rounded-[10px] border border-[#e0d6c4] bg-white p-4 sm:p-6">
              <h2 className="text-base font-black uppercase text-[#1b623a]">Vida parlamentar</h2>
              <p className="mt-1 text-xs text-[#4d4d4d]">
                Mandato atual ligado a este candidato pelo CPF — só cobre quem está em exercício hoje.
              </p>

              <ul className="mt-3 flex flex-col gap-2">
                {previousMandates.map((mandato) => {
                  const bills = mandato.bills ?? [];
                  const link = linkDoMandato(mandato);

                  return (
                    <li key={mandato.id} className="rounded-lg border border-[#e0d6c4] px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold">{CHAMBER_LABELS[mandato.chamber] ?? mandato.chamber}</span>
                          <span className="ml-1.5 text-xs text-[#4d4d4d]">
                            {mandato.party ?? '—'} · {mandato.state ?? '—'}
                          </span>
                        </div>
                        {link && (
                          <Link
                            href={link}
                            className="shrink-0 rounded-full bg-[#1B623A] px-3 py-1 text-[11px] font-semibold text-white"
                          >
                            Ver perfil completo →
                          </Link>
                        )}
                      </div>

                      {bills.length > 0 ? (
                        <p className="mt-1.5 text-xs text-[#4d4d4d]">
                          <strong className="text-[#1b623a]">{bills.length}</strong> proposições apresentadas no
                          mandato atual ({contarPorTipo(bills)}).
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs text-[#4d4d4d]">Nenhuma proposição registrada neste mandato.</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {runningMates.length > 0 && (
            <section className="mt-4 rounded-[10px] border border-[#e0d6c4] bg-white p-4 sm:p-6">
              <h2 className="text-base font-black uppercase text-[#1b623a]">Chapa</h2>
              <p className="mt-1 text-xs text-[#4d4d4d]">
                {office === 'governador' || office === 'presidente' ? 'Vice na chapa de' : 'Suplentes na chapa de'} {candidato.ballot_name}.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {runningMates.map((mate) => (
                  <div
                    key={mate.id}
                    className="flex flex-col items-center gap-2 rounded-[12px] border border-[#e0d6c4] bg-[#f7f5f2] p-3 text-center"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#8d0801]/30">
                      <LegislatorPhoto
                        src={mate.photo_url}
                        alt={mate.ballot_name}
                        fallbackSrc={config.fallbackPhoto}
                        sizes="80px"
                        className="object-cover"
                        optimize={false}
                      />
                    </div>
                    <div className="text-xs font-black uppercase text-[#1b623a]">{mate.ballot_name}</div>
                    <div className="text-[11px] font-semibold uppercase text-[#8d0801]">{mate.office}</div>
                    <div className="text-[11px] text-[#4d4d4d]">{mate.party.acronym ?? '—'}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <CandidateExpensesSection office={office} candidateId={candidato.id} summary={candidato.expenses_summary} />
        </div>
        <Footer />
      </main>
      <FloatingAIButton />
    </div>
  );
}
