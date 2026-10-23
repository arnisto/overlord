import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["700", "900"] });

export const metadata: Metadata = {
  title: { default: "Communauté Le Revenu", template: "%s · Communauté Le Revenu" },
  description: "Posez vos questions d'argent, partagez vos expériences et échangez avec la rédaction du Revenu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-[15px] leading-normal">
        <Header />
        <div className="mx-auto max-w-[1260px] px-4 pb-24 pt-6 lg:pb-12">{children}</div>
        <MobileNav />
      </body>
    </html>
  );
}
