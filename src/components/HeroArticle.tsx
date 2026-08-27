"use client";

import { useState } from "react";

export default function HeroArticle() {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="mt-6">
      <a
        href="#"
        className="group relative block h-56 sm:h-72 overflow-hidden rounded-3xl bg-brasil-blue border-2 border-[#1B623A]"
      >
        {!imgLoaded && (
          <div
            className="absolute inset-0 bg-linear-to-br from-brasil-blue via-brasil-blue/80 to-brasil-green-deep/80"
            aria-hidden="true"
          />
        )}

        {!imgError && (
          <img
            src="/foto-noticia-principal.png"
            alt=""
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col justify-start p-6 sm:p-8">
          <span className="w-fit rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-brasil-green-deep">
            Congresso Nacional
          </span>
          <h2 className="mt-3 max-w-xl font-display font-bold text-2xl sm:text-3xl text-cream leading-snug">
            Comissão aprova novo pacote de investimentos em infraestrutura
          </h2>
          <p className="mt-2 max-w-xl text-sm text-cream/80">
            Recursos devem priorizar obras de mobilidade urbana e saneamento
          </p>
        </div>
      </a>

      <div className="mt-6 h-px w-full bg-[#EDDBBA]" aria-hidden="true" />
    </div>
  );
}