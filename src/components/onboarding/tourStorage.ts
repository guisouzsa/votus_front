// Guarda no navegador (localStorage) se a pessoa já concluiu ou pulou o tour
// de uma página — sem backend. A versão vai junto: subir a versão do tour na
// config faz ele aparecer de novo uma vez.
//
// Formato: chave "votus:tour:<pageId>" → {"version":1,"status":"completed","at":"2026-..."}

export type TourStatus = "completed" | "skipped";

type StoredTour = { version: number; status: TourStatus; at: string };

const storageKey = (pageId: string) => `votus:tour:${pageId}`;

export function hasSeenTour(pageId: string, version: number): boolean {
  try {
    const raw = window.localStorage.getItem(storageKey(pageId));
    if (!raw) return false;
    const stored = JSON.parse(raw) as Partial<StoredTour>;
    return stored.version === version;
  } catch {
    // Navegação privada/armazenamento bloqueado: trata como já visto, pra não
    // abrir o tour sozinho em toda visita.
    return true;
  }
}

export function markTourSeen(pageId: string, version: number, status: TourStatus): void {
  try {
    const value: StoredTour = { version, status, at: new Date().toISOString() };
    window.localStorage.setItem(storageKey(pageId), JSON.stringify(value));
  } catch {
    // Sem armazenamento, o tour só não fica lembrado — nada quebra.
  }
}

// Janela de boas-vindas da tela inicial (WelcomeIntro): guardada no mesmo
// formato. Subir a versão faz ela aparecer de novo uma vez.
const WELCOME_ID = "boas-vindas";
const WELCOME_VERSION = 1;

/** Disparado ao fechar a janela; o tour da tela inicial começa depois disso. */
export const WELCOME_CLOSED_EVENT = "votus:boas-vindas-fechada";

export function hasSeenWelcome(): boolean {
  return hasSeenTour(WELCOME_ID, WELCOME_VERSION);
}

export function markWelcomeSeen(): void {
  markTourSeen(WELCOME_ID, WELCOME_VERSION, "completed");
}
