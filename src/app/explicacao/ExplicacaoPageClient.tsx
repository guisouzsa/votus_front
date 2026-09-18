"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import DashboardHeader from "@/components/DashboardHeader";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";
import { getExplanations } from "@/services/explanationService";
import { ApiError } from "@/services/apiClient";

function ExplicacaoCardSkeleton() {
  return <div className="h-56 animate-pulse rounded-2xl border border-line bg-[#eee6d8]" />;
}

export default function ExplicacaoPageClient() {
  const [page, setPage] = useState(1);

  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR(["explicacoes", page], () => getExplanations(page), { revalidateOnFocus: false });

  const error = swrError
    ? swrError instanceof ApiError
      ? "Não foi possível carregar as explicações agora. Tente novamente em instantes."
      : "Ocorreu um erro inesperado ao carregar as explicações."
    : null;

  const explicacoes = data?.data ?? [];

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Você sabe?"
            titleColor="text-[#8C0801]"
            titleClassName="font-heading"
            subtitle="Entenda conceitos importantes de política e cidadania, e teste o que aprendeu com um quiz."
          />

          {isLoading && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ExplicacaoCardSkeleton key={n} />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <p className="mt-10 text-sm font-semibold text-[#8D0801]">{error}</p>
          )}

          {!isLoading && !error && explicacoes.length === 0 && (
            <p className="mt-10 text-sm text-[#103D23]">
              Nenhuma explicação publicada ainda. Volte em breve.
            </p>
          )}

          {!isLoading && !error && explicacoes.length > 0 && (
            <>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {explicacoes.map((explicacao) => (
                  <Link
                    key={explicacao.id}
                    href={`/explicacao/${explicacao.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#1B623A]/40 hover:shadow-md"
                  >
                    <span className="w-fit rounded-full bg-[#EDDBBA]/50 px-3 py-1 text-xs font-bold text-[#1B623A]">
                      {explicacao.category}
                    </span>

                    <h2 className="mt-4 font-heading text-lg font-bold leading-snug text-[#22201b]">
                      {explicacao.question_title}
                    </h2>

                    {explicacao.summary && (
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[#6b6255]">
                        {explicacao.summary}
                      </p>
                    )}

                    <div className="mt-auto pt-5">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1B623A] transition-transform group-hover:translate-x-1">
                        Entenda
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {data && data.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-[8px] border border-line px-4 py-2 text-sm font-bold text-[#22201b] disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-[#6b6255]">
                    Página {data.current_page} de {data.last_page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                    disabled={page >= data.last_page}
                    className="rounded-[8px] border border-line px-4 py-2 text-sm font-bold text-[#22201b] disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </main>

      <FloatingAIButton />
    </div>
  );
}
