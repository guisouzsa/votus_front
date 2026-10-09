'use client';

import { useState } from 'react';

export default function FeaturesSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const questions = [
    {
      title: 'Para onde vai o dinheiro público da sua cidade?',
      color: 'bg-brasil-gold',
      textColor: 'text-white',
      answer: 'Veja como o Votus rastreia e explica o orçamento municipal de forma clara e acessível.'
    },
    {
      title: 'É um senador com programa que ta uma proposta?',
      color: 'bg-brick',
      textColor: 'text-white',
      answer: 'Descubra como os propostas de seus senadores impactam sua vida através do Votus.'
    },
    {
      title: 'Qual é a função de um governador?',
      color: 'bg-brasil-green',
      textColor: 'text-white',
      answer: 'Entenda as responsabilidades e poder de ação de governadores de forma didática.'
    },
    {
      title: '3 outras oportunidades estão abertas para jovens no campo?',
      color: 'bg-brasil-orange',
      textColor: 'text-white',
      answer: 'Explore políticas de desenvolvimento rural e oportunidades para o setor agrícola.'
    }
  ];

  return (
    <section id="features" className="bg-white px-4 py-0 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center min-[641px]:mb-8 min-[1025px]:mb-10">
          <h2 className="text-3xl font-bold uppercase text-brick md:text-4xl">
            Você saberia responder?
          </h2>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 mb-8">
          {questions.slice(0, 2).map((q, index) => (
            <div
              key={index}
              className={`${q.color} ${q.textColor} group min-h-40 cursor-pointer rounded-lg p-8 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-green`}
              onMouseEnter={() => setExpandedCard(index)}
              onMouseLeave={() => setExpandedCard(null)}
              onFocus={() => setExpandedCard(index)}
              onBlur={() => setExpandedCard(null)}
              onClick={() => setExpandedCard(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setExpandedCard(expandedCard === index ? null : index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={expandedCard === index}
            >
              <div className="flex items-start min-h-[120px]">
                <span className="flex-shrink-0 w-[96px] text-[110px] font-black leading-none text-white opacity-90 pt-1">
                  {index + 1}.
                </span>

                <div className="flex-1 min-w-0 pl-2">
                  <h3 className="text-2xl font-bold leading-tight">
                    {q.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-relaxed opacity-0 translate-y-2 transition-[opacity,transform] duration-200 motion-reduce:transform-none motion-reduce:transition-none ${
                      expandedCard === index ? 'translate-y-0 opacity-90' : 'pointer-events-none'
                    }`}
                  >
                    {q.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {questions.slice(2).map((q, index) => (
            <div
              key={index + 2}
              className={`${q.color} ${q.textColor} group min-h-40 cursor-pointer rounded-lg p-8 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-green`}
              onMouseEnter={() => setExpandedCard(index + 2)}
              onMouseLeave={() => setExpandedCard(null)}
              onFocus={() => setExpandedCard(index + 2)}
              onBlur={() => setExpandedCard(null)}
              onClick={() => setExpandedCard(index + 2)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setExpandedCard(expandedCard === index + 2 ? null : index + 2);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={expandedCard === index + 2}
            >
              <div className="flex items-start min-h-[120px]">
                <span className="flex-shrink-0 w-[96px] text-[110px] font-black leading-none text-white opacity-90 pt-1">
                  {index + 3}.
                </span>

                <div className="flex-1 min-w-0 pl-2">
                  <h3 className="text-2xl font-bold leading-tight">
                    {q.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-relaxed opacity-0 translate-y-2 transition-[opacity,transform] duration-200 motion-reduce:transform-none motion-reduce:transition-none ${
                      expandedCard === index + 2 ? 'translate-y-0 opacity-90' : 'pointer-events-none'
                    }`}
                  >
                    {q.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Stack */}
        <div className="md:hidden space-y-4">
          {questions.map((q, index) => (
            <button
              key={index}
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              aria-expanded={expandedCard === index}
              className={`${q.color} ${q.textColor} relative w-full overflow-hidden rounded-lg p-6 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-green`}
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[72px] font-black leading-none text-white opacity-90">
                {index + 1}.
              </span>

              <div className="pl-16">
                <h3 className="font-bold mb-2">
                  {q.title}
                </h3>
                <p
                  className={`mt-3 border-t pt-3 text-sm opacity-0 translate-y-2 transition-[opacity,transform] duration-200 motion-reduce:transform-none motion-reduce:transition-none ${
                    q.textColor === 'text-white' ? 'border-white/30' : 'border-ink/30'
                  } ${expandedCard === index ? 'translate-y-0 opacity-80' : 'pointer-events-none'}`}
                >
                  {q.answer}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
