export default function ProposalCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-[12px] border border-[#e0d6c4] bg-white p-4 shadow-sm sm:p-5">
      <div className="h-4 w-2/3 rounded bg-[#eee6d8]" />
      <div className="h-3 w-1/3 rounded bg-[#eee6d8]" />
      <div className="h-3 w-full rounded bg-[#eee6d8]" />
      <div className="h-3 w-5/6 rounded bg-[#eee6d8]" />
      <div className="mt-1 flex gap-3">
        <div className="h-9 w-24 rounded-full bg-[#eee6d8]" />
        <div className="h-9 w-28 rounded-full bg-[#eee6d8]" />
      </div>
    </div>
  );
}

export function ProposalListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProposalCardSkeleton key={index} />
      ))}
    </div>
  );
}
