import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { getDeputies } from "@/services/deputiesService";
import { getSenators } from "@/services/senatorsService";
import { getNewsList } from "@/services/newsService";
import { getExplanations } from "@/services/explanationService";
import { CANDIDATE_OFFICES, getCandidates, type CandidateOfficeSlug } from "@/services/candidatesService";

const PAGINAS_ESTATICAS = [
  { path: "/", priority: 1 },
  { path: "/InicialPage", priority: 0.8 },
  { path: "/DeputadosPage", priority: 0.9 },
  { path: "/SenadoresPage", priority: 0.9 },
  { path: "/PainelNoticiasPage", priority: 0.9 },
  { path: "/PropostasPage", priority: 0.8 },
  { path: "/ExplicacoesPage", priority: 0.7 },
  { path: "/explicacao", priority: 0.7 },
  { path: "/JuventudePage", priority: 0.6 },
  { path: "/UniversidadesPage", priority: 0.6 },
  { path: "/SantinhoPage", priority: 0.5 },
  { path: "/SimuladorUrnaPage", priority: 0.5 },
  { path: "/SugestoesPage", priority: 0.4 },
  // Candidatos 2026 — 5 páginas reais (CANDIDATE_OFFICES), faltavam
  // inteiramente no sitemap.
  ...(Object.keys(CANDIDATE_OFFICES) as CandidateOfficeSlug[]).map((slug) => ({
    path: `/CandidatosPage/${slug}`,
    priority: 0.9,
  })),
];

// Quantas páginas de notícias buscar pro sitemap — não é preciso incluir o
// histórico inteiro (nem toda notícia antiga vale a pena continuar indexada),
// só o suficiente pra cobrir o que é realmente recente/relevante. Se a API
// não responder, o sitemap ainda funciona só com as páginas estáticas abaixo.
const PAGINAS_NOTICIAS_NO_SITEMAP = 5;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = PAGINAS_ESTATICAS.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    priority,
  }));

  const [deputados, senadores, noticias, explicacoes, candidatos] = await Promise.all([
    buscarDeputados(),
    buscarSenadores(),
    buscarNoticias(),
    buscarExplicacoes(),
    buscarCandidatos(),
  ]);

  return [...estaticas, ...deputados, ...senadores, ...noticias, ...explicacoes, ...candidatos];
}

async function buscarDeputados(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await getDeputies({ page: 1 });

    return response.data.map((deputado) => ({
      url: `${SITE_URL}/ShowDeputadosPage/${deputado.external_id}`,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

async function buscarSenadores(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await getSenators({ page: 1 });

    return response.data.map((senador) => ({
      url: `${SITE_URL}/ShowSenadoresPage/${senador.external_id}`,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

async function buscarExplicacoes(): Promise<MetadataRoute.Sitemap> {
  try {
    const entradas: MetadataRoute.Sitemap = [];
    let page = 1;

    while (page <= PAGINAS_NOTICIAS_NO_SITEMAP) {
      const response = await getExplanations(page);

      for (const explicacao of response.data) {
        entradas.push({ url: `${SITE_URL}/explicacao/${explicacao.id}`, priority: 0.5 });
      }

      if (page >= response.last_page) break;
      page++;
    }

    return entradas;
  } catch {
    return [];
  }
}

// Candidatos titulares dos 5 cargos — igual à listagem pública, sem
// suplentes/vices (que não têm página própria). Ao contrário das notícias,
// aqui não há "mais recente/relevante" pra priorizar — é a chapa inteira da
// eleição —, então percorre todas as páginas de cada cargo, não só a 1ª.
// Restrito ao Ceará (exceto Presidente, nacional) igual à listagem pública —
// sem isso, cada cargo percorria TODOS os 27 estados (até ~11 mil candidatos
// em centenas de páginas só pra Deputado Estadual), estourando o timeout de
// build do sitemap.
async function buscarCandidatos(): Promise<MetadataRoute.Sitemap> {
  const porCargo = await Promise.all(
    (Object.keys(CANDIDATE_OFFICES) as CandidateOfficeSlug[]).map(async (slug) => {
      try {
        const entradas: MetadataRoute.Sitemap = [];
        let page = 1;
        const filtro = slug === 'presidente' ? {} : { state: 'CE' };

        while (true) {
          const response = await getCandidates(slug, page, filtro);

          for (const candidato of response.data) {
            entradas.push({ url: `${SITE_URL}/CandidatosPage/${slug}/${candidato.id}`, priority: 0.6 });
          }

          if (page >= response.meta.last_page) break;
          page++;
        }

        return entradas;
      } catch {
        return [];
      }
    })
  );

  return porCargo.flat();
}

async function buscarNoticias(): Promise<MetadataRoute.Sitemap> {
  try {
    const entradas: MetadataRoute.Sitemap = [];

    for (let page = 1; page <= PAGINAS_NOTICIAS_NO_SITEMAP; page++) {
      const response = await getNewsList(page);

      for (const noticia of response.data) {
        entradas.push({
          url: `${SITE_URL}/noticias/${noticia.id}`,
          lastModified: noticia.published_at ?? undefined,
          priority: 0.5,
        });
      }

      if (page >= response.last_page) break;
    }

    return entradas;
  } catch {
    return [];
  }
}
