import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /admin/* nunca deve ser indexado pelo Google. robots.txt (ver
  // src/app/robots.ts) já pede pra não rastrear, mas alguns buscadores
  // ignoram robots.txt para páginas que já conhecem por outro link — o
  // header X-Robots-Tag é a forma que eles são obrigados a respeitar. Fica
  // aqui (não em admin/layout.tsx) porque esse layout é Client Component e
  // não pode exportar `metadata`.
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // Pastas de rota renomeadas para padronizar o sufixo "Page" — mantém
  // links antigos salvos/compartilhados funcionando.
  async redirects() {
    return [
      { source: "/Inicial", destination: "/InicialPage", permanent: false },
      { source: "/Juventude", destination: "/JuventudePage", permanent: false },
      { source: "/Universidades", destination: "/UniversidadesPage", permanent: false },
      { source: "/Painelnoticias", destination: "/PainelNoticiasPage", permanent: false },
    ];
  },
  images: {
    // Next.js blocks SVG optimization by default ("image type is not
    // allowed"), which silently broke every next/image usage of a local
    // .svg in this app (sidebar.svg header bars, CardProposta.svg, etc).
    // CSP below prevents an SVG from executing any embedded script.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.camara.leg.br",
        pathname: "/internet/deputado/bandep/**",
      },
      {
        protocol: "https",
        hostname: "www.senado.leg.br",
        pathname: "/senadores/img/fotos-oficiais/**",
      },
      {
        // Fotos antigas dos candidatos, servidas pelo próprio backend
        // (Storage::url no disco local). Mantido por compatibilidade.
        protocol: "https",
        hostname: "votus-core.onrender.com",
        pathname: "/storage/candidates/**",
      },
      {
        // Fotos atuais dos candidatos: o backend agora usa o disco
        // "supabase" e devolve a URL pública absoluta do bucket. Sem esta
        // entrada o otimizador do next/image recusava a URL (400
        // INVALID_IMAGE_OPTIMIZE_REQUEST, confirmado em produção) e todo
        // card caía no placeholder via onError — nenhuma foto real aparecia.
        protocol: "https",
        hostname: "bibpgfltcdrgbxvvnixn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Fotos dos deputados estaduais, raspadas direto do site da ALECE
        // (Assembleia Legislativa do Ceará) — sem isso next/image recusa a
        // URL e a página inteira quebra com 500 (erro fatal de render, não
        // só um placeholder), confirmado em /DeputadosEstaduaisPage.
        protocol: "https",
        hostname: "www.al.ce.gov.br",
        pathname: "/image/**",
      },
      {
        // Foto do governador do Ceará (cargos executivos/GovernadoresPage) —
        // vem direto do site do Governo do Estado, não do bucket Supabase.
        // Mesmo erro fatal de render das outras entradas acima sem isso.
        protocol: "https",
        hostname: "www.ce.gov.br",
        pathname: "/wp-content/uploads/**",
      },
    ],
    // As fotos do bucket vêm com Cache-Control: no-cache (definido no
    // upload), então sem isso a versão otimizada seria revalidada a toda
    // hora. O problema é que cada expiração RE-transforma a mesma foto, e
    // isso conta de novo no teto da Vercel: com 1 dia, as ~629 fotos de
    // candidatos do Ceará eram re-transformadas ~30x/mês. Em out/2026 isso
    // estourou o limite de 5k/mês do plano Hobby e a conta inteira foi
    // pausada com DEPLOYMENT_DISABLED (402) — os 10 projetos saíram do ar,
    // não só este (Cache Writes 9k > Transformations 6k confirmou que era
    // re-gravação, não imagem nova).
    // 31 dias derruba a projeção pra ~1,3k/mês. Fotos oficiais mudam
    // raramente; o custo é uma foto corrigida no bucket levar até um mês
    // pra aparecer.
    // Nota: não restringir deviceSizes/imageSizes aqui. Larguras removidas
    // passam a responder 400, e quem tiver a página em cache com o srcset
    // antigo fica sem a foto. O ganho vinha do TTL e dos `sizes` corretos
    // nos <Image> de perfil, não de proibir larguras.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
