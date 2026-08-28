'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function DevelopersSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const developers = [
    {
      name: 'Dafny Almeida',
      image: '/dafny_almeida_votus.jpg'
    },
    {
      name: 'Emanuel Rodrigues',
      image: '/emanuel_sousa_votus.jpg'
    },
    {
      name: 'Eva Lohane',
      image: '/eva_lohane_votus.jpg'
    },
    {
      name: 'Kerllon Sousa',
      image: '/kerllon_sousa_votus.jpg'
    },
    {
      name: 'Guilherme Rodrigues',
      image: '/guilherme_rodrigues_votus.jpg'
    },
    {
      name: 'Ivens Araujo',
      image: '/ivens_araujo_votus.jpeg'
    },
    {
      name: 'Larissa Félix',
      image: '/larissa_felix_votus.jpg'
    },
    {
      name: 'Marianne Moreira',
      image: '/marianne_moreira_votus.jpg'
    },
    {
      name: 'Maria Eduarda',
      image: '/maria_eduarda_votus.jpg'
    },
    {
      name: 'Pedro Oliveira',
      image: '/pedro_oliveira_votus.jpg'
    },
    
  ];

  const itemsPerView = 5;
  const totalSlides = Math.ceil(developers.length / itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const visibleDevelopers = developers.slice(
    currentIndex * itemsPerView,
    (currentIndex + 1) * itemsPerView
  );

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brick mb-4 uppercase">
            Desenvolvedores
          </h2>
        </div>

        {/* Carousel */}
        <div className="flex items-center justify-center gap-6">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="flex-shrink-0 p-2 hover:bg-brasil-green/10 rounded-full transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="text-brasil-green" size={32} strokeWidth={2.5} />
          </button>

          {/* Team Members Grid */}
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap flex-1">
            {visibleDevelopers.map((dev, index) => (
              <div key={currentIndex * itemsPerView + index} className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-brasil-green">
                  <Image
                    src={dev.image}
                    alt={dev.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center font-semibold text-ink">
                  {dev.name}
                </p>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="flex-shrink-0 p-2 hover:bg-brasil-green/10 rounded-full transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="text-brasil-green" size={32} strokeWidth={2.5} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-brasil-green' : 'bg-brasil-green/30'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
