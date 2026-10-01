import { apiGet } from "./apiClient";
import type { Legislator, LegislatorDetail, PaginatedResponse } from "./types";

export type { Committee, Bill, Profession, LegislatorDetail } from "./types";

export interface GetSenatorsParams {
  state?: string;
  page?: number;
}

export function getSenators(params: GetSenatorsParams = {}) {
  return apiGet<PaginatedResponse<Legislator>>("/api/senators", {
    state: params.state,
    page: params.page,
  });
}

export function getSenator(externalId: number | string) {
  return apiGet<LegislatorDetail>(`/api/senators/${externalId}`);
}
