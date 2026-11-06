// Tours de apresentação por página. Cada passo aponta pra um elemento real
// da tela: "#id" usa o id do elemento; qualquer outro valor procura
// data-tour="<valor>". Alvos compartilhados entre páginas já vêm marcados nos
// componentes: data-tour="cargos" (OfficeQuickNav), "busca" (SearchBar),
// "compartilhar" (ShareProfileButton) e "navbar"/"guia" (Sidebar).
//
// Passo cujo alvo não está na tela (ex.: lista ainda carregando, atalho que só
// existe pra Presidente) é pulado na hora de abrir o tour.
//
// Pra criar o tour de outra página: escreva a config aqui, registre a rota em
// TOURS_BY_ROUTE e marque os elementos com data-tour. O botão "O que é esta
// página" aparece sozinho na navbar. Mudou o conteúdo de um tour já
// publicado? Suba a `version` — quem já tinha visto/pulado vê a nova uma vez.

export type TourPlacement = "top" | "bottom" | "auto";

export type TourStep = {
  id: string;
  /** Alvos em ordem de preferência: usa o primeiro presente na tela. */
  target: string | string[];
  title: string;
  description: string;
  placement?: TourPlacement;
  /**
   * Alvo que pode nunca aparecer nesta variação da página (ex.: atalho que só
   * existe pra Presidente). A abertura automática não espera por ele.
   */
  optional?: boolean;
};

export type TourConfig = {
  pageId: string;
  version: number;
  /** Ordem de exibição = ordem do array. */
  steps: TourStep[];
};

// ---------- Cargos atuais (listas) ----------

function officeListTour({
  pageId,
  numbers,
  profile,
}: {
  pageId: string;
  /** Sem `numbers`, o passo dos cards de números fica de fora. */
  numbers?: string;
  profile: string;
}): TourConfig {
  const steps: TourStep[] = [
    {
      id: "cargos",
      target: "cargos",
      title: "Troque de cargo por aqui",
      description:
        "Estes atalhos levam direto a Presidente, Governadores, Deputados Federais, Senadores e Deputados Estaduais, sem precisar abrir o menu.",
    },
  ];
  if (numbers) {
    steps.push({
      id: "numeros",
      target: "numeros",
      title: "Um panorama rápido",
      description: `${numbers} O ícone (i) no canto de cada card explica como o número é calculado.`,
    });
  }

  return {
    pageId,
    version: 1,
    steps: [
      ...steps,
      {
        id: "busca",
        target: "busca",
        title: "Encontre quem você procura",
        description:
          "Pesquise pelo nome ou partido. Em Filtros, escolha a situação do mandato e o partido e toque em Aplicar filtros.",
        // Presidente e Governadores não têm busca.
        optional: true,
      },
      {
        id: "perfil",
        target: ["primeiro-card", "lista"],
        title: "Abra o perfil completo",
        description: profile,
        placement: "auto",
      },
    ],
  };
}

const LEGISLATOR_PROFILE =
  "visão geral do mandato, comissões, proposições, linha do tempo e um botão para compartilhar as informações.";

export const DEPUTADOS_TOUR = officeListTour({
  pageId: "deputados-federais",
  numbers:
    "Quantos deputados federais do Ceará estão em mandato, quantas propostas apresentaram, quantos partidos representam e a efetividade média.",
  profile: `Cada card leva ao perfil do deputado: ${LEGISLATOR_PROFILE}`,
});

const SENADORES_TOUR = officeListTour({
  pageId: "senadores",
  numbers: "Quantos senadores do Ceará estão nesta lista, quantas propostas apresentaram e quantos partidos representam.",
  profile: `Cada card leva ao perfil do senador: ${LEGISLATOR_PROFILE}`,
});

const DEPUTADOS_ESTADUAIS_TOUR = officeListTour({
  pageId: "deputados-estaduais",
  numbers:
    "Quantos deputados estaduais estão nesta lista, quantas propostas apresentaram e quantos partidos representam.",
  profile: `Cada card leva ao perfil do deputado estadual: ${LEGISLATOR_PROFILE}`,
});

const PRESIDENTE_TOUR = officeListTour({
  pageId: "presidente",
  profile: "O card leva ao perfil: dados pessoais, biografia, ações recentes com link para a fonte e um botão para compartilhar.",
});

const GOVERNADORES_TOUR = officeListTour({
  pageId: "governadores",
  profile: "Cada card leva ao perfil: dados pessoais, biografia, ações recentes com link para a fonte e um botão para compartilhar.",
});

// ---------- Perfis ----------

const LEGISLATOR_PROFILE_TOUR: TourConfig = {
  pageId: "perfil-parlamentar",
  version: 1,
  steps: [
    {
      id: "resumo",
      target: "#perfil",
      title: "O resumo do mandato",
      description:
        "Partido, estado e três indicadores: efetividade legislativa (quanto do que propôs avançou), cadência (proposições por ano) e foco temático. O ícone (i) explica cada cálculo.",
    },
    {
      id: "compartilhar",
      target: "compartilhar",
      title: "Compartilhe este perfil",
      description: "Monte um card com as informações deste perfil, escolha o visual e baixe ou envie para quem quiser.",
    },
    {
      id: "abas",
      target: "#visao-geral",
      title: "Navegue pelas abas",
      description:
        "Visão geral, Comissões, Proposições e Linha do tempo. Em Proposições, o número ao lado mostra quantas foram apresentadas.",
    },
  ],
};

const EXECUTIVE_PROFILE_TOUR: TourConfig = {
  pageId: "perfil-executivo",
  version: 1,
  steps: [
    {
      id: "compartilhar",
      target: "compartilhar",
      title: "Compartilhe este perfil",
      description: "Monte um card com as informações deste perfil, escolha o visual e baixe ou envie para quem quiser.",
    },
    {
      id: "dados",
      target: "perfil-dados",
      title: "Quem é",
      description: "Nascimento, naturalidade, ocupação, escolaridade e, quando disponível, uma biografia.",
    },
    {
      id: "acoes",
      target: "acoes",
      title: "Ações recentes",
      description: "Atos e ações registrados no mandato, com data e link para a fonte oficial.",
    },
  ],
};

const CANDIDATO_PROFILE_TOUR: TourConfig = {
  pageId: "perfil-candidato",
  version: 1,
  steps: [
    {
      id: "identificacao",
      target: "candidato-identificacao",
      title: "Quem é e como votar",
      description: "Nome na urna, nome civil, partido, estado e o número para digitar na urna.",
    },
    {
      id: "perfil",
      target: "candidato-perfil",
      title: "Dados do registro",
      description:
        "Escolaridade, ocupação e situação da candidatura no TSE. Quando houver, aqui ficam também o resultado da eleição e o plano de governo.",
    },
    {
      id: "historico",
      target: "candidato-historico",
      title: "Candidaturas anteriores",
      description: "As eleições que essa pessoa já disputou, com o cargo, o ano, o partido e o resultado.",
    },
    {
      id: "gastos",
      target: "candidato-gastos",
      title: "Gastos de campanha",
      description: "A prestação de contas: os gastos declarados durante a campanha.",
      // A seção some quando o candidato não tem gastos registrados.
      optional: true,
    },
  ],
};

// ---------- Eleições 2026 ----------

const CANDIDATOS_TOUR: TourConfig = {
  pageId: "candidatos",
  version: 1,
  steps: [
    {
      id: "cargos",
      target: "candidatos-cargos",
      title: "Escolha o cargo em disputa",
      description: "Presidente, Governador, Senador, Deputado Federal e Deputado Estadual — cada aba mostra quem concorre.",
    },
    {
      id: "busca",
      target: "busca",
      title: "Pesquise e filtre",
      description:
        "Busque por nome, partido ou número na urna. Em Filtros, escolha partido e resultado da eleição; os atalhos logo abaixo filtram pelo resultado com um toque.",
    },
    {
      id: "comparador",
      target: "comparador-atalho",
      title: "Compare as propostas",
      description: "Veja, tema a tema, o que os planos de governo propõem, com o trecho original.",
      // Só aparece na aba Presidente.
      optional: true,
    },
    {
      id: "perfil",
      target: ["primeiro-card", "lista"],
      title: "Abra o perfil do candidato",
      description:
        "Dados do registro no TSE, histórico de candidaturas, chapa, gastos de campanha e, quando houver, o plano de governo.",
      placement: "auto",
    },
  ],
};

const COMPARADOR_TOUR: TourConfig = {
  pageId: "comparador",
  version: 1,
  steps: [
    {
      id: "candidatos",
      target: "#candidatos",
      title: "Os candidatos",
      description: "Quem tem plano de governo registrado no TSE e quantas propostas foram reunidas de cada um.",
    },
    {
      id: "filtros",
      target: "comparador-filtros",
      title: "Escolha o que comparar",
      description: "Busque por palavra ou filtre por área, candidato e situação no plano do TSE.",
    },
    {
      id: "resultado",
      // A seção #resultado só existe depois de escolher um tema/buscar; antes
      // disso, o passo aponta pros atalhos de tema.
      target: ["#resultado", "comparador-temas"],
      title: "Compare os candidatos",
      description: "Toque em um tema para ver o que cada candidato propõe, com o trecho original do plano de governo.",
    },
    {
      id: "visao-geral",
      target: "#visao-geral",
      title: "Visão geral por área",
      description: "Quantas propostas cada plano tem em cada área, para ver onde cada candidato coloca mais ênfase.",
    },
  ],
};

// ---------- Radar e Notícias ----------

const RADAR_TOUR: TourConfig = {
  pageId: "radar",
  version: 1,
  steps: [
    {
      id: "mapa",
      target: "radar-mapa",
      title: "Escolha um estado",
      description: "Toque no mapa ou use a lista, e escolha o período: um ano específico ou a legislatura toda.",
    },
    {
      id: "resumo",
      target: "radar-resumo",
      title: "O resumo do estado",
      description: "O tema mais frequente nas proposições dos parlamentares do estado no período escolhido.",
    },
    {
      id: "legislativo",
      target: "radar-legislativo",
      title: "Câmara e Senado",
      description: "O que os deputados federais e os senadores do estado têm proposto.",
    },
    {
      id: "metodologia",
      target: "#radar-metodologia",
      title: "Como os números são calculados",
      description:
        "Siglas, fontes e método. O Radar mostra a atividade legislativa, não as prioridades da população.",
    },
  ],
};

const NOTICIAS_TOUR: TourConfig = {
  pageId: "noticias",
  version: 1,
  steps: [
    {
      id: "busca",
      target: "busca",
      title: "Busque por assunto",
      description: "Pesquise por palavra e, em Filtros, escolha as categorias que interessam.",
    },
    {
      id: "destaque",
      target: "noticias-destaque",
      title: "Destaque e ordem",
      description: "A notícia principal do momento e as abas Mais relevantes e Mais recentes para ordenar a lista.",
    },
    {
      id: "secoes",
      target: "noticias-secoes",
      title: "Notícias por categoria",
      description: "As notícias ficam agrupadas por tema. Toque em uma para ler o texto completo.",
    },
  ],
};

const NOTICIA_TOUR: TourConfig = {
  pageId: "noticia",
  version: 1,
  steps: [
    {
      id: "cabecalho",
      target: "noticia-cabecalho",
      title: "Do que trata a notícia",
      description: "Categoria, título e descrição, ao lado da fonte e da data de publicação.",
    },
    {
      id: "resumo",
      target: "noticia-resumo",
      title: "Leia o resumo",
      description: "Os pontos principais da notícia, sem precisar sair do Votus.",
      placement: "auto",
    },
    {
      id: "fonte",
      target: "noticia-fonte",
      title: "Confira na fonte",
      description: "Este botão abre a notícia completa no site do veículo que a publicou.",
      optional: true,
    },
  ],
};

// ---------- Entender ----------

const VOCE_SABIA_TOUR: TourConfig = {
  pageId: "voce-sabia",
  version: 1,
  steps: [
    {
      id: "titulo",
      target: "voce-sabia-titulo",
      title: "Política sem complicação",
      description: "Conceitos importantes de política e cidadania explicados de um jeito direto.",
    },
    {
      id: "cards",
      target: ["voce-sabia-primeira", "voce-sabia-lista"],
      title: "Escolha uma pergunta",
      description: "Cada card traz o tema, a pergunta e um resumo. Toque nele para ler a explicação e fazer o quiz.",
      placement: "auto",
    },
  ],
};

const EXPLICACAO_DETALHE_TOUR: TourConfig = {
  pageId: "voce-sabia-detalhe",
  version: 1,
  steps: [
    {
      id: "resposta",
      target: ["explicacao-resposta", "explicacao-pergunta"],
      title: "A resposta rápida",
      description: "Comece por aqui para ter a ideia principal em poucas linhas.",
    },
    {
      id: "secoes",
      target: "explicacao-secoes",
      title: "A explicação completa",
      description: "O que é, para que serve, o que faz na prática, por que importa, como afeta você e um exemplo.",
      placement: "auto",
    },
    {
      id: "fontes",
      target: "explicacao-fontes",
      title: "As fontes",
      description: "Os links usados para escrever este conteúdo, para você conferir por conta própria.",
      optional: true,
    },
    {
      id: "quiz",
      target: "explicacao-quiz",
      title: "Teste o que aprendeu",
      description: "Escolha uma opção e toque em Verificar resposta para ver se acertou e a explicação.",
      placement: "auto",
      optional: true,
    },
  ],
};

const EXPLICACOES_TOUR: TourConfig = {
  pageId: "explicacoes",
  version: 1,
  steps: [
    {
      id: "cargos",
      target: "explicacoes-cargos",
      title: "Escolha um cargo",
      description: "O conteúdo desta página muda conforme o cargo selecionado aqui.",
    },
    {
      id: "ficha",
      target: "explicacoes-ficha",
      title: "O essencial do cargo",
      description: "Um resumo do cargo e, logo abaixo, o que quem ocupa esse cargo faz no dia a dia.",
    },
    {
      id: "comparar",
      target: "explicacoes-comparar",
      title: "Compare cargos",
      description: "Veja as diferenças entre o cargo escolhido e os demais.",
    },
    {
      id: "voto",
      target: "explicacoes-voto",
      title: "Do voto ao cargo",
      description: "Como o seu voto em cada eleição leva alguém a cada um desses cargos.",
    },
  ],
};

const PROPOSTAS_TOUR: TourConfig = {
  pageId: "propostas",
  version: 1,
  steps: [
    {
      id: "cadastrar",
      target: "propostas-cadastrar",
      title: "Tem uma ideia?",
      description: "Cadastre uma proposta legislativa. Ela fica visível para outras pessoas apoiarem e comentarem.",
    },
    {
      id: "busca",
      target: "busca",
      title: "Busque propostas",
      description: "Pesquise por palavra e, em Filtros, escolha as categorias.",
    },
    {
      id: "lista",
      target: ["propostas-primeira", "propostas-lista"],
      title: "Apoie ou comente",
      description: "Cada proposta tem os botões Legal e Não apoio, e Comentários para conversar sobre ela.",
      placement: "auto",
    },
  ],
};

const JUVENTUDE_TOUR: TourConfig = {
  pageId: "juventude",
  version: 1,
  steps: [
    {
      id: "vagas",
      target: "juventude-vagas",
      title: "Vagas de emprego",
      description: "Oportunidades abertas, com o local e o link para a vaga. Use as setas para ver mais páginas.",
    },
    {
      id: "concursos",
      target: "juventude-concursos",
      title: "Concursos e processos seletivos",
      description: "Concursos e seleções abertos, também com o link para o edital ou a inscrição.",
    },
  ],
};

const UNIVERSIDADES_TOUR: TourConfig = {
  pageId: "universidades",
  version: 1,
  steps: [
    {
      id: "filtros",
      target: "universidades-filtros",
      title: "Filtre o que procura",
      description:
        "Escolha estado, município, curso, modalidade e tipo de instituição, e toque em Buscar universidades.",
    },
    {
      id: "resultados",
      target: "universidades-resultados",
      title: "Os resultados",
      description: "Cada resultado mostra a instituição, o curso, o local e o link para mais informações.",
      placement: "auto",
    },
  ],
};

// ---------- Mais ----------

const SANTINHO_TOUR: TourConfig = {
  pageId: "santinho",
  // v2: escolha da eleição.
  version: 2,
  steps: [
    {
      id: "eleicao",
      target: "santinho-eleicao",
      title: "Escolha a eleição",
      description: "Tipo, ano, estado e turno. A colinha mostra só os cargos em disputa, na ordem da urna.",
    },
    {
      id: "form",
      target: "santinho-form",
      title: "Preencha os números",
      description:
        "Digite o número de cada cargo. Quando o Votus tem o candidato, o nome e o partido aparecem para você conferir, e dá para buscar pelo nome.",
    },
    {
      id: "previa",
      target: "santinho-previa",
      title: "Confira a prévia",
      description: "A cola vai sendo montada aqui enquanto você preenche.",
    },
    {
      id: "exportar",
      target: "santinho-exportar",
      title: "Exporte e imprima",
      description: "Escolha quantas páginas e quantas colas por página, e toque em Exportar.",
    },
  ],
};

const URNA_TOUR: TourConfig = {
  pageId: "urna",
  // v2: escolha da eleição.
  version: 2,
  steps: [
    {
      id: "eleicao",
      target: "urna-eleicao",
      title: "Escolha o que treinar",
      description: "Tipo, ano, estado e turno. A urna mostra só os cargos dessa votação, na ordem certa.",
    },
    {
      id: "urna",
      target: "urna",
      title: "Vote como na urna",
      description:
        "Digite o número no teclado, confira o nome e o partido e toque em CONFIRMA. CORRIGE apaga; BRANCO vota em branco.",
      placement: "auto",
    },
    {
      id: "aviso",
      target: "urna-aviso",
      title: "Só um treino",
      description: "O voto não é registrado nem salvo em lugar nenhum. Aqui estão as diferenças para a urna oficial.",
    },
  ],
};

const SUGESTOES_TOUR: TourConfig = {
  pageId: "sugestoes",
  version: 1,
  steps: [
    {
      id: "anonimo",
      target: "sugestoes-anonimo",
      title: "Sua resposta é anônima",
      description: "Não pedimos nome, e-mail nem cadastro.",
    },
    {
      id: "perguntas",
      target: "sugestoes-form",
      title: "Responda as perguntas",
      description: "Leva menos de um minuto. As perguntas que não são obrigatórias vêm marcadas como (opcional).",
    },
    {
      id: "enviar",
      target: "sugestoes-enviar",
      title: "Envie",
      description: "O botão é liberado assim que as perguntas obrigatórias estiverem respondidas.",
    },
  ],
};

const TRANSPARENCIA_TOUR: TourConfig = {
  pageId: "transparencia",
  version: 1,
  steps: [
    {
      id: "fluxo",
      target: "transparencia-fluxo",
      title: "O caminho do dado",
      description: "As cinco etapas entre a fonte oficial e o que você vê no Votus.",
    },
    {
      id: "fontes",
      target: "transparencia-fontes",
      title: "De onde vêm os dados",
      description: "TSE, Câmara, Senado e Assembleia do Ceará, cada um com o link para a fonte oficial.",
      placement: "auto",
    },
    {
      id: "tipos",
      target: "transparencia-tipos",
      title: "Quatro tipos de dado",
      description: "Veja a diferença entre um dado oficial, tratado, relacionado ou calculado pelo Votus.",
      placement: "auto",
    },
    {
      id: "erros",
      target: "transparencia-erros",
      title: "Como evitamos erros",
      description: "O que o processo faz para reduzir erros, e com que frequência os dados são atualizados.",
      placement: "auto",
    },
  ],
};

// ---------- Início ----------

const INICIO_TOUR: TourConfig = {
  pageId: "inicio",
  // v2: passo do botão Pergunte à IA.
  version: 2,
  steps: [
    {
      id: "navbar",
      target: "navbar",
      title: "Todo o Votus fica aqui",
      description:
        "Representantes, notícias, explicações e ferramentas, organizados por grupo. No celular, ficam no botão Menu.",
      placement: "bottom",
    },
    {
      id: "comece",
      target: "inicio-comece",
      title: "Comece por aqui",
      description: "Três passos para chegar à urna sabendo em quem votar.",
    },
    {
      id: "explorar",
      target: "inicio-explorar",
      title: "Mais para explorar",
      description: "O que acompanhar depois da eleição: quem está no mandato e oportunidades para a juventude.",
    },
    {
      // Este botão aparece em quase todas as páginas, mas só é apresentado aqui.
      id: "pergunte-ia",
      target: "pergunte-ia",
      title: "Pergunte à IA",
      description: "Ficou com dúvida? Este botão abre um chat para perguntar sobre política e sobre o Votus, em qualquer página.",
    },
    {
      id: "guia",
      target: "guia",
      title: "Uma apresentação em cada página",
      description:
        "Em cada página, este botão no topo mostra para que ela serve e como aproveitá-la.",
      placement: "bottom",
    },
  ],
};

// ---------- Rotas ----------

const TOURS_BY_ROUTE: { match: (pathname: string) => boolean; tour: TourConfig }[] = [
  { match: (p) => p === "/" || p === "/InicialPage", tour: INICIO_TOUR },
  { match: (p) => p === "/PresidentePage", tour: PRESIDENTE_TOUR },
  { match: (p) => p === "/GovernadoresPage", tour: GOVERNADORES_TOUR },
  { match: (p) => p === "/SenadoresPage", tour: SENADORES_TOUR },
  { match: (p) => p === "/DeputadosPage", tour: DEPUTADOS_TOUR },
  { match: (p) => p === "/DeputadosEstaduaisPage", tour: DEPUTADOS_ESTADUAIS_TOUR },
  {
    match: (p) => /^\/(ShowDeputadosPage|ShowSenadoresPage|ShowDeputadosEstaduaisPage)\/[^/]+$/.test(p),
    tour: LEGISLATOR_PROFILE_TOUR,
  },
  { match: (p) => /^\/(ShowPresidentePage|ShowGovernadoresPage)\/[^/]+$/.test(p), tour: EXECUTIVE_PROFILE_TOUR },
  { match: (p) => /^\/CandidatosPage\/[^/]+$/.test(p), tour: CANDIDATOS_TOUR },
  { match: (p) => /^\/CandidatosPage\/[^/]+\/[^/]+$/.test(p), tour: CANDIDATO_PROFILE_TOUR },
  { match: (p) => p === "/ComparadorPropostasPage", tour: COMPARADOR_TOUR },
  { match: (p) => p === "/RadarPage", tour: RADAR_TOUR },
  { match: (p) => p === "/PainelNoticiasPage", tour: NOTICIAS_TOUR },
  { match: (p) => /^\/noticias\/[^/]+$/.test(p), tour: NOTICIA_TOUR },
  { match: (p) => p === "/ExplicacoesPage", tour: EXPLICACOES_TOUR },
  { match: (p) => p === "/explicacao", tour: VOCE_SABIA_TOUR },
  { match: (p) => /^\/explicacao\/[^/]+$/.test(p), tour: EXPLICACAO_DETALHE_TOUR },
  { match: (p) => p === "/PropostasPage", tour: PROPOSTAS_TOUR },
  { match: (p) => p === "/JuventudePage", tour: JUVENTUDE_TOUR },
  { match: (p) => p === "/UniversidadesPage", tour: UNIVERSIDADES_TOUR },
  { match: (p) => p === "/SantinhoPage", tour: SANTINHO_TOUR },
  { match: (p) => p === "/SimuladorUrnaPage", tour: URNA_TOUR },
  { match: (p) => p === "/SugestoesPage", tour: SUGESTOES_TOUR },
  { match: (p) => p === "/TransparenciaPage", tour: TRANSPARENCIA_TOUR },
];

export function getTourForPath(pathname: string): TourConfig | undefined {
  return TOURS_BY_ROUTE.find(({ match }) => match(pathname))?.tour;
}
