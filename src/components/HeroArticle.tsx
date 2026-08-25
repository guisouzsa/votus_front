"use client";

import { useState } from "react";

const TABS = ["Mais relevantes", "Mais recentes"];

export default function HeroArticle() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="mt-6">
      <a href="#" className="group relative block h-56 sm:h-72 overflow-hidden rounded-3xl bg-brasil-blue">
        <div
          className="absolute inset-0 bg-linear-to-br from-brasil-blue via-brasil-blue/80 to-brasil-green-deep/80 transition-transform duration-500 group-hover:scale-105"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)" }}
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
          <span className="w-fit rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-brasil-green-deep">
            Congresso Nacional
          </span>
          <h2 className="mt-3 max-w-xl font-display font-bold text-2xl sm:text-3xl text-cream leading-snug">
            Comissão aprova novo pacote de investimentos em infraestrutura
          </h2>
          <p className="mt-2 text-sm text-cream/80">
            Recursos devem priorizar obras de mobilidade urbana e saneamento
          </p>
        </div>
      </a>

      <div className="mt-4 flex gap-2">
        {TABS.map((label) => {
          const isActive = tab === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer border border-line ${
                isActive ? "bg-sand text-forest" : "bg-cream-panel text-forest"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}