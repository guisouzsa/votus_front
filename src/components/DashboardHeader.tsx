export default function DashboardHeader() {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <img
          src="/painel-titulo.png"
          alt="Painel de Notícias"
          className="block h-24 sm:h-32 w-auto object-contain object-left"
        />
        <p className="mt-2 ml-6 sm:ml-6 text-sm text-[#0B2A16]">
          Veja as últimas notícias sobre seus tópicos favoritos
        </p>
      </div>

      <img
        src="/decoracao-pontos.png"
        alt=""
        aria-hidden="true"
        className="block h-16 sm:h-20 w-auto max-w-[220px] sm:max-w-[260px] object-contain shrink-0"
      />
    </header>
  );
}