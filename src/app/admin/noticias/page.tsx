"use client";

import { useState } from "react";
import useSWR from "swr";
import { Clock, ChevronDown, ChevronUp, Newspaper, PlusCircle } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminState from "@/components/admin/AdminState";
import { getAdminDashboard, collectNews, getAdminNews } from "@/services/adminService";
import { apiErrorMessage } from "@/services/apiClient";

function formatDateHora(iso: string | null): string {
  if (!iso) return "Nunca executada";

  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  concluido: { label: "Publicada", className: "bg-[#1B623A]/10 text-[#1B623A]" },
  pendente: { label: "Aguardando resumo", className: "bg-[#FCC100]/20 text-[#8D6A00]" },
  em_processamento: { label: "Processando", className: "bg-[#FCC100]/20 text-[#8D6A00]" },
  falhou: { label: "Falhou", className: "bg-[#8D0801]/10 text-[#8D0801]" },
};

type EstadoColeta = "idle" | "executando" | "sucesso" | "erro";

export default function AdminNoticiasPage() {
  const { data: dashboard, mutate: mutateDashboard } = useSWR("admin-dashboard", getAdminDashboard, {
    revalidateOnFocus: false,
  });
  const [page, setPage] = useState(1);
  const {
    data: newsPage,
    error: newsError,
    isLoading: newsLoading,
    mutate: mutateNews,
  } = useSWR(["admin-news", page], () => getAdminNews(page), { revalidateOnFocus: false });

  const [estadoColeta, setEstadoColeta] = useState<EstadoColeta>("idle");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [detalhesExecucao, setDetalhesExecucao] = useState<{ coleta?: string; fila?: string } | null>(null);

  async function handleAtualizarNoticias() {
    setEstadoColeta("executando");
    setMensagem(null);
    setDetalhesExecucao(null);

    try {
      const resultado = await collectNews();
      setEstadoColeta("sucesso");
      setMensagem("Atualização solicitada com sucesso. O processamento pode continuar em segundo plano.");
      setDetalhesExecucao({ coleta: resultado.coleta, fila: resultado.fila });
      mutateDashboard();
      mutateNews();
    } catch (err) {
      setEstadoColeta("erro");
      setMensagem(apiErrorMessage(err, "Não foi possível iniciar a atualização. Tente novamente."));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total de notícias" value={dashboard?.noticias.total ?? "—"} icon={Newspaper} />
        <AdminStatCard
          label="Última atualização"
          value={formatDateHora(dashboard?.noticias.ultima_atualizacao_em ?? null)}
          icon={Clock}
        />
        <AdminStatCard
          label="Adicionadas na última execução"
          value={dashboard?.noticias.adicionadas_na_ultima_execucao ?? "—"}
          icon={PlusCircle}
          accent={dashboard?.noticias.status === "com_falhas" ? "red" : "green"}
          hint={
            dashboard && dashboard.noticias.status === "com_falhas"
              ? `${dashboard.noticias.fontes_com_falha} fonte(s) desativada(s) pelo circuit breaker`
              : undefined
          }
        />
      </div>

      <div className="rounded-[12px] border border-line bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleAtualizarNoticias}
            disabled={estadoColeta === "executando"}
            className="flex h-12 items-center justify-center rounded-[10px] bg-[#1b623a] px-8 text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {estadoColeta === "executando" ? "Atualizando notícias..." : "Atualizar notícias"}
          </button>

          {mensagem && (
            <p
              className={`text-sm font-semibold ${
                estadoColeta === "erro" ? "text-[#8D0801]" : "text-[#1B623A]"
              }`}
            >
              {mensagem}
            </p>
          )}
        </div>

        {detalhesExecucao && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setDetalhesAbertos((v) => !v)}
              className="flex items-center gap-1 text-xs font-bold text-[#6b6255] hover:text-[#22201b]"
            >
              {detalhesAbertos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {detalhesAbertos ? "Ocultar detalhes da execução" : "Ver detalhes da execução"}
            </button>

            {detalhesAbertos && (
              <div className="mt-2 flex flex-col gap-3">
                {detalhesExecucao.coleta && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#6b6255]">Coleta</p>
                    <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-[8px] bg-[#22201b] p-3 text-xs text-[#EDDBBA]">
                      {detalhesExecucao.coleta || "(sem saída)"}
                    </pre>
                  </div>
                )}
                {detalhesExecucao.fila && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#6b6255]">Fila (resumo por IA)</p>
                    <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-[8px] bg-[#22201b] p-3 text-xs text-[#EDDBBA]">
                      {detalhesExecucao.fila || "(sem saída)"}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Notícias coletadas</h2>

        {newsLoading && <AdminState type="loading" message="Carregando notícias..." />}

        {newsError && <AdminState type="error" message="Não foi possível carregar as notícias agora." />}

        {newsPage?.data.length === 0 && <AdminState type="empty" message="Nenhuma notícia coletada ainda." />}

        {newsPage?.data.map((noticia) => {
          const status = STATUS_LABEL[noticia.status_resumo ?? ""] ?? {
            label: noticia.status_resumo ?? "—",
            className: "bg-[#FDF8EE] text-[#6b6255]",
          };

          return (
            <div key={noticia.id} className="rounded-[12px] border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-bold text-[#22201b]">{noticia.title}</p>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {noticia.category && (
                  <span className="rounded-full bg-[#EDDBBA]/50 px-3 py-1 text-xs font-bold text-[#1B623A]">
                    {noticia.category}
                  </span>
                )}
              </div>

              {noticia.status_resumo === "falhou" && (
                <div className="mt-3 rounded-[8px] bg-[#8D0801]/5 p-3">
                  <p className="text-xs font-bold text-[#8D0801]">
                    Falhou após {noticia.tentativas_resumo} tentativa(s):
                  </p>
                  <p className="mt-1 text-xs text-[#8D0801]/90">
                    {noticia.erro_resumo ?? "Motivo não registrado."}
                  </p>
                </div>
              )}

              <p className="mt-2 text-xs text-[#6b6255]">
                Adicionada em {formatDateHora(noticia.imported_at)}
              </p>
            </div>
          );
        })}
      </div>

      {newsPage && newsPage.last_page > 1 && (
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
            Página {newsPage.current_page} de {newsPage.last_page}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(newsPage.last_page, p + 1))}
            disabled={page >= newsPage.last_page}
            className="rounded-[8px] border border-line px-4 py-2 text-sm font-bold text-[#22201b] disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
