import { apiGet } from "./apiClient";
import type { Legislator, PaginatedResponse } from "./types";

export interface Committee {
  id: number;
  external_id: string;
  name: string;
  acronym: string;
  pivot: {
    role: string | null;
    start_date: string | null;
    end_date: string | null;
  };
}

export interface Bill {
  id: number;
  external_id: string;
  type: string;
  summary: string;
  presented_at: string | null;
  status_situacao: string | null;
  status_sigla: string | null;
}

export interface Profession {
  id: number;
  normalized_name: string;
  pivot: {
    original_name: string | null;
    is_primary: boolean | null;
  };
}

export interface LegislatorDetail extends Legislator {
  civil_name: string | null;
  legislature: number | null;
  phone: string | null;
  email: string | null;
  official_website: string | null;
  effectiveness_total_bills: number | null;
  effectiveness_advanced_bills: number | null;
  effectiveness_rate: string | null;
  effectiveness_wilson_lower: string | null;
  committees: Committee[];
  bills: Bill[];
  professions: Profession[];
}

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
