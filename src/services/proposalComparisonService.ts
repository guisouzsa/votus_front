import { apiGet } from "./apiClient";

// Contrato de GET /api/presidential-proposal-comparison/themes e
// /themes/{slug} (ver PresidentialProposalComparisonController no backend).
// As propostas são extraídas dos sites oficiais dos candidatos e a
// comparação é um texto descritivo gerado por IA (Groq) a partir delas.

export interface ProposalTheme {
  slug: string;
  name: string;
  proposals_count: number;
}

export interface CandidateProposal {
  title: string;
  description: string;
  source_excerpt: string | null;
  source_reference: string | null;
  source_url: string;
}

export interface ThemeCandidate {
  id: number;
  external_id: number | string;
  name: string;
  party: string | null;
  proposals: CandidateProposal[];
}

export interface ThemeComparison {
  summary: string;
  similarities: string[];
  differences: string[];
  candidate_summaries: Record<string, string>;
  candidate_one_id: number;
  candidate_two_id: number;
}

export interface ThemeDetail {
  theme: { slug: string; name: string };
  candidates: ThemeCandidate[];
  comparison: ThemeComparison | null;
}

export function getProposalThemes() {
  return apiGet<{ data: ProposalTheme[] }>("/api/presidential-proposal-comparison/themes");
}

export function getProposalTheme(slug: string) {
  return apiGet<{ data: ThemeDetail }>(`/api/presidential-proposal-comparison/themes/${encodeURIComponent(slug)}`);
}
