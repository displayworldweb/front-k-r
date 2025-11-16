import { Metadata } from 'next';
import { getMetadataForPage } from '@/lib/seo-metadata';
import HeroSlider from "./components/HeroSlider";
import PopularCategories from "./components/PopularCategories";
import StoreInfo from "./components/StoreInfo";
import PopularProducts from "./components/PopularProducts";
import RelatedProductsSlider from "./components/RelatedProductsSlider";
import CompleteSolutionSlider from "./components/CompleteSolutionSlider";
import BannerForm from "./components/BannerForm";
import PaymentInfo from "./components/PaymentInfo";
import OurWorksSlider from "./components/OurWorksSlider";
import OrderStepsSection from "./components/OrderStepsSection";
import WhyTrustUs from "./components/WhyTrustUs";
import ReviewsSlider from "./components/ReviewsSlider";
import Promo from "./components/Promo";
import Blog from "./components/Blog";
import FAQ from "./components/FAQ";

// Генерируем метаданные для SEO
export async function generateMetadata(): Promise<Metadata> {
  return await getMetadataForPage(
    'home',
    'Памятники и памятные комплексы из гранита | КР',
    'Изготовление и продажа памятников из гранита, оград и памятных комплексов'
  );
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
