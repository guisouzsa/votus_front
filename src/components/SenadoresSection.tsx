'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function SenadoresSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === 2 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brasil-orange">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-72">
          {/* Left - Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Acesse dados dos candidatos aos cargos de deputado e senador
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
                src="/tela_senadores.png"
                alt="Dados de Senadores - Votus"
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
      </div>
    </section>
  );
}