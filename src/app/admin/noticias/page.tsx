"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Clock, ChevronDown, ChevronUp, ImageOff, Newspaper, PlusCircle, Trash2 } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminState from "@/components/admin/AdminState";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import { getAdminDashboard, collectNews, drainNews, getAdminNews, deleteAdminNews } from "@/services/adminService";
import { apiErrorMessage } from "@/services/apiClient";

// Duas causas reais e distintas pra ausência de imagem — nunca inventamos um
// motivo genérico: ou a fonte (RSS) nunca trouxe imagem nenhuma pra essa
// notícia, ou trouxe um link que o navegador não conseguiu carregar agora
// (quebrado, expirado ou bloqueado pela fonte).
function NoticiaThumbnail({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  const [erro, setErro] = useState(false);

  if (imageUrl && !erro) {
    return (
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-[#FDF8EE]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          onError={() => setErro(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-[8px] bg-[#FDF8EE] p-1 text-center"
      title={
        imageUrl
          ? `Esta notícia (${title}) tem um link de imagem, mas ele falhou ao carregar — pode estar quebrado, expirado ou bloqueado pela fonte.`
          : `Esta notícia (${title}) não possui imagem porque a fonte não forneceu nenhuma no momento da coleta.`
      }
    >
      <ImageOff size={16} className="text-[#6b6255]" />
      <span className="text-[9px] font-semibold leading-tight text-[#6b6255]">
        {imageUrl ? "Link falhou" : "Sem imagem"}
      </span>
    </div>
  );
}

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
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    mutate: mutateDashboard,
  } = useSWR("admin-dashboard", getAdminDashboard, {
    revalidateOnFocus: false,
    refreshInterval: (latest) => (latest && latest.noticias.pendentes > 0 ? 15000 : 0),
  });
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const {
    data: newsPage,
    error: newsError,
    isLoading: newsLoading,
    mutate: mutateNews,
  } = useSWR(["admin-news", page, busca], () => getAdminNews(page, busca), { revalidateOnFocus: false });

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  const [estadoColeta, setEstadoColeta] = useState<EstadoColeta>("idle");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [detalhesExecucao, setDetalhesExecucao] = useState<{ coleta?: string; fila?: string } | null>(null);
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  async function handleRemoverNoticia(id: number) {
    if (!window.confirm("Tem certeza que deseja remover esta notícia?")) return;

    setRemovendoId(id);

    try {
      await deleteAdminNews(id);
      mutateNews();
      mutateDashboard();
    } catch {
      window.alert("Não foi possível remover a notícia. Tente novamente.");
    } finally {
      setRemovendoId(null);
    }
  }

  const pendentes = dashboard?.noticias.pendentes ?? 0;
  // Trava também enquanto o dashboard ainda não carregou — sem isso, o
  // botão fica clicável por um instante antes de sabermos se já há
  // resumo pendente, inclusive logo depois de recarregar a página.
  const atualizarDesabilitado = estadoColeta === "executando" || dashboardLoading || pendentes > 0;

  const drenandoRef = useRef(false);
  const [drenagemAtiva, setDrenagemAtiva] = useState(false);

  // Sem isso, processar o que já está na fila dependia só do cron externo
  // (que já se mostrou pouco confiável) ou de o admin ficar clicando em
  // "Atualizar notícias" várias vezes — cada chamada só drena uma janela
  // curta (rate limit da IA + teto de segurança contra timeout da
  // plataforma). Enquanto houver pendente, o painel drena sozinho em
  // segundo plano até zerar, sem precisar de mais nenhuma ação do admin.
  useEffect(() => {
    if (pendentes <= 0) return;

    const intervalo = setInterval(async () => {
      if (drenandoRef.current) return;
      drenandoRef.current = true;
      setDrenagemAtiva(true);

      try {
        await drainNews();
        mutateDashboard();
        mutateNews();
      } catch {
        // Silencioso: é um processo de fundo: se uma tentativa falhar
        // (ex: rede instável), a próxima do próprio intervalo tenta de novo.
      } finally {
        drenandoRef.current = false;
      }
    }, 8000);

    return () => clearInterval(intervalo);
    // Depende só de virar >0/0 (não do valor exato de pendentes) de
    // propósito — senão o intervalo reiniciaria a cada nova contagem vinda
    // do polling do dashboard, nunca deixando os 8s completarem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendentes > 0]);

  useEffect(() => {
    if (pendentes <= 0) setDrenagemAtiva(false);
  }, [pendentes]);

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
        <AdminStatCard
          label="Notícias publicadas"
          value={dashboard?.noticias.publicadas ?? "—"}
          icon={Newspaper}
          hint={dashboard ? `${dashboard.noticias.total} coletadas ao todo` : undefined}
        />
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
            disabled={atualizarDesabilitado}
            className="flex h-12 items-center justify-center rounded-[10px] bg-[#1b623a] px-8 text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {estadoColeta === "executando" ? "Atualizando notícias..." : "Atualizar notícias"}
          </button>

          {estadoColeta !== "executando" && pendentes > 0 && !mensagem && (
            <p className="text-sm font-semibold text-[#8D6A00]">
              {pendentes} notícia(s) sendo processada(s) pelo resumo de IA
              {drenagemAtiva ? " — processando automaticamente em segundo plano..." : "..."}
            </p>
          )}

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Notícias coletadas</h2>
          <div className="w-full sm:w-72">
            <AdminSearchInput value={busca} onChange={handleBuscaChange} placeholder="Pesquisar por título..." />
          </div>
        </div>

        {newsLoading && <AdminState type="loading" message="Carregando notícias..." />}

        {newsError && <AdminState type="error" message="Não foi possível carregar as notícias agora." />}

        {newsPage?.data.length === 0 && (
          <AdminState
            type="empty"
            message={busca ? "Nenhuma notícia encontrada para essa busca." : "Nenhuma notícia coletada ainda."}
          />
        )}

        {newsPage?.data.map((noticia) => {
          const status = STATUS_LABEL[noticia.status_resumo ?? ""] ?? {
            label: noticia.status_resumo ?? "—",
            className: "bg-[#FDF8EE] text-[#6b6255]",
          };

          return (
            <div key={noticia.id} className="flex gap-3 rounded-[12px] border border-line bg-white p-4">
              <NoticiaThumbnail imageUrl={noticia.image_url} title={noticia.title} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#22201b]">{noticia.title}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoverNoticia(noticia.id)}
                      disabled={removendoId === noticia.id}
                      aria-label="Remover notícia"
                      className="rounded-full p-1.5 text-[#8D0801] transition-colors hover:bg-[#8D0801]/10 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
