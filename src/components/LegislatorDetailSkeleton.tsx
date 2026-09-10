import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Image from 'next/image';

export default function LegislatorDetailSkeleton() {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileBottomNav />
      <main className="min-h-dvh animate-pulse bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
          <div className="mb-4 h-4 w-20 rounded bg-[#eee6d8]" />

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
            <div className="flex min-h-[145px] flex-col items-center gap-3 rounded-[10px] p-3 sm:col-span-3 sm:flex-row md:col-span-1">
              <div className="h-[195px] w-[170px] shrink-0 rounded-lg bg-[#eee6d8]" />
              <div className="w-full flex-1 space-y-3">
                <div className="mx-auto h-5 w-3/4 rounded bg-[#eee6d8] sm:mx-0" />
                <div className="mx-auto h-4 w-1/2 rounded bg-[#eee6d8] sm:mx-0" />
                <div className="mx-auto h-3 w-2/3 rounded bg-[#eee6d8] sm:mx-0" />
              </div>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="min-h-[120px] rounded-[10px] bg-[#eee6d8] sm:min-h-[145px]" />
            ))}
          </section>

          <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
            <div className="h-16 rounded-[10px] bg-[#eee6d8] md:h-[338px] md:w-[160px]" />
            <div className="min-h-[280px] rounded-[10px] bg-[#eee6d8]" />
          </section>
        </div>
      </main>
    </div>
  );
}
