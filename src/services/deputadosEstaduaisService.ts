import { apiGet } from "./apiClient";
import type { Legislator, LegislatorDetail, PaginatedResponse } from "./types";

export type { Committee, Bill, Profession, LegislatorDetail } from "./types";

export interface GetDeputadosEstaduaisParams {
  state?: string;
  page?: number;
}

export function getDeputadosEstaduais(params: GetDeputadosEstaduaisParams = {}) {
  return apiGet<PaginatedResponse<Legislator>>("/api/state-deputies", {
    state: params.state,
    page: params.page,
  });
}

// Ao contrário de deputados federais/senadores (identificados por
// external_id numérico, vindo das APIs oficiais da Câmara/Senado), os
// deputados estaduais são raspados do site da ALECE e não têm esse external
// id — o backend identifica cada um pelo source_slug (string).
export function getDeputadoEstadual(sourceSlug: string) {
  return apiGet<LegislatorDetail>(`/api/state-deputies/${sourceSlug}`);
}
