"use client";

import { useRef } from "react";
import NewsCard, { NewsItem } from "@/components/NewsCard";

export default function NewsSection({ title, items }: { title: string; items: NewsItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  }

  function stopDrag() {
    isDown.current = false;
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-4">
        <h3 className="font-display text-lg font-bold text-ink shrink-0">{title}</h3>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={stopDrag}
        onMouseUp={stopDrag}
        onMouseMove={onMouseMove}
        className="flex gap-4 overflow-x-auto pb-2 cursor-grab select-none active:cursor-grabbing [scrollbar-width:thin]"
      >
        {items.map((item, i) => (
          <div key={i} className="w-64 shrink-0">
            <NewsCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
}