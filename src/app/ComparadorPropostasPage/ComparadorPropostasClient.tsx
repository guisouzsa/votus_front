'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, ExternalLink, Info, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import LoadingState from '@/components/LoadingState';
import { useSsrDetail } from '@/hooks/useSsrDetail';
import {
  getProposalTheme,
  getProposalThemes,
  type ProposalTheme,
  type ThemeCandidate,
  type ThemeComparison,
} from '@/services/proposalComparisonService';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EDDBBA]/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6b4f1d]">
      <Sparkles size={11} aria-hidden="true" />
      Gerado por IA
    </span>
  );
}

function ComparisonCard({ comparison }: { comparison: ThemeComparison }) {
  return (
    <section className="rounded-2xl border border-[#e0d6c4] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-black uppercase tracking-wide text-[#1B623A]">Resumo comparativo</h2>
        <AiBadge />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink">{comparison.summary}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: 'Pontos em comum', items: comparison.similarities },
          { title: 'Diferenças', items: comparison.differences },
        ].map(({ title, items }) => (
          <div key={title} className="rounded-xl bg-[#f7f5f2] p-3">
            <h3 className="text-xs font-bold uppercase text-ink-soft">{title}</h3>
            {items.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-ink">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">Nenhum item apontado.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CandidateColumn({ candidate, aiSummary }: { candidate: ThemeCandidate; aiSummary?: string }) {
  return (
    <section className="flex flex-col rounded-2xl border border-[#e0d6c4] bg-white p-4 sm:p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line pb-3">
        <h2 className="text-lg font-black text-ink">
          {candidate.name}
          {candidate.party && <span className="ml-1.5 text-sm font-bold text-ink-soft">({candidate.party})</span>}
        </h2>
        <Link
          href={`/CandidatosPage/presidente/${candidate.external_id}`}
          className="text-xs font-bold text-[#1B623A] underline underline-offset-2"
        >
          Ver perfil
        </Link>
      </header>

      {aiSummary && (
        <div className="mt-3 rounded-xl bg-[#f7f5f2] p-3">
          <AiBadge />
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{aiSummary}</p>
        </div>
      )}

      <ul className="mt-3 space-y-4">
        {candidate.proposals.map((proposal) => (
          <li key={`${proposal.title}-${proposal.source_url}`}>
            <h3 className="text-sm font-bold text-ink">{proposal.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{proposal.description}</p>
            {proposal.source_excerpt && (
              <blockquote className="mt-2 border-l-4 border-[#1B623A]/40 pl-3 text-[13px] italic leading-relaxed text-ink">
                “{proposal.source_excerpt}”
              </blockquote>
            )}
            <a
              href={proposal.source_url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1B623A] underline underline-offset-2"
            >
              Fonte oficial: {hostOf(proposal.source_url)}
              {proposal.source_reference && ` (${proposal.source_reference})`}
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ComparadorPropostasClient({ initialThemes }: { initialThemes?: ProposalTheme[] }) {
  const themesQuery = useSsrDetail(
    ['proposal-themes'],
    () => getProposalThemes().then((response) => response.data),
    initialThemes
  );
  const themes = themesQuery.data;
  const [chosenSlug, setChosenSlug] = useState<string | null>(null);
  const selectedSlug = chosenSlug ?? themes?.[0]?.slug ?? null;

  const detail = useSWR(
    selectedSlug ? ['proposal-theme', selectedSlug] : null,
    () => getProposalTheme(selectedSlug!).then((response) => response.data),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  // Ordem alfabética: nenhum candidato fica sempre na primeira coluna.
  const candidates = useMemo(
    () => [...(detail.data?.candidates ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [detail.data]
  );

  const unavailable = !themesQuery.isLoading && (themesQuery.error || !themes || themes.length === 0);

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-4 py-8 sm:px-10">
          <Link
            href="/CandidatosPage/presidente"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1B623A]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Candidatos a Presidente
          </Link>

          <section className="rounded-lg bg-[#1B623A] px-4 py-3 text-white sm:px-6 sm:py-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80 sm:text-xs">
              Eleições 2026
            </p>
            <h1 className="mt-0.5 text-lg font-black uppercase leading-tight tracking-tight sm:text-xl md:text-2xl">
              Compare as propostas para Presidente
            </h1>
            <p className="mt-1 max-w-3xl text-xs leading-snug text-white/90 sm:text-sm">
              Escolha um tema e veja, lado a lado, o que cada plano de governo propõe, com o trecho e o link da fonte
              oficial.
            </p>
          </section>

          <p className="mt-3 flex items-start gap-2 rounded-xl border border-[#e0d6c4] bg-[#f7f5f2] p-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
            <Info size={16} className="mt-0.5 shrink-0 text-[#1B623A]" aria-hidden="true" />
            <span>
              As propostas foram extraídas automaticamente das páginas oficiais de plano de governo dos candidatos e
              agrupadas por tema com ajuda de inteligência artificial. Os resumos são descritivos e não dizem qual
              proposta é melhor. Pode haver erros de extração: confira sempre o trecho original na fonte.
            </span>
          </p>

          {themesQuery.isLoading && !themes ? (
            <LoadingState message="Carregando temas..." />
          ) : unavailable ? (
            <p role="status" className="mt-6 rounded-2xl border border-[#e0d6c4] bg-white p-5 text-sm text-ink-soft">
              A comparação de propostas ainda não está disponível. Os temas aparecem aqui assim que os planos de governo
              forem processados a partir das fontes oficiais.
            </p>
          ) : (
            <>
              <h2 className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-soft">Temas</h2>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Tema">
                {themes!.map((theme) => (
                  <button
                    key={theme.slug}
                    type="button"
                    role="radio"
                    aria-checked={theme.slug === selectedSlug}
                    onClick={() => setChosenSlug(theme.slug)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                      theme.slug === selectedSlug
                        ? 'border-[#1B623A] bg-[#1B623A] text-white'
                        : 'border-[#e0d6c4] bg-white text-[#1B623A] hover:bg-[#EDDBBA]/40'
                    }`}
                  >
                    {theme.name}
                    <span className="ml-1.5 text-xs font-semibold opacity-75">{theme.proposals_count}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {detail.error && !detail.data ? (
                  <p role="alert" className="rounded-2xl border border-[#e0d6c4] bg-white p-5 text-sm text-[#8d0801]">
                    Não foi possível carregar este tema agora. Tente novamente em instantes.
                  </p>
                ) : !detail.data ? (
                  <LoadingState message="Carregando propostas..." />
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-[#1B623A]">{detail.data.theme.name}</h2>

                    {detail.data.comparison && <ComparisonCard comparison={detail.data.comparison} />}

                    {candidates.length === 1 && (
                      <p className="rounded-xl bg-[#fdf3e7] p-3 text-[13px] text-[#7a4a00]">
                        Só o plano de {candidates[0].name} tem propostas classificadas neste tema.
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {candidates.map((candidate) => (
                        <CandidateColumn
                          key={candidate.id}
                          candidate={candidate}
                          aiSummary={detail.data!.comparison?.candidate_summaries?.[candidate.name]}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
