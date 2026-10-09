'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ParrotBannerSection() {
  return (
    <section className="px-4 py-0 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[18px] bg-white">
        <div className="flex items-center gap-5 px-4 py-4 md:px-8">
          <div className="relative h-28 w-28 shrink-0 md:h-36 md:w-36">
            <Image
              src="/ivy_votus.png"
              alt="Papagaio Votus"
              fill
              priority
              sizes="(min-width: 768px) 144px, 112px"
              className="object-contain"
            />
          </div>

          <div className="flex flex-1 flex-col items-end justify-center gap-4 text-right">
            <p className="text-xl font-black uppercase leading-none tracking-tight text-brasil-orange md:text-4xl">
              Sua participação começa com informação. Acesse o Votus agora.
            </p>

            <Link href="/CandidatosPage/deputado-federal" className="inline-block w-full shrink-0 rounded bg-brasil-orange px-8 py-3 text-center font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-orange sm:w-auto">
              Explorar candidatos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
