const STORAGE_KEY = "votus_admin_token";

/**
 * Token Sanctum (Bearer) do painel admin. Guardado em localStorage — a
 * proteção de verdade é o backend rejeitar qualquer chamada sem token válido
 * (ver EnsureIsAdmin), isso aqui só evita mostrar a tela pra quem não logou.
 */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Sem storage disponível (ex: navegação privada) — sessão não persiste entre reloads.
  }
}

export function clearAdminToken(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada a limpar.
  }
}
