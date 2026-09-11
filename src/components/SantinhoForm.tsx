'use client';

import SantinhoCandidateInput from './SantinhoCandidateInput';
import type { SantinhoCandidato } from './SantinhoPreview';

export default function SantinhoForm({
  candidatos,
  onNumeroChange,
  showValidation = false,
}: {
  candidatos: SantinhoCandidato[];
  onNumeroChange: (id: number, numero: string) => void;
  showValidation?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      {candidatos.map((candidato, index) => {
        const preenchido = candidato.numero.replace(/\s/g, '').length === candidato.digitos;
        const invalid = showValidation && !preenchido;

        return (
          <div key={candidato.id} className={`flex flex-col gap-2 ${index < 2 ? 'col-span-2' : ''}`}>
            <label className="text-base font-bold text-[#8d0801] sm:text-lg">{candidato.cargo}</label>
            <SantinhoCandidateInput
              digitos={candidato.digitos}
              numero={candidato.numero}
              onChange={(numero) => onNumeroChange(candidato.id, numero)}
              invalid={invalid}
            />
            {invalid && (
              <p className="text-xs font-semibold text-[#8d0801]">Preencha os {candidato.digitos} dígitos.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
