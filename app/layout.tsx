import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Préparer votre site | Arnaud Crestey",
  description: "Un parcours simple pour imaginer votre futur site avec Arnaud Crestey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
