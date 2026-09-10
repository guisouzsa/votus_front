"use client";

import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
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
    description: "Lorem ipsum é simplesmente um texto fictício da indústria tipográfica e de impressão.",
    cta: "Ver mais universidades",
    href: "/Universidades",
    Icon: Building2,
    photoClassName: "bg-[#8FB89C]",
    panelClassName: "bg-[#1B623A]",
    ctaClassName: "text-[#1B623A]",
  },
  {
    id: "farmacia",
    tag: "RUSSAS - CE",
    title: "Atendente de Farmácia",
    description: "Lorem ipsum é simplesmente um texto fictício da indústria tipográfica e de impressão.",
    cta: "Ver mais oportunidades",
    href: undefined,
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
      <MobileBottomNav />

      <main className="min-h-screen bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleSrc="/JuventudeEmPauta.svg"
            titleAlt="Juventude em Pauta"
            titleWidth={400}
            titleHeight={117}
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
              ({ id, tag, title, description, cta, href, Icon, photoClassName, panelClassName, ctaClassName }) => (
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
                    {href ? (
                      <Link
                        href={href}
                        className={`mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white ${ctaClassName}`}
                      >
                        {cta}
                        <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={`mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white ${ctaClassName}`}
                      >
                        {cta}
                        <ArrowRight size={16} />
                      </button>
                    )}
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
