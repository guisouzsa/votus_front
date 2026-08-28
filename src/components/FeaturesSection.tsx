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
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brick mb-4 uppercase">
            Você saberia responder?
          </h2>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 mb-8">
          {questions.slice(0, 2).map((q, index) => (
            <div
              key={index}
              className={`${q.color} ${q.textColor} p-8 rounded-lg cursor-pointer hover:shadow-lg transition-shadow group min-h-40`}
              onMouseEnter={() => setExpandedCard(index)}
              onMouseLeave={() => setExpandedCard(null)}
            >
              <div className="flex items-start min-h-[120px]">
                <span className="flex-shrink-0 w-[96px] text-[110px] font-black leading-none opacity-90 pt-1">
                  {index + 1}.
                </span>

                <div className="flex-1 min-w-0 pl-2">
                  <h3 className={`text-2xl font-bold leading-tight ${expandedCard === index ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                    {q.title}
                  </h3>

                  {expandedCard === index && (
                    <p className="mt-3 text-sm opacity-90 leading-relaxed">
                      {q.answer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {questions.slice(2).map((q, index) => (
            <div
              key={index + 2}
              className={`${q.color} ${q.textColor} p-8 rounded-lg cursor-pointer hover:shadow-lg transition-shadow group min-h-40`}
              onMouseEnter={() => setExpandedCard(index + 2)}
              onMouseLeave={() => setExpandedCard(null)}
            >
              <div className="flex items-start min-h-[120px]">
                <span className="flex-shrink-0 w-[96px] text-[110px] font-black leading-none opacity-90 pt-1">
                  {index + 3}.
                </span>

                <div className="flex-1 min-w-0 pl-2">
                  <h3 className={`text-2xl font-bold leading-tight ${expandedCard === index + 2 ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                    {q.title}
                  </h3>

                  {expandedCard === index + 2 && (
                    <p className="mt-3 text-sm opacity-90 leading-relaxed">
                      {q.answer}
                    </p>
                  )}
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
              className={`${q.color} ${q.textColor} w-full p-6 rounded-lg text-left transition-all relative overflow-hidden`}
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[72px] font-black leading-none opacity-90">
                {index + 1}.
              </span>

              <div className="pl-16">
                <h3 className="font-bold mb-2">
                  {q.title}
                </h3>
                {expandedCard === index && (
                  <p className={`text-sm opacity-80 mt-3 border-t ${q.textColor === 'text-white' ? 'border-white/30' : 'border-ink/30'} pt-3`}>
                    {q.answer}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
