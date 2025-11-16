/**
 * Утилита для загрузки SEO метаданных отдельных сущностей (blogs, campaigns, памятники и т.д.)
 * Используется для generateMetadata в динамических страницах
 */

import { Metadata } from 'next';

export interface EntitySEOData {
  id?: number;
  slug: string;
  title?: string;
  name?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  description?: string;
  featuredImage?: string;
  image?: string;
}

/**
 * Загружает SEO данные блога по slug
 */
export async function getBlogSEOData(slug: string): Promise<EntitySEOData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k-r.by/api'}/blogs/by-slug/${slug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Blog SEO данные не найдены для ${slug}`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(`Ошибка загрузки SEO данных блога ${slug}:`, error);
    return null;
  }
}

/**
 * Загружает SEO данные кампании по slug
 */
export async function getCampaignSEOData(slug: string): Promise<EntitySEOData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k-r.by/api'}/campaigns/by-slug/${slug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Campaign SEO данные не найдены для ${slug}`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(`Ошибка загрузки SEO данных кампании ${slug}:`, error);
    return null;
  }
}

/**
 * Загружает SEO данные памятника по категории и slug
 */
export async function getMonumentSEOData(
  category: string,
  slug: string
): Promise<EntitySEOData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k-r.by/api'}/monuments/${category}/${slug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Monument SEO данные не найдены для ${category}/${slug}`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(`Ошибка загрузки SEO данных памятника ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Загружает SEO данные ограды по категории и slug
 */
export async function getFenceSEOData(
  category: string,
  slug: string
): Promise<EntitySEOData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k-r.by/api'}/fences/${category}/${slug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Fence SEO данные не найдены для ${category}/${slug}`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(`Ошибка загрузки SEO данных ограды ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Генерирует Metadata для сущности из SEO данных
 */
export function generateMetadataFromEntity(
  entity: EntitySEOData | null,
  fallbackTitle?: string,
  fallbackDescription?: string
): Metadata {
  if (!entity) {
    return {
      title: fallbackTitle || 'Каменная Роза',
      description: fallbackDescription || 'Производство памятников из гранита',
    };
  }

  const title = entity.title || entity.name;
  const description = entity.description;
  const image = entity.ogImage || entity.featuredImage || entity.image;

  const metadata: Metadata = {
    title: entity.seoTitle || title || fallbackTitle || 'Каменная Роза',
    description: entity.seoDescription || description || fallbackDescription || 'Производство памятников из гранита',
    keywords: entity.seoKeywords,
  };

  // Open Graph
  if (image) {
    metadata.openGraph = {
      title: entity.seoTitle || title,
      description: entity.seoDescription || description,
      images: [
        {
          url: image,
          width: entity.ogImageWidth || 1200,
          height: entity.ogImageHeight || 630,
          alt: title,
        },
      ],
      type: 'article',
    };
  } else {
    metadata.openGraph = {
      title: title,
      description: description || entity.seoDescription,
      type: 'article',
    };
  }

  return metadata;
}

/**
 * Комбинированная функция для блогов: загружает данные и генерирует Metadata
 */
export async function getMetadataForBlog(
  slug: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const blogData = await getBlogSEOData(slug);
  return generateMetadataFromEntity(blogData, fallbackTitle, fallbackDescription);
}

/**
 * Комбинированная функция для кампаний: загружает данные и генерирует Metadata
 */
export async function getMetadataForCampaign(
  slug: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const campaignData = await getCampaignSEOData(slug);
  return generateMetadataFromEntity(campaignData, fallbackTitle, fallbackDescription);
}

/**
 * Комбинированная функция для памятников: загружает данные и генерирует Metadata
 */
export async function getMetadataForMonument(
  category: string,
  slug: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const monumentData = await getMonumentSEOData(category, slug);
  return generateMetadataFromEntity(monumentData, fallbackTitle, fallbackDescription);
}

/**
 * Загружает SEO данные аксессуара по категории и slug
 */
export async function getAccessorySEOData(
  category: string,
  slug: string
): Promise<EntitySEOData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k-r.by/api'}/accessories/${category}/${slug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Accessory SEO данные не найдены для ${category}/${slug}`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(`Ошибка загрузки SEO данных аксессуара ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Загружает SEO данные ландшафтного элемента по категории и slug
 */
export async function getLandscapeSEOData(
  category: string,
  slug: string
): Promise<EntitySEOData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k-r.by/api'}/landscape/${category}/${slug}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Landscape SEO данные не найдены для ${category}/${slug}`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(`Ошибка загрузки SEO данных ландшафта ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Комбинированная функция для оград: загружает данные и генерирует Metadata
 */
export async function getMetadataForFence(
  category: string,
  slug: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const fenceData = await getFenceSEOData(category, slug);
  return generateMetadataFromEntity(fenceData, fallbackTitle, fallbackDescription);
}

/**
 * Комбинированная функция для аксессуаров: загружает данные и генерирует Metadata
 */
export async function getMetadataForAccessory(
  category: string,
  slug: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const accessoryData = await getAccessorySEOData(category, slug);
  return generateMetadataFromEntity(accessoryData, fallbackTitle, fallbackDescription);
}

/**
 * Комбинированная функция для ландшафта: загружает данные и генерирует Metadata
 */
export async function getMetadataForLandscape(
  category: string,
  slug: string,
  fallbackTitle?: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const landscapeData = await getLandscapeSEOData(category, slug);
  return generateMetadataFromEntity(landscapeData, fallbackTitle, fallbackDescription);
}
