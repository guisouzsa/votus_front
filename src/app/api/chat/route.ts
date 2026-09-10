import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getDeputados } from "@/services/deputadosService";
import { getSenadores } from "@/services/senadoresService";
import type { Legislator } from "@/services/types";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const STATUS_LABELS: Record<string, string> = {
  active: "ativo",
  inactive: "inativo",
  on_leave: "licenciado",
  former: "ex-mandato",
};

const BASE_SYSTEM_PROMPT = `Você é a IA de apoio do Votus, uma plataforma brasileira feita para jovens conhecerem melhor seus candidatos e representantes políticos e entenderem como funciona o voto no Brasil.

O Votus é uma iniciativa voltada para jovens e pessoas que querem conhecer mais sobre os candidatos antes de votar. A plataforma reúne painéis de deputados e senadores do Ceará, notícias e conteúdo educativo sobre política. Foi desenvolvida por: Dafny Almeida, Emanuel Rodrigues, Eva Lohane, Kerllon Sousa, Guilherme Rodrigues, Ivens Araujo, Larissa Félix, Marianne Moreira, Maria Eduarda e Pedro Oliveira.

Responda apenas perguntas sobre:
- Política e eleições no Brasil: o que faz um vereador, prefeito, deputado estadual, deputado federal, senador, governador ou presidente; como funciona o voto, o sistema eleitoral, partidos, emendas parlamentares, proposições, etc.
- O próprio Votus: o que é, para quem é, e quem desenvolveu.
- Os deputados federais e senadores do Ceará listados na seção "Parlamentares do Ceará" abaixo.

Regras gerais:
- Responda em português do Brasil, de forma curta, simples e didática, como se explicasse para alguém que está aprendendo sobre política pela primeira vez.
- Se a pergunta não tiver relação com política, eleições, o Votus ou os parlamentares listados, explique educadamente que você só responde sobre esses temas e sugira reformular.
- Você não tem acesso a dados ao vivo além da lista de parlamentares fornecida abaixo (sem votações recentes, notícias do dia, resultados de eleições em andamento). Quando a pergunta exigir dado que você não tem, diga isso claramente e oriente a pessoa a consultar os painéis do próprio Votus ou fontes oficiais.
- Nunca invente nomes, números ou datas específicas das quais você não tenha certeza.

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
      getDeputados({ page: 1 }),
      getSenadores({ page: 1 }),
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

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;

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

    return NextResponse.json({ reply: sanitizeReply(reply) });
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
