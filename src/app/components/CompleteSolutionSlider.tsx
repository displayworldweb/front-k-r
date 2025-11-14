"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { Product } from "../types/types";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

const CompleteSolutionSlider = () => {
  const [isMobile, setIsMobile] = useState(false); // <768px
  const [isTablet, setIsTablet] = useState(false); // <1024px
  const [isSmallDesktop, setIsSmallDesktop] = useState(false); // <1280px
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width < 1024);
      setIsSmallDesktop(width < 1280);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Load memorial complexes
  useEffect(() => {
    const loadComplexes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(`${API_ENDPOINTS.monuments}/complex`);
        // Expect either array or { success, data }
        const rawItems: any[] = Array.isArray(data) ? data : data?.data || [];
        const mapped: Product[] = rawItems.map((item) => ({
          id: Number(item.id) || 0,
          slug: String(item.slug || ''),
          name: String(item.name || ''),
          category: String(item.category || ''),
          price: Number(item.price) || 0,
          oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
          discount: Number(item.discount) || 0,
          image: String(item.image || item.images?.[0] || ''),
          description: String(item.description || ''),
          height: String(item.height || ''),
          colors: Array.isArray(item.colors) ? item.colors : [],
          options: typeof item.options === 'object' && item.options !== null ? item.options : {},
          hit: Boolean(item.hit),
          popular: Boolean(item.popular),
          new: Boolean(item.new)
        }));
        setProducts(mapped);
      } catch (e: any) {
        setError(e.message || 'Ошибка загрузки мемориальных комплексов');
      } finally {
        setLoading(false);
      }
    };
    loadComplexes();
  }, []);

  // Функции для навигации слайдера (скролл на ширину visible карточек)
  const getVisibleCards = () => {
    if (isMobile) return 1;
    return isTablet ? 2 : 3; 
  };

  const getSlideWidth = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    const visibleCards = getVisibleCards();
    return containerWidth / visibleCards; // Ширина одной карточки
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideWidth = getSlideWidth();
      const scrollAmount = slideWidth * getVisibleCards();
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideWidth = getSlideWidth();
      const scrollAmount = slideWidth * getVisibleCards();
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const cardBasis = isMobile
      ? "basis-full" // 100% для 1 карточки <768
      : isTablet
      ? "basis-[calc(100%_/_2)]"
      : "basis-[calc(100%_/_3)]"; 

    return (
      <div
        className={`relative bg-white shadow-sm overflow-hidden group cursor-pointer flex-shrink-0 h-full ${cardBasis}`}
      >
        {/* Звезда (избранное) */}
        <div className="absolute top-2 right-2 z-10 text-gray-400 text-2xl hover:text-[#2c3a54] transition">
          ★
        </div>
        {/* Изображение (статичное, без ref/onMouse/onTouch) */}
        <div className="relative w-full h-80 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* Нижняя часть: адаптив layout для цены + кнопки */}
        <div className="p-4 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-[#2c3a54] mb-5 md:mb-10 text-xl">
            {product.name}
          </h3>
          {/* Блок цены и кнопки */}
          <div
            className={`flex ${
              isSmallDesktop 
                ? "flex-col" // <1280px → колонка: цена сверху, кнопка снизу
                : "flex-row items-center justify-between" // ≥1280px → рядом
            }`}
          >
            {/* Цена: статичная */}
            <p
              className={`text-2xl font-bold text-[#2c3a54] ${
                isSmallDesktop ? "mb-2" : ""
              }`}
            >
              Цена по запросу
            </p>
            {/* Кнопка: справа при ≥1280px, под ценой при <1280px */}
            <button
              className={`w-max font-bold hidden md:block py-[9px] px-[15px] bg-white border border-[#2c3a54] text-[#2c3a54] rounded-full hover:bg-[#2c3a54] hover:text-white transition whitespace-nowrap`}
            >
              Подробнее
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="max-w-[1300px] mt-17 lg:mt-30 container-centered">

      <h2 className="text-4xl font-bold text-[#2c3a54] mb-6">Готовые решения</h2>
      <div
        ref={containerRef}
        className={isMobile ? "" : "relative"}
      >
        {isMobile ? (
          // <768px: 1 большая, свайп only (overflow-x-auto flex)
          <div
            ref={sliderRef}
            className="flex overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{
              scrollSnapType: "x mandatory",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.slug || `product-${product.id}`} product={product} />
            ))}
          </div>
        ) : (
          // ≥768px: слайдер с навигацией
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-[-16px] border border-[#2c3a54] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2c3a54"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div
              ref={sliderRef}
              className="flex gap-0 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-0.5" // gap-0 для плотности, px-0.5 если нужно
              style={{
                scrollSnapType: "x mandatory",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {products.map((product) => (
                <ProductCard key={product.slug || `product-${product.id}`} product={product} />
              ))}
            </div>
            <button
              onClick={scrollRight}
              className="absolute right-[-16px] border border-[#2c3a54] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2c3a54"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>
      {/* Кнопка внизу */}
      <div className="mt-10 flex">
        <button className="font-bold md:min-w-[330px] px-7.5 py-3 bg-[#2c3a54] border border-[#2c3a54] text-white rounded-full hover:bg-white hover:text-[#2c3a54] transition">
          <Link href="/">Смотреть все</Link>
        </button>
      </div>
    </section>
  );
};

export default CompleteSolutionSlider;
