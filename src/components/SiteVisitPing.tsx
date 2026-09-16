"use client";

import { useEffect } from "react";

const SESSION_KEY = "votus_site_visit_registered";

/**
 * Registra um "acesso" (não um "visitante único") uma vez por aba/sessão de
 * navegador, só pro contador do painel admin — ver App\Http\Controllers\
 * SiteVisitController no backend. Nunca deve afetar a renderização da página:
 * roda depois do mount e ignora qualquer erro silenciosamente.
 */
export default function SiteVisitPing() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Sem storage disponível: segue e registra mesmo assim, sem deduplicar.
    }

    import("@/services/metricsService")
      .then(({ registerSiteVisit }) => registerSiteVisit())
      .catch(() => {});
  }, []);

  return null;
}
