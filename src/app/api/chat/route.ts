import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getDeputies } from "@/services/deputiesService";
import { getSenators } from "@/services/senatorsService";
import type { Legislator } from "@/services/types";
import { TEAM_ADVISOR, TEAM_MEMBERS } from "@/data/team";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const STATUS_LABELS: Record<string, string> = {
  active: "ativo",
  inactive: "inativo",
  on_leave: "licenciado",
  former: "ex-mandato",
};

// Mesma lista de app/components/DevelopersSection.tsx (fonte: @/data/team),
// pra IA nunca responder um time desatualizado em relação à landing page.
const equipeFormatada = TEAM_MEMBERS.map((membro) => membro.name).join(", ");

const BASE_SYSTEM_PROMPT = `Você é a IA de apoio do Votus, uma plataforma brasileira feita para jovens conhecerem melhor seus candidatos e representantes políticos e entenderem como funciona o voto no Brasil.

O Votus é uma iniciativa voltada para jovens e pessoas que querem conhecer mais sobre os candidatos antes de votar. A plataforma reúne painéis de deputados e senadores do Ceará, notícias e conteúdo educativo sobre política. Foi desenvolvida por: ${equipeFormatada}, com orientação de ${TEAM_ADVISOR.name}.

Seu assunto é política e cidadania no Brasil, incluindo (sem se limitar só a estes exemplos):
- Cargos e suas funções: vereador, prefeito, deputado estadual, deputado federal, senador, governador, presidente da República — o que cada um faz, como é eleito, duração de mandato.
- Eleições: sistema eleitoral, turnos, voto, partidos, coligações/federações, candidatos, como funciona uma campanha.
- Congresso Nacional, Câmara dos Deputados e Senado Federal: como funcionam, o que são proposições, projetos de lei, PECs, emendas parlamentares (individuais, de bancada, de comissão), como uma lei é aprovada.
- Orçamento público: como funciona, o que é uma emenda orçamentária, e o que significam os termos do ciclo da despesa pública (empenho/"valor empenhado", liquidação, pagamento).
- Fiscalização e denúncia: para perguntas do tipo "onde denunciar" (corrupção, irregularidade, mau uso de verba pública), oriente para os canais oficiais que realmente existem no Brasil — Ministério Público (estadual ou federal, conforme o caso), Tribunal de Contas (da União ou do estado/município), Controladoria-Geral da União, ouvidorias dos próprios órgãos (Câmara, Senado, prefeituras) e o Portal da Transparência — sem inventar telefone, link ou número de protocolo específico que você não tenha certeza de que existe.
- Instituições públicas em geral e o funcionamento político-institucional brasileiro (separação de poderes, papel do Judiciário, TSE, etc.).
- O próprio Votus: o que é, para quem é, seu objetivo, como usar suas ferramentas (painéis de parlamentares, candidatos, notícias, propostas, gerador de cola eleitoral, explicações), e quem desenvolveu.
- Os deputados federais e senadores do Ceará listados na seção "Parlamentares do Ceará" abaixo.

Regras gerais:
- Responda em português do Brasil, de forma curta, simples e didática, como se explicasse para alguém que está aprendendo sobre política pela primeira vez.
- Você PODE e DEVE responder perguntas gerais de educação cívica (como as descritas acima) usando seu próprio conhecimento sobre como o Brasil funciona — isso não depende da lista de parlamentares abaixo, que serve só para perguntas sobre pessoas específicas do Ceará.
- Recuse educadamente só o que for claramente fora desse assunto (não relacionado a política, cidadania, instituições brasileiras ou ao Votus) — não recuse uma pergunta só porque ela não aparece literalmente nos exemplos acima; se for do mesmo assunto (política/cidadania/Votus), responda.
- Você não tem acesso a dados ao vivo além da lista de parlamentares fornecida abaixo (sem votações recentes, notícias do dia, resultados de eleições em andamento). Quando a pergunta pedir um dado factual específico e atual que você não tem (ex: nome de um candidato específico fora do Ceará, resultado de uma votação desta semana), diga isso claramente e oriente a pessoa a consultar os painéis do próprio Votus ou fontes oficiais — em vez de recusar a pergunta inteira, responda a parte conceitual (o que é/como funciona) e só sinalize como indisponível a parte que exige dado ao vivo.
- Nunca invente nomes de candidatos, integrantes de equipe, números, datas, links ou dados específicos dos quais você não tenha certeza.

Neutralidade e imparcialidade (regra importante):
- O Votus não apoia nem recomenda nenhum candidato, partido ou lado político.
- Se perguntarem para comparar políticos, partidos ou candidatos, ou "qual é melhor", "em quem devo votar", responda de forma neutra: apresente apenas fatos e dados objetivos (cargo, partido, produção legislativa, efetividade) sem julgar, ranquear ou tomar partido.
- Deixe claro, quando fizer esse tipo de comparação, que a decisão de voto é pessoal e deve ser baseada na análise do próprio eleitor, e nunca declare que um lado está certo ou errado.

Formatação da resposta:
- Escreva em texto simples, sem markdown: não use **negrito**, *itálico*, títulos com #, nem crases.
- Se precisar listar itens, use linhas começando com "- ", sem outros símbolos.`;

function formatEffectiveness(rate: number | null): string {
  return rate !== null && rate !== undefined ? `${Math.round(rate * 100)}%` : "não informada";
}

function formatLegislator(person: Legislator, role: string): string {
  const status = STATUS_LABELS[person.status ?? ""] ?? "situação desconhecida";
  const totalBills = person.metrics?.effectiveness?.total_bills ?? "não informado";
  const effectiveness = formatEffectiveness(person.metrics?.effectiveness?.rate ?? null);

  return `- ${person.parliamentary_name} (${role}, partido: ${person.party ?? "sem partido"}, situação: ${status}, efetividade legislativa: ${effectiveness}, proposições: ${totalBills})`;
}

let rosterCache: { section: string; expiresAt: number } | null = null;
const ROSTER_TTL_MS = 5 * 60 * 1000;

async function getRosterSection(): Promise<string> {
  if (rosterCache && rosterCache.expiresAt > Date.now()) {
    return rosterCache.section;
  }

  try {
    const [deputadosRes, senadoresRes] = await Promise.all([
      getDeputies({ page: 1 }),
      getSenators({ page: 1 }),
    ]);

    const deputadosList = deputadosRes.data.map((d) => formatLegislator(d, "deputado federal")).join("\n");
    const senadoresList = senadoresRes.data.map((s) => formatLegislator(s, "senador")).join("\n");

    const section = `Parlamentares do Ceará (esta é a ÚNICA base de dados de parlamentares que você tem — todos são do Ceará; se perguntarem sobre um deputado ou senador que não está nesta lista, diga que só tem dados dos parlamentares do Ceará cadastrados no Votus):

Deputados federais:
${deputadosList || "(lista indisponível no momento)"}

Senadores:
${senadoresList || "(lista indisponível no momento)"}`;

    rosterCache = { section, expiresAt: Date.now() + ROSTER_TTL_MS };
    return section;
  } catch {
    return "Parlamentares do Ceará: no momento não foi possível carregar a lista. Se perguntarem sobre um deputado ou senador específico, diga que esse dado está temporariamente indisponível.";
  }
}

function sanitizeReply(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|\s)\*(\S(?:.*?\S)?)\*(?=\s|$)/g, "$1$2")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*\*\s+/gm, "- ")
    .trim();
}

interface IncomingMessage {
  role?: unknown;
  content?: unknown;
}

// Rate limit em memória do processo (best-effort): sem isso, qualquer
// pessoa podia bater nesse endpoint sem limite nenhum e estourar a cota da
// chave da Groq — diferente do /api/agente/perguntar do backend, que já tem
// throttle:10,1. Não é distribuído (reseta se o processo reiniciar ou em
// deploy multi-instância), mas cobre o caso comum de um cliente abusando.
//
// Dois limites, dois propósitos:
// - por IP (rajada curta): trava um script disparando muitas requisições
//   rápido, inclusive alternando um X-Visitor-Id falso a cada chamada.
// - por pessoa (5/hora): a regra pedida. "Pessoa" aqui é o mesmo
//   identificador anônimo que o projeto já gera e persiste em
//   localStorage pra votos de proposta (getVisitorId, ver lib/visitorId.ts
//   e ProposalController::vote no backend, que já usa esse mesmo header
//   X-Visitor-Id) — não um identificador novo. Sobrevive a atualizar a
//   página/abrir outra aba (o id vem do localStorage, não muda), e o
//   controle real é aqui no servidor: o frontend só manda o header, quem
//   decide se passou do limite é este código, então zerar/trocar o valor
//   no localStorage do navegador não abre passe livre — só criaria uma
//   "pessoa" nova do zero, que também começa a contar do seu próprio 0/5.
const IP_BURST_WINDOW_MS = 60_000;
const IP_BURST_MAX_REQUESTS = 10;
const PERSON_WINDOW_MS = 60 * 60_000; // 1 hora
const PERSON_MAX_REQUESTS = 5;

const ipLog = new Map<string, number[]>();
const personLog = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "desconhecido";
}

// X-Visitor-Id é o mesmo identificador de lib/visitorId.ts (getVisitorId),
// já usado pra votos/comentários de proposta — reaproveitado aqui, não é
// um identificador novo. Sem o header (cliente antigo ou chamada direta à
// API sem passar pelo nosso frontend), cai pro IP: nunca fica sem limite.
function getPersonKey(request: Request): string {
  const visitorId = request.headers.get("x-visitor-id")?.trim();
  return visitorId ? `visitor:${visitorId}` : `ip:${getClientIp(request)}`;
}

function checarLimite(
  log: Map<string, number[]>,
  chave: string,
  janelaMs: number,
  maximo: number
): { permitido: boolean; restantes: number } {
  const agora = Date.now();
  const timestamps = (log.get(chave) ?? []).filter((timestamp) => agora - timestamp < janelaMs);

  if (timestamps.length >= maximo) {
    log.set(chave, timestamps);
    return { permitido: false, restantes: 0 };
  }

  timestamps.push(agora);
  log.set(chave, timestamps);
  return { permitido: true, restantes: maximo - timestamps.length };
}

export async function POST(request: Request) {
  const { permitido: dentroDaRajada } = checarLimite(
    ipLog,
    getClientIp(request),
    IP_BURST_WINDOW_MS,
    IP_BURST_MAX_REQUESTS
  );

  if (!dentroDaRajada) {
    return NextResponse.json(
      { error: "Muitas perguntas em pouco tempo. Espere um instante e tente de novo." },
      { status: 429 }
    );
  }

  const { permitido: dentroDoLimitePessoal, restantes } = checarLimite(
    personLog,
    getPersonKey(request),
    PERSON_WINDOW_MS,
    PERSON_MAX_REQUESTS
  );

  if (!dentroDoLimitePessoal) {
    return NextResponse.json(
      {
        error: `Você atingiu o limite de ${PERSON_MAX_REQUESTS} perguntas por hora. Tente novamente mais tarde.`,
      },
      { status: 429 }
    );
  }

  // Nome próprio (não GROQ_API_KEY genérico) pra não confundir com as
  // GROQ_API_KEY_1..5 do backend (votus-general-api) — são chaves Groq
  // diferentes, em projetos/plataformas diferentes (esta aqui é só do chat
  // do frontend, configurada na Vercel).
  const apiKey = process.env.CHAT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "IA indisponível no momento. Tente novamente mais tarde." },
      { status: 503 }
    );
  }

  let body: { messages?: IncomingMessage[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (entry): entry is { role: "user" | "assistant"; content: string } =>
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0
    )
    .slice(-10)
    .map((entry) => ({ role: entry.role, content: entry.content.slice(0, 2000) }));

  if (history.length === 0) {
    return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });
  }

  const rosterSection = await getRosterSection();
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${rosterSection}`;

  const groq = new Groq({ apiKey, maxRetries: 2 });

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      temperature: 0.3,
    });

    const reply = response.choices[0]?.message?.content;

    if (typeof reply !== "string") {
      return NextResponse.json({ error: "Resposta inesperada da IA." }, { status: 502 });
    }

    // "restantes" pro frontend poder mostrar "Pergunta X/5" — puramente
    // informativo, quem decide o limite de verdade é o checarLimite acima.
    return NextResponse.json({ reply: sanitizeReply(reply), limite: { restantes, maximo: PERSON_MAX_REQUESTS } });
  } catch (error) {
    console.error("Erro ao chamar o Groq:", error);

    if (error instanceof Groq.APIError && (error.status === 429 || error.status === 503)) {
      return NextResponse.json(
        { error: "A IA está sobrecarregada no momento. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Não foi possível falar com a IA agora. Tente novamente." },
      { status: 502 }
    );
  }
}
