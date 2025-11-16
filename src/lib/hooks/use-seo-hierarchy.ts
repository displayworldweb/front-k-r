import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api';

interface SeoTemplate {
  id: number;
  categoryKey: string;
  categoryName: string;
  entityType: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

interface EntitySeoData {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

/**
 * Применяет иерархию SEO:
 * 1. Если у сущности есть собственный SEO - используется он
 * 2. Если нет - используется SEO шаблона категории
 * 3. Если и шаблона нет - используется значение по умолчанию (название)
 */
export function useSeoHierarchy(
  entityData: EntitySeoData | null | undefined,
  template: SeoTemplate | null | undefined,
  fallbackTitle?: string,
  fallbackDescription?: string
) {
  const result = {
    title: entityData?.seoTitle || template?.seoTitle || fallbackTitle || 'StoneRose',
    description:
      entityData?.seoDescription || template?.seoDescription || fallbackDescription || '',
    keywords: entityData?.seoKeywords || template?.seoKeywords || '',
    ogImage:
      entityData?.ogImage || template?.ogImage || '/og-image.png',
  };

  useEffect(() => {
    // Обновляем meta теги
    updateMetaTags(result.title, result.description, result.keywords, result.ogImage);
  }, [result.title, result.description, result.keywords, result.ogImage]);

  return result;
}

/**
 * Получить шаблон SEO по типу сущности и ключу категории
 */
export async function fetchSeoTemplate(
  entityType: string,
  categoryKey: string
): Promise<SeoTemplate | null> {
  try {
    const response = await fetch(`${API_URL}/seo-hierarchy/${entityType}/${categoryKey}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.template || null;
  } catch (error) {
    console.error('Error fetching SEO template:', error);
    return null;
  }
}

/**
 * Получить все шаблоны для типа сущности
 */
export async function fetchSeoTemplatesByEntityType(entityType: string): Promise<SeoTemplate[]> {
  try {
    const response = await fetch(`${API_URL}/admin/seo-templates?entityType=${entityType}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching SEO templates:', error);
    return [];
  }
}

/**
 * Вспомогательная функция для обновления meta тегов
 */
function updateMetaTags(title: string, description: string, keywords: string, ogImage: string) {
  // Обновляем title
  document.title = title;

  // Обновляем meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);

  // Обновляем keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', keywords);

  // Обновляем OG Image
  let metaOgImage = document.querySelector('meta[property="og:image"]');
  if (!metaOgImage) {
    metaOgImage = document.createElement('meta');
    metaOgImage.setAttribute('property', 'og:image');
    document.head.appendChild(metaOgImage);
  }
  metaOgImage.setAttribute('content', ogImage);

  // Обновляем OG Title
  let metaOgTitle = document.querySelector('meta[property="og:title"]');
  if (!metaOgTitle) {
    metaOgTitle = document.createElement('meta');
    metaOgTitle.setAttribute('property', 'og:title');
    document.head.appendChild(metaOgTitle);
  }
  metaOgTitle.setAttribute('content', title);

  // Обновляем OG Description
  let metaOgDescription = document.querySelector('meta[property="og:description"]');
  if (!metaOgDescription) {
    metaOgDescription = document.createElement('meta');
    metaOgDescription.setAttribute('property', 'og:description');
    document.head.appendChild(metaOgDescription);
  }
  metaOgDescription.setAttribute('content', description);
}
