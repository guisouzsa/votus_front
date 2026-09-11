import Image from 'next/image';

export interface SantinhoCandidato {
  cargo: string;
  numero: string;
}

export default function SantinhoPreview({ candidatos }: { candidatos: SantinhoCandidato[] }) {
  return (
    <div className="relative mx-auto flex min-h-[520px] w-full max-w-sm flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
      <div className="absolute right-0 top-0 h-full w-[24%]">
        <Image src="/SantinhoElementos/lateral.svg" alt="" fill sizes="120px" className="object-cover" />
      </div>

      <div className="relative flex flex-1 flex-col py-6 pl-6 pr-[28%]">
        <h1 className="text-lg font-black uppercase leading-tight tracking-wide text-brasil-orange sm:text-xl">
          Santinho Eleitoral
        </h1>

        <div className="mt-5 flex flex-col gap-4">
          {candidatos.map((candidato, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-brasil-orange sm:text-sm">
                {candidato.cargo}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidato.numero.split('').map((digito, digitoIndex) => (
                  <div
                    key={digitoIndex}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border-2 border-brasil-orange text-sm font-bold text-brasil-orange sm:h-8 sm:w-8"
                  >
                    {digito}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <Image
            src="/SantinhoElementos/LogoVotus.svg"
            alt="Votus"
            width={133}
            height={32}
            className="h-6 w-auto"
          />
        </div>
      </div>
    </div>
  );
}
