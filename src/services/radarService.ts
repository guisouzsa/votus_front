import { apiGet } from "./apiClient";

// Contrato de GET /api/radar/states e /api/radar/states/{uf} (ver
// RadarController no backend). Câmara, Senado e IBGE vêm em blocos
// separados e nunca são combinados. Um bloco com status 'pending' ainda não
// tem dado calculado (a atualização roda em segundo plano no backend).

export type RadarStatus = "ok" | "pending";

export type RadarIndicatorKey = "population" | "area" | "gdp";

export interface RadarPeriod {
  key: string;
  label: string;
  options: string[];
}

export interface RadarMethodology {
  what_it_measures: string;
  camara: string;
  senado: string;
  multiple_topics: string;
  periods: string;
  ibge: string;
}

export interface RadarIndicatorMeta {
  label: string;
  unit: string | null;
  period: string;
  source: string;
  url: string;
}

export interface RadarIbgeMeta {
  status: RadarStatus;
  generated_at: string | null;
  last_failed_at: string | null;
  // true = valores oficiais guardados no repositório da API (IbgeSnapshot),
  // usados enquanto a consulta ao IBGE falha. Ausente na API antiga.
  from_snapshot?: boolean;
  indicators: Record<RadarIndicatorKey, RadarIndicatorMeta> | null;
}

export interface RadarCamaraMeta {
  status: RadarStatus;
  missing_years: number[];
  generated_at: string | null;
  last_failed_at: string | null;
  source_files: { url: string; last_modified: string | null }[];
}

export interface RadarCamaraTopic {
  code: string;
  name: string;
  count: number;
  share: number;
}

export interface RadarStateInfo {
  uf: string;
  name: string;
  region: string;
  ibge_code: number;
}

export interface RadarOverviewState extends RadarStateInfo {
  indicators: Record<RadarIndicatorKey, number | null> | null;
  camara: { propositions: number; top_topics: RadarCamaraTopic[] } | null;
}

export interface RadarOverview {
  period: RadarPeriod;
  methodology: RadarMethodology;
  ibge: RadarIbgeMeta;
  camara: RadarCamaraMeta;
  states: RadarOverviewState[];
}

export interface RadarSenadoData {
  propositions: number;
  without_topic: number;
  topics: { name: string; count: number }[];
  since: string;
  senators: { code: string; name: string | null; participation: string | null }[];
  details_failed: number;
  small_sample: boolean;
}

export interface RadarStateDetail {
  state: RadarStateInfo;
  period: RadarPeriod;
  methodology: RadarMethodology;
  ibge: RadarIbgeMeta & { values: Record<RadarIndicatorKey, number | null> | null };
  camara: RadarCamaraMeta & {
    data: {
      propositions: number;
      deputies: number | null;
      multi_theme_propositions: number;
      multi_author_same_uf_propositions: number;
      topics: RadarCamaraTopic[];
    } | null;
  };
  senado: {
    status: RadarStatus;
    generated_at: string | null;
    last_failed_at: string | null;
    data: RadarSenadoData | null;
  };
}

export function getRadarOverview(period?: string) {
  return apiGet<RadarOverview>("/api/radar/states", { period });
}

export function getRadarState(uf: string, period?: string) {
  return apiGet<RadarStateDetail>(`/api/radar/states/${uf}`, { period });
}
