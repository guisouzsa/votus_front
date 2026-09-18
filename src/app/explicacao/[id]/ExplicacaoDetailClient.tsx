"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";
import { getExplanation } from "@/services/explanationService";
import type { ExplanationApi, QuizQuestionApi } from "@/services/types";

type CampoConteudo =
  | "what_is"
  | "purpose"
  | "practical_role"
  | "why_it_matters"
  | "citizen_impact"
  | "example";

const SECOES: { campo: CampoConteudo; titulo: string }[] = [
  { campo: "what_is", titulo: "O que é?" },
  { campo: "purpose", titulo: "Para que serve?" },
  { campo: "practical_role", titulo: "O que faz na prática?" },
  { campo: "why_it_matters", titulo: "Por que isso importa?" },
  { campo: "citizen_impact", titulo: "Como isso afeta você?" },
  { campo: "example", titulo: "Um exemplo" },
];

// Mesmo estilo de opção usado em Sugestões (botão com bolinha preenchida em
// vez de checkbox/caixa genérica) — só que aqui, depois de "verificar", a
// opção certa e a errada marcada ganham cor própria (verde/vermelho).
function QuizOptionButton({
  texto,
  selecionada,
  onSelecionar,
  estado,
}: {
  texto: string;
  selecionada: boolean;
  onSelecionar: () => void;
  estado: "neutro" | "certa" | "errada";
}) {
  const estilos =
    estado === "certa"
      ? "border-[#1b623a] bg-[#1b623a]/10 text-[#1b623a]"
      : estado === "errada"
        ? "border-[#8D0801] bg-[#8D0801]/10 text-[#8D0801]"
        : selecionada
          ? "border-[#1b623a] bg-[#1b623a]/10 text-[#1b623a]"
          : "border-[#d6d1c8] bg-[#FDF8EE] text-[#22201b] hover:border-[#1b623a]/40";

  const corBolinha =
    estado === "certa" ? "border-[#1b623a]" : estado === "errada" ? "border-[#8D0801]" : selecionada ? "border-[#1b623a]" : "border-[#d6d1c8]";

  const corPreenchimento = estado === "certa" ? "bg-[#1b623a]" : estado === "errada" ? "bg-[#8D0801]" : "bg-[#1b623a]";

  return (
    <button
      type="button"
      onClick={onSelecionar}
      aria-pressed={selecionada}
      className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left text-sm font-semibold transition-colors ${estilos}`}
    >
      <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${corBolinha}`}>
        {(selecionada || estado === "certa") && <span className={`h-2 w-2 rounded-full ${corPreenchimento}`} />}
      </span>
      {texto}
    </button>
  );
}

function QuizCard({ pergunta, indice }: { pergunta: QuizQuestionApi; indice: number }) {
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [verificada, setVerificada] = useState(false);

  const opcaoSelecionada = pergunta.options.find((o) => o.id === selecionada);
  const acertou = opcaoSelecionada?.is_correct ?? false;

  return (
    <div className="border-t border-line pt-6">
      <h3 className="text-base font-bold text-[#1b623a]">
        <span className="text-[#8D0801]">{indice + 1}. </span>
        {pergunta.question}
      </h3>

      <div className="mt-3 flex flex-col gap-2">
        {pergunta.options.map((opcao) => {
          const isSelected = selecionada === opcao.id;
          const estado: "neutro" | "certa" | "errada" = !verificada
            ? "neutro"
            : opcao.is_correct
              ? "certa"
              : isSelected
                ? "errada"
                : "neutro";

          return (
            <QuizOptionButton
              key={opcao.id}
              texto={opcao.text}
              selecionada={isSelected}
              estado={estado}
              onSelecionar={() => {
                if (verificada) return;
                setSelecionada(opcao.id);
              }}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {!verificada && (
          <button
            type="button"
            onClick={() => setVerificada(true)}
            disabled={selecionada === null}
            className="w-fit rounded-[10px] bg-[#1b623a] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Verificar resposta
          </button>
        )}

        {verificada && (
          <div
            className={`flex items-start gap-2 rounded-[10px] border px-4 py-3 text-sm ${
              acertou ? "border-[#1b623a]/30 bg-[#1b623a]/5 text-[#164f30]" : "border-[#8D0801]/30 bg-[#8D0801]/5 text-[#8D0801]"
            }`}
          >
            {acertou ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-bold">{acertou ? "Resposta correta!" : "Ainda não é essa."}</p>
              {pergunta.explanation && <p className="mt-1 leading-relaxed">{pergunta.explanation}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplicacaoDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: explicacao, isLoading } = useSWR(id ? ["explicacao", id] : null, () => getExplanation(id), {
    revalidateOnFocus: false,
  });

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 pb-2 pt-8 sm:px-10">
          <Link
            href="/explicacao"
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>
        </div>

        {isLoading && (
          <p className="px-6 py-16 text-center text-sm text-[#103D23] sm:px-10">Carregando...</p>
        )}

        {!isLoading && !explicacao && (
          <p className="px-6 py-16 text-center text-sm text-[#103D23] sm:px-10">
            Explicação não encontrada.
          </p>
        )}

        {!isLoading && explicacao && (
          <article className="w-full px-6 pb-16 sm:px-10">
            <header className="border-b border-line pb-6">
              <span className="mb-3 inline-flex rounded-full bg-[#EDDBBA]/50 px-3 py-1 text-xs font-bold text-[#1B623A]">
                {explicacao.category}
              </span>
              <h1 className="font-heading text-3xl font-bold leading-tight text-[#8D0801] sm:text-4xl">
                {explicacao.question_title}
              </h1>
            </header>

            {explicacao.summary && (
              <section className="mt-6 rounded-2xl border border-[#1B623A]/20 bg-[#1B623A]/5 p-5 sm:p-6">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#1B623A]">
                  Resposta rápida
                </p>
                <p className="text-base font-medium leading-relaxed text-[#22201b]">{explicacao.summary}</p>
              </section>
            )}

            <div className="mt-5 flex flex-col gap-4">
              {SECOES.map(({ campo, titulo }) => {
                const texto = explicacao[campo];
                if (!texto) return null;

                return (
                  <section key={campo} className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-2 text-lg font-bold text-[#22201b]">{titulo}</h2>
                    <p className="text-sm leading-relaxed text-[#6b6255] sm:text-base">{texto}</p>
                  </section>
                );
              })}
            </div>

            {explicacao.sources && explicacao.sources.length > 0 && (
              <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-1 text-lg font-bold text-[#22201b]">Fontes</h2>
                <p className="mb-4 text-xs text-[#6b6255]">
                  Consulte as fontes utilizadas na elaboração deste conteúdo.
                </p>

                <div className="flex flex-col gap-2.5">
                  {explicacao.sources.map((fonte) => (
                    <a
                      key={fonte.id}
                      href={fonte.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-[#1B623A]/30 hover:bg-[#FDF8EE]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#22201b] group-hover:text-[#1B623A]">
                          {fonte.name}
                        </p>
                        <p className="truncate text-xs text-[#6b6255]">{fonte.domain}</p>
                      </div>
                      <ExternalLink size={16} className="shrink-0 text-[#1B623A]" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {explicacao.quiz_questions && explicacao.quiz_questions.length > 0 && (
              <section className="mt-10">
                <div className="mb-5">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#1B623A]">Quiz</p>
                  <h2 className="text-2xl font-black text-[#22201b]">Teste o que você aprendeu</h2>
                  <p className="mt-1.5 text-sm text-[#6b6255]">
                    Responda às perguntas e confira a explicação de cada resposta.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {explicacao.quiz_questions.map((pergunta, indice) => (
                    <QuizCard key={pergunta.id} pergunta={pergunta} indice={indice} />
                  ))}
                </div>
              </section>
            )}
          </article>
        )}

        <Footer />
      </main>

      <FloatingAIButton />
    </div>
  );
}
