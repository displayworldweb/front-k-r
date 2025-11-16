// src/app/favorites/page.tsx

"use client";
import { useEffect, useState } from "react";
import OurWorksSlider from "../components/OurWorksSlider";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { PageDescriptionBlock } from "../components/PageDescriptionBlock";
import { Product } from "../types/types";

// Функция для получения товара по slug из всех категорий
const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
    console.log('fetchProductBySlug вызвана для slug:', slug);
    
    // Список всех возможных API endpoints
    const endpoints = [
        'https://k-r.by/api/monuments',
        'https://k-r.by/api/fences'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Проверяем endpoint: ${endpoint} для slug: ${slug}`);
            const response = await fetch(endpoint);
            if (!response.ok) {
                console.log(`Endpoint ${endpoint} вернул ошибку:`, response.status);
                continue;
            }
            
            const data = await response.json();
            const products = data.data || [];
            console.log(`Получено товаров из ${endpoint}:`, products.length);
            
            // Логируем первые несколько slug'ов для отладки
            if (products.length > 0) {
                console.log(`Первые 3 slug'а из ${endpoint}:`, products.slice(0, 3).map((p: any) => p.slug));
            }
            
            // Ищем товар с нужным slug
            const product = products.find((p: any) => p.slug === slug);
            if (product) {
                console.log(`✅ Товар найден в ${endpoint}:`, product.name);
                return product;
            } else {
                console.log(`❌ Товар с slug ${slug} НЕ найден в ${endpoint}`);
            }
        } catch (error) {
            console.warn(`Error fetching from ${endpoint}:`, error);
            continue;
        }
    }
    
    console.error(`🚨 Товар с slug ${slug} не найден НИ В ОДНОЙ категории!`);
    return null; // Товар не найден ни в одной категории
};

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState<string[]>([]); // Теперь это slug'и
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const PRODUCTS_PER_PAGE = 12;

    // Для адаптивности
    useEffect(() => {
        const checkScreenSize = () => {
            setIsTablet(window.innerWidth < 1024);
            setIsMobile(window.innerWidth < 768);
            setIsNarrowMobile(window.innerWidth < 420);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Загружаем избранные товары при загрузке
    useEffect(() => {
        let savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // Фильтруем только строки (slug'и), удаляя старые числовые ID
        savedFavorites = savedFavorites.filter((item: any) => typeof item === 'string');
        
        console.log('Загруженные избранные при инициализации:', savedFavorites);
        console.log('Отфильтровано только slug\'и:', savedFavorites);
        
        // Обновляем localStorage с очищенными данными
        localStorage.setItem('favorites', JSON.stringify(savedFavorites));
        
        setFavorites(savedFavorites);
    }, []);

    // Загружаем продукты по slug из избранного через API
    useEffect(() => {
        const loadFavoriteProducts = async () => {
            console.log('Начинаем загрузку избранных товаров:', favorites);
            
            if (favorites.length === 0) {
                console.log('Список избранного пуст');
                setFavoriteProducts([]);
                return;
            }

            setIsLoading(true);
            const products: Product[] = [];

            // Загружаем каждый товар по slug
            for (const slug of favorites) {
                console.log('Загружаем товар по slug:', slug);
                const product = await fetchProductBySlug(slug);
                if (product) {
                    console.log('Товар найден:', product.name);
                    products.push(product);
                } else {
                    console.log('Товар не найден по slug:', slug);
                }
            }

            console.log('Загружено товаров:', products.length);
            setFavoriteProducts(products);
            setIsLoading(false);
        };

        loadFavoriteProducts();
    }, [favorites]);

    useEffect(() => {
        const handleFavoritesChange = () => {
            let savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            
            // Фильтруем только строки (slug'и)
            savedFavorites = savedFavorites.filter((item: any) => typeof item === 'string');
            
            console.log('Изменения в избранном:', savedFavorites);
            
            // Обновляем localStorage с очищенными данными
            localStorage.setItem('favorites', JSON.stringify(savedFavorites));
            
            setFavorites(savedFavorites);
            setCurrentPage(1); // Сбрасываем на первую страницу при изменении
        };

        // Подписываемся на кастомное событие
        window.addEventListener('favoritesChanged', handleFavoritesChange);

        // Очистка подписки
        return () => {
            window.removeEventListener('favoritesChanged', handleFavoritesChange);
        };
    }, []);

    // Рассчитываем общее количество страниц
    const totalPages = Math.ceil(favoriteProducts.length / PRODUCTS_PER_PAGE);

    // Получаем продукты для текущей страницы
    const currentProducts = favoriteProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <>
            <section className="container-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <PathPage />
                    <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Товары в избранном</h1>

                    {/* Сетка избранных продуктов */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-gray-500">Загружаем избранные товары...</div>
                        </div>
                    ) : favoriteProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 mb-7.5">
                            {currentProducts.map((product) => (
                                <ProductCard
                                    key={product.slug || `product-${product.id}`}
                                    product={product}
                                    isTablet={isTablet}
                                    isMobile={isMobile}
                                    isNarrowMobile={isNarrowMobile}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-[#2D4266]">В избранном пока нет товаров.</p>
                    )}

                    {/* Пагинация */}
                    <Pagination
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        initialPage={1}
                    />v
                    
                    <PageDescriptionBlock pageSlug="favorites" />
                </div>
            </section>

            {/* OurWorksSlider внизу страницы */}
            <div className="mb-22.5">
                <OurWorksSlider />
            </div>
        </>
    );
};

export default FavoritesPage;