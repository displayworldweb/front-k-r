"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { Product } from "../types/types";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import ProductCard from "./ProductCard";

const CompleteSolutionSlider = () => {
  const [isMobile, setIsMobile] = useState(false); // <768px
  const [isTablet, setIsTablet] = useState(false); // <1024px
  const [isNarrowMobile, setIsNarrowMobile] = useState(false); // <480px
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
      setIsNarrowMobile(width < 480);
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
            className="flex overflow-x-auto pb-4 snap-x snap-mandatory gap-0"
            style={{
              scrollSnapType: "x mandatory",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {products.map((product) => (
              <div key={product.slug || `product-${product.id}`} className="shrink-0 w-full">
                <ProductCard 
                  product={product}
                  isTablet={false}
                  isMobile={true}
                  isNarrowMobile={isNarrowMobile}
                />
              </div>
            ))}
          </div>
        ) : (
          // ≥768px: слайдер с навигацией
          <>
            <button
              onClick={scrollLeft}
              className="absolute -left-4 border border-[#2c3a54] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition"
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
              className="flex gap-0 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-0.5"
              style={{
                scrollSnapType: "x mandatory",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {products.map((product) => {
                const cardWidthClass = isTablet ? "w-[calc(50%-0px)]" : "w-[calc(33.333%-0px)]";
                return (
                  <div key={product.slug || `product-${product.id}`} className={`shrink-0 ${cardWidthClass} px-0.5`}>
                    <ProductCard 
                      product={product}
                      isTablet={isTablet}
                      isMobile={false}
                      isNarrowMobile={isNarrowMobile}
                    />
                  </div>
                );
              })}
            </div>
            <button
              onClick={scrollRight}
              className="absolute -right-4 border border-[#2c3a54] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition"
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
          <Link href="/monuments/complex">Смотреть все</Link>
        </button>
      </div>
    </section>
  );
};

export default CompleteSolutionSlider;
