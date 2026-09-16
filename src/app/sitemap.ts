import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { getDeputados } from "@/services/deputadosService";
import { getSenadores } from "@/services/senadoresService";
import { getNewsList } from "@/services/newsService";

const PAGINAS_ESTATICAS = [
  { path: "/", priority: 1 },
  { path: "/Inicial", priority: 0.8 },
  { path: "/DeputadosPage", priority: 0.9 },
  { path: "/SenadoresPage", priority: 0.9 },
  { path: "/Painelnoticias", priority: 0.9 },
  { path: "/PropostasPage", priority: 0.8 },
  { path: "/ExplicacoesPage", priority: 0.7 },
  { path: "/Juventude", priority: 0.6 },
  { path: "/Universidades", priority: 0.6 },
  { path: "/SantinhoPage", priority: 0.5 },
  { path: "/SobreNosPage", priority: 0.5 },
  { path: "/SugestoesPage", priority: 0.4 },
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

  const [deputados, senadores, noticias] = await Promise.all([
    buscarDeputados(),
    buscarSenadores(),
    buscarNoticias(),
  ]);

  return [...estaticas, ...deputados, ...senadores, ...noticias];
}

async function buscarDeputados(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await getDeputados({ page: 1 });

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
    const response = await getSenadores({ page: 1 });

    return response.data.map((senador) => ({
      url: `${SITE_URL}/ShowSenadoresPage/${senador.external_id}`,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
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
