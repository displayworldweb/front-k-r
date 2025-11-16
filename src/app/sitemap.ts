import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://k-r.by';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api';

if (!process.env.NEXT_PUBLIC_SITE_URL || !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('⚠️ Missing environment variables for sitemap generation. Using defaults.');
}

// Статические страницы с приоритетами
const staticPages = [
  { url: '', priority: 1.0, changefreq: 'daily' as const },
  { url: '/monuments', priority: 0.9, changefreq: 'daily' as const },
  { url: '/fences', priority: 0.9, changefreq: 'daily' as const },
  { url: '/accessories', priority: 0.9, changefreq: 'daily' as const },
  { url: '/landscape', priority: 0.9, changefreq: 'daily' as const },
  { url: '/services', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/design', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/blog', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/works', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/sales', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/granite', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/contacts', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/payment', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/policy', priority: 0.3, changefreq: 'yearly' as const },
];

// Категории памятников
const monumentCategories = [
  'single', 'double', 'exclusive', 'cheap', 'cross', 'heart',
  'composite', 'europe', 'artistic', 'tree', 'complex'
];

// Категории оград
const fenceCategories = ['granite', 'metal', 'polymer'];

// Категории аксессуаров
const accessoryCategories = [
  'vases', 'lamps', 'sculptures', 'frames', 'bronze', 'plates', 'tables'
];

// Категории благоустройства
const landscapeCategories = [
  'graves', 'foundation', 'tiles', 'gravel', 'benches', 'lawn'
];

// Страницы услуг
const servicePages = [
  'monument-installation', 'fence-installation', 'monument-production',
  'monument-dismantle', '3d'
];

// Страницы дизайна
const designPages = ['epitaphs', 'portrait', 'medallions', 'text-engraving'];

async function fetchWithTimeout(url: string, timeout = 5000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Кешируем на 1 час
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Error fetching ${url}:`, error);
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Статические страницы
  const staticUrls: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: currentDate,
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));

  // Категории памятников
  const monumentCategoryUrls: MetadataRoute.Sitemap = monumentCategories.map(cat => ({
    url: `${BASE_URL}/monuments/${cat}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Категории оград
  const fenceCategoryUrls: MetadataRoute.Sitemap = fenceCategories.map(cat => ({
    url: `${BASE_URL}/fences/${cat}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Категории аксессуаров
  const accessoryCategoryUrls: MetadataRoute.Sitemap = accessoryCategories.map(cat => ({
    url: `${BASE_URL}/accessories/${cat}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Категории благоустройства
  const landscapeCategoryUrls: MetadataRoute.Sitemap = landscapeCategories.map(cat => ({
    url: `${BASE_URL}/landscape/${cat}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Страницы услуг
  const serviceUrls: MetadataRoute.Sitemap = servicePages.map(page => ({
    url: `${BASE_URL}/services/${page}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Страницы дизайна
  const designUrls: MetadataRoute.Sitemap = designPages.map(page => ({
    url: `${BASE_URL}/design/${page}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Динамические данные из API
  const dynamicUrls: MetadataRoute.Sitemap = [];

  try {
    // Получаем памятники
    const monumentsData = await fetchWithTimeout(`${API_URL}/monuments?limit=1000`);
    if (monumentsData?.success && monumentsData?.data) {
      const monumentUrls = monumentsData.data
        .filter((m: any) => m.slug)
        .map((monument: any) => {
          const categorySlug = getCategorySlug(monument.category);
          return {
            url: `${BASE_URL}/monuments/${categorySlug}/${monument.slug}`,
            lastModified: monument.updatedAt || currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          };
        });
      dynamicUrls.push(...monumentUrls);
    }

    // Получаем ограды
    const fencesData = await fetchWithTimeout(`${API_URL}/fences?limit=500`);
    if (fencesData?.success && fencesData?.data) {
      const fenceUrls = fencesData.data
        .filter((f: any) => f.slug)
        .map((fence: any) => {
          const categorySlug = getFenceCategorySlug(fence.category);
          return {
            url: `${BASE_URL}/fences/${categorySlug}/${fence.slug}`,
            lastModified: fence.updatedAt || currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          };
        });
      dynamicUrls.push(...fenceUrls);
    }

    // Получаем аксессуары
    const accessoriesData = await fetchWithTimeout(`${API_URL}/accessories?limit=500`);
    if (accessoriesData?.success && accessoriesData?.data) {
      const accessoryUrls = accessoriesData.data
        .filter((a: any) => a.slug)
        .map((accessory: any) => {
          const categorySlug = getAccessoryCategorySlug(accessory.category);
          return {
            url: `${BASE_URL}/accessories/${categorySlug}/${accessory.slug}`,
            lastModified: accessory.updatedAt || currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
          };
        });
      dynamicUrls.push(...accessoryUrls);
    }

    // Получаем товары для благоустройства
    const landscapeData = await fetchWithTimeout(`${API_URL}/landscape?limit=500`);
    if (landscapeData?.success && landscapeData?.data) {
      const landscapeUrls = landscapeData.data
        .filter((l: any) => l.slug)
        .map((item: any) => {
          const categorySlug = getLandscapeCategorySlug(item.category);
          return {
            url: `${BASE_URL}/landscape/${categorySlug}/${item.slug}`,
            lastModified: item.updatedAt || currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
          };
        });
      dynamicUrls.push(...landscapeUrls);
    }

    // Получаем блоги
    const blogsData = await fetchWithTimeout(`${API_URL}/blogs?limit=500`);
    if (blogsData?.success && blogsData?.data) {
      const blogUrls = blogsData.data
        .filter((b: any) => b.slug)
        .map((blog: any) => ({
          url: `${BASE_URL}/blog/${blog.slug}`,
          lastModified: blog.updatedAt || currentDate,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }));
      dynamicUrls.push(...blogUrls);
    }

    // Получаем акции
    const campaignsData = await fetchWithTimeout(`${API_URL}/campaigns?limit=100`);
    if (campaignsData?.success && campaignsData?.data) {
      const campaignUrls = campaignsData.data
        .filter((c: any) => c.slug && c.status === 'active')
        .map((campaign: any) => ({
          url: `${BASE_URL}/sales/${campaign.slug}`,
          lastModified: campaign.updatedAt || currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      dynamicUrls.push(...campaignUrls);
    }

  } catch (error) {
    console.error('Error generating dynamic sitemap URLs:', error);
  }

  return [
    ...staticUrls,
    ...monumentCategoryUrls,
    ...fenceCategoryUrls,
    ...accessoryCategoryUrls,
    ...landscapeCategoryUrls,
    ...serviceUrls,
    ...designUrls,
    ...dynamicUrls,
  ];
}

// Вспомогательные функции для маппинга категорий
function getCategorySlug(category: string): string {
  // Если категория уже в английском формате - возвращаем как есть
  if (category.length < 15 && !category.includes(' ')) {
    return category;
  }
  
  // Иначе маппируем с русского на английский
  const mapping: Record<string, string> = {
    'Одиночные': 'single',
    'Двойные': 'double',
    'Эксклюзивные': 'exclusive',
    'Недорогие': 'cheap',
    'В виде креста': 'cross',
    'В виде сердца': 'heart',
    'Составные': 'composite',
    'Европейские': 'europe',
    'Художественная резка': 'artistic',
    'В виде деревьев': 'tree',
    'Мемориальные комплексы': 'complex',
  };
  return mapping[category] || category;
}

function getFenceCategorySlug(category: string): string {
  // Если уже в английском формате - возвращаем как есть
  if (category.length < 15 && !category.includes(' ')) {
    return category;
  }
  
  const mapping: Record<string, string> = {
    'Гранитные': 'granite',
    'Металлические': 'metal',
    'С полимерным покрытием': 'polymer',
    'Гранитные ограды': 'granite',
    'Металлические ограды': 'metal',
    'Кованные ограды': 'forged',
  };
  return mapping[category] || 'granite';
}

function getAccessoryCategorySlug(category: string): string {
  // Если уже в английском формате - возвращаем как есть
  if (category.length < 15 && !category.includes(' ')) {
    return category;
  }
  
  const mapping: Record<string, string> = {
    'Вазы': 'vases',
    'Лампады': 'lamps',
    'Скульптуры': 'sculptures',
    'Рамки': 'frames',
    'Бронза': 'bronze',
    'Надгробные плиты': 'plates',
    'Гранитные таблички': 'tables',
    'Изделия из бронзы': 'bronze',
  };
  return mapping[category] || 'vases';
}

function getLandscapeCategorySlug(category: string): string {
  // Если уже в английском формате - возвращаем как есть
  if (category.length < 15 && !category.includes(' ')) {
    return category;
  }
  
  const mapping: Record<string, string> = {
    'Благоустройство могил': 'graves',
    'Фундамент для памятников': 'foundation',
    'Фундамент': 'foundation',
    'Укладка плитки': 'tiles',
    'Плитка': 'tiles',
    'Щебень': 'gravel',
    'Щебень декоративный': 'gravel',
    'Столы и скамейки': 'benches',
    'Искусственный газон': 'lawn',
    'Газон': 'lawn',
  };
  return mapping[category] || 'graves';
}
