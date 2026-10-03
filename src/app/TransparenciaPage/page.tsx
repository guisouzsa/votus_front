import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Calculator, Landmark, Link2, Scale, SlidersHorizontal, Building2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import DashboardHeader from "@/components/DashboardHeader";
import FloatingAIButton from "@/components/FloatingAIButton";

export const metadata: Metadata = {
  title: "Transparência dos Dados",
  description:
    "Como o Votus coleta, trata e verifica os dados de candidatos, parlamentares e despesas de campanha exibidos na plataforma.",
  alternates: { canonical: "/TransparenciaPage" },
};

const ETAPAS_FLUXO = [
  { numero: "1", titulo: "Fonte oficial", descricao: "TSE, Câmara, Senado e ALECE." },
  { numero: "2", titulo: "Coleta", descricao: "Arquivos e APIs públicas dessas instituições." },
  { numero: "3", titulo: "Tratamento", descricao: "Padronizado para ficar legível, sem mudar o conteúdo." },
  { numero: "4", titulo: "Votus", descricao: "Organizado e exibido nas páginas do site." },
  { numero: "5", titulo: "Você", descricao: "Consulta com a origem sempre rastreável." },
];

const FONTES = [
  {
    nome: "TSE",
    descricao: "Candidatos, histórico de candidaturas e despesas de campanha de 2026 — arquivos oficiais baixados do Portal de Dados Abertos.",
    url: "https://dadosabertos.tse.jus.br/dataset/candidatos-2026",
    icon: Scale,
    cor: { texto: "text-brasil-red", fundoIcone: "bg-brasil-red/10" },
  },
  {
    nome: "Câmara dos Deputados",
    descricao: "Deputados federais do Ceará em exercício e suas proposições, pela API pública de Dados Abertos.",
    url: "https://dadosabertos.camara.leg.br/swagger/api.html",
    icon: Landmark,
    cor: { texto: "text-brasil-green", fundoIcone: "bg-brasil-green/10" },
  },
  {
    nome: "Senado Federal",
    descricao: "Senadores do Ceará em exercício e suas proposições, pela API pública de Dados Abertos Legislativos.",
    url: "https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html",
    icon: Building2,
    cor: { texto: "text-brasil-orange", fundoIcone: "bg-brasil-orange/10" },
  },
  {
    nome: "Assembleia Legislativa do Ceará",
    descricao: "Deputados estaduais e proposições. A ALECE não publica API aberta, então extraímos direto do site oficial.",
    url: "https://www.al.ce.gov.br/deputados",
    icon: Landmark,
    cor: { texto: "text-brasil-gold", fundoIcone: "bg-brasil-gold/20" },
  },
];

const TIPOS_DADO = [
  {
    titulo: "Dado oficial",
    descricao: "Vem direto de uma fonte oficial, sem alteração.",
    icon: BadgeCheck,
    cor: { texto: "text-brasil-green", fundoIcone: "bg-brasil-green/10" },
  },
  {
    titulo: "Dado tratado",
    descricao: "Dado oficial padronizado para ser exibido corretamente.",
    icon: SlidersHorizontal,
    cor: { texto: "text-brasil-green", fundoIcone: "bg-brasil-green/10" },
  },
  {
    titulo: "Dado relacionado",
    descricao: "Ligado por um identificador oficial (CPF, código do TSE) — nunca só pelo nome.",
    icon: Link2,
    cor: { texto: "text-brasil-orange", fundoIcone: "bg-brasil-orange/10" },
  },
  {
    titulo: "Dado calculado pelo Votus",
    descricao: "Criado por nós a partir de dados oficiais, sempre identificado como tal. Ex.: o total de despesas de campanha, somado a partir dos registros do TSE.",
    icon: Calculator,
    cor: { texto: "text-brasil-red", fundoIcone: "bg-brasil-red/10" },
  },
];

const COMO_EVITAMOS_ERROS = [
  "Priorizamos identificadores oficiais (CPF, código do TSE/Câmara/Senado) em vez de só o nome.",
  "Mantemos a referência de onde cada informação veio.",
  "Diferenciamos ausência de dado de erro de carregamento.",
  "Não usamos IA para inventar ou completar dados eleitorais.",
];

export default function TransparenciaPage() {
  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        {/* pr-16 no mobile/tablet: o botão flutuante "Pergunte à IA" fica fixo
            no canto inferior direito (bottom-24 right-4, só sai dessa posição
            em md:) e cobria pedaços de título/texto que chegavam até ali. */}
        <div className="w-full py-8 pl-6 pr-16 sm:pl-10 md:pr-10">
          <DashboardHeader
            titleText="Transparência dos dados"
            titleColor="text-brasil-green"
            subtitle="Os dados políticos exibidos no Votus não são inventados pela plataforma — veja de onde vêm e como são tratados."
          />

          <section className="mt-12 sm:mt-16">
            <h2 className="text-center font-heading text-2xl font-black uppercase tracking-tight text-brasil-red sm:text-4xl">
              Como o dado chega até você
            </h2>

            <div className="relative mt-10 pb-4">
              <div className="absolute left-[8%] right-[8%] top-[44px] hidden h-[3px] bg-brasil-gold sm:block" />

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
                {ETAPAS_FLUXO.map((etapa) => (
                  <div key={etapa.titulo} className="relative flex flex-col items-center text-center">
                    <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-brasil-gold text-3xl font-black text-white shadow-sm">
                      {etapa.numero}
                    </div>
                    <p className="mt-3 text-sm font-black uppercase leading-tight text-brasil-gold">{etapa.titulo}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{etapa.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-14 sm:mt-20">
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
              Fontes oficiais utilizadas hoje
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FONTES.map((fonte) => (
                <div
                  key={fonte.nome}
                  className="flex flex-col overflow-hidden rounded-xl border border-line bg-cream shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <div className="h-2 w-full shrink-0 bg-[url('/sidebar.svg')] bg-[length:auto_100%] bg-repeat-x" aria-hidden="true" />
                  <div className="flex flex-1 items-start gap-3 p-5">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fonte.cor.fundoIcone} ${fonte.cor.texto}`}>
                      <fonte.icon size={20} strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-base font-bold text-ink">{fonte.nome}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{fonte.descricao}</p>
                      <a
                        href={fonte.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`group mt-3 inline-flex items-center gap-1.5 text-sm font-bold ${fonte.cor.texto}`}
                      >
                        Ver fonte oficial
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 sm:mt-20">
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
              Dado oficial, tratado, relacionado ou calculado?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
              Nem todo número no Votus foi publicado assim pela fonte — por isso separamos em quatro tipos:
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TIPOS_DADO.map((tipo) => (
                <div key={tipo.titulo} className="flex items-start gap-3 rounded-xl border border-line bg-cream-panel p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tipo.cor.fundoIcone} ${tipo.cor.texto}`}>
                    <tipo.icon size={20} strokeWidth={2.25} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className={`font-heading text-sm font-black uppercase tracking-tight ${tipo.cor.texto}`}>{tipo.titulo}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{tipo.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 max-w-2xl sm:mt-20">
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
              Como evitamos erros
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
              Não prometemos zero erros, mas o processo é desenhado para reduzir erros de associação:
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {COMO_EVITAMOS_ERROS.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft sm:text-base">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brasil-green" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs italic text-ink-soft">
              Dados de candidatos e parlamentares são atualizados pela equipe conforme as fontes oficiais publicam
              novas versões — não em tempo real.
            </p>
          </section>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
