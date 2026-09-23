import { apiGet } from "./apiClient";
import type { Candidate, SimplePaginatedResponse } from "./types";

export type CandidateOfficeSlug = "governador" | "senado" | "deputado-federal" | "deputado-estadual";

export const CANDIDATE_OFFICES: Record<CandidateOfficeSlug, { endpoint: string; label: string; fallbackPhoto: string }> = {
  governador: { endpoint: "governor-candidates", label: "Governador", fallbackPhoto: "/deputados.png" },
  senado: { endpoint: "senate-candidates", label: "Senador", fallbackPhoto: "/senadores.png" },
  "deputado-federal": { endpoint: "federal-deputy-candidates", label: "Deputado Federal", fallbackPhoto: "/deputados.png" },
  "deputado-estadual": { endpoint: "state-deputy-candidates", label: "Deputado Estadual", fallbackPhoto: "/deputados.png" },
};

export function isCandidateOfficeSlug(value: string): value is CandidateOfficeSlug {
  return value in CANDIDATE_OFFICES;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// photo_url vem relativo (ex: "/storage/candidates/123.jpg") porque é servido
// pelo próprio backend, diferente das fotos de deputados/senadores (já vêm
// como URL absoluta das APIs da Câmara/Senado).
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

export async function getCandidates(office: CandidateOfficeSlug, page = 1) {
  const response = await apiGet<SimplePaginatedResponse<Candidate>>(`/api/${CANDIDATE_OFFICES[office].endpoint}`, {
    page,
  });

  return { ...response, data: response.data.map(normalizeCandidate) };
}

export async function getCandidate(office: CandidateOfficeSlug, id: number | string) {
  const response = await apiGet<{ data: Candidate }>(`/api/${CANDIDATE_OFFICES[office].endpoint}/${id}`);

  return normalizeCandidate(response.data);
}
