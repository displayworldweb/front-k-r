import { apiClient, API_ENDPOINTS } from "./api-client";
import { PageBlock } from "@/app/components/PageBlocksRenderer";

export interface PageDescription {
  id: number;
  pageSlug: string;
  pageTitle: string;
  blocks: PageBlock[];
  createdAt: string;
  updatedAt: string;
}

// Функция для получения описания страницы по slug
export async function getPageDescription(slug: string): Promise<PageDescription | null> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.pageDescriptions}/${slug}`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Ошибка получения описания для страницы ${slug}:`, error);
    return null;
  }
}

// Получить slug страницы для конкретной категории памятников
export function getPageSlugForCategory(category: string): string {
  const categoryMapping: { [key: string]: string } = {
    'odynochnyie': 'monuments-single',
    'dvoynyie': 'monuments-double', 
    'exclusive': 'monuments-exclusive',
    'nedorogie': 'monuments-cheap',
    'sostavnyie': 'monuments-composite',
    'v-vide-kresta': 'monuments-cross',
    'v-vide-serdcza': 'monuments-heart',
    'evropejskie': 'monuments-europe',
    'hudozhestvennaya-rezka': 'monuments-artistic',
    'v-vide-derevev': 'monuments-tree',
    'memorialnyie-kompleksyi': 'monuments-complex',
  };

  return categoryMapping[category] || `monuments-${category}`;
}