export default function LegislatorCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-[12px] border border-[#e0d6c4] bg-white shadow-sm">
      <div className="flex h-36 shrink-0 items-center justify-center bg-white p-3 sm:h-44 sm:p-4 md:h-56">
        <div className="h-full w-full rounded-md bg-[#eee6d8]" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#e0d6c4]">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-white p-3 pb-4 sm:p-4 sm:pb-5">
          <div className="h-4 w-3/4 rounded bg-[#eee6d8]" />
          <div className="h-3 w-1/2 rounded bg-[#eee6d8]" />
          <div className="h-3 w-1/3 rounded bg-[#eee6d8]" />
        </div>
        <div className="h-3 w-full shrink-0 bg-[#eee6d8]" />
      </div>
    </div>
  );
}

export function LegislatorGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-[repeat(5,minmax(0,1fr))] md:gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <LegislatorCardSkeleton key={index} />
      ))}
    </div>
  );
}
