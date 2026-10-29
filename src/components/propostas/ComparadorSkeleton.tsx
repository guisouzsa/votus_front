// Mesmo padrão dos skeletons do Votus (LegislatorCardSkeleton): blocos
// bege com animate-pulse no formato do conteúdo que vai chegar — aqui, a
// faixa dos candidatos, a busca e a visão geral, sem molduras.
export default function ComparadorSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mt-6 animate-pulse">
      <span className="sr-only">Carregando propostas...</span>
      <div className="border-t border-line pt-5">
        <div className="h-5 w-40 rounded bg-[#eee6d8]" />
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-1/2 rounded bg-[#eee6d8]" />
              <div className="h-8 w-2/3 rounded bg-[#eee6d8]" />
              <div className="h-3 w-1/3 rounded bg-[#eee6d8]" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 h-10 rounded-full bg-[#eee6d8]" />
      <div className="mt-8 space-y-3 border-t border-line pt-5">
        <div className="h-5 w-48 rounded bg-[#eee6d8]" />
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
