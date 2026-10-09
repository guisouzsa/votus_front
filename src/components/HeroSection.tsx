'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-white px-4 pb-0 pt-32 sm:px-6 lg:px-8">
      <div className="landing-container">
        {/* Main Hero */}
        <div className="mb-0 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-brick mb-8 leading-[0.95] tracking-tight">
            VOTE COM CONSCIÊNCIA
          </h1>
          <h2 className="text-[clamp(1.125rem,2.2vw,1.75rem)] font-semibold leading-tight text-brick mb-10 tracking-tight min-[641px]:whitespace-nowrap">
            Conheça candidatos, acompanhe notícias e monte seu santinho
          </h2>
          <p className="mx-auto mb-[var(--landing-hero-gap)] max-w-3xl text-lg leading-relaxed text-ink-soft">
            O Votus é uma iniciativa voltada para jovens e para quem quer conhecer melhor os candidatos antes de votar. Aqui você consulta perfis, acompanha notícias e monta o seu santinho.
          </p>
          <Link href="/CandidatosPage/deputado-federal" className="px-8 py-3 bg-brick text-white rounded font-bold hover:opacity-90 transition-opacity inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick">
            Explorar candidatos
          </Link>
        </div>
      </div>
    </section>
  );
}
