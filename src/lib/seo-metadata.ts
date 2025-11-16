/**
 * Утилита для загрузки SEO метаданных страниц из БД
 * Используется для generateMetadata в Next.js страницах
 */

import { Metadata } from 'next';

export interface PageSEOData {
  id: number;
  pageSlug: string;
  pageTitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  author?: string;
  isIndexed: boolean;
}

// Default SEO для fallback
const DEFAULT_SEO = {
  title: 'Каменная Роза в Витебске',
  description: 'Производство и установка памятников, оград, аксессуаров из гранита.',
  keywords: 'памятники, гранит, ограды, аксессуары',
};

/**
 * Загружает SEO данные для страницы по slug
 * @param pageSlug - slug страницы (например: 'home', 'monuments', 'blogs')
 * @returns SEO данные или null если не найдены
 */
export async function getPageSEOData(pageSlug: string): Promise<PageSEOData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k-r.by/api'}/page-seo/by-slug/${pageSlug}`,
      {
        // Кэшируем на 1 час
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`SEO данные не найдены для ${pageSlug}`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(`Ошибка загрузки SEO данных для ${pageSlug}:`, error);
    return null;
  }
}

/**
 * Генерирует Metadata объект из SEO данных
 * @param seoData - SEO данные из БД
 * @param fallbackTitle - fallback title если нет в БД
 * @param fallbackDescription - fallback description если нет в БД
 * @returns Metadata объект для Next.js
 */
export function generateMetadataFromSEO(
  seoData: PageSEOData | null,
  fallbackTitle?: string,
  fallbackDescription?: string
): Metadata {
  if (!seoData) {
    return {
      title: fallbackTitle || DEFAULT_SEO.title,
      description: fallbackDescription || DEFAULT_SEO.description,
      keywords: DEFAULT_SEO.keywords,
    };
  }

  const metadata: Metadata = {
    title: seoData.seoTitle || fallbackTitle || DEFAULT_SEO.title,
    description: seoData.seoDescription || fallbackDescription || DEFAULT_SEO.description,
    keywords: seoData.seoKeywords || DEFAULT_SEO.keywords,
  };

  // Open Graph
  if (seoData.ogImage) {
    metadata.openGraph = {
      title: seoData.ogTitle || seoData.seoTitle,
      description: seoData.ogDescription || seoData.seoDescription,
      images: [
        {
          url: seoData.ogImage,
          width: seoData.ogImageWidth || 1200,
          height: seoData.ogImageHeight || 630,
          alt: seoData.ogTitle || seoData.seoTitle,
        },
      ],
      type: 'website',
    };
  } else {
    metadata.openGraph = {
      title: seoData.seoTitle,
      description: seoData.seoDescription,
      type: 'website',
    };
  }

  // Twitter Card
  if (seoData.twitterImage) {
    metadata.twitter = {
      card: 'summary_large_image',
      title: seoData.twitterTitle || seoData.seoTitle,
      description: seoData.twitterDescription || seoData.seoDescription,
      images: [seoData.twitterImage],
    };
  }

  // Canonical URL
  if (seoData.canonicalUrl) {
    metadata.alternates = {
      canonical: seoData.canonicalUrl,
    };
  }

  // Robots meta
  if (seoData.robotsMeta) {
    metadata.robots = seoData.robotsMeta as 'index' | 'noindex' | 'follow' | 'nofollow';
  } else {
    metadata.robots = seoData.isIndexed ? 'index, follow' : 'noindex, nofollow';
  }

  // Author
  if (seoData.author) {
    metadata.creator = seoData.author;
  }

  return metadata;
}

/**
 * Комбинированная функция: загружает SEO данные и генерирует Metadata
 * @param pageSlug - slug страницы
 * @param fallbackTitle - fallback title если нет в БД
 * @param fallbackDescription - fallback description если нет в БД
 * @returns Metadata объект
 */
export async function getMetadataForPage(
  pageSlug: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const seoData = await getPageSEOData(pageSlug);
  return generateMetadataFromSEO(seoData, fallbackTitle, fallbackDescription);
}
