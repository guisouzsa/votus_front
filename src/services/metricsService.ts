import { apiPost } from "./apiClient";

/**
 * Contadores best-effort para o painel admin (Santinhos gerados / Acessos
 * registrados). Nunca devem interromper a experiência pública se falharem —
 * por isso quem chama essas funções deve sempre ignorar o erro (ver
 * SantinhoPage e useSiteVisitPing).
 */
export function registerSantinhoGeneration() {
  return apiPost<{ message: string }>("/api/santinhos", {});
}

export function registerSiteVisit() {
  return apiPost<{ message: string }>("/api/site-visits", {});
}
