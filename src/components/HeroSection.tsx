'use client';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Main Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-brick mb-8 leading-[0.95] tracking-tight">
            ESCOLHA SEU TIME ELEITORAL COM
            <span className="block mt-5">CONSCIÊNCIA</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-black text-brick mb-10 tracking-tight">
            ESCOLHA SEU TIME ELEITORAL COM O VOTUS
          </h2>
          <p className="text-lg text-ink-soft mb-12 max-w-3xl mx-auto leading-relaxed">
            O Votus é uma iniciativa voltada para jovens e a pessoas que querem conhecer mais sobre o candidato que desejam elegê-los sua página.
          </p>
          <button className="px-8 py-3 bg-brick text-white rounded font-bold hover:opacity-90 transition-opacity inline-block">
            Conheça o projeto
          </button>
        </div>
      </div>
    </section>
  );
}
