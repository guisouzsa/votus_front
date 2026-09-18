function NewsCardSkeleton() {
  return <div className="h-44 w-[80vw] shrink-0 animate-pulse rounded-lg bg-[#eee6d8] sm:h-48 sm:w-[21rem]" />;
}

export default function NewsPanelSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-4" aria-label="Carregando notícias" role="status">
      <div className="h-56 w-full animate-pulse rounded-xl bg-[#eee6d8] sm:h-72" />

      {[1, 2].map((secao) => (
        <section key={secao} className="mt-6">
          <div className="mb-3 h-5 w-40 animate-pulse rounded bg-[#eee6d8]" />
          <div className="flex gap-4 overflow-hidden rounded-xl border border-black/10 bg-cream-panel p-3 sm:p-4">
            {[1, 2, 3].map((card) => (
              <NewsCardSkeleton key={card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
