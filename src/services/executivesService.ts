import { apiGet } from "./apiClient";
import type { Executive, ExecutiveDetail, ExecutiveRecord, PaginatedResponse } from "./types";

export function getPresidents() {
  return apiGet<PaginatedResponse<Executive>>("/api/president");
}

// Resource único (não coleção) do Laravel vem envelopado em {"data": ...}
// por padrão (sem withoutWrapping() no projeto) — mesmo padrão já usado em
// candidatesService.getCandidate.
export async function getPresident(id: number | string) {
  const response = await apiGet<{ data: ExecutiveDetail }>(`/api/president/${id}`);
  return response.data;
}

// Só Lula e Alckmin têm registro; os demais respondem 404.
export async function getPresidentRecord(id: number | string) {
  const response = await apiGet<{ data: ExecutiveRecord }>(`/api/president/${id}/record`);
  return response.data;
}

export interface GetGovernorsParams {
  state?: string;
}

export function getGovernors(params: GetGovernorsParams = {}) {
  return apiGet<PaginatedResponse<Executive>>("/api/governors", { state: params.state });
}

export async function getGovernor(id: number | string) {
  const response = await apiGet<{ data: ExecutiveDetail }>(`/api/governors/${id}`);
  return response.data;
}
