"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WovenRibbon from "@/components/WovenRibbon";
import DashboardHeader from "@/components/DashboardHeader";
import SearchBar from "@/components/SearchBar";
import HeroArticle from "@/components/HeroArticle";
import RelevanceTabs, { type RelevanceTab } from "@/components/RelevanceTabs";
import NewsSection from "@/components/NewsSection";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";
import { getAllNews } from "@/services/newsService";
import { categoryGradient, mapApiNewsToArticle } from "@/lib/news";
import { ApiError } from "@/services/apiClient";
import type { NewsArticleApi } from "@/services/types";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [relevanceTab, setRelevanceTab] = useState<RelevanceTab>("Mais relevantes");

  const {
    data: news,
    error: swrError,
    isLoading,
  } = useSWR("news", () => getAllNews(), { revalidateOnFocus: false });

  const error = swrError
    ? swrError instanceof ApiError
      ? "Não foi possível carregar as notícias agora. Tente novamente em instantes."
      : "Ocorreu um erro inesperado ao carregar as notícias."
    : null;

  const publishedNews = useMemo(() => (news ?? []).filter((item) => item.published), [news]);

  const sortedNews = useMemo(() => {
    const list = [...publishedNews];

    if (relevanceTab === "Mais recentes") {
      list.sort(
        (a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
      );
    } else {
      list.sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0));
    }

    return list;
  }, [publishedNews, relevanceTab]);

  const categories = useMemo(
    () =>
      Array.from(new Set(publishedNews.map((item) => item.category).filter((c): c is string => Boolean(c)))).sort(),
    [publishedNews]
  );

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedNews.filter((item) => {
      const matchesQuery = !query || item.title.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategories.length === 0 || (item.category !== null && selectedCategories.includes(item.category));

      return matchesQuery && matchesCategory;
    });
  }, [sortedNews, search, selectedCategories]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, NewsArticleApi[]>();

    for (const item of filteredNews) {
      const key = item.category ?? "Outros";
      const list = groups.get(key);
      if (list) {
        list.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    return Array.from(groups.entries());
  }, [filteredNews]);

  // A notícia em destaque é sempre a mais relevante entre todas as publicadas,
  // fixa independente da aba de ordenação ou dos filtros aplicados na lista abaixo.
  const mostRelevantNews = useMemo(() => {
    if (publishedNews.length === 0) return undefined;

    return [...publishedNews].sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0))[0];
  }, [publishedNews]);

  const heroArticle = mostRelevantNews ? mapApiNewsToArticle(mostRelevantNews) : undefined;

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Painel Notícias"
            titleColor="text-[#8C0801]"
            titleClassName="font-heading"
          />
          <SearchBar
            searchValue={search}
            onSearchChange={setSearch}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
          />
          <HeroArticle article={heroArticle} />
          <RelevanceTabs value={relevanceTab} onChange={setRelevanceTab} />

          {isLoading && <p className="mt-10 text-sm text-[#103D23]">Carregando notícias...</p>}

          {!isLoading && error && (
            <p className="mt-10 text-sm font-semibold text-[#8D0801]">{error}</p>
          )}

          {!isLoading && !error && filteredNews.length === 0 && (
            <p className="mt-10 text-sm text-[#103D23]">Nenhuma notícia encontrada.</p>
          )}

          {!isLoading &&
            !error &&
            groupedByCategory.map(([category, items]) => (
              <NewsSection
                key={category}
                title={category}
                items={items.map((item) => ({
                  id: item.id,
                  eyebrow: item.category ?? "Notícia",
                  title: item.title,
                  imageUrl: item.image_url,
                  gradient: categoryGradient(item.category),
                }))}
              />
            ))}
        </div>

        <Footer />
      </main>

      <FloatingAIButton />
    </div>
  );
}
