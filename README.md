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

Ela reúne, num só lugar, painéis de deputados federais e senadores do Ceará, notícias de política resumidas por IA, conteúdo educativo sobre cargos e eleições (com quiz), um espaço para propostas e sugestões da comunidade, e um assistente de IA para tirar dúvidas sobre política.

Este repositório é o **frontend**: consome a API do Votus (backend em Laravel) e apresenta os dados de forma organizada, responsiva e acessível. Não contém lógica de negócio própria — toda regra de coleta, resumo e persistência de dados vive no backend.

## Principais funcionalidades

**Área pública**

- Consulta e perfil detalhado de deputados federais e senadores do Ceará (proposições, comissões, linha do tempo, efetividade legislativa);
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

# Chave da API da Groq, usada pelo assistente de IA (rota /api/chat)
GROQ_API_KEY=

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
| `/` | Página inicial |
| `/DeputadosPage`, `/ShowDeputadosPage/[id]` | Listagem e perfil de deputados federais |
| `/SenadoresPage`, `/ShowSenadoresPage/[id]` | Listagem e perfil de senadores |
| `/Painelnoticias`, `/noticias/[id]` | Painel e detalhe de notícias |
| `/explicacao`, `/explicacao/[id]` | Explicações geradas por IA e respectivo quiz |
| `/ExplicacoesPage` | Mapa de Cargos Políticos |
| `/PropostasPage` | Propostas da comunidade |
| `/SugestoesPage` | Formulário de sugestões |
| `/SantinhoPage` | Gerador de santinhos |
| `/Juventude`, `/Universidades` | Conteúdo para juventude e universidades |
| `/SobreNosPage` | Sobre o projeto e a equipe |

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
GET  /api/deputies              GET  /api/senators
GET  /api/deputies/{id}         GET  /api/senators/{id}
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
- **Backend**: a coleta/resumo de notícias e a geração de explicações + quiz rodam inteiramente no backend Laravel, que também usa a Groq — isso é responsabilidade do [repositório da API](https://github.com/NotCrazyDog-hub/votus-general-api), não deste frontend.

A IA tem caráter informativo/educacional; respostas não substituem fontes oficiais.

## 🧩 Estrutura do projeto

```text
votus_frontend/
├── src/
│   ├── app/                    # Rotas (App Router)
│   │   ├── DeputadosPage/ SenadoresPage/ ShowDeputadosPage/ ShowSenadoresPage/
│   │   ├── Painelnoticias/ noticias/[id]/
│   │   ├── explicacao/         # "Você sabe?" (explicações + quiz)
│   │   ├── ExplicacoesPage/    # Mapa de Cargos Políticos
│   │   ├── PropostasPage/ SugestoesPage/ SantinhoPage/
│   │   ├── Juventude/ Universidades/ SobreNosPage/
│   │   ├── admin/              # Painel administrativo
│   │   └── api/chat/           # Rota do assistente de IA
│   ├── components/             # Componentes reutilizáveis (UI, admin, cargos)
│   ├── services/                # Chamadas à API (fetch + tipos)
│   ├── lib/                     # Utilitários (SEO, geração de PDF, formatação)
│   └── data/                    # Dados estáticos (cargos políticos, equipe)
├── public/                      # Imagens, ícones e elementos do santinho
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

Dados públicos de deputados e senadores vêm das APIs oficiais:

- [Câmara dos Deputados — Dados Abertos](https://dadosabertos.camara.leg.br/swagger/api.html);
- [Senado Federal — Dados Abertos](https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html).

## 🌐 Deploy

O frontend está hospedado na [Vercel](https://vercel.com/). Para o build de produção:

```bash
npm run build
npm run start
```

Configure `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` e `GROQ_API_KEY` como variáveis de ambiente na plataforma de deploy.

---

<p align="center">
    Desenvolvido pela equipe do Votus.
</p>
