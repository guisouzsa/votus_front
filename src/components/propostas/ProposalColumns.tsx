import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { IndexProposal } from '@/services/proposalComparisonService';
import Tag from './Tag';
import { coverage, excerptCheck, isPossibleDuplicate, pdfPageUrl } from './coverage';
import type { ComparisonCandidate } from './types';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function ProposalItem({
  proposal,
  candidate,
  themeName,
}: {
  proposal: IndexProposal;
  candidate: ComparisonCandidate;
  themeName: string | null;
}) {
  const check = excerptCheck(proposal, String(candidate.external_id));
  const document = coverage.documents[String(candidate.external_id)];

  return (
    <li className="border-t border-[#efe8da] pt-3 first:border-t-0 first:pt-0">
      {themeName && <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{themeName}</p>}
      <h4 className="mt-0.5 text-sm font-bold text-ink">{proposal.title}</h4>

      <dl className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed">
        <div>
          <dt className="sr-only">Resumo</dt>
          <dd className="text-ink-soft">
            <span className="mr-1 text-[11px] font-bold uppercase text-ink-soft/80">Resumo (IA):</span>
            {proposal.description}
          </dd>
        </div>
        {proposal.source_excerpt && (
          <div>
            <dt className="text-[11px] font-bold uppercase text-ink-soft/80">Trecho original</dt>
            <dd>
              <blockquote className="border-l-4 border-[#1B623A]/30 pl-2.5 italic text-ink">“{proposal.source_excerpt}”</blockquote>
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {check.kind === 'plan' && (
          <a href={pdfPageUrl(document, check.page) ?? '#'} target="_blank" rel="noreferrer noopener" className="rounded-full">
            <Tag tone="verified">Trecho conferido no plano do TSE, p. {check.page}</Tag>
          </a>
        )}
        {check.kind === 'source' && (
          <Tag tone="neutral" title="O trecho existe na página de origem, mas não foi encontrado no plano registrado no TSE">
            Trecho conferido só na página de origem
          </Tag>
        )}
        {check.kind === 'pending' && (
          <Tag tone="pending" title="Sem trecho literal que sustente o resumo">Fonte pendente de validação</Tag>
        )}
        {isPossibleDuplicate(proposal) && <Tag tone="pending">Possível duplicata</Tag>}
        <a
          href={proposal.source_url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B623A] underline underline-offset-2"
        >
          Fonte: {hostOf(proposal.source_url)}
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      </div>
    </li>
  );
}

/**
 * Propostas filtradas, uma coluna por candidato (lado a lado no desktop,
 * empilhadas no celular). A coluna existe mesmo sem proposta, com o motivo.
 */
export default function ProposalColumns({
  candidates,
  proposals,
  themeNames,
  highlightExternalId,
  emptyHint,
  showTheme = true,
}: {
  candidates: ComparisonCandidate[];
  proposals: IndexProposal[];
  themeNames: Record<string, string>;
  highlightExternalId: string | null;
  emptyHint: string;
  /** Rótulo do tema em cada proposta — desnecessário quando um só tema está filtrado. */
  showTheme?: boolean;
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${candidates.length > 1 ? 'lg:grid-cols-2' : ''}`}>
      {candidates.map((candidate) => {
        const own = proposals.filter((p) => p.candidate_id === candidate.id);
        const highlighted = highlightExternalId === String(candidate.external_id);

        return (
          <section
            key={candidate.id}
            aria-labelledby={`coluna-${candidate.id}`}
            className={`rounded-2xl border bg-white p-4 ${highlighted ? 'border-[#1B623A] ring-2 ring-[#1B623A]/20' : 'border-[#e0d6c4]'}`}
          >
            <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-[#e0d6c4] pb-2.5">
              <h3 id={`coluna-${candidate.id}`} className="text-base font-black text-ink">
                {candidate.name}
                {candidate.party && <span className="ml-1.5 text-sm font-bold text-ink-soft">({candidate.party})</span>}
              </h3>
              <span className="text-xs font-semibold text-ink-soft">
                {own.length} {own.length === 1 ? 'proposta' : 'propostas'}
                {' · '}
                <Link href={`/CandidatosPage/presidente/${candidate.external_id}`} className="text-[#1B623A] underline underline-offset-2">
                  Ver perfil
                </Link>
              </span>
            </header>

            {own.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">{emptyHint}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {own.map((proposal, index) => (
                  <ProposalItem
                    key={proposal.id ?? `${proposal.theme_slug}-${index}`}
                    proposal={proposal}
                    candidate={candidate}
                    themeName={showTheme ? themeNames[proposal.theme_slug] ?? proposal.theme_slug : null}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
