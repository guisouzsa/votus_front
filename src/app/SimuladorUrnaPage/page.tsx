import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import DashboardHeader from "@/components/DashboardHeader";
import FloatingAIButton from "@/components/FloatingAIButton";
import UrnaSimulador from "@/components/urna/UrnaSimulador";

export const metadata: Metadata = {
  title: "Simulador de Urna",
  description:
    "Experimente uma simulação educativa de urna eletrônica com os candidatos reais de 2026. O voto não é registrado e não produz resultado eleitoral.",
  alternates: { canonical: "/SimuladorUrnaPage" },
};

export default function SimuladorUrnaPage() {
  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Simulador de Urna"
            titleColor="text-brasil-green"
            subtitle="Experimente a interface de uma urna eletrônica com os candidatos reais de 2026."
          />

          <p className="mt-3 max-w-2xl text-xs italic leading-relaxed text-ink-soft sm:text-sm">
            Simulador educativo — o voto não é registrado, não é salvo em nenhum lugar e não produz resultado
            eleitoral. Os candidatos exibidos são os de 2026 já cadastrados no Votus.
          </p>

          <div className="mt-8 flex justify-center">
            <UrnaSimulador />
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-line bg-cream-panel p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
              <h2 className="font-heading text-base font-black uppercase tracking-tight text-ink sm:text-lg">
                Como usar
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
                <li>Toque os números no teclado para digitar o número do candidato de cada cargo.</li>
                <li>Confira o nome e o partido exibidos na tela e toque em CONFIRMA.</li>
                <li>Toque em CORRIGE para apagar e digitar de novo, ou em BRANCO para votar em branco.</li>
                <li>Ao final de todos os cargos, a simulação reinicia automaticamente.</li>
              </ul>
            </section>

            <section className="rounded-xl border border-[#e0d6c4] bg-[#f7f5f2] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
              <h2 className="font-heading text-base font-black uppercase tracking-tight text-brasil-red sm:text-lg">
                Isto não é a urna oficial
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Este simulador reproduz só a tela e o teclado da urna eletrônica, de forma educativa — ele não
                funciona como o equipamento real do TSE:
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink-soft">
                <li>
                  <strong className="text-ink">A urna oficial não tem acesso à internet.</strong> Ela fica
                  totalmente desconectada de redes durante a votação, por segurança. Este simulador, ao
                  contrário, busca os dados dos candidatos ao vivo pela internet, na API do Votus.
                </li>
                <li>
                  Na urna oficial, os dados dos candidatos vêm pré-carregados num cartão de memória lacrado antes
                  da eleição — não são buscados em tempo real.
                </li>
                <li>Não há identificação do eleitor (biometria/título) aqui — qualquer pessoa pode usar.</li>
                <li>Nenhum voto é registrado, contado ou transmitido a nenhum lugar — nem aqui, nem à urna real.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
