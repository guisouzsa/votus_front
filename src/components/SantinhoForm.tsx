'use client';

import SantinhoCandidateInput from './SantinhoCandidateInput';
import SantinhoCandidateSearch from './SantinhoCandidateSearch';
import type { SantinhoCandidate } from './SantinhoPreview';

export default function SantinhoForm({
  candidatos,
  erros = {},
  onNumeroChange,
  onLegendaChange,
  showValidation = false,
  segundoTurno = false,
}: {
  candidatos: SantinhoCandidate[];
  erros?: Record<string, string>;
  onNumeroChange: (id: string, numero: string) => void;
  onLegendaChange: (id: string, legenda: boolean) => void;
  showValidation?: boolean;
  segundoTurno?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
      {candidatos.map((candidato) => {
        const preenchido = candidato.numero.replace(/\s/g, '').length === candidato.digitos;
        // Enquanto digita não acusa falta de dígito; número repetido aparece na hora.
        const erro = erros[candidato.id] && (showValidation || preenchido) ? erros[candidato.id] : null;
        const rotulo = `${candidato.ordem}. ${candidato.cargo}`;

        return (
          <fieldset key={candidato.id} className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 text-base font-bold text-[#8d0801] sm:text-lg">{rotulo}</legend>
            <SantinhoCandidateInput
              digitos={candidato.digitos}
              numero={candidato.numero}
              onChange={(numero) => onNumeroChange(candidato.id, numero)}
              invalid={Boolean(erro)}
            />
            {erro && <p className="text-xs font-semibold text-[#8d0801]">{erro}</p>}
            {/* Confirma de quem é o número digitado (dado real do TSE). */}
            {preenchido && candidato.nome && (
              <p className="text-xs font-semibold text-[#1b623a]" aria-live="polite">
                {candidato.nome}
                {candidato.partido ? ` · ${candidato.partido}` : ''}
              </p>
            )}
            {candidato.candidateOffice && !candidato.legenda && (
              <SantinhoCandidateSearch
                office={candidato.candidateOffice}
                digitos={candidato.digitos}
                rotulo={candidato.cargo}
                apenasSegundoTurno={segundoTurno}
                onSelect={(numero) => onNumeroChange(candidato.id, numero)}
              />
            )}
            {candidato.permiteLegenda && (
              <label className="flex min-h-8 cursor-pointer items-center gap-2 text-xs font-medium text-[#103D23]">
                <input
                  type="checkbox"
                  checked={Boolean(candidato.legenda)}
                  onChange={(event) => onLegendaChange(candidato.id, event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[#1b623a]"
                />
                Votar só no partido (voto de legenda, 2 dígitos)
              </label>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
