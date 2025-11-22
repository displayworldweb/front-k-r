import type { Metadata } from "next";
import dynamic from "next/dynamic";
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
        {/* Critical inline styles to eliminate render-blocking CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          @font-face{font-family:LatoRegular;src:url(/fonts/LatoRegular.ttf) format("truetype");font-display:swap;font-weight:400}
          @font-face{font-family:LatoBold;src:url(/fonts/LatoBold.ttf) format("truetype");font-display:swap;font-weight:700}
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:LatoRegular,system-ui,-apple-system,BlinkMacSystemFont,Arial,sans-serif;font-size:16px;line-height:1.5;contain:layout style;min-width:360px;background:#fff;color:#000}
          main{min-height:100vh;display:block;contain:layout style}
          .min-h-screen{min-height:100vh}
          section:first-of-type{min-height:clamp(226px,29.5vw,400px);aspect-ratio:1300/400;contain:layout style paint;position:relative}
          img{content-visibility:auto;contain-intrinsic-size:auto 400px;max-width:100%;height:auto;display:block}
          h1,h2,h3,h4,h5,h6{font-family:LatoBold,Arial,sans-serif;font-weight:700;line-height:1.2}
          a{text-decoration:none;color:inherit}
          .font-bold,strong{font-family:LatoBold,Arial,sans-serif;font-weight:700}
        `}} />
        
        {/* Preconnect для раннего установления соединения */}
        <link rel="preconnect" href="https://k-r.by" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        
        {/* Preload LCP изображения с наивысшим приоритетом */}
        <link
          rel="preload"
          as="image"
          href="/sliders/single.webp"
          fetchPriority="high"
          imageSizes="(max-width: 768px) 100vw, 1300px"
          imageSrcSet="/_next/image?url=%2Fsliders%2Fsingle.webp&w=640&q=90 640w, /_next/image?url=%2Fsliders%2Fsingle.webp&w=1200&q=90 1200w, /_next/image?url=%2Fsliders%2Fsingle.webp&w=1920&q=90 1920w"
        />
        
        <SchemaOrg schema={schemaOrganization} />
      </head>
      <body className="min-w-[360px]" style={{ willChange: 'contents' }}>
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
