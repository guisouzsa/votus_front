import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
