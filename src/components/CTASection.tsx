'use client';

export default function CTASection() {
  return (
    <section id="cta" className="py-16 px-4 sm:px-6 lg:px-8 bg-brasil-green text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 uppercase">
            Pronto para ganhar a política com mais clareza?
          </h2>
          
          <button className="px-12 py-3 bg-cream text-brasil-green rounded font-bold hover:opacity-90 transition-opacity inline-block">
            Acessar
          </button>
        </div>
      </div>
    </section>
  );
}
