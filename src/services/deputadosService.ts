import { apiGet } from "./apiClient";
import type { Legislator, LegislatorDetail, SimplePaginatedResponse } from "./types";

export type { Committee, Bill, Profession, LegislatorDetail } from "./types";

export interface GetDeputadosParams {
  state?: string;
  page?: number;
}

export function getDeputados(params: GetDeputadosParams = {}) {
  return apiGet<SimplePaginatedResponse<Legislator>>("/api/deputies", {
    state: params.state,
    page: params.page,
  });
}

export function getDeputado(externalId: number | string) {
  return apiGet<LegislatorDetail>(`/api/deputies/${externalId}`);
}
