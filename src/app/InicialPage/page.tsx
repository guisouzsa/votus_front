import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import DashboardHeader from "@/components/DashboardHeader";
import HighlightGrid from "@/components/Highlightgrid";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Início",
  description:
    "Acompanhe deputados, senadores, notícias políticas, propostas e mais em um só lugar no Votus.",
  alternates: { canonical: "/InicialPage" },
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh overflow-x-hidden bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Bem-vindo ao Votus"
            titleColor="text-brasil-red"
            subtitle="Aqui você pode consultar informações sobre candidatos, acompanhar notícias políticas e conhecer oportunidades."
          />
          <HighlightGrid />
        </div>
        <Footer />
      </main>

      <FloatingAIButton />
    </div>
  );
}