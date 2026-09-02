"use client";

import Sidebar from "@/components/Sidebar";
import FloatingAIButton from "@/components/FloatingAIButton";
import { Search } from "lucide-react";
import { useState } from "react";

interface UniversidadeItem {
  tipo: "Pública" | "Privada";
  instituicao: string;
  curso: string;
  municipio: string;
  modalidade: string;
  grau: string;
  cargaHoraria: string;
  vagas: string;
  detalhesHref?: string;
  universidadeHref?: string;
}

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

const UNIVERSIDADES_PUBLICAS: UniversidadeItem[] = [
  {
    tipo: "Pública",
    instituicao: "Universidade Regional do Cariri",
    curso: "Artes Visuais",
    municipio: "Russas",
    modalidade: "Presencial",
    grau: "Licenciatura",
    cargaHoraria: "3.300 horas",
    vagas: "50 vagas",
  },
];

export default function UniversidadesPage() {
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_VAZIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosState | null>(null);

  const chipsFiltros = filtrosAplicados
    ? ([
        filtrosAplicados.estado && { label: "Estado", valor: filtrosAplicados.estado },
        filtrosAplicados.municipio && { label: "Município", valor: filtrosAplicados.municipio },
        filtrosAplicados.curso && { label: "Curso", valor: filtrosAplicados.curso },
      ].filter(Boolean) as { label: string; valor: string }[])
    : [
        { label: "Estado", valor: "CE" },
        { label: "Município", valor: "Russas" },
        { label: "Curso", valor: "Artes Visuais" },
      ];

  const totalUniversidades = UNIVERSIDADES_PUBLICAS.length;
  const totalPlaceholders = Math.max(3 - UNIVERSIDADES_PUBLICAS.length, 0);

  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="overflow-x-hidden md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          {/* Cabeçalho */}
          <div className="relative">
            {/* Asset final: /public/PainelUniver.svg — ajustar altura ao tamanho real do Figma */}
            <img src="/PainelUniver.svg" alt="Painel de Universidades" className="ml-6 h-10 w-auto sm:ml-10 sm:h-12" />
            <img
              src="/decoracao-pontos.png"
              alt=""
              aria-hidden="true"
              className="absolute right-0 top-0 hidden h-8 w-auto sm:block"
            />
            <p className="mt-2 max-w-2xl text-sm text-[#103D23]">
              Encontre universidades e cursos pelo Ceará. Lorem Ipsum é simplesmente um texto
              fictício da indústria tipográfica e de impressão.
            </p>
          </div>

          {/* Filtros */}
          <div className="mt-6 rounded-2xl border border-[#D9C29B] bg-[#FDF8EE] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CAMPOS_FILTRO.map(({ id, label, placeholder, options }) => (
                <label key={id} className="flex flex-col gap-1.5 text-xs font-bold text-[#8D0801]">
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
                onClick={() => setFiltrosAplicados(filtros)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#1B623A] px-5 py-2.5 text-sm font-semibold text-[#FDF8EE] transition-colors hover:bg-[#103D23]"
              >
                <Search size={16} />
                Buscar universidades
              </button>
              <button
                type="button"
                onClick={() => {
                  setFiltros(FILTROS_VAZIOS);
                  setFiltrosAplicados(null);
                }}
                className="flex items-center justify-center rounded-full border border-[#D9C29B] bg-[#EDDBBA] px-5 py-2.5 text-sm font-semibold text-[#1B623A] transition-colors hover:bg-[#E3CFA4]"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="mt-4 flex flex-col gap-2 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-[#103D23]">Resultados da pesquisa</p>
              <p className="text-sm font-bold text-[#1B623A]">
                {totalUniversidades} {totalUniversidades === 1 ? "Universidade encontrada" : "Universidades encontradas"}
              </p>
            </div>
            {chipsFiltros.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {chipsFiltros.map(({ label, valor }) => (
                  <span key={label} className="text-xs font-bold text-[#1B623A]">
                    {label}: {valor}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Universidades Públicas */}
          <section className="mt-10">
            {/* Asset final: /public/UniverPublicas.svg — ajustar altura ao tamanho real do Figma */}
            <img src="/UniverPublicas.svg" alt="Universidades Públicas" className="h-7 w-auto sm:h-8" />
            <p className="mt-1 max-w-2xl text-sm text-[#103D23]">Encontre universidades e cursos pelo Ceará.</p>

            {totalUniversidades === 0 ? (
              <div className="mt-4 flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-2xl border border-[#D9C29B] bg-[#EDDBBA]/60 p-6 text-center">
                <p className="text-sm font-bold text-[#1B623A]">0 Universidades encontradas</p>
                <p className="text-xs text-[#103D23]">Tente ajustar os filtros de busca.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {UNIVERSIDADES_PUBLICAS.map((item) => (
                  <article
                    key={`${item.instituicao}-${item.curso}`}
                    className="flex flex-col gap-3 rounded-2xl border border-[#D9C29B] bg-[#EDDBBA] p-4"
                  >
                    <span className="w-fit rounded-full bg-[#FCC100] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8D0801]">
                      {item.tipo}
                    </span>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#8D0801]">
                        {item.instituicao}
                      </p>
                      <h3 className="font-display text-xl font-bold text-[#1B623A]">{item.curso}</h3>
                      <p className="text-xs text-[#6B6255]">{item.municipio}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-[#FDF8EE]/70 px-3 py-2">
                        <p className="text-[10px] font-medium text-[#8D0801]">Modalidade</p>
                        <p className="text-sm font-bold text-[#1B623A]">{item.modalidade}</p>
                      </div>
                      <div className="rounded-lg bg-[#FDF8EE]/70 px-3 py-2">
                        <p className="text-[10px] font-medium text-[#8D0801]">Grau</p>
                        <p className="text-sm font-bold text-[#1B623A]">{item.grau}</p>
                      </div>
                      <div className="rounded-lg bg-[#FDF8EE]/70 px-3 py-2">
                        <p className="text-[10px] font-medium text-[#8D0801]">Carga horária</p>
                        <p className="text-sm font-bold text-[#1B623A]">{item.cargaHoraria}</p>
                      </div>
                      <div className="rounded-lg bg-[#FDF8EE]/70 px-3 py-2">
                        <p className="text-[10px] font-medium text-[#8D0801]">Vagas</p>
                        <p className="text-sm font-bold text-[#1B623A]">{item.vagas}</p>
                      </div>
                    </div>

                    <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                      <a
                        href={item.detalhesHref ?? "#"}
                        className="flex-1 rounded-full bg-[#1B623A] px-3 py-2 text-center text-xs font-semibold text-[#FDF8EE] transition-colors hover:bg-[#103D23]"
                      >
                        Ver detalhes do curso
                      </a>
                      <a
                        href={item.universidadeHref ?? "#"}
                        className="flex-1 rounded-full bg-[#FCC100] px-3 py-2 text-center text-xs font-bold text-[#8D0801] transition-colors hover:brightness-95"
                      >
                        Ver universidade
                      </a>
                    </div>
                  </article>
                ))}

                {Array.from({ length: totalPlaceholders }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="min-h-[260px] rounded-2xl border border-[#D9C29B] bg-[#EDDBBA]/60"
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}