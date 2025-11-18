import { Metadata } from 'next';
import { getMetadataForPage } from '@/lib/seo-metadata';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const metadata = await getMetadataForPage('discount',
      'Товары на скидке - Памятники и ограды со скидкой в Минске | K-R.by',
      'Специальные предложения на памятники и ограды в Минске. Акции и скидки на готовые изделия из гранита. Выгодные цены на качественную продукцию.'
    );
    
    if (metadata) {
      return metadata;
    }
  } catch (error) {
    console.error('Error loading SEO data:', error);
  }

  // Fallback metadata
  return {
    title: 'Товары на скидке - Памятники и ограды со скидкой в Минске | K-R.by',
    description: 'Специальные предложения на памятники и ограды в Минске. Акции и скидки на готовые изделия из гранита. Выгодные цены на качественную продукцию.',
    keywords: 'памятники со скидкой, ограды со скидкой, акции памятники минск, скидки гранит, памятники недорого',
  };
}

export default function DiscountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
