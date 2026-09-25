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
    ],
    // As fotos do bucket vêm com Cache-Control: no-cache (definido no
    // upload), então sem isso a versão otimizada seria revalidada a toda
    // hora. Fotos oficiais mudam raramente; 1 dia de cache é seguro.
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
