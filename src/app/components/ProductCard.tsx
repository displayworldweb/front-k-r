// src/components/ProductCard.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ColorOption, Product } from "../types/types";

interface ProductCardProps {
  product: Product;
  isTablet: boolean;
  isMobile: boolean;
  isNarrowMobile: boolean;
}

// Функция для формирования ссылки на товар в зависимости от категории
const generateProductHref = (product: Product): string => {
  // Если есть явный productType и categorySlug - используем их
  if (product.productType && product.categorySlug) {
    return `/${product.productType}/${product.categorySlug}/${product.slug}`;
  }

  // Если это памятник
  const monumentCategories = [
    // Русские названия
    'Одиночные', 'Двойные', 'Эксклюзивные', 'Недорогие', 'В виде креста', 'В виде сердца', 
    'Составные', 'Европейские', 'Художественная резка', 'В виде деревьев', 'Мемориальные комплексы', 'Бюджетные',
    // Полные русские названия из админки
    'Одиночные памятники', 'Двойные памятники', 'Недорогие памятники', 'Памятники в виде креста', 
    'Памятники в виде сердца', 'Составные памятники', 'Европейские памятники', 'Художественная резка',
    'Памятники в виде деревьев', 'Мемориальные комплексы', 'Эксклюзивные памятники',
    // Английские ключи (которые сохраняются в БД)
    'single', 'double', 'exclusive', 'cheap', 'cross', 'heart', 'composite', 'europe', 
    'artistic', 'tree', 'complex'
  ];
  
  if (monumentCategories.includes(product.category)) {
    // Маппим названия категорий в URL slugs
    const categoryMap: Record<string, string> = {
      // Короткие русские названия
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
      // Полные русские названия из админки
      'Одиночные памятники': 'single',
      'Двойные памятники': 'double',
      'Недорогие памятники': 'cheap',
      'Памятники в виде креста': 'cross',
      'Памятники в виде сердца': 'heart',
      'Составные памятники': 'composite',
      'Европейские памятники': 'europe',
      'Памятники в виде деревьев': 'tree',
      'Эксклюзивные памятники': 'exclusive',
      // Английские ключи (те что приходят из БД)
      'single': 'single',
      'double': 'double',
      'exclusive': 'exclusive',
      'cheap': 'cheap',
      'cross': 'cross',
      'heart': 'heart',
      'composite': 'composite',
      'europe': 'europe',
      'artistic': 'artistic',
      'tree': 'tree',
      'complex': 'complex',
    };
    const categorySlug = categoryMap[product.category] || 'single';
    return `/monuments/${categorySlug}/${product.slug}`;
  }

  // Если это ограда
  if (['Гранитные ограды', 'С полимерным покрытием', 'Металлические ограды'].includes(product.category)) {
    const categoryMap: Record<string, string> = {
      'Гранитные ограды': 'granite',
      'С полимерным покрытием': 'polymer',
      'Металлические ограды': 'metal',
    };
    const categorySlug = categoryMap[product.category] || 'granite';
    return `/fences/${categorySlug}/${product.slug}`;
  } 

  // Если это аксессуар
  if (['Вазы', 'Лампады', 'Скульптуры', 'Рамки', 'Изделия из бронзы', 'Таблички'].includes(product.category)) {
    const categoryMap: Record<string, string> = {
      'Вазы': 'vases',
      'Лампады': 'lamps',
      'Скульптуры': 'sculptures',
      'Рамки': 'frames',
      'Изделия из бронзы': 'bronze',
      'Таблички': 'plates',
    };
    const categorySlug = categoryMap[product.category] || 'vases';
    return `/accessories/${categorySlug}/${product.slug}`;
  }

  // Если это ландшафт
  if (['Столы и скамейки', 'Щебень декоративный', 'Щебень', 'Металлические элементы'].includes(product.category)) {
    const categoryMap: Record<string, string> = {
      'Столы и скамейки': 'benches',
      'Щебень декоративный': 'gravel',
      'Щебень': 'gravel',
      'Металлические элементы': 'metal-elements',
    };
    const categorySlug = categoryMap[product.category] || 'gravel';
    return `/landscape/${categorySlug}/${product.slug}`;
  }

  // Fallback
  console.log('❌ No URL generated for product:', product.name, 'category:', product.category);
  return '';
};

const ProductCard = ({
  product,
  isTablet,
  isMobile,
  isNarrowMobile,
}: ProductCardProps) => {
  const [hoveredColorIndex, setHoveredColorIndex] = useState(0);
  const [showIndicators, setShowIndicators] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); 
  const imageRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Инициализация состояния из localStorage используя slug
    if (product.slug) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      // Проверяем как новый формат (slug), так и старый (ID)
      const isFavoriteBySlug = favorites.includes(product.slug);
      const isFavoriteById = favorites.includes(product.id);
      setIsFavorite(isFavoriteBySlug || isFavoriteById);
    }
  }, [product.slug, product.id]);

  // Инициализация дефолтного цвета на планшете
  useEffect(() => {
    setSelectedColorIndex(0);
  }, [product.id]);

  // Пока не на клиенте — рендерим "нейтральную" версию
  if (!isClient) {
    return (
      <div className="relative bg-gray-200 animate-pulse">Загрузка...</div>
    );
  }

  // Проверяем, существуют ли цвета и есть ли в них хотя бы один элемент
  const productColors: ColorOption[] = (() => {
    if (Array.isArray(product.colors)) {
      return product.colors;
    }
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse colors JSON:', product.colors);
        return [];
      }
    }
    return [];
  })();

  const hasColors = productColors.length > 0;

  // expandedColors = массив цветов (первый всегда дефолт из БД)
  const expandedColors: ColorOption[] = productColors;

  // Изображение для отображения
  const displayImage = isTablet
    ? (expandedColors[selectedColorIndex]?.image || product.image)
    : (expandedColors[hoveredColorIndex]?.image || product.image);

  // Получаем текущий выбранный/hovered цвет
  const currentColorIndex = isTablet ? selectedColorIndex : hoveredColorIndex;
  const currentColor = expandedColors[currentColorIndex];

  // Используем цену и скидку ТЕКУЩЕГО выбранного цвета (не дефолта!) с fallback на основные свойства продукта
  const currentPrice = currentColor?.price ?? product.price;
  
  // Для oldPrice и discount используем умную логику:
  // - Если нет цветов вообще - используем product.oldPrice
  // - Если есть цвета, но у текущего цвета нет oldPrice И это эксклюзивный памятник - НЕ используем fallback
  // - Если есть цвета, но у текущего цвета нет oldPrice И это НЕ эксклюзивный памятник - используем fallback на product.oldPrice
  const isExclusiveMonument = product.category === 'Эксклюзивные' || product.category === 'exclusive';
  
  let currentOldPrice: number | null | undefined;
  let currentDiscount: number | null | undefined;
  
  if (!hasColors) {
    // Нет цветов - используем основные свойства продукта
    currentOldPrice = product.oldPrice;
    currentDiscount = product.discount;
  } else if (currentColor?.oldPrice !== null && currentColor?.oldPrice !== undefined) {
    // У цвета есть собственная старая цена
    currentOldPrice = currentColor.oldPrice;
    currentDiscount = currentColor.discount;
  } else if (isExclusiveMonument) {
    // Эксклюзивный памятник без скидки у цвета - НЕ показываем скидку
    currentOldPrice = null;
    currentDiscount = null;
  } else {
    // Обычный памятник без скидки у цвета - используем скидку продукта
    currentOldPrice = product.oldPrice;
    currentDiscount = product.discount;
  }

  // Временное логирование для отладки
  if (product.name.includes("О-22") || product.name.includes("О-25")) {
    console.log("Product debug:", {
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      discount: product.discount,
      currentPrice,
      currentOldPrice,
      currentDiscount,
      hasColors,
      currentColor
    });
  }

  // Функция для отображения цены
  const formatPriceDisplay = (price: number | null | undefined, description?: string | null): string | null => {
    // Если есть описание с текстовой ценой (для новых категорий памятников)
    if (description && (description.includes('цена по запросу') || description.includes('под заказ'))) {
      return 'цена по запросу';
    }
    
    // Если цена равна 0, null или undefined, показываем "цена по запросу"
    if (!price || price === 0) {
      return 'цена по запросу';
    }
    
    return null; // Используем обычную логику отображения цены
  };

  // Проверяем, нужно ли показать специальный текст цены
  const specialPrice = formatPriceDisplay(currentPrice, product.description);
  const shouldUseSpecialPrice = specialPrice !== null;

  // Рассчитываем скидку автоматически, если она не задана явно
  const calculateDiscount = (price: number | null | undefined, oldPrice: number | null | undefined): number | null => {
    if (price && oldPrice && oldPrice > price) {
      return Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    return null;
  };

  // Есть ли скидка на текущем выбранном/наведенном цвете
  const hasDiscount = (() => {
    // Если нет цветов вообще, проверяем скидку основного товара
    if (!hasColors) {
      // Сначала проверяем явно заданную скидку
      if (product.discount !== null && product.discount !== undefined && Number(product.discount) > 0) {
        return true;
      }
      // Если явной скидки нет, рассчитываем из цен
      const calculatedDiscount = calculateDiscount(product.price, product.oldPrice);
      return calculatedDiscount !== null && calculatedDiscount > 0;
    }
    
    // Если есть цвета, проверяем скидку у конкретного цвета
    if (hasColors && currentColor) {
      // Сначала проверяем явно заданную скидку цвета
      const colorOriginalDiscount = currentColor.discount;
      if (colorOriginalDiscount !== null && colorOriginalDiscount !== undefined && 
          Number(colorOriginalDiscount) > 0) {
        return true;
      }
      
      // Если явной скидки у цвета нет, рассчитываем из цен цвета
      const calculatedColorDiscount = calculateDiscount(currentColor.price, currentColor.oldPrice);
      if (calculatedColorDiscount !== null && calculatedColorDiscount > 0) {
        return true;
      }
      
      // Для эксклюзивных памятников НЕ используем fallback к основному товару
      if (isExclusiveMonument) {
        return false;
      }
      
      // Для обычных памятников проверяем скидку основного товара как fallback
      // Сначала проверяем явно заданную скидку основного товара
      if (product.discount !== null && product.discount !== undefined && Number(product.discount) > 0) {
        return true;
      }
      
      // Если явной скидки нет, рассчитываем из цен основного товара
      const calculatedProductDiscount = calculateDiscount(product.price, product.oldPrice);
      if (calculatedProductDiscount !== null && calculatedProductDiscount > 0) {
        return true;
      }
    }
    
    return false;
  })();

  // Обработчик свайпа по изображению (адаптирован из вашего кода)
  const handleTouchStartImage = (e: React.TouchEvent) => {
    if (isTablet) {
      const startX = e.touches[0].clientX;
      const startY = e.touches[0].clientY;
      const onTouchMoveImg = (e: TouchEvent) => {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;
        e.preventDefault();
      };
      const onTouchEndImg = (e: TouchEvent) => {
        document.removeEventListener("touchmove", onTouchMoveImg);
        document.removeEventListener("touchend", onTouchEndImg);
        const deltaX = e.changedTouches[0].clientX - startX;
        if (Math.abs(deltaX) > 50) {
          const direction = deltaX > 0 ? -1 : 1;
          const newIndex =
            (selectedColorIndex + direction + expandedColors.length) %
            expandedColors.length;
          setSelectedColorIndex(newIndex);
        }
      };
      document.addEventListener("touchmove", onTouchMoveImg);
      document.addEventListener("touchend", onTouchEndImg);
    } else {
      const startX = e.touches[0].clientX;
      const onTouchEndDesktop = (e: TouchEvent) => {
        document.removeEventListener("touchend", onTouchEndDesktop);
        const deltaX = e.changedTouches[0].clientX - startX;
        if (Math.abs(deltaX) > 50) {
          const direction = deltaX > 0 ? -1 : 1;
          const newIndex = Math.max(
            0,
            Math.min(expandedColors.length - 1, hoveredColorIndex + direction)
          );
          setHoveredColorIndex(newIndex);
          setShowIndicators(true);
        }
      };
      document.addEventListener("touchend", onTouchEndDesktop);
    }
  };

  // Обработчик движения мыши для расчета сегмента
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || expandedColors.length === 1) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    setShowIndicators(true);
    const indicatorStart = 0.1 * width;
    const indicatorEnd = 0.9 * width;
    const indicatorWidth = indicatorEnd - indicatorStart;
    const totalSegments = expandedColors.length;
    let newIndex;
    if (x < indicatorStart) {
      newIndex = 0;
    } else if (x > indicatorEnd) {
      newIndex = totalSegments - 1;
    } else {
      const ratio = (x - indicatorStart) / indicatorWidth;
      newIndex = Math.floor(ratio * totalSegments);
    }
    if (newIndex !== hoveredColorIndex) {
      setHoveredColorIndex(newIndex);
    }
  };

  // Обработчик клика на звезду (избранное)
  const toggleFavorite = () => {
    if (!product.slug) {
      console.warn('Товар не имеет slug, нельзя добавить в избранное');
      return;
    }

    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite);

    // Получаем текущие избранные и очищаем от старых числовых ID
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Фильтруем только строки (slug'и), удаляя числовые ID
    favorites = favorites.filter((item: any) => typeof item === 'string');
    
    console.log('toggleFavorite:', {
      productSlug: product.slug,
      productName: product.name,
      newIsFavorite,
      currentFavorites: favorites
    });

    if (newIsFavorite) {
      // Добавляем в избранное
      if (!favorites.includes(product.slug)) {
        favorites.push(product.slug);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log('Добавлен в избранное:', product.slug);
        console.log('Новый список избранного:', favorites);
      }
    } else {
      // Удаляем из избранного (убираем и по slug, и по старому ID на всякий случай)
      const newFavorites = favorites.filter((item: any) => 
        item !== product.slug && item !== product.id
      );
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      console.log('Удалён из избранного:', product.slug);
      console.log('Новый список избранного:', newFavorites);
    }

    window.dispatchEvent(new Event('favoritesChanged'));
  };

  return (
    <div
      className={`relative bg-white shadow-sm overflow-hidden group flex-shrink-0 h-full ${isTablet ? "basis-[calc(100%_/_3)]" : "basis-[calc(100%_/_4)]"
        }`}
    >
      {/* Бейдж скидки */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-20 bg-[#cd5554] text-white text-xs font-bold px-2.5 py-0.75 rounded-xl">
          Сегодня -{(() => {
            // Пытаемся взять явную скидку
            if (hasColors && currentColor && currentColor.discount && Number(currentColor.discount) > 0) {
              return Math.round(Number(currentColor.discount));
            }
            if (product.discount && Number(product.discount) > 0) {
              return Math.round(Number(product.discount));
            }
            // Если явной скидки нет, рассчитываем
            if (hasColors && currentColor) {
              const calculated = calculateDiscount(currentColor.price, currentColor.oldPrice);
              if (calculated && calculated > 0) return Math.round(calculated);
            }
            const calculated = calculateDiscount(currentPrice, currentOldPrice);
            return Math.round(calculated || 0);
          })()}%
        </div>
      )}
      
      {/* Бейдж ХИТ */}
      {(() => {
        // Для эксклюзивных памятников показываем HIT только если у выбранного цвета hit = true
        if (isExclusiveMonument && hasColors && currentColor) {
          return currentColor.hit === true;
        }
        // Для остальных памятников используем старую логику
        return product.hit === true;
      })() && (
        <div className={`absolute left-2 z-20 bg-gray-600 text-white text-xs font-bold px-2.5 py-0.75 rounded-xl ${
          hasDiscount ? 'top-12' : 'top-2'
        }`}>
          ХИТ
        </div>
      )}
      
      {/* Звезда (избранное) */}
      <div
        className={`absolute top-2 right-2 z-10 text-2xl hover:text-[#2c3a54] transition cursor-pointer ${isFavorite ? "text-[#2c3a54]" : "text-gray-400"
          }`}
        onClick={toggleFavorite}
      >
        ★
      </div>
      {/* Изображение товара */}
      <div
        className="relative w-full h-64 overflow-hidden cursor-pointer"
        ref={imageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredColorIndex(0);
          setShowIndicators(false);
        }}
        onTouchStart={handleTouchStartImage}
      >
        <Link href={generateProductHref(product)}>
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        </Link>
        {/* Индикаторы цветов для десктопа */}
        {!isTablet && hasColors && (
          <div
            className={`absolute bottom-3 left-[10%] right-[10%] flex space-x-0.5 transition-all duration-300 z-10 ${showIndicators ? "opacity-100" : "opacity-0"
              }`}
          >
            {expandedColors.map((color, index) => (
              <button
                key={index}
                className={`w-6 h-1 rounded-full transition-all duration-300 flex-1 ${index === hoveredColorIndex
                  ? "opacity-100 bg-[#2c3a54]"
                  : "opacity-0 bg-transparent"
                  }`}
              />
            ))}
          </div>
        )}
        {isTablet && hasColors && expandedColors.length > 1 && (
          <div className="absolute bottom-0 right-3 flex flex-col items-end z-10">
            <div className="bg-gray-300 h-2 rounded-full px-1.5 flex space-x-1 justify-end">
              {expandedColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColorIndex(index)}
                  className={`w-[5px] h-[5px] rounded-full self-center bg-white transition-all duration-200 ${index === selectedColorIndex
                    ? "ring-1 ring-[#2c3a54]"
                    : "opacity-70"
                    }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Нижняя часть карточки */}
      <div className="p-3 flex flex-col h-[calc(100%-256px)]">
        {/* Title */}
        <h3
          className={`font-bold text-gray-800 mb-1 ${isTablet ? "text-base" : "text-lg"
            }`}
        >
          {product.name}
        </h3>
        {/* Высота */}
        {product.height ? (
          <p className={`text-sm text-gray-600 ${isTablet ? "mb-4" : "mb-3"}`}>
            Общая высота: {product.height}
          </p>
        ) : null}
        {/* Блок с ценой и кнопкой: flex-row на десктопе (цена слева, кнопка справа), на мобиле - col */}
        <div className="flex-1 flex flex-col xl:flex-row justify-between">
          {/* Цены в одну строку */}
          <div
            className={`flex items-center xl:self-end xl:flex-col xl:items-start ${isNarrowMobile ? "flex-col gap-0 items-start" : "gap-2"
              }`}
          >
            {/* Показываем цену с учетом специальных случаев */}
            {shouldUseSpecialPrice ? (
              <span className="text-xl font-bold text-[#2c3a54]">
                {specialPrice}
              </span>
            ) : product.textPrice ? (
              <span className="text-xl font-bold text-[#2c3a54]">
                {product.textPrice}
              </span>
            ) : currentPrice !== undefined && currentPrice !== null ? (
              (() => {
                // Проверяем есть ли скидка (как в эксклюзивных памятниках)
                const hasCurrentDiscount = (hasColors && currentColor?.discount && Number(currentColor.discount) > 0) ||
                                           (!hasColors && product.discount && Number(product.discount) > 0) ||
                                           (currentOldPrice && Number(currentOldPrice) > Number(currentPrice));
                
                return hasCurrentDiscount ? (
                  <>
                    <span className="font-bold text-xl text-[#cd5554]">
                      {product.category === 'Составные' ? 'от ' : ''}{currentPrice} руб.{(product.category === 'Металлические ограды' || product.category === 'С полимерным покрытием') ? ' м.п.' : ''}
                    </span>
                    {currentOldPrice && Number(currentOldPrice) > 0 && (
                      <span className="text-[12px] text-gray-500 line-through">
                        {currentOldPrice} руб.{(product.category === 'Металлические ограды' || product.category === 'С полимерным покрытием') ? ' м.п.' : ''}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xl font-bold text-[#2c3a54]">
                    {product.category === 'Составные' ? 'от ' : ''}{currentPrice} руб.{(product.category === 'Металлические ограды' || product.category === 'С полимерным покрытием') ? ' м.п.' : ''}
                  </span>
                );
              })()
            ) : null}
          </div>

          {/* Кнопка "Подробнее" — только если tablet, но не mobile */}
          {!isMobile && (
            <Link href={generateProductHref(product)}
              className="w-max xl:self-end mt-2 py-[9px] px-[15px] bg-white border border-[#2c3a54] text-[#2c3a54] rounded-full font-bold hover:bg-[#2c3a54] hover:text-white transition whitespace-nowrap text-center"
            >
              Подробнее
            </Link>
          )}
          {/* На мобильном (isMobile) кнопка не отображается */}
        </div>
      </div>
    </div >
  );
};

export default ProductCard;
