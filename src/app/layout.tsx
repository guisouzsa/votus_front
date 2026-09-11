import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import SWRProvider from "@/components/SWRProvider";
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
  title: "Votus - Painel de Notícias",
  description: "Veja as últimas notícias sobre seus tópicos favoritos",
  icons: {
    icon: "/ivy_votus.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={`${montserrat.variable} ${poppins.variable}`}>
      <body>
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}