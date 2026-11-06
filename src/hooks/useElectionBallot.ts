import { useState } from 'react';
import type { ElectionSelection } from '@/components/SantinhoElectionPicker';
import {
  CUSTOM_ELECTION_ID,
  DEFAULT_ELECTION_ID,
  buildBallot,
  buildCustomElection,
  describeBallot,
  getElection,
  getRounds,
  withoutPositions,
} from '@/lib/electoralConfig';

// Abre em 2026 no Ceará, onde o Votus tem os candidatos de todos os cargos.
const SELECAO_INICIAL: ElectionSelection = {
  electionId: DEFAULT_ELECTION_ID,
  custom: { base: 'municipal', positions: ['prefeito'], senateVacancies: 1 },
  round: 1,
  state: 'CE',
  municipio: '',
};

/** Eleição escolhida e a lista de votos dela. Compartilhado pela colinha e pela urna. */
export function useElectionBallot() {
  const [selecao, setSelecao] = useState<ElectionSelection>(SELECAO_INICIAL);

  const eleicaoCompleta =
    selecao.electionId === CUSTOM_ELECTION_ID
      ? buildCustomElection(selecao.custom)
      : (getElection(selecao.electionId) ?? getElection(DEFAULT_ELECTION_ID)!);
  const eleicao = withoutPositions(eleicaoCompleta, selecao.hiddenPositions ?? []);
  // Tirar o último cargo com 2º turno volta pro 1º turno.
  const turno = getRounds(eleicao).includes(selecao.round) ? selecao.round : 1;
  const votos = buildBallot(eleicao, { round: turno, runoffPositions: selecao.runoffPositions, state: selecao.state });
  const descricao = describeBallot(eleicao, { round: turno, state: selecao.state, municipio: selecao.municipio });

  function atualizar(patch: Partial<ElectionSelection>) {
    setSelecao((prev) => ({ ...prev, ...patch }));
  }

  return { selecao, eleicaoCompleta, eleicao, turno, votos, descricao, atualizar };
}
