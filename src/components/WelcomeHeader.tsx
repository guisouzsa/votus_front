export default function WelcomeHeader() {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {/* Título */}
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#8C0801] font-heading sm:text-4xl md:text-5xl">
          Bem-vindo ao Votus
        </h1>
        
        {/* Adicionado 'ml-6' para afastar o texto para a direita (ou mude para ml-10 / ml-12 se quiser afastar ainda mais) */}
        <p className="mt-2 max-w-xl text-sm text-[#0B2A16]">
          Aqui você pode consultar informações sobre seus candidatos a deputados e
          senadores, ver as últimas notícias do mundo político e conhecer vagas
          abertas em universidades.
        </p>
      </div>

      {/* Mesmo asset usado no DashboardHeader (todas as outras páginas), para o
          elemento decorativo de pontinhos ficar idêntico em tamanho e posição
          em todo o site. */}
      <img
        src="/decoracao-pontos.png"
        alt=""
        aria-hidden="true"
        width={381}
        height={60}
        className="relative -top-2 block h-auto w-[min(500px,45vw)] shrink-0 self-center object-contain"
      />
    </header>
  );
}