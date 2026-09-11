import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
