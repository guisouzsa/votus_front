import useSWR from 'swr';
import { findCandidateByNumber, type CandidateOfficeSlug } from '@/services/candidatesService';
import type { SantinhoCandidato } from '@/components/SantinhoPreview';

// Cargo do santinho → listagem de candidatos correspondente.
const OFFICE_POR_CARGO: Record<string, CandidateOfficeSlug> = {
  Presidente: 'presidente',
  'Deputado Federal': 'deputado-federal',
  'Deputado Estadual': 'deputado-estadual',
  'Senador 1': 'senado',
  'Senador 2': 'senado',
  Governador: 'governador',
};

function numeroCompleto(candidato: SantinhoCandidato) {
  const numero = candidato.numero.replace(/\s/g, '');
  return numero.length === candidato.digitos ? numero : null;
}

/**
 * Completa cada linha do santinho com a foto real (Supabase Storage) e o
 * nome de urna do candidato cujo número foi digitado. Só busca quando todos
 * os dígitos do cargo estão preenchidos; sem correspondência exata, a linha
 * fica como está (sem foto, sem placeholder).
 */
export function useSantinhoCandidatos(candidatos: SantinhoCandidato[]): SantinhoCandidato[] {
  const consultas = candidatos
    .map((candidato) => ({ id: candidato.id, office: OFFICE_POR_CARGO[candidato.cargo], numero: numeroCompleto(candidato) }))
    .filter((c): c is { id: number; office: CandidateOfficeSlug; numero: string } => Boolean(c.office && c.numero));

  // Uma chave só pro conjunto: as buscas rodam em paralelo e o SWR guarda
  // cada combinação já consultada, então redigitar um número não refaz a ida.
  const { data } = useSWR(
    consultas.length > 0 ? ['santinho-candidatos', ...consultas.map((c) => `${c.office}:${c.numero}`)] : null,
    async () => {
      const resultados = await Promise.all(
        consultas.map(async (c) => [c.id, await findCandidateByNumber(c.office, c.numero).catch(() => null)] as const)
      );
      return Object.fromEntries(resultados);
    },
    { revalidateOnFocus: false, keepPreviousData: false }
  );

  return candidatos.map((candidato) => {
    const encontrado = numeroCompleto(candidato) ? data?.[candidato.id] : null;

    return encontrado
      ? {
          ...candidato,
          fotoUrl: encontrado.photo_url,
          nome: encontrado.ballot_name,
          partido: encontrado.party.acronym,
        }
      : candidato;
  });
}
