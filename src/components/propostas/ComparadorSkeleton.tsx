// Mesmo padrão dos skeletons do Votus (LegislatorCardSkeleton): blocos
// bege com animate-pulse no formato do conteúdo que vai chegar.
export default function ComparadorSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mt-5 animate-pulse">
      <span className="sr-only">Carregando propostas...</span>
      <div className="h-4 w-40 rounded bg-[#eee6d8]" />
      <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2 rounded-xl border border-[#e0d6c4] bg-white p-3.5">
            <div className="h-4 w-1/3 rounded bg-[#eee6d8]" />
            <div className="h-3 w-2/3 rounded bg-[#eee6d8]" />
            <div className="h-3 w-1/2 rounded bg-[#eee6d8]" />
            <div className="h-3 w-3/4 rounded bg-[#eee6d8]" />
          </div>
        ))}
      </div>
      <div className="mt-5 h-[88px] rounded-xl border border-[#e0d6c4] bg-white" />
      <div className="mt-5 space-y-2 rounded-xl border border-[#e0d6c4] bg-white p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3.5 flex-1 rounded bg-[#eee6d8]" />
            <div className="h-3.5 w-16 rounded bg-[#eee6d8]" />
            <div className="h-3.5 w-16 rounded bg-[#eee6d8]" />
          </div>
        ))}
      </div>
    </div>
  );
}
