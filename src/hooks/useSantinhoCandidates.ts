import useSWR from 'swr';
import { findCandidateByNumber, type CandidateOfficeSlug } from '@/services/candidatesService';
import type { SantinhoCandidate } from '@/components/SantinhoPreview';

function numeroCompleto(candidato: SantinhoCandidate) {
  const numero = candidato.numero.replace(/\s/g, '');
  return numero.length === candidato.digitos ? numero : null;
}

/**
 * Completa cada linha do santinho com a foto real (Supabase Storage) e o
 * nome de urna do candidato cujo número foi digitado. Só busca nos cargos em
 * que a eleição tem dados (candidateOffice, ver lib/electoralConfig) e quando
 * todos os dígitos estão preenchidos; sem correspondência exata, a linha fica
 * como está (sem foto, sem placeholder).
 */
export function useSantinhoCandidates(candidatos: SantinhoCandidate[]): SantinhoCandidate[] {
  const consultas = candidatos
    .map((candidato) => ({ id: candidato.id, office: candidato.candidateOffice, numero: numeroCompleto(candidato) }))
    .filter((c): c is { id: string; office: CandidateOfficeSlug; numero: string } => Boolean(c.office && c.numero));

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
    const encontrado = candidato.candidateOffice && numeroCompleto(candidato) ? data?.[candidato.id] : null;

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
