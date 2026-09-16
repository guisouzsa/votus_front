import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Painel administrativo e autenticação: nunca devem ser indexados.
      // robots.txt não é controle de acesso (é só um pedido educado aos
      // crawlers que respeitam a convenção) — a proteção de verdade
      // continua sendo o backend (EnsureIsAdmin) e o header noindex em
      // /admin/layout.tsx.
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
