'use client';

import Image from 'next/image';
import Link from 'next/link';

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
];

export default function DeputadosPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <div className="min-h-screen">
        <header className="relative h-[84px] w-full overflow-hidden border-b border-[#d7d0c3] bg-[#f7f5f1]">
          <Image
            src="/sidebar.svg"
            alt="Menu superior"
            fill
            priority
            className="object-cover"
          />
        </header>

        <div className="p-4 md:p-6">
          <div className="mx-auto max-w-[1200px]">
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

            <div className="relative mt-6 overflow-hidden rounded-[10px] border border-[#d6d1c8] bg-[#f3e6d3] p-4 shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{ backgroundImage: "url('/estampa_secao.png')" }}
              />
              <div className="absolute bottom-8 left-[43%] top-8 z-[1] w-px -translate-x-1/2 rounded-full bg-[#1C5D45]" />

              <div className="relative z-10 rounded-[14px] p-4 text-[#1C5D45]">
                  <div className="grid items-end gap-4 md:grid-cols-[1.4fr_1fr_1fr] md:gap-x-2">
                    <div className="flex h-[52px] items-center rounded-[10px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 shadow-sm">
                      <input
                        type="text"
                        placeholder="Pesquisar por nome, partido ou palavra-chave..."
                        className="w-full border-0 bg-transparent text-sm text-[#1C5D45] outline-none placeholder:text-[#1C5D45]"
                      />
                      <span className="ml-3 text-xl text-[#1C5D45]">⌕</span>
                    </div>

                    <label className="text-sm font-semibold text-[#1C5D45] md:ml-16">
                      SITUAÇÃO DO MANDATO
                      <select className="mt-2 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 text-base font-semibold text-[#1C5D45] outline-none md:w-[280px]">
                        <option className="bg-[#FDFDFD]">Todas</option>
                        <option className="bg-[#FDFDFD]">Ativo</option>
                        <option className="bg-[#FDFDFD]">Encerrado</option>
                      </select>
                    </label>

                    <label className="text-sm font-semibold text-[#1C5D45] md:ml-8">
                      PARTIDO
                      <select className="mt-2 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDFDFD] px-4 py-3 text-base font-semibold text-[#1C5D45] outline-none md:w-[280px]">
                        <option className="bg-[#FDFDFD]">Todos</option>
                        <option className="bg-[#FDFDFD]">PDT</option>
                        <option className="bg-[#FDFDFD]">PT</option>
                        <option className="bg-[#FDFDFD]">MDB</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-5 flex justify-end gap-3 pt-4">
                    <button type="button" className="rounded-[10px] border border-[#d6d1c8] px-5 py-3 text-sm font-semibold text-[#1C5D45]">
                      Limpar filtros
                    </button>
                    <button type="button" className="rounded-[10px] bg-[#8D0801] px-5 py-3 text-sm font-semibold text-white">
                      Aplicar filtros
                    </button>
                  </div>
                </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase text-[#f07a00]">SENADORES</h2>
                <button className="text-sm font-semibold uppercase text-[#f07a00] underline-offset-2 hover:underline">
                  Ver todos e ordenar
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-4">
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
      </div>
    </main>
  );
}