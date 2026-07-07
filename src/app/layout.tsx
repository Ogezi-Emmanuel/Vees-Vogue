import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEES VOGUE | Luxury Bridal & Prom Atelier Abuja",
  description: "Abuja's premier atelier for bespoke bridal and prom artistry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
