// Candidato exibido na comparação: vem do índice da API e, quando ele ainda
// não tem proposta (ou o endpoint agregado não está publicado), da análise
// dos planos (src/data/planCoverage.json) — para a coluna nunca sumir.
export interface ComparisonCandidate {
  id: number;
  external_id: string;
  name: string;
  party: string | null;
  plan_document_url: string | null;
}
