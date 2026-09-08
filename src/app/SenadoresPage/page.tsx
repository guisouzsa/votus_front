'use client';

import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import FloatingAIButton from '@/components/FloatingAIButton';
import SearchFilterFrame from '@/components/SearchFilterFrame';

const statCards = [
  { label: 'SENADORES', value: '08', color: 'bg-[#1C5D45]' },
  { label: 'PRESSES POLÍTICOS', value: '91', color: 'bg-[#F4C400]' },
  { label: 'PROPOSTAS', value: '324', color: 'bg-[#F07A00]' },
  { label: 'EMENDAS', value: '96', color: 'bg-[#EDDBBA]' },
];

const senators = [
  { name: 'Rusimãe de mileto ', party: 'Rusimãe de Mileto', area: 'CE', photoUrl: '/senadores/raimundo.jpg' },
  { name: 'Rusimãe de mileto ', party: 'Rusimãe de Mileto', area: 'CE', photoUrl: '/senadores/ana-maria.jpg' },
  { name: 'Rusimãe de mileto ', party: 'Rusimãe de Mileto', area: 'CE', photoUrl: '/senadores/pedro-costa.jpg' },
  { name: 'Rusimãe de mileto ', party: 'Rusimãe de Mileto', area: 'CE', photoUrl: '/senadores/lucia-santos.jpg' },
  { name: 'Rusimãe de mileto ', party: 'Rusimãe de Mileto', area: 'CE', photoUrl: '/senadores/raimundo.jpg' },
  { name: 'Rusimãe de mileto ', party: 'Rusimãe de Mileto', area: 'CE', photoUrl: '/senadores/ana-maria.jpg' },
];

export default function DeputadosPage() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen bg-[#FDFDFD] md:pl-24">
      <div className="min-h-screen">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1] md:-ml-24 md:w-[calc(100%+6rem)]">
          <Image
            src="/sidebar.svg"
            alt="Menu superior"
            fill
            priority
            className="object-cover"
          />
        </header>

        <div className="w-full px-6 py-8 sm:px-10">
            <section className="overflow-hidden rounded-[10px] bg-[#8d0801] text-white shadow-sm">
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex-1">
                  <h1 className="text-3xl font-black uppercase leading-none tracking-tight md:text-4xl">
                    ENCONTR E ACOMPANHE OS SENADORES DO CEARÁ
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/90 md:text-xl">
                    Consulte informações públicas sobre mandato, votações, projetos, recursos e registros oficiais.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {statCards.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} flex min-h-[120px] flex-col justify-center rounded-md border border-[#d8cdb8] px-4 py-3`}
                >
                  <div className="text-right text-base font-black uppercase tracking-wide text-white md:text-xl">
                    {item.label}
                  </div>
                  <div className="mt-3 text-left text-3xl font-black uppercase text-white md:text-5xl">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <SearchFilterFrame />

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase text-[#f07a00]">SENADORES</h2>
                <button className="text-sm font-semibold uppercase text-[#f07a00] underline-offset-2 hover:underline">
                  Ver todos e ordenar
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-[repeat(5,minmax(0,1fr))]">
                {senators.map((senator, index) => (
                  <Link
                    key={index}
                    href="/ShowSenadoresPage"
                    aria-label={`Ver detalhes de ${senator.name}`}
                    className="overflow-hidden rounded-[12px] border border-[#f0a75b] bg-[#f7f5f2] shadow-sm"
                  >
                    <div className="flex h-56 items-center justify-center bg-[#f7e7d4] p-4">
                  <div className="relative h-56 w-full overflow-hidden bg-[#f7e7d4]">
                    <div className="absolute inset-3">
                      <Image
                        src="/senadores.png"
                        alt={`Foto de ${senator.name}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    </div>
                    </div>

                    <div className="relative rounded-lg border border-orange-300 overflow-hidden">
                      <div className="bg-[#f7f5f2] p-4 pb-5 text-center">
                        <div className="text-xl font-black uppercase text-[#8d0801]">{senator.name}</div>
                        <div className="mt-1 text-sm text-[#4d4d4d]">{senator.party}</div>
                        <div className="mt-2 text-sm font-medium text-[#4d4d4d]">{senator.area}</div>
                      </div>

                        <div className="absolute bottom-0 left-0 h-3 w-full bg-[url('/sidebar.svg')] bg-repeat-x bg-[length:auto_100%]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
        </div>
      </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}