"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/lib/news";

export default function HeroArticle({ article }: { article?: NewsArticle }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="mt-6">
      <Link
        href={article ? `/noticias/${article.id}` : "#"}
        aria-disabled={!article}
        className={`group relative block h-56 sm:h-72 overflow-hidden rounded-3xl bg-brasil-blue border-2 border-[#1B623A] ${
          article ? "" : "pointer-events-none"
        }`}
      >
        {!imgLoaded && (
          <div
            className="absolute inset-0 bg-linear-to-br from-brasil-blue via-brasil-blue/80 to-brasil-green-deep/80"
            aria-hidden="true"
          />
        )}

        {!imgError && (
          <Image
            src="/foto-noticia-principal.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 700px"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className="object-cover opacity-100 transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col justify-start p-6 sm:p-8">
          <span className="w-fit px-3 py-1 text-xs font-semibold text-white">
            {article?.category ?? "Notícias"}
          </span>
          <h2 className="mt-3 max-w-xl font-display font-bold text-2xl sm:text-3xl text-cream leading-snug">
            {article?.title ?? "Nenhuma notícia em destaque no momento"}
          </h2>
          {article?.description && (
            <p className="mt-2 max-w-xl line-clamp-2 text-sm text-cream/80">{article.description}</p>
          )}
        </div>
      </Link>

      <div className="mt-6 h-px w-full bg-[#EDDBBA]" aria-hidden="true" />
    </div>
  );
}
