import Image from 'next/image';

export interface SantinhoCandidato {
  id: number;
  cargo: string;
  digitos: number;
  numero: string;
}

// Todo o dimensionamento interno usa unidades de container query (cqw = 1%
// da largura do próprio cartão) em vez de pixels fixos, porque esse mesmo
// componente é renderizado em tamanhos bem diferentes (preview grande na
// página, miniaturas lado a lado no popup de exportação) — com px fixo o
// conteúdo cabia só no tamanho "calibrado" e "comia" a logo/números em
// qualquer outro.
export default function SantinhoPreview({ candidatos }: { candidatos: SantinhoCandidato[] }) {
  return (
    <div className="relative mx-auto flex aspect-[3/5] w-full max-w-[260px] flex-col overflow-hidden rounded-[16px] bg-[#ffffff] shadow-[0_4px_20px_rgba(0,0,0,0.12)] [container-type:inline-size]">
      <div className="absolute right-0 top-0 h-full w-[26%]">
        <Image src="/SantinhoElementos/lateral.svg" alt="" fill sizes="100px" className="object-cover" />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden pb-[6cqw] pl-[6cqw] pr-[34%] pt-[6cqw]">
        <h1 className="text-[2.6cqw] font-black uppercase leading-[1.15] text-brasil-orange">
          Santinho
          <br />
          Eleitoral
        </h1>

        <div className="mt-[3cqw] flex flex-1 flex-col justify-between gap-[1.5cqw]">
          {candidatos.map((candidato) => (
            <div key={candidato.id} className="flex flex-col gap-[0.8cqw]">
              <p className="text-[2.3cqw] font-bold uppercase leading-tight text-brasil-orange">
                {candidato.cargo}
              </p>
              <div className="flex flex-wrap gap-[1cqw]">
                {Array.from({ length: candidato.digitos }).map((_, digitIndex) => {
                  const digit = candidato.numero[digitIndex];
                  return (
                    <div
                      key={digitIndex}
                      className="flex aspect-square w-[7cqw] shrink-0 items-center justify-center rounded-[0.8cqw] border-[0.35cqw] border-brasil-orange text-[2.6cqw] font-bold text-brasil-orange"
                    >
                      {digit && digit !== ' ' ? digit : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[2cqw] shrink-0">
          <Image
            src="/SantinhoElementos/LogoVotus.svg"
            alt="Votus"
            width={133}
            height={32}
            className="h-[4.5cqw] w-auto"
          />
        </div>
      </div>
    </div>
  );
}
