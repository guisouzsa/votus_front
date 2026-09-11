'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import SantinhoPreview, { type SantinhoCandidato } from '@/components/SantinhoPreview';
import SantinhoForm from '@/components/SantinhoForm';
import SantinhoExportModal from '@/components/SantinhoExportModal';

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

function SantinhoSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: number[];
}) {
  return (
    <label className="flex flex-col text-sm font-bold text-[#1b623a]">
      {label}
      <span className="relative mt-1.5">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[52px] w-full appearance-none rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] pl-4 pr-11 text-base font-semibold text-[#8D0801] outline-none"
        >
          <option value="">Selecionar</option>
          {options.map((numero) => (
            <option key={numero} value={numero}>
              {numero}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={2.5}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8D0801]"
        />
      </span>
    </label>
  );
}

export default function SantinhoPage() {
  const [candidatos, setCandidatos] = useState<SantinhoCandidato[]>(CANDIDATOS_INICIAIS);
  const [quantidadePaginas, setQuantidadePaginas] = useState('');
  const [santinhosPorPagina, setSantinhosPorPagina] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleNumeroChange(id: number, numero: string) {
    setCandidatos((prev) => prev.map((candidato) => (candidato.id === id ? { ...candidato, numero } : candidato)));
  }

  const candidatosCompletos = candidatos.every(
    (candidato) => candidato.numero.replace(/\s/g, '').length === candidato.digitos
  );

  function handleExportar() {
    setErro(null);

    if (!candidatosCompletos || !quantidadePaginas || !santinhosPorPagina) {
      setShowValidation(true);
      setErro('Preencha todos os números dos candidatos e as configurações de exportação antes de exportar.');
      return;
    }

    setShowPreview(true);
  }

  async function handleSalvar() {
    setGerando(true);
    setErro(null);

    try {
      const { generateSantinhoPdf } = await import('@/lib/generateSantinhoPdf');
      await generateSantinhoPdf({
        candidatos,
        quantidadePaginas: Number(quantidadePaginas),
        santinhosPorPagina: Number(santinhosPorPagina),
      });
      setShowPreview(false);
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
            titleColor="text-[#8C0801]"
            titleClassName="font-heading"
            subtitle="Crie seu santinho digital para você decorar o número dos seus candidatos e baixe também o modelo para imprimi-lo."
          />

          <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-start">
            <div className="order-2 mx-auto w-full max-w-[260px] lg:order-1 lg:mx-0 lg:shrink-0">
              <SantinhoPreview candidatos={candidatos} />
            </div>

            <div className="order-1 flex-1 lg:order-2">
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
              <SantinhoSelect
                label="Quant. páginas"
                value={quantidadePaginas}
                onChange={setQuantidadePaginas}
                options={PAGINAS_OPCOES}
              />
              <SantinhoSelect
                label="Santinhos por página"
                value={santinhosPorPagina}
                onChange={setSantinhosPorPagina}
                options={SANTINHOS_POR_PAGINA_OPCOES}
              />
            </div>

            <button
              type="button"
              onClick={handleExportar}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1b623a] px-8 text-base font-bold text-white transition-colors hover:bg-[#164f30] sm:w-auto sm:px-14"
            >
              Exportar
            </button>

            {erro && <p className="mt-3 text-sm font-semibold text-[#8d0801]">{erro}</p>}
          </div>
        </div>
      </main>
      <FloatingAIButton />

      {showPreview && (
        <SantinhoExportModal
          candidatos={candidatos}
          quantidadePaginas={Number(quantidadePaginas)}
          santinhosPorPagina={Number(santinhosPorPagina)}
          salvando={gerando}
          erro={erro}
          onClose={() => setShowPreview(false)}
          onConfirm={handleSalvar}
        />
      )}
    </div>
  );
}
