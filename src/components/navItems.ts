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
  { id: "inicio", label: "Início", icon: "/IconeInicial.svg", path: "/InicialPage" },
  { id: "noticias", label: "Notícias", icon: "/IconeNoticias.png", path: "/PainelNoticiasPage" },
  // "Cargos atuais" = quem exerce mandato hoje (dados da Câmara/Senado).
  // "Candidatos 2026" = quem concorre na eleição (dados do TSE). São duas
  // áreas diferentes de propósito.
  {
    id: "cargos",
    label: "Cargos atuais",
    icon: "/Iconesenadores.svg",
    children: [
      { id: "presidente", label: "Presidente", path: "/PresidentePage" },
      { id: "governadores", label: "Governadores", path: "/GovernadoresPage" },
      { id: "senadores", label: "Senadores", path: "/SenadoresPage" },
      { id: "deputados", label: "Deputados Federais", path: "/DeputadosPage" },
      { id: "deputados-estaduais", label: "Deputados Estaduais", path: "/DeputadosEstaduaisPage" },
    ],
  },
  // Candidatos fica acima de Juventude (pedido do projeto: prioridade na
  // eleição). No mobile, entra entre os 4 atalhos fixos da barra inferior.
  {
    id: "candidatos",
    label: "Candidatos 2026",
    icon: "/IconeCandidatos.svg",
    children: [
      { id: "candidatos-presidente", label: "Presidente", path: "/CandidatosPage/presidente" },
      { id: "candidatos-governador", label: "Governador", path: "/CandidatosPage/governador" },
      { id: "candidatos-senado", label: "Senador", path: "/CandidatosPage/senado" },
      { id: "candidatos-deputado-federal", label: "Deputado Federal", path: "/CandidatosPage/deputado-federal" },
      { id: "candidatos-deputado-estadual", label: "Deputado Estadual", path: "/CandidatosPage/deputado-estadual" },
      { id: "comparador", label: "Comparador de propostas", path: "/ComparadorPropostasPage" },
    ],
  },
  // Radar depois dos 4 primeiros itens, pra não mudar os atalhos fixos da
  // barra inferior do mobile.
  { id: "radar", label: "Radar do Brasil", icon: "/IconeRadar.svg", path: "/RadarPage" },
  {
    id: "juventude",
    label: "Juventude",
    icon: "/IconeJuventude.svg",
    iconClass: "h-9 w-9",
    children: [
      { id: "juventude-pauta", label: "Juventude em Pauta", path: "/JuventudePage" },
      { id: "universidades", label: "Universidades", path: "/UniversidadesPage" },
    ],
  },
  { id: "propostas", label: "Propostas", icon: "/IconePropostas.svg", path: "/PropostasPage" },
  { id: "santinho", label: "Gerador de Cola Eleitoral", icon: "/IconeSantinho.svg", path: "/SantinhoPage" },
  { id: "explicacoes", label: "Explicações", icon: "/IconeExplicacoes.svg", path: "/ExplicacoesPage" },
  { id: "urna", label: "Simulador de Urna", icon: "/IconeUrna.svg", path: "/SimuladorUrnaPage" },
  { id: "sugestoes", label: "Sugestões", icon: "/IconeSugestoes.svg", path: "/SugestoesPage" },
];

export const DETAIL_ROUTE_PREFIXES: { prefix: string; id: string }[] = [
  { prefix: "/ShowDeputadosPage", id: "deputados" },
  { prefix: "/ShowSenadoresPage", id: "senadores" },
  { prefix: "/ShowDeputadosEstaduaisPage", id: "deputados-estaduais" },
  { prefix: "/ShowPresidentePage", id: "presidente" },
  { prefix: "/ShowGovernadoresPage", id: "governadores" },
  { prefix: "/noticias/", id: "noticias" },
  // "Você Sabia?" (/explicacao e /explicacao/[id]) tem link próprio em Entender.
  { prefix: "/explicacao", id: "voce-sabia" },
  { prefix: "/CandidatosPage/presidente/", id: "candidatos-presidente" },
  { prefix: "/CandidatosPage/governador/", id: "candidatos-governador" },
  { prefix: "/CandidatosPage/senado/", id: "candidatos-senado" },
  { prefix: "/CandidatosPage/deputado-federal/", id: "candidatos-deputado-federal" },
  { prefix: "/CandidatosPage/deputado-estadual/", id: "candidatos-deputado-estadual" },
];

// Agrupamento da navbar superior (desktop) e do menu do celular. É montado a
// partir de NAV_ITEMS — os ids continuam os mesmos, então getActiveRouteId
// serve pros dois formatos e nenhuma rota muda.
export type NavSection = { label?: string; items: NavChild[] };

export type NavGroup = {
  id: string;
  label: string;
  /** Texto usado na navbar em larguras menores (até 1279px). */
  shortLabel?: string;
  /** Ícone de /public; sem ícone, a navbar usa um genérico. */
  icon?: string;
  path?: string;
  sections?: NavSection[];
};

function navItem(id: string): NavItem {
  const item = NAV_ITEMS.find((navItem) => navItem.id === id);
  if (!item) throw new Error(`Item de navegação inexistente: ${id}`);
  return item;
}

function navLink(id: string): NavChild {
  const { label, path } = navItem(id);
  return { id, label, path: path! };
}

export const NAV_GROUPS: NavGroup[] = [
  { id: "inicio", label: "Início", icon: "/IconeInicial.svg", path: "/InicialPage" },
  { id: "noticias", label: "Notícias", icon: "/IconeNoticias.png", path: "/PainelNoticiasPage" },
  {
    id: "representantes",
    label: "Representantes",
    icon: "/Iconesenadores.svg",
    sections: [
      { label: "Cargos atuais", items: navItem("cargos").children! },
      { label: "Candidatos 2026", items: navItem("candidatos").children! },
    ],
  },
  {
    id: "entender",
    label: "Entender",
    icon: "/IconeExplicacoes.svg",
    sections: [
      {
        items: [
          navLink("explicacoes"),
          { id: "voce-sabia", label: "Você Sabia?", path: "/explicacao" },
          navLink("propostas"),
        ],
      },
      { label: "Juventude", items: navItem("juventude").children! },
    ],
  },
  { id: "radar", label: "Radar do Brasil", shortLabel: "Radar", icon: "/IconeRadar.svg", path: "/RadarPage" },
  {
    id: "mais",
    label: "Mais",
    sections: [
      {
        items: [
          navLink("santinho"),
          navLink("urna"),
          navLink("sugestoes"),
          // Página que já existia fora do menu (só era aberta pelo aviso de
          // fonte dos dados).
          { id: "transparencia", label: "Transparência dos dados", path: "/TransparenciaPage" },
        ],
      },
    ],
  },
];

export function getActiveGroupId(activeRouteId: string | undefined): string | undefined {
  if (!activeRouteId) return undefined;

  return NAV_GROUPS.find(
    (group) =>
      group.id === activeRouteId ||
      group.sections?.some((section) => section.items.some((item) => item.id === activeRouteId))
  )?.id;
}

// MobileBottomNav e a navbar ficam em componentes separados; o botão "Mais"
// da barra inferior abre o mesmo menu da navbar por este evento.
export const OPEN_MOBILE_MENU_EVENT = "votus:abrir-menu";

export const ACTIVE_CLASS = "bg-[#EDDBBA]/50 text-[#1B623A] shadow-sm";

export function getActiveRouteId(pathname: string): string | undefined {
  const flatRoutes: NavChild[] = [
    ...NAV_ITEMS.flatMap((item) =>
      item.children ? item.children : item.path ? [{ id: item.id, label: item.label, path: item.path }] : []
    ),
    { id: "transparencia", label: "Transparência dos dados", path: "/TransparenciaPage" },
  ];

  return (
    flatRoutes.find(
      ({ path }) => path && (pathname === path || (path === "/InicialPage" && pathname === "/"))
    )?.id ?? DETAIL_ROUTE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix))?.id
  );
}
