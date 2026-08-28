'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function PreviewSectionsCarousel() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      title: 'VEJA AS ÚLTIMAS NOTÍCIAS SOBRE OS SEUS TÓPICOS FAVORITOS',
      image: '/tela_noticias.png',
      altText: 'Painel de Notícias Votus',
      bgColor: 'bg-brasil-green'
    },
    {
      title: 'Acesse dados dos candidatos aos cargos de deputado e senador',
      image: '/tela_senadores.png',
      altText: 'Dados de Senadores - Votus',
      bgColor: 'bg-brasil-orange'
    }
  ];

  const handlePrev = () => {
    setActiveSection((prev) => (prev === 0 ? sections.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSection((prev) => (prev === sections.length - 1 ? 0 : prev + 1));
  };

  const current = sections[activeSection];

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${current.bgColor} mx-4 md:mx-6 lg:mx-8 rounded-lg my-8 transition-all duration-500`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-72">
          {/* Left - Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {current.title}
            </h2>
          </div>

          {/* Right - Image with Navigation */}
          <div className="flex justify-center items-center gap-4">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="text-white" size={40} strokeWidth={2.5} />
            </button>

            {/* Image */}
            <div className="relative w-full max-w-lg">
              <Image
                src={current.image}
                alt={current.altText}
                width={500}
                height={500}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="text-white" size={40} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSection(index)}
              className={`w-4 h-4 rounded-full transition-all ${
                index === activeSection ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
