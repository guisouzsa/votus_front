import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import SWRProvider from "@/components/SWRProvider";
import SiteVisitPing from "@/components/SiteVisitPing";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_LOCALE, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/siteConfig";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Votus",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "RcW_O4aHMcLCW1AEtRV2zOLrUF1T2pB6rrHyo996-OY",
  },
  icons: {
    icon: "/ivy_votus.png",
    apple: "/ivy_votus.png",
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
};

// Só fatos que realmente existem no projeto — sem inventar redes sociais
// (os links do rodapé são placeholders "#", não URLs reais) nem endereço.
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "pt-BR",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/ivy_votus.png`,
    description: SITE_DESCRIPTION,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${poppins.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteVisitPing />
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
