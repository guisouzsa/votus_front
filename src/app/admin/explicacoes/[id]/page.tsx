"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import AdminState from "@/components/admin/AdminState";
import {
  getAdminExplanation,
  updateAdminExplanation,
  publishAdminExplanation,
  type UpdateExplanationPayload,
  type UpdateExplanationQuizQuestionPayload,
} from "@/services/adminService";
import { apiErrorMessage } from "@/services/apiClient";
import type { ExplanationCategory } from "@/services/types";

const CATEGORIAS: ExplanationCategory[] = ["Órgãos e instituições", "Cargos políticos", "Eleições e voto"];

const CAMPOS_TEXTO: { campo: keyof Omit<UpdateExplanationPayload, "quiz" | "category">; label: string }[] = [
  { campo: "title", label: "Tema" },
  { campo: "question_title", label: "Pergunta de abertura" },
  { campo: "summary", label: "Resposta rápida (resumo)" },
  { campo: "what_is", label: "O que é?" },
  { campo: "purpose", label: "Para que serve?" },
  { campo: "practical_role", label: "O que faz na prática?" },
  { campo: "why_it_matters", label: "Por que isso importa?" },
  { campo: "citizen_impact", label: "Como isso afeta você?" },
  { campo: "example", label: "Um exemplo" },
];

export default function AdminExplicacaoEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const { data: explicacao, isLoading, mutate } = useSWR(
    id ? ["admin-explicacao", id] : null,
    () => getAdminExplanation(id),
    { revalidateOnFocus: false }
  );

  const [form, setForm] = useState<UpdateExplanationPayload | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    if (!explicacao || form) return;

    setForm({
      title: explicacao.title,
      question_title: explicacao.question_title,
      category: explicacao.category as ExplanationCategory,
      summary: explicacao.summary ?? "",
      what_is: explicacao.what_is ?? "",
      purpose: explicacao.purpose ?? "",
      practical_role: explicacao.practical_role ?? "",
      why_it_matters: explicacao.why_it_matters ?? "",
      citizen_impact: explicacao.citizen_impact ?? "",
      example: explicacao.example ?? "",
      quiz: (explicacao.quiz_questions ?? []).map((q): UpdateExplanationQuizQuestionPayload => ({
        id: q.id,
        question: q.question,
        explanation: q.explanation ?? "",
        correct_option_id: q.options.find((o) => o.is_correct)?.id ?? q.options[0]?.id ?? 0,
        options: q.options.map((o) => ({ id: o.id, text: o.option_text })),
      })),
    });
  }, [explicacao, form]);

  function atualizarCampo(campo: keyof Omit<UpdateExplanationPayload, "quiz">, valor: string) {
    setForm((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  }

  function atualizarPergunta(index: number, patch: Partial<UpdateExplanationQuizQuestionPayload>) {
    setForm((prev) => {
      if (!prev) return prev;
      const quiz = prev.quiz.map((q, i) => (i === index ? { ...q, ...patch } : q));
      return { ...prev, quiz };
    });
  }

  function atualizarOpcao(perguntaIndex: number, opcaoId: number, texto: string) {
    setForm((prev) => {
      if (!prev) return prev;
      const quiz = prev.quiz.map((q, i) =>
        i === perguntaIndex
          ? { ...q, options: q.options.map((o) => (o.id === opcaoId ? { ...o, text: texto } : o)) }
          : q
      );
      return { ...prev, quiz };
    });
  }

  async function handleSalvar(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;

    setSalvando(true);
    setErro(null);
    setSucesso(null);

    try {
      await updateAdminExplanation(id, form);
      setSucesso("Alterações salvas.");
      mutate();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível salvar. Verifique os campos e tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handlePublicar() {
    setPublicando(true);
    setErro(null);

    try {
      await publishAdminExplanation(id);
      router.push("/admin/explicacoes");
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível publicar. Verifique se o quiz está completo (5 perguntas, 4 alternativas cada, 1 correta)."));
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/explicacoes"
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#8d0801] hover:-translate-x-0.5"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Voltar
      </Link>

      {isLoading && <AdminState type="loading" message="Carregando explicação..." />}
      {!isLoading && !explicacao && <AdminState type="error" message="Explicação não encontrada." />}

      {!isLoading && explicacao && form && (
        <form onSubmit={handleSalvar} className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-black uppercase tracking-wide text-[#1b623a]">Revisar explicação</h1>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-[10px] border border-[#1B623A] px-4 py-2 text-sm font-bold text-[#1B623A] transition-colors hover:bg-[#1B623A]/10 disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>

              {explicacao.status !== "published" && (
                <button
                  type="button"
                  onClick={handlePublicar}
                  disabled={publicando}
                  className="flex items-center gap-1.5 rounded-[10px] bg-[#1b623a] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  {publicando ? "Publicando..." : "Publicar"}
                </button>
              )}
            </div>
          </div>

          {erro && <p className="text-sm font-semibold text-[#8D0801]">{erro}</p>}
          {sucesso && <p className="text-sm font-semibold text-[#1B623A]">{sucesso}</p>}

          <section className="rounded-[12px] border border-line bg-white p-5">
            <label className="flex flex-col text-sm font-bold text-[#1b623a]">
              Categoria
              <select
                value={form.category}
                onChange={(e) => atualizarCampo("category", e.target.value)}
                className="mt-1.5 h-11 w-full max-w-sm rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
              >
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 flex flex-col gap-4">
              {CAMPOS_TEXTO.map(({ campo, label }) => (
                <label key={campo} className="flex flex-col text-sm font-bold text-[#1b623a]">
                  {label}
                  {campo === "title" || campo === "question_title" ? (
                    <input
                      type="text"
                      required
                      value={form[campo]}
                      onChange={(e) => atualizarCampo(campo, e.target.value)}
                      className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
                    />
                  ) : (
                    <textarea
                      required
                      value={form[campo]}
                      onChange={(e) => atualizarCampo(campo, e.target.value)}
                      rows={3}
                      className="mt-1.5 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 py-2.5 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
                    />
                  )}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[12px] border border-line bg-white p-5">
            <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-[#1b623a]">Quiz</h2>

            <div className="flex flex-col gap-5">
              {form.quiz.map((pergunta, index) => (
                <div key={pergunta.id} className="rounded-[10px] border border-line p-4">
                  <label className="flex flex-col text-xs font-bold text-[#6b6255]">
                    Pergunta {index + 1}
                    <input
                      type="text"
                      required
                      value={pergunta.question}
                      onChange={(e) => atualizarPergunta(index, { question: e.target.value })}
                      className="mt-1.5 h-10 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-3 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
                    />
                  </label>

                  <div className="mt-3 flex flex-col gap-2">
                    {pergunta.options.map((opcao) => (
                      <div key={opcao.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correta-${pergunta.id}`}
                          checked={pergunta.correct_option_id === opcao.id}
                          onChange={() => atualizarPergunta(index, { correct_option_id: opcao.id })}
                          className="h-4 w-4 shrink-0 accent-[#1B623A]"
                          aria-label="Marcar como resposta correta"
                        />
                        <input
                          type="text"
                          required
                          value={opcao.text}
                          onChange={(e) => atualizarOpcao(index, opcao.id, e.target.value)}
                          className="h-9 flex-1 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-3 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
                        />
                      </div>
                    ))}
                  </div>

                  <label className="mt-3 flex flex-col text-xs font-bold text-[#6b6255]">
                    Explicação da resposta correta
                    <textarea
                      required
                      value={pergunta.explanation}
                      onChange={(e) => atualizarPergunta(index, { explanation: e.target.value })}
                      rows={2}
                      className="mt-1.5 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-3 py-2 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </form>
      )}
    </div>
  );
}
