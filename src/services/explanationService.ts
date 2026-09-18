import { apiGet } from "./apiClient";
import type { ExplanationApi, ExplanationListResponse } from "./types";

export function getExplanations(page = 1) {
  return apiGet<ExplanationListResponse>("/api/explanations", { page });
}

export function getExplanation(id: number | string) {
  return apiGet<ExplanationApi>(`/api/explanations/${id}`);
}
