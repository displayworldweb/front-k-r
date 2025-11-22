import type { Metadata } from "next";

/**
 * Open Graph метаданные для социальных сетей
 */

export function generateOpenGraphMetadata(
  title: string,
  description: string,
  imageUrl: string = "https://k-r.by/og-image.jpg",
  pageUrl: string = "https://k-r.by",
  type: "website" | "article" = "website"
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "Каменная Роза",
      locale: "ru_RU",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@KamennayaRoza",
    },
  };
}

/**
 * Дополнительные Open Graph метаданные для статей
 */
export function generateArticleMetadata(
  title: string,
  description: string,
  imageUrl: string,
  pageUrl: string,
  publishedTime?: string,
  modifiedTime?: string,
  author?: string
): Metadata {
  const metadata = generateOpenGraphMetadata(title, description, imageUrl, pageUrl, "article");
  
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
    },
  };
}

/**
 * Дополнительные Open Graph метаданные для продуктов
 */
export function generateProductMetadata(
  title: string,
  description: string,
  imageUrl: string,
  pageUrl: string,
  price?: number,
  currency?: string
): Metadata {
  const metadata = generateOpenGraphMetadata(title, description, imageUrl, pageUrl, "article");

  return {
    ...metadata,
  };
}
