import { apiGet } from "./apiClient";
import type { Candidate, SimplePaginatedResponse } from "./types";

export type CandidateOfficeSlug = "presidente" | "governador" | "senado" | "deputado-federal" | "deputado-estadual";

// regiao: Presidente é eleição nacional (candidatos com UF "BR" no TSE); os
// demais cargos são os do Ceará. Usado nos títulos/descrições das páginas.
export const CANDIDATE_OFFICES: Record<
  CandidateOfficeSlug,
  { endpoint: string; label: string; fallbackPhoto: string; regiao: string }
> = {
  presidente: {
    endpoint: "president-candidates",
    label: "Presidente da República",
    fallbackPhoto: "/deputados.png",
    regiao: "no Brasil",
  },
  governador: { endpoint: "governor-candidates", label: "Governador", fallbackPhoto: "/deputados.png", regiao: "no Ceará" },
  senado: { endpoint: "senate-candidates", label: "Senador", fallbackPhoto: "/senadores.png", regiao: "no Ceará" },
  "deputado-federal": {
    endpoint: "federal-deputy-candidates",
    label: "Deputado Federal",
    fallbackPhoto: "/deputados.png",
    regiao: "no Ceará",
  },
  "deputado-estadual": {
    endpoint: "state-deputy-candidates",
    label: "Deputado Estadual",
    fallbackPhoto: "/deputados.png",
    regiao: "no Ceará",
  },
};

export function isCandidateOfficeSlug(value: string): value is CandidateOfficeSlug {
  return value in CANDIDATE_OFFICES;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Hoje o backend usa o disco "supabase" e photo_url já vem absoluta (URL
// pública do bucket). Fotos gravadas antes no disco local do backend vinham
// relativas ("/storage/candidates/123.jpg") — este tratamento continua só pra
// não quebrar se alguma ainda existir. URLs absolutas passam intactas.
function resolvePhotoUrl(photoUrl: string | null): string | null {
  if (!photoUrl || !API_URL) return photoUrl;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;

  return new URL(photoUrl, API_URL).toString();
}

function normalizeCandidate(candidate: Candidate): Candidate {
  return {
    ...candidate,
    photo_url: resolvePhotoUrl(candidate.photo_url),
    running_mates: candidate.running_mates?.map(normalizeCandidate),
  };
}

export interface CandidateFilters {
  party?: string;
  search?: string;
}

// A listagem ganha "filters.parties": todos os partidos com candidatos no
// cargo (não só os da página atual), pra montar o select do filtro.
export type CandidatesResponse = SimplePaginatedResponse<Candidate> & {
  filters?: { parties: string[] };
};

export async function getCandidates(office: CandidateOfficeSlug, page = 1, filters: CandidateFilters = {}) {
  const response = await apiGet<CandidatesResponse>(`/api/${CANDIDATE_OFFICES[office].endpoint}`, {
    page,
    party: filters.party,
    search: filters.search?.trim(),
  });

  return { ...response, data: response.data.map(normalizeCandidate) };
}

export async function getCandidate(office: CandidateOfficeSlug, id: number | string) {
  const response = await apiGet<{ data: Candidate }>(`/api/${CANDIDATE_OFFICES[office].endpoint}/${id}`);

  return normalizeCandidate(response.data);
}

/**
 * Candidato titular do cargo com exatamente esse número de urna (no Ceará o
 * número é único por cargo), ou null se não existir. Usa a busca da
 * listagem (?search=) e confere o número exato no resultado, já que a busca
 * é por trecho (buscar "12" também traria "1234").
 */
export async function findCandidateByNumber(office: CandidateOfficeSlug, numero: string): Promise<Candidate | null> {
  const alvo = numero.trim();
  if (!alvo) return null;

  const response = await getCandidates(office, 1, { search: alvo });

  return response.data.find((candidato) => candidato.ballot_number === alvo) ?? null;
}
