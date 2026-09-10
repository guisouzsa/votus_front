"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import FloatingAIButton from "@/components/FloatingAIButton";
import NewsArticlePage from "@/components/NewsArticlePage";
import { getNewsItem } from "@/services/newsService";
import { mapApiNewsToArticle } from "@/lib/news";

export default function NewsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading } = useSWR(id ? ["news", id] : null, () => getNewsItem(id), {
    revalidateOnFocus: false,
  });

  const article = data ? mapApiNewsToArticle(data) : undefined;

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 pb-2 pt-8 sm:px-10">
          <Link
            href="/Painelnoticias"
            className="mb-4 inline-flex items-center gap-1.5 bg-transparent text-sm font-semibold text-[#8d0801] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Voltar
          </Link>
        </div>

        {isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-[#103D23] sm:px-10">Carregando notícia...</p>
        ) : (
          <NewsArticlePage article={article} />
        )}
      </main>
      <FloatingAIButton />
    </div>
  );
}
