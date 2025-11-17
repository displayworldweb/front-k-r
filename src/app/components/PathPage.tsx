'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Импортируем массивы товаров по категориям
import { productsMonuments } from '../mock/products';
import { productsFences } from '../mock/products';
import { productsAccessories } from '../mock/products';
import { productsLandscape } from '../mock/products';
import { apiClient } from '@/lib/api-client';
import { Product } from '../types/types';


// Маппинг пути → название страницы
const pageTitles: Record<string, string> = {
  '/policy': 'Политика конфиденциальности',
  '/granite': 'Виды гранита',
  '/sales': 'Акции',
  '/works': 'Готовые работы',
  '/payment': 'Оплата и доставка',
  '/contacts': 'Контакты',
  '/services': 'Услуги',
  '/monuments': 'Памятники',
  '/fences': 'Ограждения',
  '/landscape': 'Благоустройство',
  '/design': 'Дизайн',
  '/blog': 'Блог',
  '/accessories': 'Аксессуары',
  '/monuments/single': 'Одиночные',
  '/monuments/double': 'Двойные',
  '/monuments/exclusive': 'Эксклюзивные',
  '/monuments/cheap': 'Недорогие',
  '/monuments/cross': 'В виде креста',
  '/monuments/heart': 'В виде сердца',
  '/monuments/composite': 'Составные',
  '/monuments/europe': 'Европейские',
  '/monuments/artistic': 'Художественная резка',
  '/monuments/tree': 'В виде деревьев',
  '/monuments/complex': 'Мемориальные комплексы',
  '/fences/granite': 'Гранитные ограды',
  '/fences/polymer': 'С полимерным покрытием',
  '/fences/metal': 'Металлические ограды',
  '/accessories/vases': 'Вазы',
  '/accessories/lamps': 'Лампы',
  '/accessories/sculptures': 'Скульптуры',
  '/accessories/frames': 'Рамки',
  '/accessories/bronze': 'Изделия из бронзы',
  '/accessories/plates': 'Надгробные плиты',
  '/accessories/tables': 'Гранитные таблички',
  '/landscape/graves': 'Благоустройство могил',
  '/landscape/foundation': 'Фундамент для памятников',
  '/landscape/tiles': 'Укладка плитки',
  '/landscape/benches': 'Столы и скамейки',
  '/landscape/gravel': 'Щебень',
  '/landscape/lawn': 'Искусственный газон',
  '/services/monument-installation': 'Установка памятников',
  '/services/fence-installation': 'Установка оград',
  '/services/monument-production': 'Изготовление памятников',
  '/services/monument-dismantle': 'Демонтаж памятников',
  '/services/3d': '3D-моделирование',
  '/design/epitaphs': 'Эпитафии',
  '/design/portrait': 'Гравировка портрета',
  '/design/medallions': 'Медальоны на памятник',
  '/design/text-engraving': 'Гравировка текста',
  '/why/granite': 'Работаем более чем с 30 породами гранита',
  '/why/contract': 'Работаем строго по договору',
  '/why/payment': 'Предоставляем разные варианты оплаты',
  '/why/report': 'Предоставляем фото и видео отчёт',
  '/why/quality': 'Гарантируем качество работ',
  '/why/experience': 'Опыт работы более 30 лет',
};

// Маппинг подкатегорий → основная категория
const subcategoryToCategory: Record<string, string> = {
  '/monuments/single': '/monuments',
  '/monuments/double': '/monuments',
  '/monuments/exclusive': '/monuments',
  '/monuments/cheap': '/monuments',
  '/monuments/cross': '/monuments',
  '/monuments/heart': '/monuments',
  '/monuments/composite': '/monuments',
  '/monuments/europe': '/monuments',
  '/monuments/artistic': '/monuments',
  '/monuments/tree': '/monuments',
  '/monuments/complex': '/monuments',
  '/monuments/glass': '/monuments',
  '/fences/granite': '/fences',
  '/fences/forged': '/fences',
  '/fences/metal': '/fences',
  '/accessories/vases': '/accessories',
  '/accessories/lamps': '/accessories',
  '/accessories/sculptures': '/accessories',
  '/accessories/frames': '/accessories',
  '/accessories/bronze': '/accessories',
  '/accessories/plates': '/accessories',
  '/accessories/tables': '/accessories',
  '/landscape/benches': '/landscape',
  '/landscape/graves': '/landscape',
  '/landscape/foundation': '/landscape',
  '/landscape/tiles': '/landscape',
  '/landscape/gravel': '/landscape',
  '/landscape/lawn': '/landscape',
  '/services/monument-installation': '/services',
  '/services/fence-installation': '/services',
  '/services/monument-production': '/services',
  '/services/monument-dismantle': '/services',
  '/services/3d': '/services',
  '/design/epitaphs': '/design',
  '/design/portrait': '/design',
  '/design/medallions': '/design',
  '/design/text-engraving': '/design',
};

// Маппинг основных категорий → название категории
const categoryTitles: Record<string, string> = {
  '/monuments': 'Памятники',
  '/fences': 'Ограждения',
  '/accessories': 'Аксессуары',
  '/landscape': 'Благоустройство',
  '/services': 'Услуги',
  '/design': 'Оформление памятников',
};

// Маппинг подкатегории → соответствующий массив товаров
const subcategoryToProductArray: Record<string, Product[]> = {
  '/monuments/single': productsMonuments,
  '/monuments/double': productsMonuments,
  '/monuments/exclusive': productsMonuments,
  '/monuments/cheap': productsMonuments,
  '/monuments/cross': productsMonuments,
  '/monuments/heart': productsMonuments,
  '/monuments/composite': productsMonuments,
  '/monuments/europe': productsMonuments,
  '/monuments/artistic': productsMonuments,
  '/monuments/tree': productsMonuments,
  '/monuments/complex': productsMonuments,
  '/monuments/glass': productsMonuments,
  '/fences/granite': productsFences,
  '/fences/forged': productsFences,
  '/fences/metal': productsFences,
  '/accessories/vases': productsAccessories,
  '/accessories/lamps': productsAccessories,
  '/accessories/sculptures': productsAccessories,
  '/accessories/frames': productsAccessories,
  '/accessories/bronze': productsAccessories,
  '/accessories/plates': productsAccessories,
  '/accessories/tables': productsAccessories,
  '/landscape/graves': productsLandscape,
  '/landscape/foundation': productsLandscape,
  '/landscape/tiles': productsLandscape,
  '/landscape/benches': productsLandscape,
  '/landscape/gravel': productsLandscape,
  '/landscape/lawn': productsLandscape,
};

export default function PathPage() {
  const pathname = usePathname();
  const [productName, setProductName] = useState<string | null>(null);

  // Проверяем, является ли путь подкатегорией
  const isSubcategory = Object.keys(subcategoryToCategory).some(sub => pathname.startsWith(sub + '/'));
  const isSubcategoryExact = subcategoryToCategory.hasOwnProperty(pathname);

  // Загружаем название товара по slug'у
  useEffect(() => {
    if (isSubcategory && !isSubcategoryExact) {
      const pathParts = pathname.split('/');
      const productSlugOrId = pathParts[pathParts.length - 1];
      const subcategoryPath = Object.keys(subcategoryToCategory).find(sub => pathname.startsWith(sub + '/'));
      
      if (subcategoryPath && productSlugOrId) {
        // Для оград используем API с slug'ом
        if (subcategoryPath.startsWith('/fences')) {
          apiClient.get(`/fences?slug=${productSlugOrId}`)
            .then(data => {
              if (data.data) {
                setProductName(data.data.name);
              }
            })
            .catch(() => setProductName(productSlugOrId));
        }
        // Для аксессуаров используем API с slug'ом
        else if (subcategoryPath.startsWith('/accessories')) {
          apiClient.get(`/accessories?slug=${productSlugOrId}`)
            .then(data => {
              if (data.success && data.data) {
                const item = Array.isArray(data.data) 
                  ? data.data.find((item: any) => item.slug === productSlugOrId)
                  : data.data;
                if (item) {
                  setProductName(item.name);
                }
              }
            })
            .catch(() => setProductName(productSlugOrId));
        }
        // Для landscape используем API с slug'ом
        else if (subcategoryPath.startsWith('/landscape')) {
          apiClient.get(`/landscape?slug=${productSlugOrId}`)
            .then(data => {
              if (data.success && data.data) {
                const item = Array.isArray(data.data) 
                  ? data.data.find((item: any) => item.slug === productSlugOrId)
                  : data.data;
                if (item) {
                  setProductName(item.name);
                }
              }
            })
            .catch(() => setProductName(productSlugOrId));
        }
        // Для памятников используем API с slug'ом
        else if (subcategoryPath.startsWith('/monuments')) {
          if (subcategoryPath === '/monuments/exclusive') {
            apiClient.get(`/monuments/exclusive/${productSlugOrId}`)
              .then(data => {
                if (data.data) {
                  setProductName(data.data.name);
                }
              })
              .catch(() => setProductName(productSlugOrId));
          } else {
            // Для остальных категорий памятников
            apiClient.get(`/monuments?slug=${productSlugOrId}`)
              .then(data => {
                if (data.success && data.data) {
                  const item = Array.isArray(data.data) 
                    ? data.data.find((item: any) => item.slug === productSlugOrId)
                    : data.data;
                  if (item) {
                    setProductName(item.name);
                  }
                }
              })
              .catch(() => setProductName(productSlugOrId));
          }
        } else {
          // Для остальных категорий ищем в mock'е по ID
          const productArray = subcategoryToProductArray[subcategoryPath];
          if (productArray) {
            const product = productArray.find(p => p.id.toString() === productSlugOrId);
            if (product) {
              setProductName(product.name);
            } else {
              setProductName(productSlugOrId);
            }
          } else {
            setProductName(productSlugOrId);
          }
        }
      }
    }
  }, [pathname, isSubcategory, isSubcategoryExact]);

  if (isSubcategoryExact) {
    // Это страница подкатегории (например, /monuments/single)
    const categoryName = categoryTitles[subcategoryToCategory[pathname]];
    const subcategoryName = pageTitles[pathname];

    return (
      <div className="mb-2.5">
        <ul className="flex items-center text-xs text-[#cbcbcb] space-x-2 font-semibold">
          <li>
            <Link href="/" className="text-[#2c3a54] hover:underline transition-colors">
              Главная
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={subcategoryToCategory[pathname]} className="text-[#2c3a54] hover:underline transition-colors">
              {categoryName}
            </Link>
          </li>
          <li>/</li>
          <li>{subcategoryName}</li>
        </ul>
      </div>
    );
  } else if (isSubcategory) {
    // Это страница продукта (например, /monuments/exclusive/eksklyuzivnyy-pamyatnik-k3)
    // Извлекаем путь подкатегории
    const subcategoryPath = Object.keys(subcategoryToCategory).find(sub => pathname.startsWith(sub + '/'));
    if (subcategoryPath) {
      const categoryName = categoryTitles[subcategoryToCategory[subcategoryPath]];
      const subcategoryName = pageTitles[subcategoryPath];

      return (
        <div className="mb-2.5">
          <ul className="flex items-center text-xs text-[#cbcbcb] space-x-2 font-semibold">
            <li>
              <Link href="/" className="text-[#2c3a54] hover:underline transition-colors">
                Главная
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={subcategoryToCategory[subcategoryPath]} className="text-[#2c3a54] hover:underline transition-colors">
                {categoryName}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={subcategoryPath} className="text-[#2c3a54] hover:underline transition-colors">
                {subcategoryName}
              </Link>
            </li>
            <li>/</li>
            <li>{productName || 'Загрузка...'}</li>
          </ul>
        </div>
      );
    }
  }

  // Для остальных страниц используем обычную логику
  const pageTitle = pageTitles[pathname] || 'Страница';

  return (
    <div className="mb-2.5">
      <ul className="flex items-center text-xs text-[#cbcbcb] space-x-2 font-semibold">
        <li>
          <Link href="/" className="text-[#2c3a54] hover:underline transition-colors">
            Главная
          </Link>
        </li>
        <li>/</li>
        <li>{pageTitle}</li>
      </ul>
    </div>
  );
}