export type NavChild = { id: string; label: string; path: string };

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  iconClass?: string;
  path?: string;
  children?: NavChild[];
};

export const NAV_ITEMS: NavItem[] = [
  { id: "inicio", label: "Início", icon: "/IconeInicial.svg", path: "/Inicial" },
  { id: "noticias", label: "Notícias", icon: "/IconeNoticias.png", path: "/Painelnoticias" },
  {
    id: "cargos",
    label: "Cargos",
    icon: "/Iconesenadores.svg",
    children: [
      { id: "senadores", label: "Senadores", path: "/SenadoresPage" },
      { id: "deputados", label: "Deputados", path: "/DeputadosPage" },
    ],
  },
  { id: "propostas", label: "Propostas", icon: "/IconePropostas.svg", path: "/PropostasPage" },
  {
    id: "juventude",
    label: "Juventude",
    icon: "/IconeJuventude.svg",
    iconClass: "h-9 w-9",
    children: [
      { id: "juventude-pauta", label: "Juventude em Pauta", path: "/Juventude" },
      { id: "universidades", label: "Universidades", path: "/Universidades" },
    ],
  },
  { id: "explicacoes", label: "Explicações", icon: "/IconeExplicacoes.svg" },
  { id: "sobre", label: "Sobre Nós", icon: "/IconeSobreNos.png" },
];

export const DETAIL_ROUTE_PREFIXES: { prefix: string; id: string }[] = [
  { prefix: "/ShowDeputadosPage", id: "deputados" },
  { prefix: "/ShowSenadoresPage", id: "senadores" },
  { prefix: "/noticias/", id: "noticias" },
];

export const ACTIVE_CLASS = "bg-[#EDDBBA]/50 text-[#1B623A] shadow-sm";

export function getActiveRouteId(pathname: string): string | undefined {
  const flatRoutes: NavChild[] = NAV_ITEMS.flatMap((item) =>
    item.children ? item.children : item.path ? [{ id: item.id, label: item.label, path: item.path }] : []
  );

  return (
    flatRoutes.find(
      ({ path }) => path && (pathname === path || (path === "/Inicial" && pathname === "/"))
    )?.id ?? DETAIL_ROUTE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix))?.id
  );
}
