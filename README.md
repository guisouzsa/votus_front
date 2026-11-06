<p align="center">
    <img width="400" alt="Votus Logo" src="https://github.com/user-attachments/assets/391c325b-9cb0-4998-a657-c7f587cbefa9" />
</p>

<p align="center">
    <em>Seu voto, sua escolha, seu futuro.</em>
</p>

<p align="center">
    <img loading="lazy" src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=FFDE21&style=for-the-badge"/>
</p>

# Votus — Frontend

## Sobre o projeto

O **Votus** é uma plataforma de transparência e educação política desenvolvida para o **Ceará Científico 2026**.

Ela reúne, num só lugar, painéis de deputados federais, estaduais e senadores do Ceará, governador e presidente, os candidatos das eleições de 2026, um comparador das propostas para Presidente, o Radar do Brasil (temas legislativos e indicadores por estado), notícias de política resumidas por IA, conteúdo educativo sobre cargos e eleições (com quiz), um espaço para propostas e sugestões da comunidade, e um assistente de IA para tirar dúvidas sobre política.

Este repositório é o **frontend**: consome a API do Votus (backend em Laravel) e apresenta os dados de forma organizada, responsiva e acessível. Não contém lógica de negócio própria — toda regra de coleta, resumo e persistência de dados vive no backend.

## Principais funcionalidades

**Área pública**

- Consulta e perfil detalhado de deputados federais, deputados estaduais (ALECE) e senadores do Ceará (proposições, comissões, linha do tempo, efetividade legislativa), além do governador e do presidente em exercício;
- **Compartilhar informações** nos perfis: popup com prévia em tempo real de um card (formatos Stories 9:16, Feed 4:5 e Quadrado 1:1, fundos sólidos e gradientes), escolha dos dados reais do perfil, download em PNG e compartilhamento nativo do navegador — com o selo "Gerado e compartilhado via VOTUS";
- **Candidatos 2026** (todos os cargos): busca, filtro por partido e por resultado oficial da eleição (eleitos, 2º turno, não eleitos...), lista ordenada pela situação eleitoral e perfil com histórico de candidaturas e despesas de campanha;
- **Comparador de propostas para Presidente**: propostas por tema lado a lado, com o trecho original, a página no plano de governo registrado no TSE e o estado de conferência de cada proposta; resumo comparativo por IA gerado uma vez e guardado (não é gerado a cada visita);
- **Radar do Brasil**: mapa das 27 UFs com o tema mais frequente nas proposições da Câmara, temas do Senado, evolução ano a ano e indicadores do IBGE;
- Simulador de urna eletrônica e página de transparência sobre a origem dos dados;
- Painel de notícias políticas, resumidas automaticamente por IA e organizadas por categoria/relevância;
- **"Você sabe?"** — explicações geradas por IA sobre temas de política, cada uma com um quiz de 5 perguntas;
- Mapa de Cargos Políticos — o que faz cada cargo (presidente, governador, senador, deputado federal/estadual) e como eles se relacionam;
- Assistente de IA (botão flutuante) para perguntas sobre política e sobre os parlamentares cadastrados;
- Propostas: cadastro e votação (apoio/reprovação) da comunidade, com comentários;
- Formulário de sugestões anônimo sobre o próprio projeto;
- Gerador de santinhos eleitorais personalizados (exportação em PDF);
- Conteúdo voltado à juventude e a universidades/vestibulares;
- Interface responsiva (mobile e desktop) e otimizada para SEO (sitemap, robots, Open Graph, dados estruturados).

**Painel administrativo** (`/admin`, autenticado)

- Gestão de notícias: disparo manual de coleta, acompanhamento e remoção, com drenagem automática da fila de resumo por IA;
- Gestão de explicações/quiz: criação (a partir de links de fontes confiáveis), geração por IA, revisão/edição do conteúdo e das respostas, publicação;
- Gestão de fontes confiáveis usadas na geração de explicações;
- Gestão de propostas e comentários da comunidade;
- Gestão de sugestões recebidas, com exportação em PDF e cadastro/edição das perguntas da pesquisa.

## Tecnologias utilizadas

- [Next.js](https://nextjs.org/) 16 (App Router, Turbopack) — framework React da aplicação;
- [React](https://react.dev/) 19;
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática;
- [Tailwind CSS](https://tailwindcss.com/) v4 — estilização;
- [SWR](https://swr.vercel.app/) — cache e revalidação de dados no cliente;
- [Lucide React](https://lucide.dev/) — ícones;
- [jsPDF](https://github.com/parallax/jsPDF) — geração de PDFs (santinhos e relatório de sugestões);
- [Groq SDK](https://console.groq.com/) — assistente de IA (rota própria do frontend, ver [Integração com IA](#-integração-com-ia)).

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior;
- npm;
- Git.

### Instalação

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Acesse a pasta do projeto
cd votus_frontend

# 3. Instale as dependências
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL da API do Votus (backend em Laravel)
NEXT_PUBLIC_API_URL=http://localhost:8000

# URL pública do site (usada em metadados, sitemap e SEO)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Chave da API da Groq, usada pelo assistente de IA (rota /api/chat) —
# nome próprio pra não confundir com as GROQ_API_KEY_1..5 do backend
CHAT_API_KEY=

# Opcional: sobrescreve o modelo padrão (openai/gpt-oss-20b)
# GROQ_MODEL=
```

Em produção, `NEXT_PUBLIC_API_URL` aponta para a API implantada, por exemplo:

```env
NEXT_PUBLIC_API_URL=https://votus-core.onrender.com
```

### Executando

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## 📜 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run start` | Executa a aplicação já compilada |
| `npm run lint` | Roda o ESLint |

## 🗺️ Rotas

### Públicas

| Rota | Descrição |
|---|---|
| `/`, `/InicialPage` | Página inicial |
| `/DeputadosPage`, `/ShowDeputadosPage/[externalId]` | Listagem e perfil de deputados federais |
| `/DeputadosEstaduaisPage`, `/ShowDeputadosEstaduaisPage/[slug]` | Listagem e perfil de deputados estaduais (ALECE) |
| `/SenadoresPage`, `/ShowSenadoresPage/[externalId]` | Listagem e perfil de senadores |
| `/GovernadoresPage`, `/ShowGovernadoresPage/[id]` | Governador em exercício |
| `/PresidentePage`, `/ShowPresidentePage/[id]` | Presidente e vice em exercício |
| `/CandidatosPage/[office]`, `/CandidatosPage/[office]/[id]` | Candidatos 2026 por cargo (`presidente`, `governador`, `senado`, `deputado-federal`, `deputado-estadual`) e perfil |
| `/ComparadorPropostasPage` | Comparador de propostas para Presidente |
| `/RadarPage` | Radar do Brasil |
| `/PainelNoticiasPage`, `/noticias/[id]` | Painel e detalhe de notícias |
| `/explicacao`, `/explicacao/[id]` | Explicações geradas por IA e respectivo quiz |
| `/ExplicacoesPage` | Mapa de Cargos Políticos |
| `/PropostasPage` | Propostas da comunidade |
| `/SugestoesPage` | Formulário de sugestões |
| `/SantinhoPage` | Gerador de santinhos |
| `/SimuladorUrnaPage` | Simulador de urna eletrônica |
| `/TransparenciaPage` | De onde vêm os dados e como são tratados |
| `/JuventudePage`, `/UniversidadesPage` | Conteúdo para juventude e universidades |
| `/embed/candidatos`, `/embed/colinha`, `/embed/noticias` | Versões incorporáveis (iframe) para o site institucional |

Os endereços antigos `/Inicial`, `/Juventude`, `/Universidades` e `/Painelnoticias` redirecionam para os atuais (`next.config.ts`).

### Administrativas (autenticadas)

| Rota | Descrição |
|---|---|
| `/admin/login` | Login do painel |
| `/admin` | Visão geral |
| `/admin/noticias` | Gestão de notícias |
| `/admin/explicacoes`, `/admin/explicacoes/[id]` | Gestão de explicações/quiz e fontes confiáveis |
| `/admin/propostas` | Gestão de propostas e comentários |
| `/admin/sugestoes` | Gestão de sugestões e perguntas da pesquisa |

## 🔌 Comunicação com a API

O frontend é desacoplado do backend e consome a API do Votus via HTTP (`NEXT_PUBLIC_API_URL`). Alguns dos endpoints usados:

```text
GET  /api/deputies              GET  /api/senators              GET  /api/state-deputies
GET  /api/deputies/{id}         GET  /api/senators/{id}         GET  /api/state-deputies/{slug}
GET  /api/governors/{id}        GET  /api/president/{id}
GET  /api/{cargo}-candidates    GET  /api/{cargo}-candidates/{id}   (filtros: state, party, search, election_result)
GET  /api/radar/states          GET  /api/radar/states/{uf}         (?period=legislature|2023..2026)
GET  /api/presidential-proposal-comparison/proposals
GET  /api/presidential-proposal-comparison/themes/{slug}
GET  /api/news                  GET  /api/news/{id}
GET  /api/explanations          GET  /api/explanations/{id}
GET  /api/proposals             POST /api/proposals
POST /api/suggestions           GET  /api/suggestion-questions
POST /api/santinhos             POST /api/site-visits
```

Rotas administrativas (`/api/admin/*`) exigem autenticação (Sanctum) e são consumidas só pelo painel `/admin`.

## ⚡ Gerenciamento de dados

As listagens usam **SWR** para cache, deduplicação e revalidação em segundo plano. Nas páginas de Deputados e Senadores, a primeira página também é buscada **no servidor** (antes de a página chegar ao navegador), para a tela já nascer com dado real em vez de esperar um fetch no cliente.

## 🤖 Integração com IA

O projeto usa a [Groq](https://groq.com/) em dois pontos distintos:

- **Assistente de IA do site** (botão flutuante): rota própria do frontend (`src/app/api/chat`), que chama a Groq diretamente com o roster de parlamentares do Ceará como contexto. Tem rate limit próprio e nunca inventa dados fora do que a API do Votus fornece.
- **Backend**: a coleta/resumo de notícias, a geração de explicações + quiz e a extração/comparação das propostas para Presidente rodam inteiramente no backend Laravel, que também usa a Groq — isso é responsabilidade do [repositório da API](https://github.com/NotCrazyDog-hub/votus-general-api), não deste frontend. O resumo comparativo de cada tema do comparador é gerado uma vez por um comando do backend e guardado no banco; o frontend só o exibe, sem chamar a IA a cada visita.

A IA tem caráter informativo/educacional; respostas não substituem fontes oficiais.

## 🧩 Estrutura do projeto

```text
votus_frontend/
├── src/
│   ├── app/                    # Rotas (App Router)
│   │   ├── DeputadosPage/ DeputadosEstaduaisPage/ SenadoresPage/ GovernadoresPage/ PresidentePage/
│   │   ├── Show*Page/          # Perfis (com o botão "Compartilhar informações")
│   │   ├── CandidatosPage/     # Candidatos 2026 por cargo
│   │   ├── ComparadorPropostasPage/ RadarPage/
│   │   ├── PainelNoticiasPage/ noticias/[id]/
│   │   ├── explicacao/         # "Você sabe?" (explicações + quiz)
│   │   ├── ExplicacoesPage/    # Mapa de Cargos Políticos
│   │   ├── PropostasPage/ SugestoesPage/ SantinhoPage/ SimuladorUrnaPage/ TransparenciaPage/
│   │   ├── JuventudePage/ UniversidadesPage/ embed/
│   │   ├── admin/              # Painel administrativo
│   │   └── api/chat/           # Rota do assistente de IA
│   ├── components/             # Componentes reutilizáveis
│   │   ├── PageSection.tsx     # Título de seção padrão (Radar, Comparador)
│   │   ├── SearchBar.tsx       # Busca padrão (pílula + painel de filtros)
│   │   ├── propostas/          # Comparador de propostas
│   │   ├── radar/              # Mapa e painéis do Radar (paleta dos estados em radarPalette.ts)
│   │   └── share/              # Editor e desenho (canvas) do card de compartilhamento
│   ├── services/               # Chamadas à API (fetch + tipos)
│   ├── lib/                    # Utilitários (SEO, geração de PDF, formatação)
│   └── data/                   # Dados estáticos (cargos, equipe, malha das UFs do IBGE,
│                               #   conferência dos planos: planCoverage.json e planReview.json)
├── scripts/plan-coverage/      # Auditoria dos planos de governo (gera src/data/planCoverage.json)
├── public/                     # Imagens, ícones, logo e elementos do santinho
├── package.json
└── next.config.ts
```

## 🔗 Arquitetura do projeto

```text
Frontend                    Backend                     Dados
Next.js + React    ──HTTP──▶  Laravel API   ──────▶  Banco (Postgres)
+ Tailwind CSS                                       + APIs públicas
      │                            │                 (Câmara, Senado)
      │                            └──────▶ Groq (resumo de notícias,
      └──▶ Groq (assistente de IA)           explicações/quiz)
```

Frontend e backend são desenvolvidos e implantados separadamente — a interface pode evoluir sem alterar a lógica do backend, e vice-versa.

## 🔗 Repositório do backend

- **Código:** https://github.com/NotCrazyDog-hub/votus-general-api
- **API em produção:** https://votus-core.onrender.com

## 📖 Fontes de dados

Os dados vêm de fontes oficiais, sempre pela API do Votus:

- [Câmara dos Deputados — Dados Abertos](https://dadosabertos.camara.leg.br/swagger/api.html) (deputados, proposições e os temas do Radar);
- [Senado Federal — Dados Abertos](https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html);
- [TSE — Dados Abertos e Resultados](https://dadosabertos.tse.jus.br/) (candidatos 2026, planos de governo, resultados oficiais);
- [IBGE — API de agregados](https://servicodados.ibge.gov.br/api/docs/agregados) (indicadores do Radar) e a malha oficial das UFs (mapa);
- Assembleia Legislativa do Ceará (deputados estaduais).

As cores dos estados no Radar são uma escolha de design inspirada nas bandeiras estaduais (publicação do IBGE "A Bandeira do Brasil e outros símbolos nacionais"); não são cores oficiais nem representam dados.

## 🌐 Deploy

O frontend está hospedado na [Vercel](https://vercel.com/). Para o build de produção:

```bash
npm run build
npm run start
```

Configure `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` e `CHAT_API_KEY` como variáveis de ambiente na plataforma de deploy.

---

<p align="center">
    Desenvolvido pela equipe do Votus.
</p>
