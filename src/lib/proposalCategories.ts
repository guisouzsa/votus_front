// Lista fixa de categorias do formulário e do filtro de propostas. Antes, as
// opções vinham de todas as categorias já criadas no banco — qualquer coisa
// que alguém digitasse livremente (teste, nome de pessoa) virava uma opção
// de filtro pra sempre. Categorias fora dessa lista continuam possíveis via
// "Outro" no formulário, só não entram no filtro fixo da listagem.
export const PROPOSAL_CATEGORIES = [
  'Educação',
  'Saúde',
  'Economia',
  'Infraestrutura',
  'Mobilidade urbana',
  'Meio ambiente',
  'Tecnologia',
  'Organização Votus',
] as const;
