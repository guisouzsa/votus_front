import { apiGet } from "./apiClient";
import type { Legislator, LegislatorDetail, SimplePaginatedResponse } from "./types";

export type { Committee, Bill, Profession, LegislatorDetail } from "./types";

export interface GetSenadoresParams {
  state?: string;
  page?: number;
}

export function getSenadores(params: GetSenadoresParams = {}) {
  return apiGet<SimplePaginatedResponse<Legislator>>("/api/senators", {
    state: params.state,
    page: params.page,
  });
}

export function getSenador(externalId: number | string) {
  return apiGet<LegislatorDetail>(`/api/senators/${externalId}`);
}
