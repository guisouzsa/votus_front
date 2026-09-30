"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NewsCard, { NewsItem } from "@/components/NewsCard";

// Quantos itens (além do destaque no topo) aparecem na grade do mobile antes
// do "Ver mais" — mantém a seção compacta sem esconder que há mais notícias.
const MOBILE_GRID_INICIAL = 4;

export default function NewsSection({
  title,
  items,
}: {
  title: string;
  items: NewsItem[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [mobileExpandido, setMobileExpandido] = useState(false);

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!scrollRef.current) return;

    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  }

  function stopDrag() {
    isDown.current = false;
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDown.current || !scrollRef.current) return;

    e.preventDefault();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;

    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }

  function scrollByAmount(direction: "left" | "right") {
    if (!scrollRef.current) return;

    const amount = scrollRef.current.clientWidth * 0.7;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  const [itemDestaque, ...itensRestantes] = items;
  const itensGradeVisiveis = mobileExpandido
    ? itensRestantes
    : itensRestantes.slice(0, MOBILE_GRID_INICIAL);
  const temMaisItens = itensRestantes.length > MOBILE_GRID_INICIAL;

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

      {/* Desktop: carrossel horizontal original, inalterado */}
      <div className="relative hidden items-center gap-2 rounded-xl border border-black/10 bg-cream-panel p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:flex sm:p-4">
        {/* Seta esquerda: só no desktop, no mobile o gesto de arrastar já é natural */}
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          aria-label="Rolar para a esquerda"
          className="z-10 hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[#103D23] transition-transform hover:scale-110 sm:flex"
        >
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>

        {/* Carrossel */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={stopDrag}
          onMouseUp={stopDrag}
          onMouseMove={onMouseMove}
          className="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-2 cursor-grab select-none active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[80vw] shrink-0 snap-start sm:w-[21rem]"
            >
              <NewsCard {...item} />
            </div>
          ))}
        </div>

        {/* Seta direita: só no desktop, no mobile o gesto de arrastar já é natural */}
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          aria-label="Rolar para a direita"
          className="z-10 hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[#103D23] transition-transform hover:scale-110 sm:flex"
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}