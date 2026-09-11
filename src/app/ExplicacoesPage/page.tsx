'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import CargosMapa from '@/components/cargos/CargosMapa';
import CargosMiniSeletor from '@/components/cargos/CargosMiniSeletor';
import CargoFicha from '@/components/cargos/CargoFicha';
import CargoAcoes from '@/components/cargos/CargoAcoes';
import CargosComparacao from '@/components/cargos/CargosComparacao';
import CargosRelacaoPoderes from '@/components/cargos/CargosRelacaoPoderes';
import CargosVotoAoCargo from '@/components/cargos/CargosVotoAoCargo';
import CargosConheca from '@/components/cargos/CargosConheca';
import { getCargoPorId } from '@/data/cargosPoliticos';

export default function ExplicacoesPage() {
  const [cargoId, setCargoId] = useState('senador');
  const [miniSeletorVisivel, setMiniSeletorVisivel] = useState(false);

  const mapaRef = useRef<HTMLDivElement>(null);
  const fichaRef = useRef<HTMLDivElement>(null);

  const cargo = getCargoPorId(cargoId);

  // O seletor mini fixo só aparece depois que o usuário rola para além do
  // mapa principal — enquanto o mapa está visível, ele seria redundante.
  useEffect(() => {
    const elemento = mapaRef.current;
    if (!elemento) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setMiniSeletorVisivel(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  function selecionarDoMapa(id: string) {
    setCargoId(id);
    fichaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="min-h-dvh">
          <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
            <Image src="/sidebar.svg" alt="Menu superior" fill priority className="object-cover" />
          </header>

          <div className="w-full px-6 py-8 sm:px-10">
            <DashboardHeader
              titleText="Quem faz o quê na política?"
              titleColor="text-brasil-red"
              subtitle="Entenda os principais cargos políticos do Brasil e descubra como eles se relacionam."
            />

            <div ref={mapaRef} className="mt-6">
              <CargosMapa selecionadoId={cargoId} onSelect={selecionarDoMapa} />
            </div>

            <CargosMiniSeletor visivel={miniSeletorVisivel} selecionadoId={cargoId} onSelect={setCargoId} />

            <div ref={fichaRef} className="mt-14 scroll-mt-6 sm:mt-20">
              <CargoFicha cargo={cargo} />
            </div>

            <div className="mt-14 sm:mt-20">
              <CargoAcoes cargo={cargo} />
            </div>

            <div className="mt-14 sm:mt-20">
              <CargosComparacao cargoSelecionadoId={cargoId} />
            </div>

            <div className="mt-14 sm:mt-20">
              <CargosRelacaoPoderes />
            </div>

            <div className="mt-14 sm:mt-20">
              <CargosVotoAoCargo />
            </div>

            <div className="mt-14 sm:mt-20">
              <CargosConheca cargo={cargo} />
            </div>
          </div>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
