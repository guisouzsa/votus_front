import { ExternalLink } from "lucide-react";
import { formatArticleParagraphs, type NewsArticle } from "@/lib/news";

export default function NewsArticlePage({ article }: { article?: NewsArticle }) {
  const hasArticle = Boolean(article?.title || article?.description || article?.content);

  return (
    <article className="w-full px-6 pb-16 sm:px-10">
      <div className="grid gap-6 border-b border-[#EDDBBA] pb-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-end">
        <div>
          {article?.category && (
            <p className="mb-4 text-sm font-semibold text-[#8D0801]">{article.category}</p>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight text-[#8D0801] sm:text-5xl">
            {article?.title || (hasArticle ? "" : "Nenhuma notícia disponível no momento")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#103D23] sm:text-lg">
            {article?.description || (hasArticle ? "" : "As notícias aparecerão aqui assim que forem informadas pela API.")}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 px-1 py-2 text-xs text-[#103D23] lg:mb-1 lg:block">
          <div className="flex min-w-0 items-center gap-2">
            {article?.source?.logoUrl && (
              <img src={article.source.logoUrl} alt="" className="h-8 w-8 shrink-0 object-contain" />
            )}
            {article?.source?.name && <span className="truncate font-medium">{article.source.name}</span>}
          </div>
          {article?.publishedAt && (
            <time className="shrink-0 lg:mt-2 lg:block" dateTime={article.publishedAt}>{article.publishedAt}</time>
          )}
        </div>
      </div>

      {article?.imageUrl ? (
        <img src={article.imageUrl} alt="" className="mt-8 aspect-video w-full rounded-xl object-cover" />
      ) : (
        <div className="mt-8 aspect-video w-full rounded-xl bg-[#F2E4CA]/60" aria-hidden="true" />
      )}

      <div className="mt-8 min-h-96">
        {article?.content ? (
          <>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-[#8D0801]">Resumo</h2>
            <div className="space-y-4 text-base leading-relaxed text-[#22201B] sm:text-lg">
              {formatArticleParagraphs(article.content).map((paragraph, index) =>
                paragraph.isQuote ? (
                  <p
                    key={index}
                    className="border-l-4 border-[#EDDBBA] pl-4 italic text-[#103D23]"
                  >
                    {paragraph.text}
                  </p>
                ) : (
                  <p key={index}>{paragraph.text}</p>
                )
              )}
            </div>
          </>
        ) : (
          <p className="text-base leading-relaxed text-[#22201B] sm:text-lg">
            Nenhuma informação para exibir no momento.
          </p>
        )}
      </div>

      {article?.url && (
        <div className="mt-8 border-t border-[#EDDBBA] pt-6">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#1B623A] px-4 py-2 text-sm font-semibold text-[#1B623A] transition-colors hover:bg-[#1B623A] hover:text-white"
          >
            <ExternalLink size={16} />
            Ver notícia completa {article.source?.name ? `em ${article.source.name}` : ""}
          </a>
        </div>
      )}
    </article>
  );
}
