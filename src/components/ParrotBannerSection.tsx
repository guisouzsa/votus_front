'use client';

import Image from 'next/image';

export default function ParrotBannerSection() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[18px] bg-white">
        <div className="flex items-center gap-5 px-4 py-4 md:px-8">
          <div className="relative h-28 w-28 shrink-0 md:h-36 md:w-36">
            <Image
              src="/ivy_votus.png"
              alt="Papagaio Votus"
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="flex flex-1 flex-col items-end justify-center gap-4 text-right">
            <p className="text-xl font-black uppercase leading-none tracking-tight text-brasil-orange md:text-4xl">
              Sua participação começa com informação. Acesse o Votus agora.
            </p>

            <button className="shrink-0 rounded-md bg-brasil-orange px-6 py-3 text-sm font-bold uppercase text-white shadow-sm transition hover:opacity-90 md:px-8 md:text-base">
              Acesse aqui
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
