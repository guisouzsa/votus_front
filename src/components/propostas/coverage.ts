import coverageData from '@/data/planCoverage.json';
import reviewData from '@/data/planReview.json';
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
  title_in_plan_page?: number | null;
  text_in_plan_page?: number | null;
  closest_plan_page?: number | null;
  shared_words_pct?: number;
}

export interface PlanKeyword {
  term: string;
  occurrences: number;
  pages: number[];
}

export interface SharedKeyword {
  term: string;
  candidates: Record<string, { occurrences: number; pages: number[] }>;
}

interface CoverageFile {
  generated_at: string;
  method: { unit: string; search: string; stored_proposals: string; plan_match: string; keywords: string; ignored_words: string[] };
  documents: Record<string, CoverageDocument>;
  subjects: CoverageSubject[];
  proposal_checks: Record<string, ProposalCheck>;
  proposal_checks_by_key: Record<string, ProposalCheck>;
  keywords: Record<string, PlanKeyword[]>;
  shared_keywords: SharedKeyword[];
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

function checkOf(proposal: IndexProposal, candidateExternalId: string): ProposalCheck | undefined {
  return (
    (proposal.id !== null ? coverage.proposal_checks[String(proposal.id)] : undefined) ??
    coverage.proposal_checks_by_key[`${candidateExternalId}|${normalize(proposal.title).replace(/\s+/g, ' ').trim()}`]
  );
}

export function excerptCheck(proposal: IndexProposal, candidateExternalId: string): ExcerptCheck {
  if (proposal.extraction === 'literal') {
    const check = checkOf(proposal, candidateExternalId);
    const page = check?.title_in_plan_page ?? check?.text_in_plan_page;

    return page ? { kind: 'plan', page } : { kind: 'source' };
  }
  if (!proposal.source_excerpt) return { kind: 'pending' };

  const check = checkOf(proposal, candidateExternalId);
  if (!check) return { kind: 'unknown' };
  if (check.excerpt_in_plan_page) return { kind: 'plan', page: check.excerpt_in_plan_page };
  if (check.excerpt_in_extraction_source) return { kind: 'source' };

  return { kind: 'pending' };
}

// Página do plano TSE com mais palavras da proposta em comum. Indício para o
// leitor conferir, não prova de que a proposta está (ou não) no plano.
export function closestPlanPage(
  proposal: IndexProposal,
  candidateExternalId: string,
): { page: number; sharedPct: number } | null {
  const check = checkOf(proposal, candidateExternalId);
  if (!check?.closest_plan_page || check.shared_words_pct === undefined) return null;

  return { page: check.closest_plan_page, sharedPct: check.shared_words_pct };
}

// Revisão das propostas sem texto igual no plano (src/data/planReview.json):
// cada trecho citado foi conferido literalmente na página indicada.
interface ReviewEntry {
  status: 'found' | 'related' | 'not_found';
  page: number | null;
  quote: string | null;
  searched_terms: string[];
}

interface ReviewFile {
  reviewed_at: string;
  method: string;
  candidates: Record<string, Record<string, ReviewEntry>>;
}

export const planReview = reviewData as unknown as ReviewFile;

// Situação documental de uma proposta frente ao plano registrado no TSE —
// um único estado por proposta, usado no filtro, nas etiquetas e nas contagens:
//  - located: texto igual (conferência automática) ou trecho correspondente
//    (revisão), com página;
//  - related: o plano trata do assunto, sem os detalhes da proposta;
//  - not_found: a busca no plano não achou trecho — não prova ausência;
//  - unverified: sem conferência registrada (ou sem trecho literal);
//  - no_document: o plano do candidato não foi analisado.
export type DocumentStatus =
  | { kind: 'located'; page: number; quote: string | null; how: 'exact' | 'review' }
  | { kind: 'related'; page: number; quote: string | null }
  | { kind: 'not_found'; closest: { page: number; sharedPct: number } | null; searchedTerms: string[] }
  | { kind: 'unverified' }
  | { kind: 'no_document' };

export type DocumentStatusKind = DocumentStatus['kind'];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatusKind, string> = {
  located: 'Trecho localizado no plano',
  related: 'Assunto localizado, sem os detalhes',
  not_found: 'Não localizado na busca',
  unverified: 'Não verificado',
  no_document: 'Documento indisponível',
};

export function documentStatus(proposal: IndexProposal, candidateExternalId: string): DocumentStatus {
  if (!coverage.documents[candidateExternalId]) return { kind: 'no_document' };

  const check = excerptCheck(proposal, candidateExternalId);
  if (check.kind === 'plan') {
    return { kind: 'located', page: check.page, quote: proposal.extraction === 'literal' ? null : proposal.source_excerpt, how: 'exact' };
  }

  const review = proposal.id !== null ? planReview.candidates[candidateExternalId]?.[String(proposal.id)] : undefined;
  if (review?.status === 'found' && review.page) return { kind: 'located', page: review.page, quote: review.quote, how: 'review' };
  if (review?.status === 'related' && review.page) return { kind: 'related', page: review.page, quote: review.quote };
  if (review?.status === 'not_found') {
    return { kind: 'not_found', closest: closestPlanPage(proposal, candidateExternalId), searchedTerms: review.searched_terms };
  }

  // Sem revisão: trecho/texto conferido na fonte, mas não no plano.
  if (check.kind === 'source') return { kind: 'not_found', closest: closestPlanPage(proposal, candidateExternalId), searchedTerms: [] };

  return { kind: 'unverified' };
}

const duplicateIds = new Set(coverage.duplicates.flat());

export function isPossibleDuplicate(proposal: IndexProposal): boolean {
  return proposal.id !== null && duplicateIds.has(proposal.id);
}
