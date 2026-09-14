// Fonte única da equipe do Votus — usada tanto na landing page (DevelopersSection)
// quanto no prompt da IA de perguntas (app/api/chat/route.ts), pra nunca desincronizar.
export interface TeamMember {
  name: string;
  role: string;
  image?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  // DS3
  { name: 'Marianne Moreira Lima', role: 'Líder da Logística e do Diário de Bordo e Designer', image: '/marianne_moreira_votus.jpg' },
  { name: 'Eva Lohane Costa Cordeiro', role: 'Líder da Logística, do Protótipo e do Pré-projeto', image: '/Eva_lohane_votus.jpg' },
  { name: 'Emanuel Rodrigues Cordeiro Sousa', role: 'Líder do Desenvolvimento e Desenvolvedor Full Stack', image: '/emanuel_sousa_votus.jpg' },
  { name: 'Larissa Felix de Lima', role: 'Desenvolvedora Full Stack', image: '/larissa_felix_votus.jpg' },
  { name: 'Guilherme Rodrigues de Souza', role: 'Desenvolvedor Full Stack', image: '/guilhermejpeg.jpeg' },
  { name: 'Pedro Henrique de Oliveira Costa', role: 'Desenvolvedor Backend', image: '/pedro_oliveira_votus.jpg' },
  // Infor2 + demais integrantes
  { name: 'Ivens de Araújo Silva', role: 'Designer', image: '/ivens_araujo_votus.jpeg' },
  { name: 'Dafny Vitória Sabino Almeida', role: 'Desenvolvedora Full Stack e Designer', image: '/dafny_almeida_votus.jpg' },
  { name: 'Maria Eduarda Andrade Araújo', role: 'Desenvolvedora Frontend', image: '/maria_eduarda_votus.jpg' },
  { name: 'Gustavo Coutinho', role: 'Desenvolvedor e Pré-projeto', image: '/coutinho.jpeg' },
  { name: 'Kerllon Sousa', role: 'Desenvolvedor Frontend e Designer', image: '/kerllon_sousa_votus.jpg' },
  { name: 'Arielly Vitória', role: 'Pré-projeto e Diário de Bordo', image: '/arielly.jpeg' },
  { name: 'Anna Julia', role: 'Pré-projeto e Diário de Bordo', image: '/julia.jpeg' },
];

export const TEAM_ADVISOR: TeamMember = { name: 'Israely', role: 'Orientadora do projeto', image: '/israely.jpeg' };
