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

// A ALECE tem 52 deputados estaduais, mas a API pagina de 50 em 50 — a tela
// precisa do time inteiro de uma vez (pra estatísticas, filtro de partido e
// busca baterem com a realidade), não só a primeira página. Busca a 1ª
// página e, se houver mais, busca o resto em paralelo e junta tudo num único
// resultado "sem paginação" (last_page sempre 1), que é o que o resto do
// código já espera.
export async function getAllStateDeputies(params: Omit<GetStateDeputiesParams, "page"> = {}): Promise<PaginatedResponse<Legislator>> {
  const first = await getStateDeputies({ ...params, page: 1 });

  if (first.meta.last_page <= 1) return first;

  const rest = await Promise.all(
    Array.from({ length: first.meta.last_page - 1 }, (_, i) => getStateDeputies({ ...params, page: i + 2 }))
  );

  const data = [...first.data, ...rest.flatMap((page) => page.data)];

  return {
    ...first,
    data,
    meta: {
      ...first.meta,
      current_page: 1,
      last_page: 1,
      from: data.length > 0 ? 1 : null,
      to: data.length,
      per_page: data.length,
      total: data.length,
    },
  };
}

// Ao contrário de deputados federais/senadores (identificados por
// external_id numérico, vindo das APIs oficiais da Câmara/Senado), os
// deputados estaduais são raspados do site da ALECE e não têm esse external
// id — o backend identifica cada um pelo source_slug (string).
export function getStateDeputy(sourceSlug: string) {
  return apiGet<LegislatorDetail>(`/api/state-deputies/${sourceSlug}`);
}
