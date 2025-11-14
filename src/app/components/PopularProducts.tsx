"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../types/types";

const PopularProducts = () => {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrowMobile, setIsNarrowMobile] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Функция для загрузки популярных товаров из всех API
  const fetchPopularProducts = async () => {
    setLoading(true);
    const endpoints = [
      'https://api.k-r.by/api/monuments',
      'https://api.k-r.by/api/fences'
    ];

    let allPopularProducts: Product[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const products = data.data || [];
          
          // Фильтруем только популярные товары
          const popularProducts = products.filter((product: any) => product.popular === true);
          allPopularProducts = [...allPopularProducts, ...popularProducts];
        }
      } catch (error) {
        console.warn(`Error fetching from ${endpoint}:`, error);
      }
    }

    console.log('Загружено популярных товаров:', allPopularProducts.length);
    setAllProducts(allPopularProducts);
    setLoading(false);
  };

  // Загрузка популярных товаров при монтировании компонента
  useEffect(() => {
    fetchPopularProducts();
  }, []);

  // Для адаптивности
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsTablet(width < 1024);
      setIsMobile(width < 768);
      setIsNarrowMobile(width < 420);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Получаем уникальные категории из загруженных товаров
  const uniqueCategories = Array.from(new Set(allProducts.map(product => product.category)));
  const availableCategories = ["Все", ...uniqueCategories];

  // Фильтруем товары по категории
  const filteredProducts = activeCategory === "Все"
    ? allProducts
    : allProducts.filter((product) => product.category === activeCategory);

  // Сброс showAll при смене категории
  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  // Вычисляем количество товаров в 2 рядах в зависимости от размера экрана
  const itemsPerRow = isMobile ? 2 : 4;
  const maxItemsToShow = itemsPerRow * 2; // 2 ряда
  
  // Определяем, нужно ли показывать кнопку "Показать все"
  const shouldShowButton = filteredProducts.length > maxItemsToShow;
  
  // Товары для отображения
  const displayedProducts = showAll ? filteredProducts : filteredProducts.slice(0, maxItemsToShow);

  return (
    <section className="max-w-[1300px] mt-17 lg:mt-30 container-centered">
      <h2 className="text-4xl font-bold text-[#2c3a54] mb-3.5 md:mb-7.5">
        Популярные товары
      </h2>
      {/* Панель категорий */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 border border-gray-300 rounded-full text-[16px] font-medium transition ${activeCategory === category
                ? "bg-[#2c3a54] text-white"
                : "text-[#2c3a54] hover:bg-[#2c3a54] hover:text-white"
              }`}
          >
            {category}
          </button>
        ))}
      </div>
      {/* Грид товаров */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Загружаем популярные товары...</div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4">
          {displayedProducts.map((product) => (
            <ProductCard key={product.slug || `product-${product.id}`} product={product} isTablet={isTablet} isMobile={isMobile} isNarrowMobile={isNarrowMobile}/>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Популярные товары не найдены в выбранной категории.
        </div>
      )}
      {/* Кнопки внизу */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 font-bold">
        {shouldShowButton && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="md:min-w-[330px] px-7.5 py-3 bg-white border border-[#2c3a54] text-[#2c3a54] rounded-full hover:bg-[#2c3a54] hover:text-white transition"
          >
            {showAll ? 'Скрыть' : 'Показать все'}
          </button>
        )}
        <button className="md:min-w-[330px] px-7.5 py-3 bg-[#2c3a54] text-white rounded-full hover:bg-white hover:border hover:border-[#2c3a54] hover:text-[#2c3a54] transition">
          <Link href="/">Перейти в каталог</Link>
        </button>
      </div>
    </section>
  );
};

export default PopularProducts;
