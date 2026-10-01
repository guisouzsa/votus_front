import { apiGet } from "./apiClient";
import type { Legislator, LegislatorDetail, PaginatedResponse } from "./types";

export type { Committee, Bill, Profession, LegislatorDetail } from "./types";

export interface GetDeputiesParams {
  state?: string;
  page?: number;
}

export function getDeputies(params: GetDeputiesParams = {}) {
  return apiGet<PaginatedResponse<Legislator>>("/api/deputies", {
    state: params.state,
    page: params.page,
  });
}

export function getDeputy(externalId: number | string) {
  return apiGet<LegislatorDetail>(`/api/deputies/${externalId}`);
}
