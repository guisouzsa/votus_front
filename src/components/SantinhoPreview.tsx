import { forwardRef } from 'react';
import Image from 'next/image';

export interface SantinhoCandidato {
  id: number;
  cargo: string;
  digitos: number;
  numero: string;
}

const SantinhoPreview = forwardRef<HTMLDivElement, { candidatos: SantinhoCandidato[] }>(
  function SantinhoPreview({ candidatos }, ref) {
    return (
      <div
        ref={ref}
        className="relative mx-auto flex aspect-[3/5] w-full max-w-[260px] flex-col overflow-hidden rounded-[16px] bg-[#ffffff] shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
      >
        <div className="absolute right-0 top-0 h-full w-[26%]">
          <Image src="/SantinhoElementos/lateral.svg" alt="" fill sizes="100px" className="object-cover" />
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden py-4 pl-4 pr-[30%]">
          <h1 className="text-xs font-black uppercase leading-tight tracking-wide text-brasil-orange">
            Santinho Eleitoral
          </h1>

          <div className="mt-3 flex flex-1 flex-col justify-between gap-1">
            {candidatos.map((candidato) => (
              <div key={candidato.id} className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-brasil-orange">
                  {candidato.cargo}
                </p>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: candidato.digitos }).map((_, digitIndex) => {
                    const digit = candidato.numero[digitIndex];
                    return (
                      <div
                        key={digitIndex}
                        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border border-brasil-orange text-[10px] font-bold text-brasil-orange"
                      >
                        {digit && digit !== ' ' ? digit : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <Image
              src="/SantinhoElementos/LogoVotus.svg"
              alt="Votus"
              width={133}
              height={32}
              className="h-4 w-auto"
            />
          </div>
        </div>
      </div>
    );
  }
);

export default SantinhoPreview;
