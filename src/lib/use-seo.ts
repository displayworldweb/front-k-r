/**
 * Хук для загрузки и использования SEO метаданных на фронтенде
 * Используется для вставки SEO тегов в <head> страницы
 */

import { useEffect } from 'react';

interface PageSEOData {
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  ogImage?: string;
}

/**
 * Хук для установки SEO метаданных страницы
 * @param pageSlug - Slug страницы
 * @param fallback - Fallback данные если ничего не найдено
 */
export function useSEO(pageSlug: string, fallback?: Partial<PageSEOData>) {
  useEffect(() => {
    // Загружаем SEO данные
    fetch(`/api/page-seo/by-slug/${pageSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          updateSEOTags(data.data);
        } else if (fallback) {
          updateSEOTags(fallback as PageSEOData);
        }
      })
      .catch(err => {
        console.error('Failed to load SEO data:', err);
        if (fallback) {
          updateSEOTags(fallback as PageSEOData);
        }
      });
  }, [pageSlug, fallback]);
}

/**
 * Обновляет SEO теги в <head>
 */
function updateSEOTags(seo: PageSEOData) {
  // Title
  document.title = seo.seoTitle;
  
  // Description
  updateMetaTag('description', seo.seoDescription);

  // Keywords
  if (seo.seoKeywords) {
    updateMetaTag('keywords', seo.seoKeywords);
  }

  // Open Graph для социальных сетей
  updateMetaTag('og:title', seo.seoTitle, 'property');
  updateMetaTag('og:description', seo.seoDescription, 'property');
  if (seo.ogImage) {
    updateMetaTag('og:image', seo.ogImage, 'property');
  }
}

/**
 * Обновляет или создает meta тег
 */
function updateMetaTag(
  name: string,
  content: string,
  type: 'name' | 'property' = 'name'
) {
  let tag = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(type, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export default useSEO;
