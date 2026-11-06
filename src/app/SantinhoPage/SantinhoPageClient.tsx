'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import WovenRibbon from '@/components/WovenRibbon';
import FloatingAIButton from '@/components/FloatingAIButton';
import DashboardHeader from '@/components/DashboardHeader';
import SantinhoPreview, { type SantinhoCandidate } from '@/components/SantinhoPreview';
import SantinhoForm from '@/components/SantinhoForm';
import SantinhoExportModal from '@/components/SantinhoExportModal';
import SantinhoElectionPicker, { type ElectionSelection } from '@/components/SantinhoElectionPicker';
import { useSantinhoCandidates } from '@/hooks/useSantinhoCandidates';
import {
  CUSTOM_ELECTION_ID,
  DEFAULT_ELECTION_ID,
  buildBallot,
  buildCustomElection,
  describeBallot,
  expectedDigits,
  getElection,
  getRounds,
  validateBallot,
  withoutPositions,
  type SlotValue,
} from '@/lib/electoralConfig';

// Abre em 2026 no Ceará, onde o Votus tem os candidatos de todos os cargos.
const SELECAO_INICIAL: ElectionSelection = {
  electionId: DEFAULT_ELECTION_ID,
  custom: { base: 'municipal', positions: ['prefeito'], senateVacancies: 1 },
  round: 1,
  state: 'CE',
  municipio: '',
};

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

export default function SantinhoPageClient({ embedded = false }: { embedded?: boolean }) {
  const [selecao, setSelecao] = useState<ElectionSelection>(SELECAO_INICIAL);
  const [valores, setValores] = useState<Record<string, SlotValue>>({});
  const [quantidadePaginas, setQuantidadePaginas] = useState('');
  const [santinhosPorPagina, setSantinhosPorPagina] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const eleicaoCompleta =
    selecao.electionId === CUSTOM_ELECTION_ID
      ? buildCustomElection(selecao.custom)
      : (getElection(selecao.electionId) ?? getElection(DEFAULT_ELECTION_ID)!);
  const eleicao = withoutPositions(eleicaoCompleta, selecao.hiddenPositions ?? []);
  // Tirar o último cargo com 2º turno da colinha volta pro 1º turno.
  const turno = getRounds(eleicao).includes(selecao.round) ? selecao.round : 1;
  const votos = buildBallot(eleicao, { round: turno, runoffPositions: selecao.runoffPositions, state: selecao.state });
  const subtitulo = describeBallot(eleicao, { round: turno, state: selecao.state, municipio: selecao.municipio });
  const erros = validateBallot(votos, valores);

  // Mesmas linhas, completadas com foto/nome reais quando o número bate com
  // um candidato — usadas no preview, no formulário e no PDF.
  const candidatosComFoto = useSantinhoCandidates(
    votos.map((voto): SantinhoCandidate => {
      const valor = valores[voto.id];
      const legenda = voto.allowsPartyVote && Boolean(valor?.legenda);
      return {
        id: voto.id,
        ordem: voto.order,
        cargo: voto.label,
        digitos: expectedDigits(voto, valor),
        numero: valor?.numero ?? '',
        permiteLegenda: voto.allowsPartyVote,
        legenda,
        candidateOffice: legenda ? undefined : voto.candidateOffice,
        nome: legenda ? 'Voto de legenda' : undefined,
      };
    })
  );

  function handleSelecaoChange(patch: Partial<ElectionSelection>) {
    setSelecao((prev) => ({ ...prev, ...patch }));
    setShowValidation(false);
    setErro(null);
  }

  function handleNumeroChange(id: string, numero: string) {
    setValores((prev) => ({ ...prev, [id]: { ...prev[id], numero } }));
  }

  function handleLegendaChange(id: string, legenda: boolean) {
    // O número muda de tamanho entre candidato e partido: começa de novo.
    setValores((prev) => ({ ...prev, [id]: { numero: '', legenda } }));
  }

  function handleExportar() {
    setErro(null);

    if (votos.length === 0) {
      setErro('Escolha pelo menos um cargo para montar a colinha.');
      return;
    }

    if (Object.keys(erros).length > 0 || !quantidadePaginas || !santinhosPorPagina) {
      setShowValidation(true);
      setErro('Confira os números destacados e escolha as configurações de exportação. Campos vazios saem em branco, para preencher à mão.');
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
        candidatos: candidatosComFoto,
        subtitulo,
        quantidadePaginas: Number(quantidadePaginas),
        santinhosPorPagina: Number(santinhosPorPagina),
      });
      setShowPreview(false);

      // Best-effort: só pro contador do painel admin, nunca deve afetar a geração do PDF.
      import('@/services/metricsService')
        .then(({ registerSantinhoGeneration }) => registerSantinhoGeneration())
        .catch(() => {});
    } catch {
      setErro('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className={embedded ? 'min-h-dvh bg-[#FDFDFD]' : 'min-h-dvh'}>
      {!embedded && <WovenRibbon className="h-14 sm:h-20" />}
      {!embedded && <Sidebar />}
      {!embedded && <MobileBottomNav />}
      <main className={embedded ? 'min-h-dvh overflow-x-hidden' : 'overflow-x-hidden pb-24 pl-0 md:pb-0'}>
        <div className="w-full px-6 py-8 sm:px-10">
          {!embedded && (
            <DashboardHeader
              titleText="Gerador de Cola Eleitoral"
              titleColor="text-[#8C0801]"
              titleClassName="font-heading"
              subtitle="Crie sua cola eleitoral digital para você decorar o número dos seus candidatos e baixe também o modelo para imprimi-la."
            />
          )}

          <SantinhoElectionPicker
            selecao={selecao}
            eleicaoCompleta={eleicaoCompleta}
            eleicao={eleicao}
            turno={turno}
            votos={votos}
            onChange={handleSelecaoChange}
          />

          <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:items-start">
            <div data-tour="santinho-previa" className="order-2 mx-auto w-full max-w-[260px] lg:order-1 lg:mx-0 lg:shrink-0">
              <SantinhoPreview candidatos={candidatosComFoto} subtitulo={subtitulo} />
            </div>

            <div data-tour="santinho-form" className="order-1 min-w-0 flex-1 lg:order-2">
              {votos.length > 0 ? (
                <SantinhoForm
                  candidatos={candidatosComFoto}
                  erros={erros}
                  onNumeroChange={handleNumeroChange}
                  onLegendaChange={handleLegendaChange}
                  showValidation={showValidation}
                  segundoTurno={turno === 2}
                />
              ) : (
                <p className="text-sm font-semibold text-[#8d0801]">Escolha pelo menos um cargo em disputa.</p>
              )}
            </div>
          </div>

          <div data-tour="santinho-exportar" className="mt-10 border-t border-line pt-6 pb-16">
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
                label="Colas por página"
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

            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-soft">
              Leve a colinha impressa: o celular não pode entrar na cabine de votação. Ela é só um lembrete das suas
              escolhas, e o Votus não guarda nem envia o seu voto.
            </p>
          </div>
        </div>
      </main>
      {!embedded && <FloatingAIButton />}

      {showPreview && (
        <SantinhoExportModal
          candidatos={candidatosComFoto}
          subtitulo={subtitulo}
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
