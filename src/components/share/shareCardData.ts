import type { ExecutiveDetail, LegislatorDetail } from '@/services/types';

// O que pode entrar no card de compartilhamento. Tudo vem dos dados que o
// perfil já carregou — nada é calculado aqui além de formatar. Campo sem
// valor não vira opção (nunca aparece como zero).

export type ShareFieldGroup = 'identificacao' | 'atuacao' | 'perfil';

export interface ShareField {
  id: string;
  group: ShareFieldGroup;
  /** Rótulo no editor e no card. */
  label: string;
  /** Valor principal, já formatado. */
  value: string;
  /** Contexto curto do valor (ex.: "12 de 40 proposições avançaram"). */
  detail?: string;
  /** Marcado na composição sugerida. */
  defaultOn: boolean;
}

export interface ShareProfile {
  name: string;
  /** "Deputado(a) Federal", "Senador(a)", "Governador(a)"... */
  role: string;
  party: string | null;
  state: string | null;
  photoUrl: string | null;
  fields: ShareField[];
  /** Origem dos dados, escrita no rodapé do card. */
  source: string;
}

export const SHARE_GROUP_LABELS: Record<ShareFieldGroup, string> = {
  identificacao: 'Identificação',
  atuacao: 'Atuação legislativa',
  perfil: 'Perfil',
};

const pct = (value: string | number | null) => (value === null ? null : `${Math.round(Number(value) * 100)}%`);

const LEGISLATOR_ROLES: Record<LegislatorDetail['chamber'], { role: string; source: string }> = {
  lower_house: { role: 'Deputado(a) Federal', source: 'Câmara dos Deputados' },
  senate: { role: 'Senador(a)', source: 'Senado Federal' },
  state_house: { role: 'Deputado(a) Estadual', source: 'Assembleia Legislativa do Ceará (ALECE)' },
};

/** Deputados federais, estaduais e senadores: mesma estrutura de dados. */
export function shareProfileFromLegislator(l: LegislatorDetail): ShareProfile {
  const { role, source } = LEGISLATOR_ROLES[l.chamber];
  const fields: ShareField[] = [];

  if (l.party) fields.push({ id: 'partido', group: 'identificacao', label: 'Partido', value: l.party, defaultOn: true });
  if (l.state) fields.push({ id: 'estado', group: 'identificacao', label: 'Estado', value: l.state, defaultOn: true });
  if (l.legislature) {
    fields.push({ id: 'legislatura', group: 'identificacao', label: 'Legislatura', value: `${l.legislature}ª legislatura`, defaultOn: false });
  }

  const effectiveness = pct(l.effectiveness_rate);
  if (effectiveness) {
    const total = l.effectiveness_total_bills;
    const advanced = l.effectiveness_advanced_bills;
    fields.push({
      id: 'efetividade',
      group: 'atuacao',
      label: 'Efetividade legislativa',
      value: effectiveness,
      detail: total !== null && advanced !== null ? `${advanced} de ${total} proposições avançaram na tramitação` : undefined,
      defaultOn: true,
    });
  }

  if (l.productivity_bills_per_year !== null) {
    fields.push({
      id: 'cadencia',
      group: 'atuacao',
      label: 'Cadência legislativa',
      value: Number(l.productivity_bills_per_year).toLocaleString('pt-BR', { maximumFractionDigits: 1 }),
      detail: 'proposições por ano de mandato',
      defaultOn: true,
    });
  }

  if (l.thematic_focus_top_topic) {
    const share = pct(l.thematic_focus_top_topic_share);
    fields.push({
      id: 'foco',
      group: 'atuacao',
      label: 'Foco temático',
      value: l.thematic_focus_top_topic.name,
      detail: share ? `${share} das proposições` : undefined,
      defaultOn: true,
    });
  }

  if (l.bills.length > 0) {
    fields.push({
      id: 'proposicoes',
      group: 'atuacao',
      label: 'Proposições',
      value: l.bills.length.toLocaleString('pt-BR'),
      detail: 'proposições registradas no Votus',
      defaultOn: false,
    });
  }

  if (l.committees.length > 0) {
    const acronyms = l.committees.slice(0, 3).map((c) => c.acronym).join(', ');
    fields.push({
      id: 'comissoes',
      group: 'atuacao',
      label: 'Comissões',
      value: `${l.committees.length} ${l.committees.length === 1 ? 'comissão' : 'comissões'}`,
      detail: l.committees.length > 3 ? `${acronyms} e outras` : acronyms,
      defaultOn: false,
    });
  }

  return { name: l.parliamentary_name, role, party: l.party, state: l.state, photoUrl: l.photo_url, fields, source };
}

const EXECUTIVE_ROLES: Record<ExecutiveDetail['office'], string> = {
  president: 'Presidente da República',
  vice_president: 'Vice-presidente da República',
  governor: 'Governador(a)',
  vice_governor: 'Vice-governador(a)',
};

// Dados do TSE vêm em maiúsculas ("ADVOGADO"): viram "Advogado". Texto já
// escrito normalmente ("Graduado em Direito pela UFC") fica como está.
function titleCase(text: string): string {
  if (text !== text.toUpperCase()) return text.trim().replace(/\.$/, '');
  return text.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, space, letter) => space + letter.toUpperCase());
}

/** Governador e Presidente: não há indicadores de gestão no Votus, só perfil. */
export function shareProfileFromExecutive(e: ExecutiveDetail): ShareProfile {
  const fields: ShareField[] = [];

  if (e.party.acronym) fields.push({ id: 'partido', group: 'identificacao', label: 'Partido', value: e.party.acronym, defaultOn: true });
  if (e.state) fields.push({ id: 'estado', group: 'identificacao', label: 'Estado', value: e.state, defaultOn: true });
  if (e.occupation) fields.push({ id: 'ocupacao', group: 'perfil', label: 'Ocupação', value: titleCase(e.occupation), defaultOn: true });
  if (e.education) fields.push({ id: 'escolaridade', group: 'perfil', label: 'Escolaridade', value: titleCase(e.education), defaultOn: true });
  if (e.birth_place) fields.push({ id: 'naturalidade', group: 'perfil', label: 'Naturalidade', value: titleCase(e.birth_place), defaultOn: false });

  const actions = e.actions ?? [];
  if (actions.length > 0) {
    fields.push({
      id: 'acoes',
      group: 'perfil',
      label: 'Ações recentes',
      value: `${actions.length} ${actions.length === 1 ? 'ação registrada' : 'ações registradas'}`,
      detail: 'ações públicas reunidas pelo Votus, com fonte',
      defaultOn: false,
    });
  }

  return {
    name: e.display_name,
    role: EXECUTIVE_ROLES[e.office] ?? e.office,
    party: e.party.acronym,
    state: e.state,
    photoUrl: e.photo_url,
    fields,
    source: e.source.name ?? 'fontes oficiais',
  };
}
