"use client";

import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import FloatingAIButton from "@/components/FloatingAIButton";
import DashboardHeader from "@/components/DashboardHeader";
import { ArrowLeft, Landmark, Search } from "lucide-react";
import { useState } from "react";

interface FiltrosState {
  estado: string;
  municipio: string;
  curso: string;
  tipoInstituicao: string;
  modalidade: string;
}

const FILTROS_VAZIOS: FiltrosState = {
  estado: "",
  municipio: "",
  curso: "",
  tipoInstituicao: "",
  modalidade: "",
};

const CAMPOS_FILTRO: { id: keyof FiltrosState; label: string; placeholder: string; options: string[] }[] = [
  { id: "estado", label: "Estado", placeholder: "Selecione o estado...", options: [] },
  { id: "municipio", label: "Município", placeholder: "Selecione o município...", options: [] },
  { id: "curso", label: "Curso", placeholder: "Selecione o curso...", options: [] },
  { id: "tipoInstituicao", label: "Tipo de instituição", placeholder: "Selecione a instituição...", options: [] },
  { id: "modalidade", label: "Modalidade", placeholder: "Selecione a modalidade...", options: [] },
];

export default function UniversidadesPage() {
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_VAZIOS);

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileBottomNav />

      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
          <Link
            href="/Juventude"
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>

          <DashboardHeader
            titleSrc="/PainelUniver.svg"
            titleAlt="Painel de Universidades"
            titleWidth={802}
            titleHeight={117}
            subtitle="Encontre universidades e cursos pelo Ceará. Lorem Ipsum é simplesmente um texto fictício da indústria tipográfica e de impressão."
          />

          {/* Filtros */}
          <div className="mt-6 rounded-2xl border border-[#D9C29B] bg-[#FDF8EE] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CAMPOS_FILTRO.map(({ id, label, placeholder, options }) => (
                <label key={id} className="flex flex-col gap-1.5 text-xs font-bold text-[#1B623A]">
                  {label}
                  <span className="relative flex items-center">
                    <Search
                      size={14}
                      strokeWidth={2}
                      className="pointer-events-none absolute left-3 text-[#1B623A]"
                    />
                    <select
                      value={filtros[id]}
                      onChange={(event) =>
                        setFiltros((atual) => ({ ...atual, [id]: event.target.value }))
                      }
                      className="w-full appearance-none rounded-lg border border-[#D9C29B] bg-[#EDDBBA] py-2 pl-8 pr-3 text-xs font-normal text-[#1B623A] outline-none focus:ring-2 focus:ring-[#1B623A]/20"
                    >
                      <option value="">{placeholder}</option>
                      {options.map((opcao) => (
                        <option key={opcao} value={opcao}>
                          {opcao}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-row items-center gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full bg-[#1B623A] px-5 py-2.5 text-sm font-semibold text-[#FDF8EE] transition-colors hover:bg-[#103D23]"
              >
                <Search size={16} />
                Buscar universidades
              </button>
              <button
                type="button"
                onClick={() => setFiltros(FILTROS_VAZIOS)}
                className="flex items-center justify-center rounded-full border border-[#D9C29B] bg-[#EDDBBA] px-5 py-2.5 text-sm font-semibold text-[#1B623A] transition-colors hover:bg-[#E3CFA4]"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          {/* Estado inicial: aguardando o usuário selecionar uma região */}
          <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#D9C29B] bg-[#EDDBBA]/60 p-10 text-center">
            <Landmark size={56} className="text-[#1B623A]" strokeWidth={1.5} />
            <h2 className="text-2xl font-black uppercase leading-tight text-[#1B623A]">
              Comece selecionando
              <br />
              uma região
            </h2>
            <p className="max-w-md text-sm text-[#8D0801]">
              Encontre universidades e cursos pelo Ceará. Lorem Ipsum é simplesmente um texto fictício
            </p>
          </div>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
