// src/app/monuments/exclusive/[slug]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import PathPage from "../../../components/PathPage";
import SidebarCatalogMenu from "../../../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../../../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../../../components/ProductCard";
import ModalCommunication from "@/app/components/Modal/ModalCommunication";
import { graniteTypes } from "../../../mock/graniteTypes";
import Tooltip from "@/app/components/Tooltip";
import View360 from "@/app/components/View360";
import { ColorOption } from "@/app/types/types";
import { getMaterialData } from "@/lib/materials-mapping";
import { apiClient } from "@/lib/api-client";
import ProductWorksGallery from "@/app/components/ProductWorksGallery";

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  height?: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  category: string;
  image: string;
  colors: ColorOption[];
  options: { [key: string]: string };
  availability?: string;
  hit?: boolean;
  popular?: boolean;
}

// Статические характеристики для памятников
const STATIC_CHARACTERISTICS = {
  "Изготовление в других размерах": "Да",
  "Изготовление в другом цвете": "Возможно", 
  "Оформление": "Не входит в стоимость",
  "Хранение": "Бесплатно в течении 1 года",
  "Установка": "Не входит в стоимость",
};

const ExclusiveProductPage = () => {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [activeTab, setActiveTab] = useState<"characteristics" | "description" | "granite">(
    "characteristics"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({
    image: "",
    description: "",
    absoluteTop: 0,
    absoluteLeft: 0,
  });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const characteristicsContentRef = useRef<HTMLDivElement>(null);
  const colorScrollRef = useRef<HTMLDivElement>(null);
  const [isGraniteModalOpen, setIsGraniteModalOpen] = useState(false);
  const [currentGraniteSlide, setCurrentGraniteSlide] = useState(0);

  // Получение данных товара
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiClient.get(`/monuments/exclusive/${slug}`);
        const product = data.data;
        
        // Парсим JSON строки в объекты
        if (typeof product.colors === 'string') {
          try {
            product.colors = JSON.parse(product.colors);
          } catch (e) {
            product.colors = [];
          }
        }
        
        if (typeof product.options === 'string') {
          try {
            product.options = JSON.parse(product.options);
          } catch (e) {
            product.options = {};
          }
        }
        
        setProduct(product);
        console.log('Product loaded:', {
          id: product.id,
          name: product.name,
          image: product.image,
          colors: product.colors?.slice(0, 2)
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Проверка адаптивности
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Инициализация избранного
  useEffect(() => {
    if (product) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      // Проверяем как по slug, так и по старому id для совместимости
      const isFavoriteBySlug = favorites.includes(product.slug);
      const isFavoriteById = favorites.includes(product.id);
      setIsFavorite(isFavoriteBySlug || isFavoriteById);
      // Устанавливаем дефолтный цвет (первый в массиве)
      if (product.colors && product.colors.length > 0) {
        // Ищем цвет со скидкой или берем первый
        const colorWithDiscount = product.colors.find(color => color.discount && color.discount > 0);
        setSelectedColor(colorWithDiscount || product.colors[0]);
      }
    }
  }, [product]);

  // Закрытие тултипа при клике вне
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!tooltipOpen) return;

      const target = event.target as Node;

      // Исключение: клик по самому тултипу
      if (tooltipRef.current && tooltipRef.current.contains(target)) {
        return;
      }

      // Закрыть во всех остальных случаях
      setTooltipOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tooltipOpen]);

  // Автоматическая прокрутка к выбранному цвету на мобильных устройствах
  useEffect(() => {
    if (isMobile && selectedColor && colorScrollRef.current && product?.colors) {
      const selectedIndex = product.colors.findIndex(color => color.name === selectedColor.name);
      if (selectedIndex !== -1) {
        const colorContainer = colorScrollRef.current;
        const buttonWidth = colorContainer.offsetWidth * 0.225; // 22.5vw
        const gap = 8; // gap-2 = 8px
        const scrollPosition = selectedIndex * (buttonWidth + gap);
        
        colorContainer.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedColor, isMobile, product?.colors]);

  if (loading) {
    return (
      <div className="container-centered max-w-[1300px] mt-5">
        <div className="text-center py-10">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  // Обработчики
  const toggleFavorite = () => {
    if (!product.slug) {
      console.warn('Товар не имеет slug, нельзя добавить в избранное');
      return;
    }

    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite);

    // Получаем текущие избранные и очищаем от старых числовых ID
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    // Фильтруем только строки (slug'и), удаляя числовые ID
    favorites = favorites.filter((item: any) => typeof item === 'string');

    if (newIsFavorite) {
      // Добавляем в избранное
      if (!favorites.includes(product.slug)) {
        favorites.push(product.slug);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        console.log('Добавлен в избранное:', product.slug);
      }
    } else {
      // Удаляем из избранного (убираем и по slug, и по старому ID на всякий случай)
      const newFavorites = favorites.filter((item: any) => 
        item !== product.slug && item !== product.id
      );
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      console.log('Удалён из избранного:', product.slug);
    }

    window.dispatchEvent(new Event("favoritesChanged"));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleModalSubmit = (formData: { name: string; phone: string }) => {
    console.log("Данные формы:", formData);
    alert(
      `Форма отправлена! Имя: ${formData.name}, Телефон: ${formData.phone}`
    );
    closeModal();
  };

  const nextGraniteSlide = () => {
    setCurrentGraniteSlide((prev) => (prev + 1) % graniteTypes.length);
  };

  const prevGraniteSlide = () => {
    setCurrentGraniteSlide(
      (prev) => (prev - 1 + graniteTypes.length) % graniteTypes.length
    );
  };

  const closeGraniteModal = () => {
    setIsGraniteModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const openGraniteModal = (index: number) => {
    setCurrentGraniteSlide(index);
    setIsGraniteModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Компонент для характеристик
  const CharacteristicItem = ({
    label,
    value,
    tooltipImage,
    tooltipDescription,
  }: {
    label: string;
    value: string;
    tooltipImage?: string;
    tooltipDescription?: string;
  }) => {
    const tooltipTriggerRef = useRef<HTMLSpanElement>(null);

    const handleClick = (e: React.MouseEvent) => {
      if (tooltipImage && tooltipDescription) {
        const element = tooltipTriggerRef.current;
        if (!element) return;

        const parentContainer = characteristicsContentRef.current;
        if (!parentContainer) return;

        const elementRect = element.getBoundingClientRect();
        const parentRect = parentContainer.getBoundingClientRect();

        // Относительная позиция (для позиционирования тултипа внутри контейнера)
        const relativeTop = elementRect.top - parentRect.top;
        const relativeLeft = elementRect.left - parentRect.left;

        // Абсолютная позиция (для расчёта места сверху/снизу)
        const absoluteTop = elementRect.top;
        const absoluteLeft = elementRect.left;

        setTooltipPosition({
          top: relativeTop - 10,
          left: relativeLeft + elementRect.width / 2,
        });

        // Передаём абсолютные координаты отдельно
        setTooltipContent({
          image: tooltipImage,
          description: tooltipDescription,
          absoluteTop: absoluteTop,
          absoluteLeft: absoluteLeft,
        });

        const img = new window.Image();
        img.src = tooltipImage;
        img.onload = () => setTooltipOpen(true);
        img.onerror = () => setTooltipOpen(true);
      }
    };

    return (
      <div className="flex justify-between items-center py-2 border-b border-[#969ead]">
        <div className="flex items-center space-x-3">
          <span className="text-[#2D4266]">{label}</span>
          {tooltipImage && tooltipDescription && (
            <span
              className="text-[#969ead] text-xs font-bold border-1 border-[#969ead] hover:border-[#2c3a54] hover:text-[#2c3a54] rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
              ref={tooltipTriggerRef}
              onClick={handleClick}
            >
              ?
            </span>
          )}
        </div>
        <span className="text-[#2D4266]">{value}</span>
      </div>
    );
  };

  // Получить название дефолтного материала (русское)
  const getDefaultMaterialName = () => {
    if (!product) return "Дефолт";
    
    const materialName = product.image.match(/K\d+_(\w+)/)?.[1] || "DYMOVSKY";
    
    // Обратный поиск - найти русское название по английскому
    const reverseMapping: Record<string, string> = {
      DYMOVSKY: "Дымовский",
      AMFIBOLITGRANATOVY: "Амфиболит",
      MANSUR: "Мансуровский",
      Pokost: "Покостовский",
      BalticGreen: "Балтик Грин",
      BALMORALRED: "Балморал Рэд",
      Aurora: "Аврора",
      CuruGray: "Куру Грей",
      LEZNIKI: "Лезниковский",
      BluePearl: "Блю Перл",
      AMADEUS: "Амадеус",
      MUGLAWHITE: "Мрамор",
    };
    
    return reverseMapping[materialName] || "Дефолт";
  };

  return (
    <>
      <section className="container-centered mt-5 max-w-[1300px] flex">
        {/* Боковая панель */}
        <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
          <SidebarCatalogMenu />
          <SidebarStickyHelp />
        </div>

        {/* Основной контент */}
        <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
          <PathPage />
          <h1 className="text-black text-[24px] md:text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">
            {product.name}
          </h1>

          {/* Основной контент карточки */}
          <div className={`mb-7.5 font-[600] ${isMobile ? "block" : "flex p-5"}`}>
            {/* Изображение */}
            <div className="relative max-w-[523px] md:w-7/12 mx-auto">
              {/* Плашка скидки - только если у selectedColor есть скидка */}
              {selectedColor?.discount && selectedColor.discount > 0 && (
                <div className="absolute top-2 left-2 z-10 bg-[#cd5554] text-white text-xs font-bold px-2.5 py-0.75 rounded">
                  Сегодня -{Math.round(Number(selectedColor.discount))}%
                </div>
              )}

              {/* Плашка ХИТ - привязана к выбранному цвету */}
              {selectedColor?.hit && (
                <div className={`absolute left-2 z-20 bg-gray-600 text-white text-xs font-bold px-2.5 py-0.75 rounded-xl ${
                  selectedColor?.discount && selectedColor.discount > 0 ? 'top-12' : 'top-2'
                }`}>
                  ХИТ
                </div>
              )}

              {/* Звезда (избранное) */}
              <div
                className={`absolute ${
                  selectedColor?.discount && selectedColor.discount > 0 && selectedColor?.hit 
                    ? 'top-20' 
                    : selectedColor?.discount && selectedColor.discount > 0 
                      ? 'top-12' 
                      : selectedColor?.hit 
                        ? 'top-12' 
                        : 'top-2'
                } left-2 z-10 w-11 h-11 text-center content-center flex-wrap text-2xl shadow-xs rounded-full hover:text-[#2c3a54] transition cursor-pointer ${
                  isFavorite ? "text-[#2c3a54]" : "text-gray-400"
                }`}
                onClick={toggleFavorite}
              >
                ★
              </div>

              {/* View360 компонент - интерактивный просмотр с разных ракурсов */}
              <View360 
                baseImagePath={(selectedColor ? selectedColor.image : product.image).replace(/\/frame_\d+\.(jpg|webp)$|\/800x800$/, '')} 
                totalFrames={11}
                frameDelay={500}
                hasDiscount={!!(selectedColor?.discount && selectedColor.discount > 0)}
                hasHit={!!selectedColor?.hit}
              />
            </div>

            {/* Блок информации */}
            <div className={`${isMobile ? "w-full" : "flex flex-col w-5/12"}`}>
              <div className={`${isMobile ? "mb-5" : "bg-[#f5f6fa] p-5 rounded-lg mb-5"}`}>
                {/* Выбор материала */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-[16px] text-[#222222]">
                      Выберите материал:
                    </h3>
                    <p className="text-[14px] text-[#969ead]">
                      {selectedColor?.name || getDefaultMaterialName()} + Габбро Карелия
                    </p>

                    <div className={`mt-3 ${isMobile ? 'overflow-x-auto scrollbar-hide' : ''}`}>
                      <div 
                        ref={isMobile ? colorScrollRef : undefined}
                        className={`${isMobile ? 'flex gap-2 pb-2' : 'grid grid-cols-4 gap-2'}`}
                      >
                        {/* Все материалы из массива (первый - дефолт) */}
                        {product.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={`${isMobile ? 'shrink-0 w-[calc(22.5vw-8px)] aspect-square' : 'aspect-square'} rounded-lg border-2 transition bg-cover bg-center ${
                              selectedColor?.name === color.name
                                ? "border-[#2c3a54]"
                                : "border-gray-300 hover:border-[#2c3a54]"
                            }`}
                            style={{
                              backgroundImage: `url(${color.image})`,
                            }}
                            aria-label={color.name}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Цена */}
                <div className="mb-5">
                  <span className="text-[#2c3a54]">Цена:</span>
                  <div className="flex items-center space-x-2">
                    {selectedColor?.discount && selectedColor.discount > 0 ? (
                      <>
                        <p className="text-3xl font-bold text-[#cd5554]">
                          {selectedColor.price} руб.
                        </p>
                        {selectedColor.oldPrice && selectedColor.oldPrice > 0 && (
                          <p className="text-lg text-gray-500 line-through">
                            {selectedColor.oldPrice} руб.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-[#2c3a54]">
                        {selectedColor?.price !== undefined ? selectedColor.price : product.price} руб.
                      </p>
                    )}
                  </div>
                </div>

                {/* Кнопка заказа */}
                <div className="space-y-2.5 mb-5">
                  <button
                    className="w-full py-3 bg-[#2c3a54] text-white rounded-full font-bold hover:bg-[#1a273b] transition"
                    onClick={openModal}
                  >
                    Заказать
                  </button>
                </div>
              </div>

              {/* Иконки внизу */}
              <div className={`max-w-[550px] flex flex-wrap gap-y-5`}>
                <div className="flex w-1/2 items-center space-x-2">
                  <Image
                    src="/guarantee.svg"
                    width={24}
                    height={24}
                    alt="Гарантия 10 лет"
                  />
                  <span className="text-[12px] text-[#2D4266]">
                    Гарантия 10 лет
                  </span>
                </div>
                <div className="flex w-1/2 items-center space-x-2">
                  <Image
                    src="/3d.svg"
                    width={24}
                    height={24}
                    alt="Бесплатный 3D эскиз"
                  />
                  <span className="text-[12px] text-[#2D4266]">
                    Бесплатный 3D эскиз
                  </span>
                </div>
                <div className="flex w-1/2 items-center space-x-2">
                  <Image
                    src="/credit.svg"
                    width={24}
                    height={24}
                    alt="Рассрочка платежа"
                  />
                  <span className="text-[12px] text-[#2D4266]">
                    Рассрочка платежа
                  </span>
                </div>
                <div className="flex w-1/2 items-center space-x-2">
                  <Image
                    src="/safe.svg"
                    width={24}
                    height={24}
                    alt="Бесплатное хранение"
                  />
                  <span className="text-[12px] text-[#2D4266]">
                    Бесплатное хранение
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Вкладки */}
          <div className="border-b border-gray-200 mb-5">
            <div className="flex space-x-4 md:space-x-6 text-[14px] md:text-[16px]">
              <button
                onClick={() => setActiveTab("characteristics")}
                className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${
                  activeTab === "characteristics"
                    ? ""
                    : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                }`}
              >
                Характеристики
              </button>
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${
                  activeTab === "description"
                    ? ""
                    : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                }`}
              >
                Описание
              </button>
              <button
                onClick={() => setActiveTab("granite")}
                className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${
                  activeTab === "granite"
                    ? ""
                    : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                }`}
              >
                Варианты гранита
              </button>
            </div>
          </div>

          {/* Контент вкладок */}
          <div className="mb-7.5 font-[600]">
            {activeTab === "characteristics" && (
              <div>
                <div
                  className="space-y-1 relative"
                  ref={characteristicsContentRef}
                >
                  {/* Динамические характеристики из базы данных */}
                  {product.options && Object.entries(product.options).map(([key, value]) => (
                    <CharacteristicItem
                      key={key}
                      label={key}
                      value={value}
                      tooltipImage={
                        key === "Общая высота"
                          ? "/single/height.webp"
                          : key === "Общая ширина"
                          ? "/single/width.webp"
                          : key === "Стела"
                          ? "/single/stela.webp"
                          : undefined
                      }
                      tooltipDescription={
                        key === "Общая высота"
                          ? "Высота от нижней до верхней точки памятника"
                          : key === "Общая ширина"
                          ? "Ширина памятника по крайним точкам"
                          : key === "Стела"
                          ? "Размеры стелы памятника"
                          : undefined
                      }
                    />
                  ))}
                  
                  {/* Статические характеристики */}
                  {Object.entries(STATIC_CHARACTERISTICS).map(([key, value]) => (
                    <CharacteristicItem
                      key={key}
                      label={key}
                      value={value}
                    />
                  ))}
                  
                  <Tooltip
                    isOpen={tooltipOpen}
                    image={tooltipContent.image}
                    description={tooltipContent.description}
                    position={tooltipPosition}
                    ref={tooltipRef}
                    absolutePosition={{ top: tooltipContent.absoluteTop, left: tooltipContent.absoluteLeft }}
                  />
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div>
                <p className="text-[#2D4266]">
                  {product.description || 
                    "Представленный эксклюзивный памятник станет идеальным решением оформления захоронения ваших родных и близких. В качестве художественного оформления рекомендуем использовать накладные бронзовые буквы и цифры итальянского производителя Caggiati, либо покрыть надпись сусальным золотом, а фото усопшего оформить в медальон в бронзовой рамке."
                  }
                </p>
              </div>
            )}

            {activeTab === "granite" && (
              <div>
                <p className="text-[#2D4266] mb-5">
                  Данный памятник можно изготовить более чем из 20 видов
                  гранита.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                  {graniteTypes.map((type, index) => (
                    <div
                      key={type.id}
                      className="flex flex-col space-y-2 cursor-pointer px-2.5 hover:opacity-80 duration-500"
                      onClick={() => openGraniteModal(index)}
                    >
                      <img
                        src={type.image}
                        alt={type.name}
                        className="w-full h-auto object-cover rounded-lg"
                      />
                      <p className="text-[14px] text-[#6B809E]">{type.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Галерея готовых работ с этим товаром */}
      <ProductWorksGallery 
        productId={product.id.toString()}
        productType="monuments"
        title="Готовые работы с этим товаром"
      />

      {/* Модальные окна */}
      <ModalCommunication
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />

      {/* Модальное окно для вариантов гранита */}
      {isGraniteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={closeGraniteModal}
        >
          <div
            className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fixed top-4 left-4 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded z-10">
              {currentGraniteSlide + 1} / {graniteTypes.length}
            </div>

            <button
              onClick={prevGraniteSlide}
              className="absolute left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              {"<"}
            </button>

            <button
              onClick={nextGraniteSlide}
              className="absolute right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              {">"}
            </button>

            {/* Изображение */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={graniteTypes[currentGraniteSlide].image}
                alt={graniteTypes[currentGraniteSlide].name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Подпись под изображением */}
            <div className="text-center text-white text-lg font-medium mt-2">
              {graniteTypes[currentGraniteSlide].name}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExclusiveProductPage;
