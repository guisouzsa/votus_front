import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Landmark, Newspaper, Vote, type LucideIcon } from "lucide-react";
import { getNewsList, temImagem } from "@/services/newsService";
import type { NewsArticleApi } from "@/services/types";

type Atalho = { label: string; href: string };

type Modulo = {
  titulo: string;
  // Responde "o que eu encontro aqui?" em uma frase.
  descricao: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  // Cor de destaque da identidade Votus (mesmas do padrão da faixa).
  cor: { texto: string; fundoIcone: string };
  atalhos?: Atalho[];
  className?: string;
  manchetes?: NewsArticleApi[];
};

// Antes eram 4 blocos verdes só com o título, e 3 deles apontavam pra "#"
// (Explicações, Senadores e deputados, Juventude) — clicar não levava a lugar
// nenhum. Agora cada módulo diz o que tem dentro e aponta pra rota real.
// Todos os links abaixo existem em src/app (conferido rota a rota).
const MODULOS: Modulo[] = [
  {
    titulo: "Notícias em alta",
    descricao: "Acompanhe notícias relevantes sobre política e assuntos públicos, com resumo e link para a fonte original.",
    href: "/Painelnoticias",
    cta: "Ver notícias",
    icon: Newspaper,
    cor: { texto: "text-brasil-red", fundoIcone: "bg-brasil-red/10" },
    className: "lg:col-span-3",
  },
  {
    titulo: "Candidatos 2026",
    descricao: "Quem concorre em 2026 à Presidência e aos cargos do Ceará: partido, número na urna, chapa e plano de governo.",
    href: "/CandidatosPage/presidente",
    cta: "Ver candidatos",
    icon: Vote,
    cor: { texto: "text-brasil-orange", fundoIcone: "bg-brasil-orange/10" },
    atalhos: [
      { label: "Presidente", href: "/CandidatosPage/presidente" },
      { label: "Governador", href: "/CandidatosPage/governador" },
      { label: "Senador", href: "/CandidatosPage/senado" },
      { label: "Dep. Federal", href: "/CandidatosPage/deputado-federal" },
      { label: "Dep. Estadual", href: "/CandidatosPage/deputado-estadual" },
    ],
    className: "lg:col-span-3",
  },
  {
    titulo: "Explicações",
    descricao: "Entenda cargos, instituições e processos políticos de forma simples, e teste o que aprendeu.",
    href: "/ExplicacoesPage",
    cta: "Entender os cargos",
    icon: BookOpen,
    cor: { texto: "text-brasil-green", fundoIcone: "bg-brasil-green/10" },
    atalhos: [
      { label: "Quem faz o quê", href: "/ExplicacoesPage" },
      { label: "Você Sabia?", href: "/explicacao" },
    ],
    className: "lg:col-span-2",
  },
  {
    titulo: "Senadores e deputados",
    descricao: "Quem exerce mandato hoje: representantes do Ceará no Congresso, com comissões, proposições e linha do tempo.",
    href: "/DeputadosPage",
    cta: "Ver parlamentares",
    icon: Landmark,
    cor: { texto: "text-brasil-green", fundoIcone: "bg-brasil-gold/20" },
    atalhos: [
      { label: "Deputados", href: "/DeputadosPage" },
      { label: "Senadores", href: "/SenadoresPage" },
    ],
    className: "lg:col-span-2",
  },
  {
    titulo: "Juventude em Pauta",
    descricao: "Vagas, concursos e cursos para quem está começando, e um espaço para propor e debater ideias.",
    href: "/Juventude",
    cta: "Ver oportunidades",
    icon: GraduationCap,
    cor: { texto: "text-brasil-red", fundoIcone: "bg-brasil-orange/10" },
    atalhos: [
      { label: "Vagas e concursos", href: "/Juventude" },
      { label: "Universidades", href: "/Universidades" },
      { label: "Propostas", href: "/PropostasPage" },
    ],
    className: "lg:col-span-2",
  },
];

function ModuloCard({ titulo, descricao, href, cta, icon: Icon, cor, atalhos, manchetes, className = "" }: Modulo) {
  return (
    <section
      aria-labelledby={`modulo-${href}`}
      className={`flex flex-col overflow-hidden rounded-xl border border-line bg-cream shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {/* Faixa com o padrão da identidade Votus — o mesmo da barra do topo. */}
      <div className="h-2.5 w-full shrink-0 bg-[url('/sidebar.svg')] bg-[length:auto_100%] bg-repeat-x" aria-hidden="true" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cor.fundoIcone} ${cor.texto}`}>
            <Icon size={20} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id={`modulo-${href}`} className="font-heading text-lg font-bold leading-tight text-ink">
              {titulo}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{descricao}</p>
          </div>
        </div>

        {manchetes && manchetes.length > 0 && (
          <ul className="mt-4 flex flex-col divide-y divide-line border-y border-line">
            {manchetes.map((noticia) => (
              <li key={noticia.id}>
                <Link
                  href={`/noticias/${noticia.id}`}
                  className="flex items-baseline gap-2 py-2.5 text-sm font-semibold leading-snug text-ink transition-colors hover:text-brasil-red"
                >
                  <span className="line-clamp-2 flex-1">{noticia.title}</span>
                  {noticia.source && (
                    <span className="shrink-0 text-[11px] font-medium text-ink-soft">{noticia.source}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {atalhos && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {atalhos.map((atalho) => (
              <li key={atalho.label}>
                <Link
                  href={atalho.href}
                  className="inline-flex rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-brasil-green/40 hover:text-brasil-green"
                >
                  {atalho.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={href}
          className={`group mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-bold ${cor.texto}`}
        >
          {cta}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

// Manchetes reais mais recentes no card de Notícias. Roda no servidor e a
// página fica em cache (ISR, ver Inicial/page.tsx) — então não atrasa a home.
// Se a API falhar, o card só aparece sem a lista, como antes.
async function carregarManchetes(): Promise<NewsArticleApi[]> {
  try {
    const resposta = await getNewsList(1);
    return resposta.data.filter((noticia) => noticia.published && temImagem(noticia)).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function HighlightGrid() {
  const manchetes = await carregarManchetes();

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {MODULOS.map((modulo, indice) => (
        // No tablet (2 colunas) o último módulo ocupa a linha inteira em vez
        // de sobrar sozinho pela metade.
        <ModuloCard
          key={modulo.href}
          {...modulo}
          manchetes={modulo.href === "/Painelnoticias" ? manchetes : undefined}
          className={`${modulo.className ?? ""} ${indice === MODULOS.length - 1 ? "sm:col-span-2" : ""}`}
        />
      ))}
    </div>
  );
}
