"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, XCircle, RotateCcw, ExternalLink, ChevronDown, GraduationCap } from "lucide-react";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import AdminState from "@/components/admin/AdminState";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import Pagination from "@/components/Pagination";
import {
  getAdminPublicOpportunities,
  approveAdminPublicOpportunity,
  rejectAdminPublicOpportunity,
  toggleAdminPublicOpportunityPublished,
  PUBLIC_OPPORTUNITY_REVIEW_LABELS,
} from "@/services/adminService";
import { apiErrorMessage } from "@/services/apiClient";
import type { AdminPublicOpportunity, PublicOpportunityReviewStatus } from "@/services/types";

const ABAS: { id: PublicOpportunityReviewStatus | ""; label: string }[] = [
  { id: "pending", label: "Pendentes" },
  { id: "approved", label: "Aprovadas" },
  { id: "rejected", label: "Rejeitadas" },
  { id: "", label: "Todas" },
];

const STATUS_BADGE: Record<PublicOpportunityReviewStatus, string> = {
  pending: "bg-[#FCC100]/20 text-[#8D6A00]",
  approved: "bg-[#1B623A]/10 text-[#1B623A]",
  rejected: "bg-[#8D0801]/10 text-[#8D0801]",
};

function formatarData(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatarSalario(min: string | null, max: string | null): string | null {
  if (!min && !max) return null;

  const fmt = (v: string) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min ?? max!);
}

function OportunidadeCard({
  oportunidade,
  processando,
  onAprovar,
  onRejeitar,
  onAlternarPublicacao,
}: {
  oportunidade: AdminPublicOpportunity;
  processando: boolean;
  onAprovar: () => void;
  onRejeitar: () => void;
  onAlternarPublicacao: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const salario = formatarSalario(oportunidade.salary_min, oportunidade.salary_max);
  const inscricoes =
    formatarData(oportunidade.registration_start) || formatarData(oportunidade.registration_end)
      ? `${formatarData(oportunidade.registration_start) ?? "?"} até ${formatarData(oportunidade.registration_end) ?? "?"}`
      : null;

  return (
    <div className="rounded-[12px] border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#22201b]">{oportunidade.title || "(sem título)"}</p>
          <p className="mt-0.5 text-xs text-[#6b6255]">
            {oportunidade.agency ?? "Órgão não informado"}
            {oportunidade.municipality ? ` · ${oportunidade.municipality}` : ""}
            {oportunidade.state ? `/${oportunidade.state}` : ""}
          </p>
        </div>

        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[oportunidade.review_status]}`}>
          {PUBLIC_OPPORTUNITY_REVIEW_LABELS[oportunidade.review_status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#6b6255]">
        <span className="rounded-full bg-[#FDF8EE] px-3 py-1 font-semibold uppercase">{oportunidade.type}</span>
        {oportunidade.vacancies !== null && (
          <span className="rounded-full bg-[#FDF8EE] px-3 py-1">{oportunidade.vacancies} vaga(s)</span>
        )}
        {salario && <span className="rounded-full bg-[#FDF8EE] px-3 py-1">{salario}</span>}
        {inscricoes && <span className="rounded-full bg-[#FDF8EE] px-3 py-1">Inscrições: {inscricoes}</span>}
        <span className="rounded-full bg-[#FDF8EE] px-3 py-1">
          {oportunidade.publications_count} publicação(ões)
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="mt-3 flex items-center gap-1 text-xs font-bold text-[#1B623A]"
      >
        <ChevronDown size={14} className={`transition-transform ${expandido ? "rotate-180" : ""}`} />
        {expandido ? "Ocultar detalhes" : "Ver detalhes"}
      </button>

      {expandido && (
        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-sm text-[#22201b]">
          <p className="whitespace-pre-wrap">{oportunidade.summary || "Sem resumo disponível."}</p>
          {oportunidade.notice_number && <p className="text-xs text-[#6b6255]">Edital nº {oportunidade.notice_number}</p>}
          {oportunidade.registration_url && (
            <a
              href={oportunidade.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-[#1B623A] hover:underline"
            >
              Página oficial de inscrição <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {oportunidade.review_status !== "approved" && (
          <button
            type="button"
            onClick={onAprovar}
            disabled={processando}
            className="flex items-center gap-2 rounded-[10px] bg-[#1B623A] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            <CheckCircle2 size={15} />
            Aprovar
          </button>
        )}

        {oportunidade.review_status !== "rejected" && (
          <button
            type="button"
            onClick={onRejeitar}
            disabled={processando}
            className="flex items-center gap-2 rounded-[10px] border border-[#8D0801] px-5 py-2 text-sm font-bold text-[#8D0801] transition-colors hover:bg-[#8D0801] hover:text-white disabled:opacity-60"
          >
            <XCircle size={15} />
            Rejeitar
          </button>
        )}

        {oportunidade.review_status === "approved" && (
          <button
            type="button"
            onClick={onAlternarPublicacao}
            disabled={processando}
            className="flex items-center gap-2 rounded-[10px] border border-line px-5 py-2 text-sm font-bold text-[#22201b] transition-colors hover:bg-[#FDF8EE] disabled:opacity-60"
          >
            <RotateCcw size={15} />
            Despublicar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminJuventudePage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<PublicOpportunityReviewStatus | "">("pending");
  const { confirm, confirmDialog } = useConfirm();

  const { data, error, isLoading, mutate } = useSWR(
    ["admin-public-opportunities", page, busca, aba],
    () => getAdminPublicOpportunities(page, busca, aba),
    { revalidateOnFocus: false }
  );

  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  function handleAba(novaAba: PublicOpportunityReviewStatus | "") {
    setAba(novaAba);
    setPage(1);
  }

  async function executar(oportunidade: AdminPublicOpportunity, acao: () => Promise<unknown>, mensagemErro: string) {
    setProcessandoId(oportunidade.id);
    setErro(null);
    setSucesso(null);

    try {
      await acao();
      await mutate();
      setSucesso("Feito.");
    } catch (err) {
      setErro(apiErrorMessage(err, mensagemErro));
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleAprovar(oportunidade: AdminPublicOpportunity) {
    const ok = await confirm({
      title: "Publicar esta oportunidade?",
      message: `"${oportunidade.title}" passa a aparecer na Juventude em Pauta para todos.`,
      confirmLabel: "Aprovar e publicar",
      tone: "primary",
    });
    if (!ok) return;

    await executar(
      oportunidade,
      () => approveAdminPublicOpportunity(oportunidade.source_key),
      "Não foi possível aprovar. Tente novamente."
    );
  }

  async function handleRejeitar(oportunidade: AdminPublicOpportunity) {
    const ok = await confirm({
      title: "Rejeitar esta oportunidade?",
      message: `"${oportunidade.title}" não aparecerá na Juventude em Pauta. O registro continua guardado (não é apagado) e pode ser aprovado depois.`,
      confirmLabel: "Rejeitar",
    });
    if (!ok) return;

    await executar(
      oportunidade,
      () => rejectAdminPublicOpportunity(oportunidade.source_key),
      "Não foi possível rejeitar. Tente novamente."
    );
  }

  async function handleAlternarPublicacao(oportunidade: AdminPublicOpportunity) {
    const ok = await confirm({
      title: "Despublicar esta oportunidade?",
      message: `"${oportunidade.title}" deixa de aparecer no site. Fica como pendente — você pode aprová-la de novo quando quiser.`,
      confirmLabel: "Despublicar",
    });
    if (!ok) return;

    await executar(
      oportunidade,
      () => toggleAdminPublicOpportunityPublished(oportunidade.source_key),
      "Não foi possível alterar a publicação. Tente novamente."
    );
  }

  const pendentesNaPagina = data?.data.filter((o) => o.review_status === "pending").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminStatCard label="Nesta página" value={data?.data.length ?? "—"} icon={GraduationCap} />
        <AdminStatCard
          label="Pendentes nesta página"
          value={pendentesNaPagina}
          icon={GraduationCap}
          accent="gold"
        />
      </div>

      <div>
        <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Juventude em Pauta — Concursos e processos seletivos</h2>
        <p className="mt-1 text-xs text-[#6b6255]">
          Oportunidades importadas automaticamente. Aprove as que estão corretas para elas aparecerem no site;
          rejeite o que não deve ser publicado. Nada é apagado — sempre dá pra reverter.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ABAS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAba(item.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                aba === item.id ? "bg-[#1B623A] text-white" : "bg-white text-[#22201b] border border-line hover:bg-[#FDF8EE]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <AdminSearchInput value={busca} onChange={handleBuscaChange} placeholder="Pesquisar por título, órgão ou município..." />
        </div>
      </div>

      {isLoading && <AdminState type="loading" message="Carregando oportunidades..." />}
      {error && <AdminState type="error" message="Não foi possível carregar as oportunidades agora." />}
      {erro && <p role="alert" className="text-sm font-semibold text-[#8D0801]">{erro}</p>}
      {sucesso && <p role="status" className="text-sm font-semibold text-[#1B623A]">{sucesso}</p>}
      {data?.data.length === 0 && <AdminState type="empty" message="Nenhuma oportunidade encontrada." />}

      {data?.data.map((oportunidade) => (
        <OportunidadeCard
          key={oportunidade.id}
          oportunidade={oportunidade}
          processando={processandoId === oportunidade.id}
          onAprovar={() => handleAprovar(oportunidade)}
          onRejeitar={() => handleRejeitar(oportunidade)}
          onAlternarPublicacao={() => handleAlternarPublicacao(oportunidade)}
        />
      ))}

      {data && data.last_page > 1 && (
        <div className="mt-2">
          <Pagination page={page} lastPage={data.last_page} onChange={setPage} />
        </div>
      )}

      {confirmDialog}
    </div>
  );
}
