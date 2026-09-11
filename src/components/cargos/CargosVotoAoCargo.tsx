'use client';

import { useEffect, useRef, useState } from 'react';
import { TRILHA_VOTO_AO_CARGO } from '@/data/cargosPoliticos';

export default function CargosVotoAoCargo() {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="voto-cargo-titulo">
      <h3 id="voto-cargo-titulo" className="font-heading text-xl font-black uppercase tracking-tight text-ink sm:text-2xl">
        Do voto ao cargo
      </h3>

      <div ref={ref} className="relative mt-10">
        <div
          className="absolute left-1.5 top-1 bottom-1 w-[2px] bg-line sm:left-0 sm:right-0 sm:top-1.5 sm:bottom-auto sm:h-[2px] sm:w-auto"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:justify-between sm:gap-2">
          {TRILHA_VOTO_AO_CARGO.map((passo, index) => {
            const ultimo = index === TRILHA_VOTO_AO_CARGO.length - 1;

            return (
              <div
                key={passo}
                style={{ transitionDelay: visivel ? `${index * 70}ms` : '0ms' }}
                className={`flex flex-1 items-center gap-3 transition-all duration-500 ease-out sm:flex-col sm:gap-3 ${
                  visivel ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 sm:translate-x-2 sm:translate-y-0'
                }`}
              >
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${ultimo ? 'bg-brasil-orange' : 'bg-brasil-red'}`}
                  aria-hidden="true"
                />
                <span
                  className={`font-heading uppercase tracking-tight sm:text-center ${
                    ultimo ? 'text-base font-black text-brasil-orange sm:text-lg' : 'text-sm font-bold text-ink-soft sm:text-base'
                  }`}
                >
                  {passo}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
