"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Newspaper,
  Clock,
  PlusCircle,
  Users,
  Landmark,
  Ticket,
  Eye,
  FileCheck2,
  FileX2,
  MessageSquareText,
  ArrowRight,
} from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminState from "@/components/admin/AdminState";
import { getAdminDashboard, collectNews } from "@/services/adminService";
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

type EstadoColeta = "idle" | "executando" | "sucesso" | "erro";

function SectionTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">{children}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-bold text-[#1B623A] hover:underline"
        >
          Ver tudo <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, error, isLoading, mutate } = useSWR("admin-dashboard", getAdminDashboard, {
    revalidateOnFocus: false,
    // Enquanto houver notícia pendente de resumo, reconsulta periodicamente
    // pra reabilitar o botão sozinho assim que a fila terminar de drenar.
    refreshInterval: (latest) => (latest && latest.noticias.pendentes > 0 ? 15000 : 0),
  });
  const [estadoColeta, setEstadoColeta] = useState<EstadoColeta>("idle");
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const pendentes = data?.noticias.pendentes ?? 0;
  // Só trava durante o próprio clique (evita disparo duplo). Resumos pendentes
  // do ciclo automático não bloqueiam mais: a atualização manual é independente.
  const atualizarDesabilitado = estadoColeta === "executando";

  async function handleAtualizarNoticias() {
    setEstadoColeta("executando");
    setMensagemErro(null);

    try {
      await collectNews();
      setEstadoColeta("sucesso");
      mutate();
    } catch (err) {
      setEstadoColeta("erro");
      setMensagemErro(apiErrorMessage(err, "Não foi possível iniciar a atualização. Tente novamente."));
    }
  }

  if (isLoading) {
    return <AdminState type="loading" message="Carregando painel..." />;
  }

  if (error || !data) {
    return <AdminState type="error" message="Não foi possível carregar os dados do painel agora." />;
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <SectionTitle href="/admin/noticias">Notícias</SectionTitle>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="Notícias publicadas"
            value={data.noticias.publicadas}
            icon={Newspaper}
            hint={`${data.noticias.total} coletadas ao todo (inclui pendentes e reprovadas)`}
          />
          <AdminStatCard
            label="Última atualização"
            value={formatDateHora(data.noticias.ultima_atualizacao_em)}
            icon={Clock}
          />
          <AdminStatCard
            label="Adicionadas na última execução"
            value={data.noticias.adicionadas_na_ultima_execucao}
            icon={PlusCircle}
            accent={data.noticias.status === "com_falhas" ? "red" : "green"}
            hint={
              data.noticias.status === "com_falhas"
                ? `${data.noticias.fontes_com_falha} fonte(s) com falha`
                : "Pipeline ok"
            }
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleAtualizarNoticias}
            disabled={atualizarDesabilitado}
            className="flex h-12 items-center justify-center rounded-[10px] bg-[#1b623a] px-8 text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {estadoColeta === "executando" ? "Atualizando notícias..." : "Atualizar notícias"}
          </button>

          {estadoColeta !== "executando" && pendentes > 0 && (
            <p className="text-sm font-semibold text-[#8D6A00]">
              {pendentes} notícia(s) ainda sendo processada(s) pelo resumo de IA.
            </p>
          )}
          {estadoColeta === "sucesso" && (
            <p className="text-sm font-semibold text-[#1B623A]">
              Atualização solicitada com sucesso. O processamento pode continuar em segundo plano.
            </p>
          )}
          {estadoColeta === "erro" && (
            <p className="text-sm font-semibold text-[#8D0801]">{mensagemErro}</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle>Dados políticos</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminStatCard label="Deputados exibidos" value={data.dados_politicos.deputados} icon={Landmark} />
          <AdminStatCard label="Senadores exibidos" value={data.dados_politicos.senadores} icon={Users} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle>Participação</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminStatCard label="Santinhos gerados" value={data.participacao.santinhos_gerados} icon={Ticket} accent="gold" />
          <AdminStatCard
            label="Acessos registrados"
            value={data.participacao.acessos_registrados}
            icon={Eye}
            accent="gold"
            hint="Contagem de acessos, não de visitantes únicos"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle href="/admin/propostas">Moderação</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminStatCard label="Propostas publicadas" value={data.moderacao.propostas_publicadas} icon={FileCheck2} />
          <AdminStatCard label="Propostas removidas" value={data.moderacao.propostas_removidas} icon={FileX2} accent="red" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle href="/admin/sugestoes">Sugestões</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminStatCard label="Sugestões recebidas" value={data.sugestoes.total} icon={MessageSquareText} />
        </div>
      </section>
    </div>
  );
}
