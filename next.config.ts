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
    ],
  },
};

export default nextConfig;
