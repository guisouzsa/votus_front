"use client";

import { useConfirm } from "@/components/admin/ConfirmDialog";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Plus,
  X,
  Trash2,
  Pencil,
  Lightbulb,
  Globe,
  Eye,
  EyeOff,
  BookOpenCheck,
} from "lucide-react";
import AdminState from "@/components/admin/AdminState";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import {
  getAdminExplanations,
  createAdminExplanation,
  publishAdminExplanation,
  unpublishAdminExplanation,
  deleteAdminExplanation,
  drainExplanations,
  getAdminTrustedSources,
  createAdminTrustedSource,
  updateAdminTrustedSource,
  deleteAdminTrustedSource,
  type CreateExplanationPayload,
} from "@/services/adminService";
import { apiErrorMessage } from "@/services/apiClient";
import type { AdminExplanation, ExplanationCategory, TrustedSource } from "@/services/types";

const CATEGORIAS: ExplanationCategory[] = ["Órgãos e instituições", "Cargos políticos", "Eleições e voto"];

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  generating: { label: "Gerando...", className: "bg-[#FCC100]/20 text-[#8D6A00]" },
  review: { label: "Em revisão", className: "bg-[#1B623A]/10 text-[#1B623A]" },
  published: { label: "Publicada", className: "bg-[#1B623A] text-white" },
  failed: { label: "Falhou", className: "bg-[#8D0801]/10 text-[#8D0801]" },
};

// Um <select> nativo por link é bem mais direto que uma busca-e-clique: o
// admin já vê os nomes cadastrados prontos numa lista, sem precisar digitar
// nada. Ao escolher, preenche o campo de URL com o endereço base da fonte —
// ainda precisa ser completado com o link exato da matéria (o sistema busca
// o conteúdo real dessa página específica, não só a página inicial do site).
function FonteSelect({ fontes, onEscolher }: { fontes: TrustedSource[]; onEscolher: (fonte: TrustedSource) => void }) {
  const ativas = fontes.filter((f) => f.is_active);

  return (
    <select
      value=""
      onChange={(e) => {
        const fonte = ativas.find((f) => String(f.id) === e.target.value);
        if (fonte) onEscolher(fonte);
      }}
      className="h-10 w-24 shrink-0 rounded-[8px] border border-[#d6d1c8] bg-white px-2 text-xs font-bold text-[#1b623a] outline-none focus:border-[#1B623A] sm:w-40"
    >
      <option value="" disabled>
        Escolher fonte...
      </option>
      {ativas.map((fonte) => (
        <option key={fonte.id} value={fonte.id}>
          {fonte.name}
        </option>
      ))}
    </select>
  );
}

function NovaExplicacaoModal({
  fontes,
  onClose,
  onCriada,
}: {
  fontes: TrustedSource[];
  onClose: () => void;
  onCriada: () => void;
}) {
  const [form, setForm] = useState<CreateExplanationPayload>({
    title: "",
    question_title: "",
    category: CATEGORIAS[0],
    source_urls: [""],
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function setUrl(index: number, valor: string) {
    setForm((prev) => ({
      ...prev,
      source_urls: prev.source_urls.map((url, i) => (i === index ? valor : url)),
    }));
  }

  function adicionarUrl() {
    if (form.source_urls.length >= 5) return;
    setForm((prev) => ({ ...prev, source_urls: [...prev.source_urls, ""] }));
  }

  function removerUrl(index: number) {
    setForm((prev) => ({ ...prev, source_urls: prev.source_urls.filter((_, i) => i !== index) }));
  }

  // Preenche a URL base da fonte escolhida na linha indicada — o admin ainda
  // completa com o link exato da matéria (o sistema busca o conteúdo real
  // dessa página específica, não só a página inicial do site).
  function escolherFonte(index: number, fonte: TrustedSource) {
    setUrl(index, fonte.base_url ?? "");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      await createAdminExplanation({
        ...form,
        source_urls: form.source_urls.map((u) => u.trim()).filter(Boolean),
      });
      onCriada();
      onClose();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível criar a explicação. Verifique os dados e tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Nova explicação</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-[#6b6255] hover:bg-[#FDF8EE]">
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-[#6b6255]">
          O sistema vai buscar o conteúdo real dos links informados, gerar a explicação e o quiz com IA, e deixar
          em revisão antes de publicar.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Tema
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex.: Câmara dos Deputados"
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Pergunta de abertura
            <input
              type="text"
              required
              value={form.question_title}
              onChange={(e) => setForm((prev) => ({ ...prev, question_title: e.target.value }))}
              placeholder="Ex.: Você sabe o que é a Câmara dos Deputados?"
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Categoria
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as ExplanationCategory }))}
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            >
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2 rounded-[10px] border border-[#d6d1c8] bg-[#FDF8EE]/50 p-3">
            <span className="text-sm font-bold text-[#1b623a]">Links das fontes</span>
            <p className="text-[11px] text-[#6b6255]">
              Escolha a fonte já cadastrada e cole o link da matéria específica sobre o tema — o sistema busca o
              conteúdo real dessa página pra gerar a explicação e o quiz.
            </p>

            <div className="mt-1 flex flex-col gap-2">
              {form.source_urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  {fontes.length > 0 && (
                    <FonteSelect fontes={fontes} onEscolher={(fonte) => escolherFonte(index, fonte)} />
                  )}
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(index, e.target.value)}
                    placeholder="Cole aqui o link completo da matéria"
                    className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#d6d1c8] bg-white px-3 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
                  />
                  {form.source_urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerUrl(index)}
                      aria-label="Remover link"
                      className="shrink-0 rounded-full p-1.5 text-[#8D0801] hover:bg-[#8D0801]/10"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {form.source_urls.length < 5 && (
              <button type="button" onClick={adicionarUrl} className="self-start text-xs font-bold text-[#1B623A] hover:underline">
                + adicionar outro link
              </button>
            )}
          </div>

          {erro && <p className="text-sm font-semibold text-[#8D0801]">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="flex h-11 items-center justify-center rounded-[10px] bg-[#1b623a] text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {salvando ? "Gerando..." : "Gerar conteúdo com IA"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditarFonteModal({
  fonte,
  onClose,
  onSalva,
}: {
  fonte: TrustedSource;
  onClose: () => void;
  onSalva: () => void;
}) {
  const [name, setName] = useState(fonte.name);
  const [domain, setDomain] = useState(fonte.domain);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      await updateAdminTrustedSource(fonte.id, {
        name: name.trim(),
        domain: domain.trim(),
        is_active: fonte.is_active,
      });
      onSalva();
      onClose();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível salvar. Verifique o domínio e tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Editar fonte confiável</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-[#6b6255] hover:bg-[#FDF8EE]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Nome
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Domínio
            <input
              type="text"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="camara.leg.br"
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          {erro && <p className="text-sm font-semibold text-[#8D0801]">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="flex h-11 items-center justify-center rounded-[10px] bg-[#1b623a] text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}

function NovaFonteModal({ onClose, onCriada }: { onClose: () => void; onCriada: () => void }) {
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      await createAdminTrustedSource({ name: name.trim(), base_url: baseUrl.trim() });
      onCriada();
      onClose();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível cadastrar a fonte. Verifique a URL e tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Nova fonte confiável</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-[#6b6255] hover:bg-[#FDF8EE]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            Nome
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Agência Câmara"
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          <label className="flex flex-col text-sm font-bold text-[#1b623a]">
            URL do site
            <input
              type="url"
              required
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://www.camara.leg.br"
              className="mt-1.5 h-11 rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-sm text-[#22201b] outline-none focus:border-[#1B623A]"
            />
          </label>

          {erro && <p className="text-sm font-semibold text-[#8D0801]">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="flex h-11 items-center justify-center rounded-[10px] bg-[#1b623a] text-sm font-bold text-white transition-colors hover:bg-[#164f30] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Cadastrar fonte"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminExplicacoesPage() {
  const { confirm, confirmDialog } = useConfirm();
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");

  const {
    data: explicacoesPage,
    error: explicacoesError,
    isLoading: explicacoesLoading,
    mutate: mutateExplicacoes,
  } = useSWR(["admin-explicacoes", page, busca], () => getAdminExplanations(page, busca), {
    revalidateOnFocus: false,
    refreshInterval: (latest) =>
      latest && latest.data.some((e) => e.status === "generating") ? 4000 : 0,
  });

  const {
    data: fontes,
    error: fontesError,
    isLoading: fontesLoading,
    mutate: mutateFontes,
  } = useSWR("admin-trusted-sources", getAdminTrustedSources, { revalidateOnFocus: false });

  const [modalExplicacao, setModalExplicacao] = useState(false);
  const [modalFonte, setModalFonte] = useState(false);
  const [fonteEditando, setFonteEditando] = useState<TrustedSource | null>(null);
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const temGerando = Boolean(explicacoesPage?.data.some((e) => e.status === "generating"));
  const drenandoRef = useRef(false);

  // Igual ao painel de notícias: a janela de 30s que o store() já tenta
  // drenar sozinho pode não bastar (rate limit da Groq, fonte lenta) — sem
  // isso, a explicação ficava presa em "Gerando..." até o admin recarregar
  // a página (o que só reexibe o status, não continua o processamento).
  useEffect(() => {
    if (!temGerando) return;

    const intervalo = setInterval(async () => {
      if (drenandoRef.current) return;
      drenandoRef.current = true;

      try {
        await drainExplanations();
        mutateExplicacoes();
      } catch {
        // Silencioso: processo de fundo, a próxima tentativa do intervalo cobre falhas passageiras.
      } finally {
        drenandoRef.current = false;
      }
    }, 8000);

    return () => clearInterval(intervalo);
  }, [temGerando, mutateExplicacoes]);

  function handleBuscaChange(valor: string) {
    setBusca(valor);
    setPage(1);
  }

  const explicacoes = explicacoesPage?.data ?? [];

  async function handlePublicar(explicacao: AdminExplanation) {
    const ok = await confirm({
      title: "Deseja publicar esta explicação?",
      message: `"${explicacao.title}" ficará visível para todos no site.`,
      confirmLabel: "Publicar",
      tone: "primary",
    });
    if (!ok) return;

    setProcessandoId(explicacao.id);
    setErroAcao(null);
    try {
      await publishAdminExplanation(explicacao.id);
      mutateExplicacoes();
    } catch (err) {
      setErroAcao(apiErrorMessage(err, "Não foi possível publicar. Verifique se o quiz está completo."));
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleDespublicar(explicacao: AdminExplanation) {
    const ok = await confirm({
      title: "Deseja despublicar esta explicação?",
      message: `"${explicacao.title}" deixará de aparecer no site. Você pode publicá-la de novo depois.`,
      confirmLabel: "Despublicar",
    });
    if (!ok) return;

    setProcessandoId(explicacao.id);
    setErroAcao(null);
    try {
      await unpublishAdminExplanation(explicacao.id);
      mutateExplicacoes();
    } catch (err) {
      setErroAcao(apiErrorMessage(err, "Não foi possível ocultar a explicação."));
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleRemover(explicacao: AdminExplanation) {
    const ok = await confirm({
      title: "Deseja realmente excluir esta explicação?",
      message: `"${explicacao.title}" será apagada. Essa ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
    });
    if (!ok) return;

    setProcessandoId(explicacao.id);
    setErroAcao(null);
    try {
      await deleteAdminExplanation(explicacao.id);
      mutateExplicacoes();
    } catch (err) {
      setErroAcao(apiErrorMessage(err, "Não foi possível remover a explicação."));
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleAlternarFonte(fonte: TrustedSource) {
    try {
      await updateAdminTrustedSource(fonte.id, { name: fonte.name, domain: fonte.domain, is_active: !fonte.is_active });
      mutateFontes();
    } catch {
      window.alert("Não foi possível atualizar a fonte.");
    }
  }

  async function handleRemoverFonte(fonte: TrustedSource) {
    const ok = await confirm({ title: "Deseja remover esta fonte?", message: fonte.name, confirmLabel: "Remover" });
    if (!ok) return;
    try {
      await deleteAdminTrustedSource(fonte.id);
      mutateFontes();
    } catch {
      window.alert("Não foi possível remover a fonte.");
    }
  }

  const publicadas = explicacoes.filter((e) => e.status === "published").length;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Explicações" value={explicacoesPage?.total ?? "—"} icon={Lightbulb} />
        <AdminStatCard label="Publicadas" value={publicadas} icon={BookOpenCheck} accent="green" />
        <AdminStatCard label="Fontes confiáveis" value={fontes?.length ?? "—"} icon={Globe} accent="gold" />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Fontes confiáveis</h2>
          <button
            type="button"
            onClick={() => setModalFonte(true)}
            className="flex items-center gap-2 rounded-[10px] border border-[#1B623A] px-4 py-2 text-sm font-bold text-[#1B623A] transition-colors hover:bg-[#1B623A]/10"
          >
            <Plus size={16} />
            Nova fonte
          </button>
        </div>

        {fontesLoading && <AdminState type="loading" message="Carregando fontes..." />}
        {fontesError && <AdminState type="error" message="Não foi possível carregar as fontes agora." />}
        {fontes && fontes.length === 0 && (
          <AdminState type="empty" message="Nenhuma fonte confiável cadastrada. Cadastre ao menos uma para gerar explicações." />
        )}

        {fontes && fontes.length > 0 && (
          <div className="flex flex-col gap-2">
            {fontes.map((fonte) => (
              <div key={fonte.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-white p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDDBBA]/40 text-[#1B623A]">
                  <Globe size={15} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#22201b]">{fonte.name}</p>
                  <p className="truncate text-xs text-[#6b6255]">{fonte.domain}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      fonte.is_active ? "bg-[#1B623A]/10 text-[#1B623A]" : "bg-[#FDF8EE] text-[#6b6255]"
                    }`}
                  >
                    {fonte.is_active ? "Ativa" : "Inativa"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAlternarFonte(fonte)}
                    aria-label={fonte.is_active ? "Desativar fonte" : "Ativar fonte"}
                    className="rounded-full p-1.5 text-[#6b6255] hover:bg-[#FDF8EE]"
                  >
                    {fonte.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFonteEditando(fonte)}
                    aria-label="Editar fonte"
                    className="rounded-full p-1.5 text-[#1B623A] hover:bg-[#1B623A]/10"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoverFonte(fonte)}
                    aria-label="Remover fonte"
                    className="rounded-full p-1.5 text-[#8D0801] hover:bg-[#8D0801]/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">Explicações</h2>
          <button
            type="button"
            onClick={() => setModalExplicacao(true)}
            className="flex items-center gap-2 rounded-[10px] bg-[#1b623a] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#164f30]"
          >
            <Plus size={16} />
            Nova explicação
          </button>
        </div>

        <div className="w-full sm:w-72">
          <AdminSearchInput value={busca} onChange={handleBuscaChange} placeholder="Pesquisar por tema ou pergunta..." />
        </div>

        {erroAcao && <p className="text-sm font-semibold text-[#8D0801]">{erroAcao}</p>}

        {explicacoesLoading && <AdminState type="loading" message="Carregando explicações..." />}
        {explicacoesError && <AdminState type="error" message="Não foi possível carregar as explicações agora." />}
        {explicacoes.length === 0 && !explicacoesLoading && (
          <AdminState
            type="empty"
            message={busca ? "Nenhuma explicação encontrada para essa busca." : "Nenhuma explicação criada ainda."}
          />
        )}

        {explicacoes.map((explicacao) => {
          const status = STATUS_LABEL[explicacao.status] ?? { label: explicacao.status, className: "bg-[#FDF8EE] text-[#6b6255]" };
          const processando = processandoId === explicacao.id;

          return (
            <div key={explicacao.id} className="rounded-[12px] border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#22201b]">{explicacao.title}</p>
                  <p className="mt-0.5 text-xs text-[#6b6255]">{explicacao.question_title}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#EDDBBA]/50 px-3 py-1 text-xs font-bold text-[#1B623A]">
                  {explicacao.category}
                </span>
                <span className="text-xs text-[#6b6255]">
                  {explicacao.sources_count ?? 0} fonte(s) · {explicacao.quiz_questions_count ?? 0} pergunta(s)
                </span>
              </div>

              {explicacao.status === "failed" && explicacao.generation_error && (
                <div className="mt-3 rounded-[8px] bg-[#8D0801]/5 p-3">
                  <p className="text-xs font-bold text-[#8D0801]">Erro na geração:</p>
                  <p className="mt-1 text-xs text-[#8D0801]/90">{explicacao.generation_error}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(explicacao.status === "review" || explicacao.status === "published") && (
                  <Link
                    href={`/admin/explicacoes/${explicacao.id}`}
                    className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-[#22201b] hover:bg-[#FDF8EE]"
                  >
                    <Pencil size={13} />
                    Revisar/editar
                  </Link>
                )}

                {explicacao.status === "review" && (
                  <button
                    type="button"
                    onClick={() => handlePublicar(explicacao)}
                    disabled={processando}
                    className="rounded-full bg-[#1b623a] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#164f30] disabled:opacity-50"
                  >
                    Publicar
                  </button>
                )}

                {explicacao.status === "published" && (
                  <button
                    type="button"
                    onClick={() => handleDespublicar(explicacao)}
                    disabled={processando}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-[#22201b] hover:bg-[#FDF8EE] disabled:opacity-50"
                  >
                    Ocultar do público
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemover(explicacao)}
                  disabled={processando}
                  aria-label="Remover explicação"
                  className="ml-auto rounded-full p-1.5 text-[#8D0801] transition-colors hover:bg-[#8D0801]/10 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {explicacoesPage && explicacoesPage.last_page > 1 && (
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
              Página {explicacoesPage.current_page} de {explicacoesPage.last_page}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(explicacoesPage.last_page, p + 1))}
              disabled={page >= explicacoesPage.last_page}
              className="rounded-[8px] border border-line px-4 py-2 text-sm font-bold text-[#22201b] disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </section>

      {modalExplicacao && (
        <NovaExplicacaoModal
          fontes={fontes ?? []}
          onClose={() => setModalExplicacao(false)}
          onCriada={() => mutateExplicacoes()}
        />
      )}

      {modalFonte && <NovaFonteModal onClose={() => setModalFonte(false)} onCriada={() => mutateFontes()} />}

      {fonteEditando && (
        <EditarFonteModal
          fonte={fonteEditando}
          onClose={() => setFonteEditando(null)}
          onSalva={() => mutateFontes()}
        />
      )}
      {confirmDialog}
    </div>
  );
}
