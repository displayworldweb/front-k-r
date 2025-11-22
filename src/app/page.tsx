import { Metadata } from 'next';
import { getMetadataForPage } from '@/lib/seo-metadata';
import { generateOpenGraphMetadata } from '@/lib/open-graph';
import dynamic from 'next/dynamic';
import HeroSlider from "./components/HeroSlider";
import PopularCategories from "./components/PopularCategories";
import StoreInfo from "./components/StoreInfo";

// Lazy load компоненты ниже the fold
const PopularProducts = dynamic(() => import("./components/PopularProducts"), { ssr: true });
const RelatedProductsSlider = dynamic(() => import("./components/RelatedProductsSlider"), { ssr: true });
const CompleteSolutionSlider = dynamic(() => import("./components/CompleteSolutionSlider"), { ssr: true });
const OurWorksSlider = dynamic(() => import("./components/OurWorksSlider"), { ssr: true });
const PaymentInfo = dynamic(() => import("./components/PaymentInfo"), { ssr: true });
const OrderStepsSection = dynamic(() => import("./components/OrderStepsSection"), { ssr: true });
const WhyTrustUs = dynamic(() => import("./components/WhyTrustUs"), { ssr: true });
const ReviewsSlider = dynamic(() => import("./components/ReviewsSlider"), { ssr: true });
const Promo = dynamic(() => import("./components/Promo"), { ssr: true });
const Blog = dynamic(() => import("./components/Blog"), { ssr: true });
const FAQ = dynamic(() => import("./components/FAQ"), { ssr: true });

// Генерируем метаданные для SEO
export async function generateMetadata(): Promise<Metadata> {
  const baseMetadata = await getMetadataForPage(
    'home',
    'Памятники и памятные комплексы из гранита | КР',
    'Изготовление и продажа памятников из гранита, оград и памятных комплексов'
  );

  return {
    ...baseMetadata,
    ...generateOpenGraphMetadata(
      'Каменная Роза - Памятники из гранита в Витебске',
      'Производство и установка памятников, оград и аксессуаров из гранита. Качество, надежность, индивидуальный подход.',
      'https://k-r.by/monuments.jpg',
      'https://k-r.by',
      'website'
    ),
  };
}

export default function Home() {
   return (
    <main className="overflow-hidden">
        <HeroSlider/>
        <PopularCategories />
        <StoreInfo />
        <PopularProducts />
        <RelatedProductsSlider />
        <CompleteSolutionSlider />
        {/* <BannerForm /> */}
        <OurWorksSlider />
        <PaymentInfo />
        <OrderStepsSection />
        <WhyTrustUs />
        <ReviewsSlider />
        <Promo />
        <Blog />
        <FAQ />
    </main>
  );
}
