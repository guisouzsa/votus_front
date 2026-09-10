import Image from "next/image";

export default function DashboardHeader({
  titleSrc = "/painel-titulo.png",
  titleAlt = "Painel de Notícias",
  subtitle = "Veja as últimas notícias sobre seus tópicos favoritos",
  titleClassName = "",
  titleWidth = 337,
  titleHeight = 117,
}: {
  titleSrc?: string;
  titleAlt?: string;
  subtitle?: string;
  titleClassName?: string;
  titleWidth?: number;
  titleHeight?: number;
}) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Image
          src={titleSrc}
          alt={titleAlt}
          width={titleWidth}
          height={titleHeight}
          className={`block h-20 w-auto object-contain object-left sm:h-24 md:h-32 ${titleClassName}`}
        />
        <p className="mt-2 ml-6 sm:ml-6 text-sm text-[#0B2A16]">
          {subtitle}
        </p>
      </div>

      <Image
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