'use client';

import Image from 'next/image';

export default function NewsPreviewSection() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-brasil-green">
        <div className="grid gap-8 p-8 sm:p-10 md:grid-cols-2 md:items-center md:gap-10 lg:p-12">
          {/* Left - Text */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wide text-cream/70">Notícias</span>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-cream md:text-4xl">
              Veja as últimas notícias sobre os seus tópicos favoritos
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/85 md:text-base">
              Acompanhe notícias relacionadas aos temas e assuntos de interesse, organizadas em um painel simples de
              consultar.
            </p>
          </div>

          {/* Right - Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <Image
                src="/tela_noticias.png"
                alt="Painel de Notícias Votus"
                width={500}
                height={500}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
