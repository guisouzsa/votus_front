import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import FloatingAIButton from "@/components/FloatingAIButton";
import NewsArticlePage from "@/components/NewsArticlePage";
import type { NewsArticle } from "@/lib/news";

type NewsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Notícia | Votus",
    description: "Detalhes da notícia no Votus",
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { id } = await params;
  const article: NewsArticle = { id };

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <NewsArticlePage article={article} />
      </main>
      <FloatingAIButton />
    </div>
  );
}
