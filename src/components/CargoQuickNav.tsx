'use client';

import Link from 'next/link';

const ITENS = [
  { href: '/DeputadosPage', label: 'Deputados' },
  { href: '/SenadoresPage', label: 'Senadores' },
] as const;

/**
 * Navegação rápida entre Deputados/Senadores — mesmo padrão visual e
 * comportamento das abas de cargo em CandidatosPage (pílulas, cor ativa em
 * verde, scroll horizontal no mobile), pra trocar de cargo sem precisar do
 * sidebar.
 */
export default function CargoQuickNav({ atual }: { atual: 'DeputadosPage' | 'SenadoresPage' }) {
  return (
    <nav aria-label="Cargos" className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {ITENS.map(({ href, label }) => {
        const ativo = href === `/${atual}`;
        return (
          <Link
            key={href}
            href={href}
            // scroll={false}: evita a página voltar pro topo ao trocar de
            // cargo (mesma correção aplicada nas abas de CandidatosPage).
            scroll={false}
            aria-current={ativo ? 'page' : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
              ativo
                ? 'border-brasil-green bg-brasil-green text-white'
                : 'border-line bg-white text-ink hover:border-brasil-green/40 hover:text-brasil-green'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
