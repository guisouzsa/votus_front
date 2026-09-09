export default function DashboardHeader({
  titleSrc = "/painel-titulo.png",
  titleAlt = "Painel de Notícias",
  subtitle = "Veja as últimas notícias sobre seus tópicos favoritos",
  titleClassName = "",
}: {
  titleSrc?: string;
  titleAlt?: string;
  subtitle?: string;
  titleClassName?: string;
}) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <img
          src={titleSrc}
          alt={titleAlt}
          className={`block h-24 sm:h-32 w-auto object-contain object-left ${titleClassName}`}
        />
        <p className="mt-2 ml-6 sm:ml-6 text-sm text-[#0B2A16]">
          {subtitle}
        </p>
      </div>

      <img
        src="/decoracao-pontos.png"
        alt=""
        aria-hidden="true"
        width={381}
        height={60}
        className="relative -top-2 block h-auto w-[min(500px,45vw)] object-contain shrink-0"
      />
    </header>
  );
}