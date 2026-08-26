"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NewsCard, { NewsItem } from "@/components/NewsCard";

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

  // Repete os itens apenas para preencher o carrossel
  // enquanto houver poucos itens vindos da API.
  const displayItems =
    items.length > 0
      ? [...items, ...items].slice(0, Math.max(items.length, 6))
      : items;

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

  return (
    <section className="mt-10">
      <h3 className="mb-3 font-display text-lg font-bold text-[#103D23]">
        {title}
      </h3>

      <div className="relative rounded-3xl border border-black/10 bg-cream-panel p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-5">
        {/* Seta esquerda */}
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          aria-label="Rolar para a esquerda"
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-brasil-green text-white shadow-md transition-transform hover:scale-110"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {/* Seta direita */}
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          aria-label="Rolar para a direita"
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-brasil-green text-white shadow-md transition-transform hover:scale-110"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>

        {/* Carrossel */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={stopDrag}
          onMouseUp={stopDrag}
          onMouseMove={onMouseMove}
          className="flex gap-4 overflow-x-auto px-8 pb-2 cursor-grab select-none active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayItems.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="w-72 shrink-0 sm:w-80"
            >
              <NewsCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
