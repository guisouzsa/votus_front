'use client';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'COLETA',
      description: 'O Votus coleta dados de fontes públicas.'
    },
    {
      number: '2',
      title: 'ORGANIZAÇÃO E VERIFICAÇÃO',
      description: 'As informações são organizadas e verificadas.'
    },
    {
      number: '3',
      title: 'EXPLICAÇÃO',
      description: 'Termos técnicos recebem explicações acessíveis.'
    },
    {
      number: '4',
      title: 'AUTONOMIA',
      description: 'O usuário consulta a fonte e forma sua própria opinião.'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-brick tracking-tight">
            COMO FUNCIONA
          </h2>
        </div>

        <div className="relative pb-10">
          <div className="absolute left-[8%] right-[8%] top-[58px] h-[3px] bg-brasil-gold" />

          <div className="relative grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="group flex flex-col items-center text-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-brasil-gold text-5xl font-black text-white shadow-sm">
                  {step.number}
                </div>

                <div className="mt-4 w-full max-w-[220px] rounded-md border border-transparent bg-transparent px-3 py-2 text-center text-lg font-black uppercase leading-tight text-brasil-gold shadow-none transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 opacity-100">
                  {step.title}
                </div>

                <p className="mt-2 max-w-[220px] text-base leading-relaxed text-ink-soft opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
