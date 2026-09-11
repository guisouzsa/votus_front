'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import SantinhoPreview, { type SantinhoCandidato } from '@/components/SantinhoPreview';
import SantinhoForm from '@/components/SantinhoForm';

const CANDIDATOS_INICIAIS: SantinhoCandidato[] = [
  { id: 1, cargo: 'Deputado Federal', digitos: 4, numero: '' },
  { id: 2, cargo: 'Deputado Estadual', digitos: 5, numero: '' },
  { id: 3, cargo: 'Senador 1', digitos: 3, numero: '' },
  { id: 4, cargo: 'Senador 2', digitos: 3, numero: '' },
  { id: 5, cargo: 'Governador', digitos: 2, numero: '' },
  { id: 6, cargo: 'Presidente', digitos: 2, numero: '' },
];

const PAGINAS_OPCOES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SANTINHOS_POR_PAGINA_OPCOES = [1, 2, 4, 6];

export default function SantinhoPage() {
  const [candidatos, setCandidatos] = useState<SantinhoCandidato[]>(CANDIDATOS_INICIAIS);
  const [quantidadePaginas, setQuantidadePaginas] = useState('');
  const [santinhosPorPagina, setSantinhosPorPagina] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleNumeroChange(id: number, numero: string) {
    setCandidatos((prev) => prev.map((candidato) => (candidato.id === id ? { ...candidato, numero } : candidato)));
  }

  const candidatosCompletos = candidatos.every(
    (candidato) => candidato.numero.replace(/\s/g, '').length === candidato.digitos
  );

  async function handleExportar() {
    setErro(null);

    if (!candidatosCompletos || !quantidadePaginas || !santinhosPorPagina) {
      setShowValidation(true);
      setErro('Preencha todos os números dos candidatos e as configurações de exportação antes de exportar.');
      return;
    }

    setGerando(true);

    try {
      const { generateSantinhoPdf } = await import('@/lib/generateSantinhoPdf');
      await generateSantinhoPdf({
        candidatos,
        quantidadePaginas: Number(quantidadePaginas),
        santinhosPorPagina: Number(santinhosPorPagina),
      });
    } catch {
      setErro('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="min-h-dvh">
      <WovenRibbon className="h-14 sm:h-20" />
      <Sidebar />
      <MobileBottomNav />
      <main className="overflow-x-hidden pb-24 pl-0 md:pb-0 md:pl-24">
        <div className="w-full px-6 py-8 sm:px-10">
          <DashboardHeader
            titleText="Gerador de Santinho"
            titleColor="text-[#8d0801]"
            subtitle="Crie seu santinho digital para você decorar o número dos seus candidatos e baixe também o modelo para imprimi-lo."
          />

          <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start">
            <div className="mx-auto w-full max-w-[260px] lg:mx-0 lg:shrink-0">
              <SantinhoPreview candidatos={candidatos} />
            </div>

            <div className="flex-1">
              <SantinhoForm
                candidatos={candidatos}
                onNumeroChange={handleNumeroChange}
                showValidation={showValidation}
              />
            </div>
          </div>

          <div className="mt-10 border-t border-line pt-6 pb-16">
            <h2 className="text-sm font-black uppercase tracking-wide text-[#1b623a]">
              Configurações de exportação
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:max-w-xl sm:grid-cols-2">
              <label className="flex flex-col text-sm font-bold text-[#1b623a]">
                Quant. páginas
                <select
                  value={quantidadePaginas}
                  onChange={(event) => setQuantidadePaginas(event.target.value)}
                  className="mt-1.5 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-base font-semibold text-[#8D0801] outline-none"
                >
                  <option value="">Selecionar</option>
                  {PAGINAS_OPCOES.map((numero) => (
                    <option key={numero} value={numero}>
                      {numero}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col text-sm font-bold text-[#1b623a]">
                Santinhos por página
                <select
                  value={santinhosPorPagina}
                  onChange={(event) => setSantinhosPorPagina(event.target.value)}
                  className="mt-1.5 h-[52px] w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-4 text-base font-semibold text-[#8D0801] outline-none"
                >
                  <option value="">Selecionar</option>
                  {SANTINHOS_POR_PAGINA_OPCOES.map((numero) => (
                    <option key={numero} value={numero}>
                      {numero}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={handleExportar}
              disabled={gerando}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1b623a] px-8 text-base font-bold text-white transition-colors hover:bg-[#164f30] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-14"
            >
              {gerando ? 'Gerando...' : 'Exportar'}
            </button>

            {erro && <p className="mt-3 text-sm font-semibold text-[#8d0801]">{erro}</p>}
          </div>
        </div>
      </main>
      <FloatingAIButton />
    </div>
  );
}
