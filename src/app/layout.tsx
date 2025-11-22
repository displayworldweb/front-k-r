import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FooterMenu from "./components/FooterMenu";
import ScrollToTop from "./components/ScrollToTop";
import { DropdownProvider } from "./context/DropDownContext";
import { AdminProtector } from "./components/AdminProtector";
import YandexMetrika from "./components/YandexMetrika";
import CookieConsent from "./components/CookieConsent";
import SchemaOrg from "./components/SchemaOrg";
import { schemaOrganization } from "@/lib/seo-schema";

// Default metadata для корневого layout - используется как fallback
export const metadata: Metadata = {
  title: "Каменная Роза в Витебске",
  description:
    "Производство и установка памятников, оград, аксессуаров из гранита.",
  metadataBase: new URL("https://k-r.by"),
  robots: "index, follow",
  openGraph: {
    title: "Каменная Роза в Витебске",
    description:
      "Производство и установка памятников, оград, аксессуаров из гранита.",
    url: "https://k-r.by",
    type: "website",
    images: [
      {
        url: "https://k-r.by/monuments.jpg",
        width: 1200,
        height: 630,
        alt: "Каменная Роза",
      },
    ],
    siteName: "Каменная Роза",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Каменная Роза в Витебске",
    description:
      "Производство и установка памятников, оград, аксессуаров из гранита.",
    images: ["https://k-r.by/monuments.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Critical CSS inline для быстрого первого рендера */}
        <style dangerouslySetInnerHTML={{__html: `
          html { scroll-behavior: smooth; }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
            background: #ffffff;
            color: #2c3a54;
            min-width: 360px;
          }
          .container-centered {
            margin-left: 20px;
            margin-right: 20px;
          }
          @media (min-width: 1300px) {
            .container-centered { margin-left: auto; margin-right: auto; }
          }
        `}} />
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/LatoRegular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/LatoBold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <SchemaOrg schema={schemaOrganization} />
      </head>
      <body className="min-w-[360px]">
        <YandexMetrika />
        <DropdownProvider>
          <AdminProtector>
            <ScrollToTop />
            <Header />
            {children}
            <Footer />
            <FooterMenu />
            <CookieConsent />
          </AdminProtector>
        </DropdownProvider>
      </body>
    </html>
  );
}
