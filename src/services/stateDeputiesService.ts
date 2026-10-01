import { apiGet } from "./apiClient";
import type { Legislator, LegislatorDetail, PaginatedResponse } from "./types";

export type { Committee, Bill, Profession, LegislatorDetail } from "./types";

export interface GetStateDeputiesParams {
  state?: string;
  page?: number;
}

export function getStateDeputies(params: GetStateDeputiesParams = {}) {
  return apiGet<PaginatedResponse<Legislator>>("/api/state-deputies", {
    state: params.state,
    page: params.page,
  });
}

// Ao contrário de deputados federais/senadores (identificados por
// external_id numérico, vindo das APIs oficiais da Câmara/Senado), os
// deputados estaduais são raspados do site da ALECE e não têm esse external
// id — o backend identifica cada um pelo source_slug (string).
export function getStateDeputy(sourceSlug: string) {
  return apiGet<LegislatorDetail>(`/api/state-deputies/${sourceSlug}`);
}
