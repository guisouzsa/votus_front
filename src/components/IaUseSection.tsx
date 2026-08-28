import Image from 'next/image';

export default function IaUseSection() {
  return (
    <section className="bg-white px-4 py-2 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-2 md:grid-cols-2 md:gap-4">
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-brasil-gold md:text-5xl">
            O uso da <br /> inteligência artificial
          </h2>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink md:text-2xl">
            A equipe da Votus acredita no uso consciente de ferramentas facilitadoras em processos complexos. Por esse motivo, diversas partes do sistema necessitam de uma IA operando por trás para funcionar de maneira mais eficiente. Acreditamos, acima de tudo, em credibilidade e autenticidade, por isso fazemos uso cuidadoso desses meios em nosso desenvolvimento.
          </p>
        </div>

        <div className="flex items-center justify-center rounded-[22px] bg-brasil-green p-3 md:p-6">
          <div className="relative h-[360px] w-full max-w-[480px] md:h-[420px]">
            <Image
              src="/imagem_uso_ia.png"
              alt="Ilustração representando o uso consciente de inteligência artificial"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
