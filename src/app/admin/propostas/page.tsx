"use client";

import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Trash2, FileCheck2, FileX2, MessageSquareText } from "lucide-react";
import AdminState from "@/components/admin/AdminState";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import {
  getAdminDashboard,
  getAdminProposals,
  deleteAdminProposal,
  getAdminProposalComments,
  deleteAdminProposalComment,
} from "@/services/adminService";
import { apiErrorMessage } from "@/services/apiClient";

function ProposalCommentsPanel({ proposalId }: { proposalId: number }) {
  const { data, error, isLoading, mutate } = useSWR(
    ["admin-proposal-comments", proposalId],
    () => getAdminProposalComments(proposalId),
    { revalidateOnFocus: false }
  );
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleRemover(commentId: number) {
    if (!window.confirm("Tem certeza que deseja excluir este comentário?")) return;

    setRemovendoId(commentId);
    setErro(null);

    try {
      await deleteAdminProposalComment(proposalId, commentId);
      mutate();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível excluir o comentário. Tente novamente."));
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      {isLoading && <p className="text-xs text-[#6b6255]">Carregando comentários...</p>}
      {error && <p className="text-xs font-semibold text-[#8D0801]">Não foi possível carregar os comentários.</p>}
      {erro && <p className="mb-2 text-xs font-semibold text-[#8D0801]">{erro}</p>}
      {data?.data.length === 0 && <p className="text-xs text-[#6b6255]">Nenhum comentário nesta proposta.</p>}

      <div className="flex flex-col gap-3">
        {data?.data.map((comment) => (
          <div key={comment.id} className="flex items-start justify-between gap-3 rounded-[10px] bg-[#FDF8EE] p-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#22201b]">
                {comment.author_name} · {new Date(comment.created_at).toLocaleDateString("pt-BR")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[#22201b]">{comment.content}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemover(comment.id)}
              disabled={removendoId === comment.id}
              aria-label="Excluir comentário"
              className="flex shrink-0 items-center gap-1.5 rounded-[8px] border border-[#8D0801] px-3 py-1.5 text-xs font-bold text-[#8D0801] transition-colors hover:bg-[#8D0801] hover:text-white disabled:opacity-60"
            >
              <Trash2 size={13} />
              {removendoId === comment.id ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  published: { label: "Publicada", className: "bg-[#1B623A]/10 text-[#1B623A]" },
  draft: { label: "Rascunho", className: "bg-[#FCC100]/20 text-[#8D6A00]" },
  removed: { label: "Removida", className: "bg-[#8D0801]/10 text-[#8D0801]" },
};

export default function AdminPropostasPage() {
  const { data: dashboard } = useSWR("admin-dashboard", getAdminDashboard, { revalidateOnFocus: false });
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const { data, error, isLoading, mutate } = useSWR(
    ["admin-proposals", page, busca],
    () => getAdminProposals(page, busca),
    { revalidateOnFocus: false }
  );
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);
  const [comentariosAbertos, setComentariosAbertos] = useState<number | null>(null);

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  async function handleRemover(id: number) {
    if (!window.confirm("Tem certeza que deseja remover esta proposta?")) return;

    setRemovendoId(id);
    setErroRemocao(null);

    try {
      await deleteAdminProposal(id);
      mutate();
      globalMutate("admin-dashboard");
    } catch (err) {
      setErroRemocao(apiErrorMessage(err, "Não foi possível remover a proposta. Tente novamente."));
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminStatCard label="Propostas publicadas" value={dashboard?.moderacao.propostas_publicadas ?? "—"} icon={FileCheck2} />
        <AdminStatCard label="Propostas removidas" value={dashboard?.moderacao.propostas_removidas ?? "—"} icon={FileX2} accent="red" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">
          Propostas publicadas
        </h2>
        <div className="w-full sm:w-72">
          <AdminSearchInput value={busca} onChange={handleBuscaChange} placeholder="Pesquisar por título ou autor..." />
        </div>
      </div>

      {isLoading && <AdminState type="loading" message="Carregando propostas..." />}
      {error && <AdminState type="error" message="Não foi possível carregar as propostas agora." />}
      {erroRemocao && <p className="text-sm font-semibold text-[#8D0801]">{erroRemocao}</p>}
      {data?.data.length === 0 && <AdminState type="empty" message="Nenhuma proposta encontrada." />}

      {data?.data.map((proposta) => {
        const status = STATUS_LABEL[proposta.status] ?? {
          label: proposta.status,
          className: "bg-[#FDF8EE] text-[#6b6255]",
        };
        const inicial = (proposta.author ?? "?").trim().charAt(0).toUpperCase();

        return (
          <div key={proposta.id} className="rounded-[12px] border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B623A]/10 text-sm font-black text-[#1B623A]">
                  {inicial}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#22201b]">{proposta.title}</p>
                  <p className="mt-0.5 text-xs text-[#6b6255]">
                    {proposta.author ?? "Autor não informado"} ·{" "}
                    {new Date(proposta.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                {status.label}
              </span>
            </div>

            {proposta.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {proposta.categories.map((categoria) => (
                  <span
                    key={categoria}
                    className="rounded-full bg-[#EDDBBA]/50 px-3 py-1 text-xs font-bold text-[#1B623A]"
                  >
                    {categoria}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-3 whitespace-pre-wrap text-sm text-[#22201b]">{proposta.content}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setComentariosAbertos((atual) => (atual === proposta.id ? null : proposta.id))}
                className="flex items-center gap-2 rounded-[10px] border border-line px-5 py-2 text-sm font-bold text-[#22201b] transition-colors hover:bg-[#FDF8EE]"
              >
                <MessageSquareText size={15} />
                {comentariosAbertos === proposta.id ? "Ocultar comentários" : "Ver comentários"}
              </button>

              {proposta.status !== "removed" && (
                <button
                  type="button"
                  onClick={() => handleRemover(proposta.id)}
                  disabled={removendoId === proposta.id}
                  className="flex items-center gap-2 rounded-[10px] border border-[#8D0801] px-5 py-2 text-sm font-bold text-[#8D0801] transition-colors hover:bg-[#8D0801] hover:text-white disabled:opacity-60"
                >
                  <Trash2 size={15} />
                  {removendoId === proposta.id ? "Removendo..." : "Remover proposta"}
                </button>
              )}
            </div>

            {comentariosAbertos === proposta.id && <ProposalCommentsPanel proposalId={proposta.id} />}
          </div>
        );
      })}

      {data && data.last_page > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3">
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
    </div>
  );
}
