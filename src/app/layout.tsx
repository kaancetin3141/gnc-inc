import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE } from "@/lib/site-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GNC Inc — Yazılım ve Dijital Ürünler",
    template: "%s | GNC Inc",
  },
  description:
    "GNC Inc: ERP/CRM'den yapay zekâ destekli beslenmeye, bulut oyunlarından mobil platformlara — 8 canlı dijital ürün, tek çatı. Next.js 16, PostgreSQL 17, Flutter.",
  keywords: [
    "GNC Inc",
    "GNC Yazılım",
    "ERP",
    "CRM",
    "randevu",
    "KaloriAI",
    "Fruit Storm",
    "Cubiq",
    "PetGuardian",
    "GridPop",
    "gncinc.online",
  ],
  authors: [{ name: "Kaan Çetin" }],
  creator: "Kaan Çetin",
  openGraph: {
    title: "GNC Inc — Yazılım ve Dijital Ürünler",
    description:
      "8 canlı dijital ürün: GNC ERP & CRM, Randevu, KaloriAI, Fruit Storm, Cubiq, PetGuardian, GridPop — tek çatı altında.",
    url: "https://www.gncinc.online",
    siteName: "GNC Inc",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GNC Inc — Yazılım ve Dijital Ürünler",
    description: "8 canlı dijital ürün, tek çatı. gncinc.online",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7faf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1210" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
