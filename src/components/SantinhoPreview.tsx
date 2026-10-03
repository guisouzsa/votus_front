import Image from 'next/image';

export interface SantinhoCandidate {
  id: number;
  cargo: string;
  digitos: number;
  numero: string;
  // Preenchidos por useSantinhoCandidates quando o número digitado bate com
  // um candidato real do cargo: foto oficial (Supabase Storage) e nome.
  fotoUrl?: string | null;
  nome?: string | null;
  partido?: string | null;
}

// Todo o dimensionamento interno usa unidades de container query (cqw = 1%
// da largura do próprio cartão) em vez de pixels fixos, porque esse mesmo
// componente é renderizado em tamanhos bem diferentes (preview grande na
// página, miniaturas lado a lado no popup de exportação) — com px fixo o
// conteúdo cabia só no tamanho "calibrado" e "comia" a logo/números em
// qualquer outro.
export default function SantinhoPreview({ candidatos }: { candidatos: SantinhoCandidate[] }) {
  return (
    <div className="relative mx-auto flex aspect-[3/5] w-full max-w-[260px] flex-col overflow-hidden rounded-[16px] bg-[#ffffff] shadow-[0_4px_20px_rgba(0,0,0,0.12)] [container-type:inline-size]">
      <div className="absolute right-0 top-0 h-full w-[26%]">
        <Image src="/SantinhoElementos/lateral.svg" alt="" fill sizes="100px" className="object-cover" />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden pb-[6cqw] pl-[6cqw] pr-[34%] pt-[6cqw]">
        <h1 className="text-[2.6cqw] font-black uppercase leading-[1.15] text-brasil-orange">
          Cola
          <br />
          Eleitoral
        </h1>

        {/* Hierarquia de leitura: NÚMERO (maior destaque, primeiro) → NOME
            (respiro maior antes dele) → CARGO + PARTIDO (agrupados, respiro
            pequeno entre si). gap-[3cqw] entre cada candidato dá o respiro
            "entre grupos" pedido — maior que qualquer espaçamento interno de
            um candidato, pra nunca confundir onde um termina e o outro começa. */}
        <div className="mt-[5cqw] flex flex-1 flex-col justify-between gap-[3cqw]">
          {candidatos.map((candidato) => (
            <div key={candidato.id} className="flex items-start gap-[2.4cqw]">
              {candidato.fotoUrl && (
                // Anel branco fino entre a foto e a borda laranja: acabamento
                // mais limpo, evita a cor da própria foto encostar direto na
                // borda. object-top: as fotos oficiais do TSE são verticais
                // (retrato, ~161x225) — ancorar no topo mantém o rosto
                // inteiro visível ao recortar num círculo. items-start no pai
                // alinha a foto com a linha do número, não com o bloco todo.
                <div className="relative aspect-square w-[10.5cqw] shrink-0 rounded-full border-[0.35cqw] border-brasil-orange bg-white p-[0.5cqw]">
                  <div className="relative h-full w-full overflow-hidden rounded-full">
                    <Image
                      src={candidato.fotoUrl}
                      alt={candidato.nome ? `Foto de ${candidato.nome}` : ''}
                      fill
                      sizes="64px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* 1. NÚMERO — o elemento de maior destaque, sempre primeiro. */}
                <div className="flex flex-wrap gap-[1cqw]">
                  {Array.from({ length: candidato.digitos }).map((_, digitIndex) => {
                    const digit = candidato.numero[digitIndex];
                    return (
                      <div
                        key={digitIndex}
                        className="flex aspect-square w-[8.6cqw] shrink-0 items-center justify-center rounded-[0.9cqw] border-[0.45cqw] border-brasil-orange text-[3.4cqw] font-black text-brasil-orange"
                      >
                        {digit && digit !== ' ' ? digit : ''}
                      </div>
                    );
                  })}
                </div>

                {/* 2. NOME — respiro maior em relação ao número, pra marcar a
                    troca de nível hierárquico. */}
                {candidato.nome && (
                  <p className="mt-[1.9cqw] truncate text-[2.8cqw] font-black uppercase leading-tight text-ink">
                    {candidato.nome}
                  </p>
                )}

                {/* 3-4. CARGO + PARTIDO — informação complementar, por isso
                    menores e mais próximas entre si do que do nome acima. */}
                <div className="mt-[1.1cqw] flex flex-col gap-[0.3cqw]">
                  <p className="text-[1.9cqw] font-bold uppercase leading-tight text-brasil-orange">
                    {candidato.cargo}
                  </p>
                  {candidato.partido && (
                    <p className="text-[1.5cqw] font-semibold uppercase leading-tight text-ink-soft">
                      {candidato.partido}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[2.5cqw] shrink-0">
          <Image
            src="/SantinhoElementos/LogoVotus.svg"
            alt="Votus"
            width={133}
            height={32}
            className="h-[4.5cqw] w-auto"
          />
          <p className="mt-[0.8cqw] text-[1.3cqw] font-medium leading-none text-ink-soft">www.votus.site</p>
        </div>
      </div>
    </div>
  );
}
