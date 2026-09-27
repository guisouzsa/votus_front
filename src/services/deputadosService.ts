import { apiGet } from "./apiClient";
import type { Legislator, LegislatorDetail, PaginatedResponse } from "./types";

export type { Committee, Bill, Profession, LegislatorDetail } from "./types";

export interface GetDeputadosParams {
  state?: string;
  page?: number;
}

export function getDeputados(params: GetDeputadosParams = {}) {
  return apiGet<PaginatedResponse<Legislator>>("/api/deputies", {
    state: params.state,
    page: params.page,
  });
}

export function getDeputado(externalId: number | string) {
  return apiGet<LegislatorDetail>(`/api/deputies/${externalId}`);
}
