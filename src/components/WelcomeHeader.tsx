export default function WelcomeHeader() {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {/* Imagem do Bem-Vindo */}
        <img
          src="/BemVindo.svg"
          alt="Seja bem-vindo ao Votus!"
          className="block h-28 w-auto object-contain object-left sm:h-20"
        />
        
        {/* Adicionado 'ml-6' para afastar o texto para a direita (ou mude para ml-10 / ml-12 se quiser afastar ainda mais) */}
        <p className="mt-2 ml-4 max-w-xl text-sm text-[#0B2A16]">
          Aqui você pode consultar informações sobre seus candidatos a deputados e
          senadores, ver as últimas notícias do mundo político e conhecer vagas
          abertas em universidades.
        </p>
      </div>

      {/* Imagem dos pontos amarelos */}
      <img
        src="/PontosAmarelo.svg"
        alt=""
        aria-hidden="true"
        width={381}
        height={60}
        className="relative -top-0 block h-15 w-[min(400px,40vw)] shrink-1 object-contain"
      />
    </header>
  );
}