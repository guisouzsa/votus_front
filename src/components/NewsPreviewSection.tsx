'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const AUTOPLAY_INTERVAL = 8_000;

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

// Edite apenas este array para adicionar ou trocar funcionalidades no futuro.
const slides: Slide[] = [
  {
    id: 'noticias',
    eyebrow: 'Notícias',
    title: 'Veja as últimas notícias sobre os seus tópicos favoritos',
    description: 'Acompanhe notícias relacionadas aos temas e assuntos de interesse, organizadas em um painel simples de consultar.',
    image: '/foto-noticia.jpg',
    imageAlt: 'Painel de notícias do Votus',
  },
  {
    id: 'candidatos',
    eyebrow: 'Candidatos',
    title: 'Conheça e compare os candidatos antes de decidir seu voto',
    description: 'Consulte informações dos candidatos e compare suas opções com mais clareza para fazer uma escolha consciente.',
    image: '/painel-candidato.jpg',
    imageAlt: 'Visualização de candidatos do Votus',
  },
  {
    id: 'colinha',
    eyebrow: 'Colinha eleitoral',
    title: 'Monte sua colinha eleitoral para votar com tranquilidade',
    description: 'Escolha seus candidatos, organize os números e leve sua própria colinha para consultar no dia da votação.',
    image: '/painel-cola.jpg',
    imageAlt: 'Fazedor de colinha eleitoral do Votus',
  },
];

export default function NewsPreviewSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const current = slides[activeIndex];

  const changeSlide = useCallback((nextIndex: number) => {
    setActiveIndex((nextIndex + slides.length) % slides.length);
  }, []);
  const nextSlide = useCallback(() => changeSlide(activeIndex + 1), [activeIndex, changeSlide]);
  const previousSlide = useCallback(() => changeSlide(activeIndex - 1), [activeIndex, changeSlide]);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(nextSlide, AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [isPaused, nextSlide]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextSlide, previousSlide]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 50) {
      if (distance > 0) previousSlide();
      else nextSlide();
    }
  };

  return (
    <section className="bg-white px-4 pb-0 pt-[var(--landing-hero-gap)] sm:px-6 lg:px-8" aria-label="Funcionalidades do Votus">
      <div
        className="landing-container overflow-hidden rounded-2xl bg-brasil-green shadow-sm"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Conheça as funcionalidades do Votus"
        tabIndex={0}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 md:items-center md:gap-8">
          <div key={`${current.id}-copy`} className="animate-[fade-in_350ms_ease-out]">
            <span className="text-xs font-bold uppercase tracking-wide text-cream/70">{current.eyebrow}</span>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-cream md:text-4xl">{current.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/85 md:text-base">{current.description}</p>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={previousSlide} className="shrink-0 rounded-full p-2 text-cream transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream" aria-label="Slide anterior">
              <ChevronLeft size={30} aria-hidden="true" />
            </button>

            <div className="relative aspect-[16/10] min-w-0 flex-1 overflow-hidden rounded-xl bg-cream-panel shadow-lg">
              <Image
                key={current.id}
                src={current.image}
                alt={current.imageAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
              />
            </div>

            <button type="button" onClick={nextSlide} className="shrink-0 rounded-full p-2 text-cream transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream" aria-label="Próximo slide">
              <ChevronRight size={30} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 px-6 pb-6 sm:px-8" aria-label="Paginação do carrossel">
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" onClick={() => changeSlide(index)} className={`h-3 w-3 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${index === activeIndex ? 'scale-110 bg-cream' : 'bg-cream/40 hover:bg-cream/70'}`} aria-label={`Ir para o slide ${index + 1}: ${slide.eyebrow}`} aria-current={index === activeIndex ? 'true' : undefined} />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">Slide {activeIndex + 1} de {slides.length}: {current.eyebrow}. {current.title}</p>
      </div>
    </section>
  );
}
