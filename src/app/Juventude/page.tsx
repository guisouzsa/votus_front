"use client";

import Sidebar from "@/components/Sidebar";
import FloatingAIButton from "@/components/FloatingAIButton";
import DashboardHeader from "@/components/DashboardHeader";
import { ArrowRight, Building2, Pill } from "lucide-react";

const STATS = [
  { value: "98", label: "Universidades no Ceará", className: "bg-[#1B623A]" },
  { value: "462", label: "Vagas de emprego", className: "bg-[#FCC100]" },
  { value: "874", label: "Profissões existentes", className: "bg-[#FF7700]" },
  { value: "28", label: "Vestibulares abertos agora", className: "bg-[#8D0801]" },
];

const OPPORTUNITIES = [
  {
    id: "unifor",
    tag: "RUSSAS - CE",
    title: "Unifor - Universidade de Fortaleza",
    description:
      "Lorem ipsum é simplesmente um texto fictício da indústria tipográfica e de impressão. Lorem Ipsum tem sido o texto padrão desde o ano de 1500.",
    cta: "Ver mais universidades",
    Icon: Building2,
    photoClassName: "bg-[#8FB89C]",
    panelClassName: "bg-[#1B623A]",
    ctaClassName: "text-[#1B623A]",
  },
  {
    id: "farmacia",
    tag: "RUSSAS - CE",
    title: "Atendente de Farmácia",
    description:
      "Lorem ipsum é simplesmente um texto fictício da indústria tipográfica e de impressão. Lorem Ipsum tem sido o texto padrão desde o ano de 1500.",
    cta: "Ver mais oportunidades",
    Icon: Pill,
    photoClassName: "bg-[#FBD7A6]",
    panelClassName: "bg-[#FF7700]",
    ctaClassName: "text-[#FF7700]",
  },
];

export default function JuventudePage() {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="min-h-screen bg-[#FDFDFD] md:pl-24">
        <div
          className="h-8 w-full bg-repeat-x md:h-9"
          style={{ backgroundImage: "url('/sidebar.svg')", backgroundSize: "auto 100%" }}
          aria-hidden="true"
        />

        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleSrc="/JuventudeEmPauta.svg"
            titleAlt="Juventude em Pauta"
            subtitle="Lorem Ipsum é simplesmente um texto fictício da indústria tipográfica e de impressão."
          />

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map(({ value, label, className }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-md px-4 py-4 text-white shadow-sm ${className}`}
              >
                <span className="text-2xl font-black leading-none md:text-3xl">{value}</span>
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {OPPORTUNITIES.map(
              ({ id, tag, title, description, cta, Icon, photoClassName, panelClassName, ctaClassName }) => (
                <article
                  key={id}
                  className="overflow-hidden rounded-md border border-[#D9C29B] shadow-sm"
                >
                  <div className={`relative flex h-40 items-center justify-center ${photoClassName}`}>
                    <Icon size={56} className="text-white/90" strokeWidth={1.5} />
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      {tag}
                    </span>
                  </div>

                  <div className={`p-5 text-white ${panelClassName}`}>
                    <h3 className="font-display text-xl font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">{description}</p>
                    <button
                      type="button"
                      className={`mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white ${ctaClassName}`}
                    >
                      {cta}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
