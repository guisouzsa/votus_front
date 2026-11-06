'use client';

import { ChevronDown } from 'lucide-react';
import {
  CUSTOM_ELECTION_ID,
  ELECTIONS,
  POSITION_RULES,
  VOTING_ORDER,
  getRounds,
  getRunoffPositions,
  getStatesFor,
  type BallotSlot,
  type CustomElectionInput,
  type ElectionBase,
  type ElectionConfig,
  type ElectionType,
  type PositionId,
  type Round,
} from '@/lib/electoralConfig';

export interface ElectionSelection {
  electionId: string;
  custom: CustomElectionInput;
  round: Round;
  /** Cargos que a pessoa tirou da colinha desta eleição. */
  hiddenPositions?: PositionId[];
  /** Cargos do 2º turno marcados; sem marcação, todos os que podem ter. */
  runoffPositions?: PositionId[];
  state: string;
  municipio: string;
}

const TIPOS: { type: ElectionType; label: string }[] = [
  { type: 'general', label: 'Eleição geral' },
  { type: 'municipal', label: 'Eleição municipal' },
  { type: 'custom', label: 'Suplementar ou outra' },
];

const BASES: { base: ElectionBase; label: string }[] = [
  { base: 'municipal', label: 'Municipal' },
  { base: 'general', label: 'Geral' },
];

const NOTA_SEGUNDO_TURNO: Record<ElectionBase, string> = {
  municipal: 'Só em municípios com mais de 200 mil eleitores, se ninguém tiver maioria no 1º turno.',
  general: 'Marque só o que foi para o 2º turno na sua votação: nem todo estado tem disputa para governador.',
};

const CHIP = 'min-h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors';
const CHIP_ON = 'border-[#1b623a] bg-[#1b623a] text-white';
const CHIP_OFF = 'border-[#d6d1c8] bg-white text-[#103D23] hover:border-[#1b623a]/50';
const ROTULO = 'text-sm font-bold text-[#1b623a]';
const CAMPO =
  'mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d1c8] bg-[#FDF8EE] px-3 text-sm font-semibold text-[#103D23] outline-none focus:border-[#1b623a] focus:ring-2 focus:ring-[#1b623a]/20';

function Chips<T extends string | number>({
  legenda,
  opcoes,
  valor,
  onChange,
}: {
  legenda: string;
  opcoes: { value: T; label: string }[];
  valor: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={legenda}>
      <p className={ROTULO}>{legenda}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {opcoes.map((opcao) => (
          <button
            key={opcao.value}
            type="button"
            aria-pressed={opcao.value === valor}
            onClick={() => onChange(opcao.value)}
            className={`${CHIP} ${opcao.value === valor ? CHIP_ON : CHIP_OFF}`}
          >
            {opcao.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Selecao({
  rotulo,
  valor,
  onChange,
  children,
}: {
  rotulo: string;
  valor: string | number;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${ROTULO}`}>
      {rotulo}
      <span className="relative block">
        <select value={valor} onChange={(event) => onChange(event.target.value)} className={`${CAMPO} appearance-none pr-9`}>
          {children}
        </select>
        <ChevronDown size={16} strokeWidth={2.5} className="pointer-events-none absolute right-3 top-[60%] -translate-y-1/2 text-[#1b623a]" />
      </span>
    </label>
  );
}

/** Escolha da eleição: tudo o que aparece aqui vem da configuração (lib/electoralConfig). */
export default function SantinhoElectionPicker({
  selecao,
  eleicaoCompleta,
  eleicao,
  turno,
  votos,
  onChange,
}: {
  selecao: ElectionSelection;
  /** A eleição como configurada, antes de tirar cargos. */
  eleicaoCompleta: ElectionConfig;
  eleicao: ElectionConfig;
  turno: Round;
  votos: BallotSlot[];
  onChange: (patch: Partial<ElectionSelection>) => void;
}) {
  const anos = ELECTIONS.filter((election) => election.type === eleicao.type);
  const estados = getStatesFor(eleicao.base);
  const turnos = getRounds(eleicao);
  const cargosSegundoTurno = getRunoffPositions(eleicao);
  const marcados = selecao.runoffPositions ?? cargosSegundoTurno;

  function escolherEleicao(id: string) {
    const proxima = id === CUSTOM_ELECTION_ID ? selecao.custom.base : ELECTIONS.find((election) => election.id === id)?.base;
    onChange({
      electionId: id,
      round: 1,
      hiddenPositions: undefined,
      runoffPositions: undefined,
      ...(proxima === 'municipal' && selecao.state === 'DF' ? { state: 'CE' } : {}),
    });
  }

  function escolherTipo(type: ElectionType) {
    if (type === 'custom') return escolherEleicao(CUSTOM_ELECTION_ID);
    const primeira = ELECTIONS.find((election) => election.type === type);
    if (primeira) escolherEleicao(primeira.id);
  }

  function escolherBase(base: ElectionBase) {
    onChange({
      custom: { ...selecao.custom, base, positions: base === 'municipal' ? ['prefeito'] : ['presidente'] },
      round: 1,
      runoffPositions: undefined,
      ...(base === 'municipal' && selecao.state === 'DF' ? { state: 'CE' } : {}),
    });
  }

  function alternarCargo(position: PositionId) {
    const { positions } = selecao.custom;
    onChange({
      custom: {
        ...selecao.custom,
        positions: positions.includes(position) ? positions.filter((id) => id !== position) : [...positions, position],
      },
      runoffPositions: undefined,
    });
  }

  function alternarNaColinha(position: PositionId) {
    const ocultos = selecao.hiddenPositions ?? [];
    const proximos = ocultos.includes(position) ? ocultos.filter((id) => id !== position) : [...ocultos, position];
    // Pelo menos um cargo fica na colinha.
    if (proximos.length < eleicaoCompleta.positions.length) onChange({ hiddenPositions: proximos, runoffPositions: undefined });
  }

  function alternarSegundoTurno(position: PositionId) {
    const proximos = marcados.includes(position) ? marcados.filter((id) => id !== position) : [...marcados, position];
    // Pelo menos um cargo: sem nenhum, não haveria 2º turno pra essa pessoa.
    if (proximos.length > 0) onChange({ runoffPositions: proximos });
  }

  const semDados = votos.filter((voto) => !voto.candidateOffice).length;
  const avisoDados = !eleicao.candidateData
    ? 'O Votus ainda não tem os candidatos desta eleição. Digite os números que você escolheu.'
    : semDados > 0
      ? 'Neste estado, o Votus só tem os candidatos a Presidente. Nos outros cargos, digite os números que você escolheu.'
      : null;

  return (
    <section data-tour="santinho-eleicao" aria-label="Escolha da eleição" className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <Chips legenda="Qual eleição?" opcoes={TIPOS.map(({ type, label }) => ({ value: type, label }))} valor={eleicao.type} onChange={escolherTipo} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eleicao.type === 'custom' ? (
            <Chips legenda="Tipo de cargos" opcoes={BASES.map(({ base, label }) => ({ value: base, label }))} valor={selecao.custom.base} onChange={escolherBase} />
          ) : (
            <Selecao rotulo="Ano" valor={eleicao.id} onChange={escolherEleicao}>
              {anos.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.year}
                  {election.validation.status === 'prevista' ? ' (modelo previsto)' : ''}
                </option>
              ))}
            </Selecao>
          )}

          <Selecao rotulo="Estado" valor={selecao.state} onChange={(state) => onChange({ state })}>
            {estados.map(({ uf, name }) => (
              <option key={uf} value={uf}>
                {name}
              </option>
            ))}
          </Selecao>

          {eleicao.base === 'municipal' && (
            <label className={`block ${ROTULO}`}>
              Município
              <input
                type="text"
                value={selecao.municipio}
                maxLength={60}
                onChange={(event) => onChange({ municipio: event.target.value })}
                placeholder="Sai escrito na sua colinha"
                className={`${CAMPO} placeholder:font-normal placeholder:text-ink-soft`}
              />
            </label>
          )}
        </div>

        {eleicao.type !== 'custom' && (
          <div role="group" aria-label="Cargos na sua colinha">
            <p className={ROTULO}>Cargos na sua colinha</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {eleicaoCompleta.positions.map(({ position }) => {
                const ativo = !selecao.hiddenPositions?.includes(position);
                return (
                  <button key={position} type="button" aria-pressed={ativo} onClick={() => alternarNaColinha(position)} className={`${CHIP} ${ativo ? CHIP_ON : CHIP_OFF}`}>
                    {POSITION_RULES[position].label}
                  </button>
                );
              })}
            </div>
            {eleicao.positions.length < eleicaoCompleta.positions.length && (
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Sua colinha fica só com o que você marcou, mas a urna continua pedindo todos os cargos em disputa na sua eleição.
              </p>
            )}
          </div>
        )}

        {eleicao.type === 'custom' && (
          <div role="group" aria-label="Cargos em disputa">
            <p className={ROTULO}>Cargos em disputa</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {VOTING_ORDER[selecao.custom.base].map((position) => {
                const ativo = selecao.custom.positions.includes(position);
                return (
                  <button key={position} type="button" aria-pressed={ativo} onClick={() => alternarCargo(position)} className={`${CHIP} ${ativo ? CHIP_ON : CHIP_OFF}`}>
                    {POSITION_RULES[position].label}
                  </button>
                );
              })}
            </div>
            {selecao.custom.positions.includes('senador') && (
              <div className="mt-3">
                <Chips
                  legenda="Vagas de senador"
                  opcoes={[
                    { value: 1, label: '1 vaga' },
                    { value: 2, label: '2 vagas' },
                  ]}
                  valor={selecao.custom.senateVacancies}
                  onChange={(senateVacancies) => onChange({ custom: { ...selecao.custom, senateVacancies: senateVacancies as 1 | 2 } })}
                />
              </div>
            )}
          </div>
        )}

        {turnos.length > 1 && (
          <div>
            <Chips
              legenda="Turno"
              opcoes={turnos.map((value) => ({ value, label: `${value}º turno` }))}
              valor={turno}
              onChange={(round) => onChange({ round: round as Round })}
            />
            {turno === 2 && (
              <>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{NOTA_SEGUNDO_TURNO[eleicao.base]}</p>
                {cargosSegundoTurno.length > 1 && (
                  <div role="group" aria-label="Cargos no 2º turno" className="mt-2 flex flex-wrap gap-2">
                    {cargosSegundoTurno.map((position) => {
                      const ativo = marcados.includes(position);
                      return (
                        <button key={position} type="button" aria-pressed={ativo} onClick={() => alternarSegundoTurno(position)} className={`${CHIP} ${ativo ? CHIP_ON : CHIP_OFF}`}>
                          {POSITION_RULES[position].label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft">
        <p>
          <strong className="font-semibold text-[#103D23]">{eleicaoCompleta.description}</strong> {eleicao.validation.note}
        </p>
        {avisoDados && <p>{avisoDados}</p>}
        <p>
          Fontes:{' '}
          {eleicao.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 && ' · '}
              <a href={source.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-[#1b623a] underline-offset-2 hover:underline">
                {source.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
