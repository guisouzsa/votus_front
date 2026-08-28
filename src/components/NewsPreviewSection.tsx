'use client';

import Image from 'next/image';

export default function NewsPreviewSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-brasil-green mx-4 md:mx-6 lg:mx-8 rounded-lg my-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-72">
          {/* Left - Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-cream leading-tight">
              VEJA AS ÚLTIMAS NOTÍCIAS SOBRE OS SEUS TÓPICOS FAVORITOS
            </h2>
          </div>

          {/* Right - Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-lg">
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
