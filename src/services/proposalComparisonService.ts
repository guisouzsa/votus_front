import { ApiError, apiGet } from "./apiClient";

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

export interface IndexCandidate {
  id: number;
  external_id: number | string;
  name: string;
  party: string | null;
  plan_document_url: string | null;
}

export interface IndexProposal extends CandidateProposal {
  id: number | null;
  candidate_id: number;
  theme_slug: string;
}

export interface ProposalIndex {
  candidates: IndexCandidate[];
  themes: { slug: string; name: string }[];
  proposals: IndexProposal[];
}

/**
 * Candidatos, temas e todas as propostas de uma vez (GET .../proposals).
 * Enquanto esse endpoint não estiver publicado (404), monta o mesmo índice a
 * partir de /themes e /themes/{slug}: mais requisições, mesmo conteúdo — mas
 * sem os candidatos sem proposta e sem o id das propostas.
 */
export async function getProposalIndex(): Promise<ProposalIndex> {
  try {
    return (await apiGet<{ data: ProposalIndex }>("/api/presidential-proposal-comparison/proposals")).data;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
  }

  const themes = (await getProposalThemes()).data;
  const details = await Promise.all(themes.map((theme) => getProposalTheme(theme.slug).then((r) => r.data)));
  const candidates = new Map<number, IndexCandidate>();
  const proposals: IndexProposal[] = [];

  for (const detail of details) {
    for (const candidate of detail.candidates) {
      candidates.set(candidate.id, {
        id: candidate.id,
        external_id: candidate.external_id,
        name: candidate.name,
        party: candidate.party,
        plan_document_url: null,
      });
      for (const proposal of candidate.proposals) {
        proposals.push({ ...proposal, id: null, candidate_id: candidate.id, theme_slug: detail.theme.slug });
      }
    }
  }

  return {
    candidates: [...candidates.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    themes: themes.map(({ slug, name }) => ({ slug, name })),
    proposals,
  };
}

export function getProposalThemes() {
  return apiGet<{ data: ProposalTheme[] }>("/api/presidential-proposal-comparison/themes");
}

export function getProposalTheme(slug: string) {
  return apiGet<{ data: ThemeDetail }>(`/api/presidential-proposal-comparison/themes/${encodeURIComponent(slug)}`);
}
