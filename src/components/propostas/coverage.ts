import coverageData from '@/data/planCoverage.json';
import type { IndexProposal } from '@/services/proposalComparisonService';

// Análise dos planos registrados no TSE (gerada por
// scripts/plan-coverage/audit.js; não vem da API). Chaves de candidato =
// external_id (SQ_CANDIDATO do TSE).

export interface CoverageExcerpt {
  page: number;
  text: string;
}

export interface CoverageCell {
  plan_pages: number[];
  excerpts: CoverageExcerpt[];
  stored_proposal_ids: number[];
}

export interface CoverageSubject {
  slug: string;
  label: string;
  group: string;
  terms: string[];
  candidates: Record<string, CoverageCell>;
}

export interface CoverageDocument {
  name: string;
  plan_pdf_url: string;
  plan_pdf_last_modified: string | null;
  plan_pages: number;
  index_pages: number[];
  extraction_source_url: string;
  extraction_source_text_found_in_plan_pct: number;
}

interface ProposalCheck {
  excerpt_in_plan_page: number | null;
  excerpt_in_extraction_source: boolean | null;
}

interface CoverageFile {
  generated_at: string;
  method: { unit: string; search: string; stored_proposals: string };
  documents: Record<string, CoverageDocument>;
  subjects: CoverageSubject[];
  proposal_checks: Record<string, ProposalCheck>;
  proposal_checks_by_key: Record<string, ProposalCheck>;
  duplicates: [number, number][];
}

export const coverage = coverageData as unknown as CoverageFile;

/** Minúsculas e sem acento, para busca ("saude" acha "Saúde"). */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function pdfPageUrl(document: CoverageDocument | undefined, page: number): string | null {
  return document ? `${document.plan_pdf_url}#page=${page}` : null;
}

// Etiquetas da cobertura de um assunto num plano. Critérios:
//  - mentioned: ao menos uma página do plano (fora sumário/índice) contém um
//    dos termos do assunto;
//  - not_found: nenhuma página contém os termos — o que NÃO prova ausência
//    (o plano pode tratar do assunto com outras palavras);
//  - unverified: não há análise do plano deste candidato.
export type CoverageStatus = 'mentioned' | 'not_found' | 'unverified';

export function coverageStatus(cell: CoverageCell | undefined): CoverageStatus {
  if (!cell) return 'unverified';

  return cell.plan_pages.length > 0 ? 'mentioned' : 'not_found';
}

// Situação do trecho de cada proposta, conferido contra o plano do TSE e
// contra a página de onde a proposta foi extraída.
export type ExcerptCheck =
  | { kind: 'plan'; page: number }
  | { kind: 'source' }
  | { kind: 'pending' }
  | { kind: 'unknown' };

export function excerptCheck(proposal: IndexProposal, candidateExternalId: string): ExcerptCheck {
  if (!proposal.source_excerpt) return { kind: 'pending' };

  const check =
    (proposal.id !== null ? coverage.proposal_checks[String(proposal.id)] : undefined) ??
    coverage.proposal_checks_by_key[`${candidateExternalId}|${normalize(proposal.title).replace(/\s+/g, ' ').trim()}`];
  if (!check) return { kind: 'unknown' };
  if (check.excerpt_in_plan_page) return { kind: 'plan', page: check.excerpt_in_plan_page };
  if (check.excerpt_in_extraction_source) return { kind: 'source' };

  return { kind: 'pending' };
}

const duplicateIds = new Set(coverage.duplicates.flat());

export function isPossibleDuplicate(proposal: IndexProposal): boolean {
  return proposal.id !== null && duplicateIds.has(proposal.id);
}
