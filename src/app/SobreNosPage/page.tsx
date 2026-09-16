import type { Metadata } from "next";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import DashboardHeader from "@/components/DashboardHeader";
import DevelopersSection from "@/components/DevelopersSection";
import FloatingAIButton from "@/components/FloatingAIButton";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description:
    "Conheça o Votus: painéis de parlamentares, notícias resumidas por IA, explicações sobre cargos políticos e o time por trás do projeto.",
  alternates: { canonical: "/SobreNosPage" },
};

const PILARES = [
  {
    titulo: "Painéis de parlamentares",
    descricao:
      "Perfis de deputados federais e senadores do Ceará com partido, situação do mandato e Efetividade Legislativa — quantas propostas de cada um realmente avançaram.",
  },
  {
    titulo: "Notícias resumidas por IA",
    descricao:
      "Notícias de política coletadas de veículos como a Agência Brasil, resumidas automaticamente e organizadas por relevância e categoria.",
  },
  {
    titulo: "Explicações sobre cargos",
    descricao:
      "Uma seção didática que explica o que faz cada cargo político federal e estadual, como funciona o voto e como os poderes se relacionam.",
  },
  {
    titulo: "Agente de IA",
    descricao:
      "Um assistente que responde perguntas sobre política, eleições e sobre os próprios parlamentares do Ceará cadastrados no Votus.",
  },
];

export default function SobreNosPage() {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="min-h-dvh">
          <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
            <Image src="/sidebar.svg" alt="" fill priority className="object-cover" />
          </header>

          <div className="w-full px-6 py-8 sm:px-10">
            <DashboardHeader
              titleText="Sobre o Votus"
              titleColor="text-brasil-green"
              subtitle="Transparência política pensada para jovens conhecerem seus representantes."
            />

            <section className="mt-10 max-w-3xl">
              <h2 className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
                O que é o Votus
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                O Votus é uma plataforma de transparência política feita para jovens e para quem quer conhecer
                melhor os candidatos e representantes antes de votar. A ideia é simples: cruzar o que os
                parlamentares dizem em público com o que eles de fato fazem no mandato, e entregar isso de um
                jeito claro, direto e sem viés partidário.
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                O Votus não apoia nem recomenda nenhum candidato, partido ou lado político. A plataforma
                apresenta dados e fatos objetivos — a decisão de voto continua sendo sempre pessoal.
              </p>
            </section>

            <section className="mt-14 sm:mt-20">
              <h2 className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
                Como o Votus funciona
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {PILARES.map((pilar) => (
                  <div
                    key={pilar.titulo}
                    className="rounded-xl border border-line bg-cream-panel p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    <p className="font-heading text-base font-black uppercase tracking-tight text-brasil-green sm:text-lg">
                      {pilar.titulo}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">{pilar.descricao}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14 max-w-3xl sm:mt-20">
              <h2 className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
                O projeto e o Ceará Científico
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                O Votus nasceu como projeto para o <strong>Ceará Científico</strong>, feira estadual de
                iniciação científica e tecnológica que reúne estudantes de todo o Ceará. A proposta da equipe
                foi usar tecnologia — coleta automatizada de dados públicos e inteligência artificial — para
                aproximar jovens da política e tornar o acompanhamento de mandatos algo acessível no dia a dia,
                não só em época de eleição.
              </p>
            </section>
          </div>

          <div className="mt-14 sm:mt-20">
            <DevelopersSection />
          </div>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
