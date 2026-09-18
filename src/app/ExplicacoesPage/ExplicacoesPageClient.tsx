'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import CargoSeletor from '@/components/cargos/CargoSeletor';
import CargoFicha from '@/components/cargos/CargoFicha';
import CargoAcoes from '@/components/cargos/CargoAcoes';
import CargosComparacao from '@/components/cargos/CargosComparacao';
import CargosRelacaoPoderes from '@/components/cargos/CargosRelacaoPoderes';
import CargosVotoAoCargo from '@/components/cargos/CargosVotoAoCargo';
import { getCargoPorId } from '@/data/cargosPoliticos';

// Cada seção do cargo escolhido ganha o mesmo tratamento visual (cartão
// branco com borda) — antes cada uma tinha um estilo próprio (grade, tabela,
// trilha, banner) sem nenhum fio condutor, o que dava a sensação de "muita
// coisa solta". O conteúdo interno de cada uma continua o mesmo.
function SecaoCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">{children}</div>;
}

export default function ExplicacoesPageClient() {
  const [cargoId, setCargoId] = useState('senador');
  const cargo = getCargoPorId(cargoId);

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />

      <main className="min-h-dvh bg-[#FDFDFD] pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="min-h-dvh">
          <div className="w-full px-6 py-8 sm:px-10">
            <DashboardHeader
              titleText="Quem faz o quê na política?"
              titleColor="text-brasil-red"
              subtitle="Entenda os principais cargos políticos do Brasil e descubra como eles se relacionam."
            />

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
              <div className="lg:sticky lg:top-8">
                <CargoSeletor selecionadoId={cargoId} onSelect={setCargoId} />
              </div>

              <div className="flex flex-col gap-6">
                <SecaoCard>
                  <CargoFicha cargo={cargo} />
                </SecaoCard>

                <SecaoCard>
                  <CargoAcoes cargo={cargo} />
                </SecaoCard>

                <SecaoCard>
                  <CargosComparacao cargoSelecionadoId={cargoId} />
                </SecaoCard>

                <SecaoCard>
                  <CargosRelacaoPoderes />
                </SecaoCard>

                <SecaoCard>
                  <CargosVotoAoCargo />
                </SecaoCard>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FloatingAIButton />
    </div>
  );
}
