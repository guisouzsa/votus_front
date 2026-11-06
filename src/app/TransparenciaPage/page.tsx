import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, Calculator, Landmark, Link2, Scale, SlidersHorizontal, Building2, CheckCircle2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import DashboardHeader from "@/components/DashboardHeader";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";

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

// Mesmo card e mesmo título das seções de /ExplicacoesPage.
function Secao({ tour, titulo, intro, children }: { tour: string; titulo: string; intro?: string; children: ReactNode }) {
  return (
    <section data-tour={tour} className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">{titulo}</h2>
      {intro && <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function TransparenciaPage() {
  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Transparência dos dados"
            titleColor="text-brasil-green"
            subtitle="Os dados políticos exibidos no Votus não são inventados pela plataforma — veja de onde vêm e como são tratados."
          />

          <div className="mt-8 flex flex-col gap-6">
            <Secao tour="transparencia-fluxo" titulo="Como o dado chega até você">
              <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-5 sm:gap-4">
                {/* Linha que liga os círculos: sai do centro do 1º e vai até o centro do 5º. */}
                <div className="absolute left-[10%] right-[10%] top-6 hidden h-[3px] bg-brasil-gold sm:block" aria-hidden="true" />
                {ETAPAS_FLUXO.map((etapa) => (
                  <li key={etapa.titulo} className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brasil-gold text-xl font-black text-ink">
                      {etapa.numero}
                    </span>
                    <div className="sm:mt-3">
                      <p className="font-heading text-sm font-black uppercase leading-tight text-ink">{etapa.titulo}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{etapa.descricao}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Secao>

            <Secao tour="transparencia-fontes" titulo="Fontes oficiais utilizadas hoje">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {FONTES.map((fonte) => (
                  <div key={fonte.nome} className="flex flex-col rounded-xl border border-line bg-cream p-5">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fonte.cor.fundoIcone} ${fonte.cor.texto}`}>
                      <fonte.icon size={20} strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-heading text-base font-bold text-ink">{fonte.nome}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{fonte.descricao}</p>
                    {/* mt-auto: o link fica alinhado no pé dos cards, com qualquer tamanho de texto. */}
                    <a
                      href={fonte.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-brasil-green"
                    >
                      Ver fonte oficial
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                ))}
              </div>
            </Secao>

            <Secao
              tour="transparencia-tipos"
              titulo="Dado oficial, tratado, relacionado ou calculado?"
              intro="Nem todo número no Votus foi publicado assim pela fonte — por isso separamos em quatro tipos:"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {TIPOS_DADO.map((tipo) => (
                  <div key={tipo.titulo} className="rounded-xl border border-line bg-cream p-5">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tipo.cor.fundoIcone} ${tipo.cor.texto}`}>
                      <tipo.icon size={20} strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-heading text-base font-bold text-ink">{tipo.titulo}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{tipo.descricao}</p>
                  </div>
                ))}
              </div>
            </Secao>

            <Secao
              tour="transparencia-erros"
              titulo="Como evitamos erros"
              intro="Não prometemos zero erros, mas o processo é desenhado para reduzir erros de associação:"
            >
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {COMO_EVITAMOS_ERROS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft sm:text-base">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brasil-green" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-line pt-4 text-xs text-ink-soft">
                Dados de candidatos e parlamentares são atualizados pela equipe conforme as fontes oficiais publicam
                novas versões — não em tempo real.
              </p>
            </Secao>
          </div>
        </div>

        <Footer />
      </main>

      <FloatingAIButton />
    </div>
  );
}
