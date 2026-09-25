"use client";

import { useConfirm } from "@/components/admin/ConfirmDialog";
import AnswersDonut from "@/components/admin/AnswersDonut";

import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Plus, X, Pencil, Trash2, MessageSquareText, BarChart3, FileDown } from "lucide-react";
import AdminState from "@/components/admin/AdminState";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import {
  getAdminDashboard,
  getAdminSuggestions,
  createAdminSuggestion,
  deleteAdminSuggestion,
  getSuggestionQuestions,
  createSuggestionQuestion,
  updateSuggestionQuestion,
  deleteSuggestionQuestion,
  type SuggestionQuestionPayload,
} from "@/services/adminService";
import { apiErrorMessage } from "@/services/apiClient";
import { generateSugestoesPdf } from "@/lib/generateSugestoesPdf";
import type { AdminSuggestion, SuggestionQuestion, SuggestionQuestionType } from "@/services/types";

const EMPTY_FORM: SuggestionQuestionPayload = { text: "", type: "choice", options: ["", ""], required: true };

function QuestionFormModal({
  inicial,
  onClose,
  onSalvar,
}: {
  inicial: SuggestionQuestion | null;
  onClose: () => void;
  onSalvar: () => void;
}) {
  const [form, setForm] = useState<SuggestionQuestionPayload>(
    inicial
      ? { text: inicial.text, type: inicial.type, options: inicial.options ?? ["", ""], required: inicial.required }
      : EMPTY_FORM
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function setTipo(type: SuggestionQuestionType) {
    setForm((prev) => ({ ...prev, type, options: type === "choice" ? prev.options ?? ["", ""] : undefined }));
  }

  function setOpcao(index: number, valor: string) {
    setForm((prev) => ({
      ...prev,
      options: (prev.options ?? []).map((opcao, i) => (i === index ? valor : opcao)),
    }));
  }

  function adicionarOpcao() {
    setForm((prev) => ({ ...prev, options: [...(prev.options ?? []), ""] }));
  }

  function removerOpcao(index: number) {
    setForm((prev) => ({ ...prev, options: (prev.options ?? []).filter((_, i) => i !== index) }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (inicial && !window.confirm("Tem certeza que deseja atualizar esta pergunta?")) return;

    setErro(null);
    setSalvando(true);

    const payload: SuggestionQuestionPayload = {
      ...form,
      options: form.type === "choice" ? (form.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
    };

    try {
      if (inicial) {
        await updateSuggestionQuestion(inicial.id, payload);
      } else {
        await createSuggestionQuestion(payload);
      }
      onSalvar();
      onClose();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível salvar a pergunta. Verifique os dados e tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">
            {inicial ? "Editar pergunta" : "Nova pergunta"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-[#6b6255] hover:bg-[#FDF8EE]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Pergunta
            <input
              type="text"
              required
              value={form.text}
              onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          <div className="flex flex-col text-sm font-bold text-[#1b623a]">
            Tipo de resposta
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setTipo("choice")}
                className={`flex-1 rounded-[8px] border px-3 py-2 text-xs font-bold ${
                  form.type === "choice" ? "border-[#1B623A] bg-[#1B623A]/10 text-[#1B623A]" : "border-[#d6d1c8] text-[#6b6255]"
                }`}
              >
                Múltipla escolha
              </button>
              <button
                type="button"
                onClick={() => setTipo("text")}
                className={`flex-1 rounded-[8px] border px-3 py-2 text-xs font-bold ${
                  form.type === "text" ? "border-[#1B623A] bg-[#1B623A]/10 text-[#1B623A]" : "border-[#d6d1c8] text-[#6b6255]"
                }`}
              >
                Texto livre
              </button>
            </div>
          </div>

          {form.type === "choice" && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-[#1b623a]">Opções</span>
              {(form.options ?? []).map((opcao, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={opcao}
                    onChange={(event) => setOpcao(index, event.target.value)}
                    className="h-10 flex-1 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-3 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
                  />
                  {(form.options ?? []).length > 2 && (
                    <button
                      type="button"
                      onClick={() => removerOpcao(index)}
                      aria-label="Remover opção"
                      className="rounded-full p-1.5 text-[#8D0801] hover:bg-[#8D0801]/10"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={adicionarOpcao}
                className="self-start text-xs font-bold text-[#1B623A] hover:underline"
              >
                + adicionar opção
              </button>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm font-bold text-[#1b623a]">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(event) => setForm((prev) => ({ ...prev, required: event.target.checked }))}
              className="h-4 w-4"
            />
            Resposta obrigatória
          </label>

          {erro && <p className="text-sm font-semibold text-[#8D0801]">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="flex h-11 items-center justify-center rounded-[10px] bg-[#1b623a] text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : inicial ? "Salvar alterações" : "Cadastrar pergunta"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CadastrarSugestaoModal({ onClose, onCriada }: { onClose: () => void; onCriada: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;

    setSalvando(true);
    setErro(null);

    try {
      await createAdminSuggestion({ name: name.trim() || undefined, message: message.trim() });
      onCriada();
      onClose();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível cadastrar a sugestão. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">
            Registrar sugestão avulsa
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-[#6b6255] hover:bg-[#FDF8EE]">
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-[#6b6255]">
          Use isto para registrar sugestões recebidas por outros canais (redes sociais, conversa
          presencial etc.), fora da pesquisa estruturada.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Nome (opcional)
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Sugestão
            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              className="mt-1.5 min-h-[120px] rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 py-3 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          {erro && <p className="text-sm font-semibold text-[#8D0801]">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="flex h-11 items-center justify-center rounded-[10px] bg-[#1b623a] text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function respostaLinhas(sugestao: AdminSuggestion): { label: string; valor: string }[] {
  if (sugestao.answers.length > 0) {
    return sugestao.answers.map((a) => ({ label: a.question?.text ?? "Pergunta removida", valor: a.answer }));
  }

  // Sugestões antigas (antes das perguntas dinâmicas) guardavam tudo num
  // texto único, uma linha por pergunta, no formato "Pergunta? Resposta" ou
  // "Rótulo: Resposta" — parseamos pra exibir com o mesmo layout das novas.
  if (sugestao.message) {
    return sugestao.message.split("\n").map((linha) => {
      const separadorInterrogacao = linha.indexOf("? ");
      if (separadorInterrogacao !== -1) {
        return {
          label: linha.slice(0, separadorInterrogacao + 1).trim(),
          valor: linha.slice(separadorInterrogacao + 2).trim(),
        };
      }

      const separadorDoisPontos = linha.indexOf(": ");
      if (separadorDoisPontos !== -1) {
        return {
          label: linha.slice(0, separadorDoisPontos).trim(),
          valor: linha.slice(separadorDoisPontos + 2).trim(),
        };
      }

      return { label: "", valor: linha.trim() };
    }).filter((linha) => linha.valor !== "");
  }

  return [];
}

export default function AdminSugestoesPage() {
  const { confirm, confirmDialog } = useConfirm();
  const { data: dashboard } = useSWR("admin-dashboard", getAdminDashboard, { revalidateOnFocus: false });
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const { data, error, isLoading, mutate } = useSWR(
    ["admin-suggestions", page, busca],
    () => getAdminSuggestions(page, busca),
    { revalidateOnFocus: false }
  );

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    setPage(1);
  }
  const {
    data: questionsData,
    error: questionsError,
    isLoading: questionsLoading,
    mutate: mutateQuestions,
  } = useSWR("admin-suggestion-questions", getSuggestionQuestions, { revalidateOnFocus: false });

  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalPergunta, setModalPergunta] = useState<{ aberto: boolean; pergunta: SuggestionQuestion | null }>({
    aberto: false,
    pergunta: null,
  });
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [erroPergunta, setErroPergunta] = useState<string | null>(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);
  const [removendoSugestaoId, setRemovendoSugestaoId] = useState<number | null>(null);
  const [erroSugestao, setErroSugestao] = useState<string | null>(null);

  async function handleRemoverSugestao(sugestao: AdminSuggestion) {
    const ok = await confirm({
      title: "Deseja realmente excluir esta sugestão?",
      message: "Essa ação não pode ser desfeita.",
      confirmLabel: "Excluir",
    });
    if (!ok) return;

    setRemovendoSugestaoId(sugestao.id);
    setErroSugestao(null);

    try {
      await deleteAdminSuggestion(sugestao.id);
      mutate();
      globalMutate("admin-dashboard");
    } catch (err) {
      setErroSugestao(apiErrorMessage(err, "Não foi possível remover a sugestão. Tente novamente."));
    } finally {
      setRemovendoSugestaoId(null);
    }
  }

  async function handleGerarPdf() {
    setGerandoPdf(true);
    setErroPdf(null);

    try {
      await generateSugestoesPdf({ perguntas });
    } catch (err) {
      setErroPdf(apiErrorMessage(err, "Não foi possível gerar o PDF. Tente novamente."));
    } finally {
      setGerandoPdf(false);
    }
  }

  async function handleRemoverPergunta(pergunta: SuggestionQuestion) {
    const ok = await confirm({
      title: "Deseja realmente remover esta pergunta?",
      message: `"${pergunta.text}" — as respostas já recebidas para ela também serão apagadas.`,
      confirmLabel: "Remover",
    });
    if (!ok) return;

    setRemovendoId(pergunta.id);
    setErroPergunta(null);

    try {
      await deleteSuggestionQuestion(pergunta.id);
      mutateQuestions();
    } catch (err) {
      setErroPergunta(apiErrorMessage(err, "Não foi possível remover a pergunta. Tente novamente."));
    } finally {
      setRemovendoId(null);
    }
  }

  const perguntas = questionsData?.data ?? [];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminStatCard label="Sugestões recebidas" value={dashboard?.sugestoes.total ?? "—"} icon={MessageSquareText} />
          <AdminStatCard label="Perguntas ativas" value={perguntas.length} icon={BarChart3} accent="gold" />
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleGerarPdf}
            disabled={gerandoPdf}
            className="flex h-11 items-center gap-2 rounded-[10px] bg-[#1b623a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            <FileDown size={16} />
            {gerandoPdf ? "Gerando PDF..." : "Gerar PDF"}
          </button>
          {erroPdf && <p className="text-xs font-semibold text-[#8D0801]">{erroPdf}</p>}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">
            Perguntas da pesquisa
          </h2>
          <button
            type="button"
            onClick={() => setModalPergunta({ aberto: true, pergunta: null })}
            className="flex items-center gap-2 rounded-[10px] bg-[#1b623a] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#164f30]"
          >
            <Plus size={16} />
            Nova pergunta
          </button>
        </div>

        {questionsLoading && <AdminState type="loading" message="Carregando perguntas..." />}
        {questionsError && <AdminState type="error" message="Não foi possível carregar as perguntas agora." />}
        {erroPergunta && <p className="text-sm font-semibold text-[#8D0801]">{erroPergunta}</p>}
        {perguntas.length === 0 && !questionsLoading && (
          <AdminState type="empty" message="Nenhuma pergunta cadastrada ainda." />
        )}

        {perguntas.map((pergunta) => (
          <div key={pergunta.id} className="rounded-[12px] border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#22201b]">{pergunta.text}</p>
                <p className="mt-1 text-xs text-[#6b6255]">
                  {pergunta.type === "choice" ? "Múltipla escolha" : "Texto livre"}
                  {" · "}
                  {pergunta.required ? "obrigatória" : "opcional"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalPergunta({ aberto: true, pergunta })}
                  aria-label="Editar pergunta"
                  className="rounded-full p-2 text-[#1B623A] hover:bg-[#1B623A]/10"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoverPergunta(pergunta)}
                  disabled={removendoId === pergunta.id}
                  aria-label="Remover pergunta"
                  className="rounded-full p-2 text-[#8D0801] hover:bg-[#8D0801]/10 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <AnswersDonut question={pergunta} />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">
            Sugestões recebidas
          </h2>
          <button
            type="button"
            onClick={() => setModalCadastro(true)}
            className="flex items-center gap-2 rounded-[10px] border border-[#1B623A] px-4 py-2 text-sm font-bold text-[#1B623A] transition-colors hover:bg-[#1B623A]/10"
          >
            <Plus size={16} />
            Registrar avulsa
          </button>
        </div>

        <div className="w-full sm:w-72">
          <AdminSearchInput value={busca} onChange={handleBuscaChange} placeholder="Pesquisar por nome ou conteúdo..." />
        </div>

        {erroSugestao && <p className="text-sm font-semibold text-[#8D0801]">{erroSugestao}</p>}

        {isLoading && <AdminState type="loading" message="Carregando sugestões..." />}
        {error && <AdminState type="error" message="Não foi possível carregar as sugestões agora." />}
        {data?.data.length === 0 && (
          <AdminState
            type="empty"
            message={busca ? "Nenhuma sugestão encontrada para essa busca." : "Nenhuma sugestão recebida ainda."}
          />
        )}

        {data?.data.map((sugestao) => (
          <div key={sugestao.id} className="flex gap-3 rounded-[12px] border border-line bg-white p-5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCC100]/20 text-[#8D6A00]">
              <MessageSquareText size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-[#6b6255]">
                  {sugestao.name ?? "Anônimo"}
                  {sugestao.email ? ` · ${sugestao.email}` : ""} ·{" "}
                  {new Date(sugestao.created_at).toLocaleString("pt-BR")}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoverSugestao(sugestao)}
                  disabled={removendoSugestaoId === sugestao.id}
                  aria-label="Remover sugestão"
                  className="shrink-0 rounded-full p-1.5 text-[#8D0801] transition-colors hover:bg-[#8D0801]/10 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <dl className="mt-3 flex flex-col gap-2">
                {respostaLinhas(sugestao).map((linha, index) => (
                  <div key={index}>
                    {linha.label && (
                      <dt className="text-xs font-bold text-[#1B623A]">{linha.label}</dt>
                    )}
                    <dd className="text-sm text-[#22201b]">{linha.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </section>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
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

      {modalPergunta.aberto && (
        <QuestionFormModal
          inicial={modalPergunta.pergunta}
          onClose={() => setModalPergunta({ aberto: false, pergunta: null })}
          onSalvar={() => mutateQuestions()}
        />
      )}

      {modalCadastro && (
        <CadastrarSugestaoModal
          onClose={() => setModalCadastro(false)}
          onCriada={() => {
            mutate();
            globalMutate("admin-dashboard");
          }}
        />
      )}
      {confirmDialog}
    </div>
  );
}
