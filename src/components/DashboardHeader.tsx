export default function DashboardHeader() {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <img
          src="/painel-titulo.png"
          alt="Painel de Notícias"
          className="h-16 sm:h-20 w-auto object-contain"
        />
        <p className="mt-2 text-sm text-ink-soft">
          Veja as últimas notícias sobre seus tópicos favoritos
        </p>
      </div>

      <img
        src="/decoracao-pontos.png"
        alt=""
        aria-hidden="true"
        className="h-16 sm:h-20 w-auto max-w-[220px] sm:max-w-[260px] object-contain shrink-0"
      />
    </header>
  );
}