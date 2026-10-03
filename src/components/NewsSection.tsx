"use client";

import { useState } from "react";
import NewsCard, { NewsItem } from "@/components/NewsCard";

// Quantos itens (além do destaque no topo) aparecem na grade do mobile antes
// do "Ver mais" — mantém a seção compacta sem esconder que há mais notícias.
const MOBILE_GRID_INICIAL = 4;

// Quantas notícias aparecem na grade do desktop antes do "Ver mais" — mesma
// lógica do mobile, só que sem destaque separado (grade única, mais colunas).
const DESKTOP_GRID_INICIAL = 4;

export default function NewsSection({
  title,
  items,
}: {
  title: string;
  items: NewsItem[];
}) {
  const [mobileExpandido, setMobileExpandido] = useState(false);
  const [desktopExpandido, setDesktopExpandido] = useState(false);

  const [itemDestaque, ...itensRestantes] = items;
  const itensGradeVisiveis = mobileExpandido
    ? itensRestantes
    : itensRestantes.slice(0, MOBILE_GRID_INICIAL);
  const temMaisItens = itensRestantes.length > MOBILE_GRID_INICIAL;

  const itensDesktopBase = items.slice(0, DESKTOP_GRID_INICIAL);
  const itensDesktopExtra = items.slice(DESKTOP_GRID_INICIAL);
  const temMaisItensDesktop = itensDesktopExtra.length > 0;

  return (
    <section className="mt-10">
      <h3 className="mb-3 font-display text-lg font-bold text-[#103D23]">
        {title}
      </h3>

      {/* Mobile: notícia em destaque + grade 2 colunas (com "Ver mais"), em vez
          do carrossel horizontal do desktop — mais fácil de perceber que há
          várias notícias no tópico sem precisar arrastar a tela. */}
      {itemDestaque && (
        <div className="sm:hidden">
          <div className="mb-3">
            <NewsCard {...itemDestaque} />
          </div>

          {itensGradeVisiveis.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {itensGradeVisiveis.map((item) => (
                <NewsCard key={item.id} {...item} />
              ))}
            </div>
          )}

          {temMaisItens && (
            <button
              type="button"
              onClick={() => setMobileExpandido((valor) => !valor)}
              className="mt-3 w-full rounded-lg border border-black/10 bg-cream-panel py-2 text-sm font-semibold text-[#103D23] transition-colors hover:bg-black/5"
            >
              {mobileExpandido ? "Ver menos" : "Ver mais"}
            </button>
          )}
        </div>
      )}

      {/* Desktop: grade responsiva (2/3/4 colunas conforme a largura), com
          "Ver mais"/"Ver menos" — mesma lógica de expansão do mobile, só que
          numa grade única (sem destaque separado) para aproveitar a largura. */}
      <div className="hidden rounded-xl border border-black/10 bg-cream-panel p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:block sm:p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {itensDesktopBase.map((item) => (
            <NewsCard key={item.id} {...item} />
          ))}
        </div>

        {itensDesktopExtra.length > 0 && (
          <div
            className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: desktopExpandido ? "1fr" : "0fr" }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-4">
                {itensDesktopExtra.map((item) => (
                  <NewsCard key={item.id} {...item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {temMaisItensDesktop && (
          <button
            type="button"
            onClick={() => setDesktopExpandido((valor) => !valor)}
            className="mt-4 w-full rounded-lg border border-black/10 bg-cream-panel py-2 text-sm font-semibold text-[#103D23] transition-colors hover:bg-black/5"
          >
            {desktopExpandido ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </div>
    </section>
  );
}