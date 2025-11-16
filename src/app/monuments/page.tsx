"use client";
import { useEffect, useState } from "react";
import OurWorksSlider from "../components/OurWorksSlider";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { categoriesMonuments } from "../mock/categories";
import { apiClient, API_ENDPOINTS } from "../../lib/api-client";
import { ColorOption } from "../types/types";
import { PageDescriptionBlock } from "../components/PageDescriptionBlock";

export const dynamic = 'force-dynamic';

// Функция для обработки данных памятника (парсинг JSON полей)
function processMonumentData(dbProduct: Record<string, unknown>) {
    // Парсим цвета из БД
    let parsedColors: ColorOption[] = [];
    if (typeof dbProduct.colors === 'string') {
        try {
            parsedColors = JSON.parse(dbProduct.colors as string);
        } catch (e) {
            console.warn('Failed to parse colors:', dbProduct.colors);
            parsedColors = [];
        }
    } else if (Array.isArray(dbProduct.colors)) {
        parsedColors = dbProduct.colors as ColorOption[];
    }

    return {
        ...dbProduct,
        colors: parsedColors
    };
}

// Функция для получения минимальной цены по категории
const fetchMinPrice = async (endpoint: string): Promise<number> => {
    try {
        const res = await apiClient.get(endpoint);
        const items = Array.isArray(res) ? res : res?.data || [];
        const prices = items
          .map((p: any) => {
            const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
            return price;
          })
          .filter((p: any) => p && !isNaN(p) && p > 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
    } catch (e) {
        console.error('Error fetching min price from', endpoint, ':', e);
        return 0;
    }
};

// Функция для форматирования цены
const formatPrice = (price: number): string | undefined =>
    price > 0 ? `от ${Math.round(price)} руб.` : undefined;

// Функция для получения продуктов для конкретной страницы
const getProductsForPage = (cards: any[], page: number, productsPerPage: number) => {
    const startIndex = (page - 1) * productsPerPage;
    return cards.slice(startIndex, startIndex + productsPerPage);
};

// Функция для получения количества страниц
const getTotalPages = (totalProducts: number, productsPerPage: number) => {
    return Math.ceil(totalProducts / productsPerPage);
};

const MonumentsPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(60); // По умолчанию показываем 60 товаров
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [monuments, setMonuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    // Загрузка данных памятников
    useEffect(() => {
        const fetchMonuments = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(API_ENDPOINTS.monuments);
                if (response.success) {
                    // Обрабатываем данные перед установкой в state
                    const processedMonuments = response.data.map((monument: any) => 
                        processMonumentData(monument)
                    );
                    setMonuments(processedMonuments);
                }
            } catch (error) {
                console.error("Error loading monuments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMonuments();
    }, []);

    // Загрузка цен для категорий
    useEffect(() => {
        const loadCategoryPrices = async () => {
            try {
                const cheapPrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/cheap`);
                const singlePrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/single`);
                const doublePrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/double`);
                const exclusivePrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/exclusive`);
                const complexPrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/complex`);
                const monumentPrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}`);

                const updatedCategories = categoriesMonuments.map((cat) => {
                    let price: string | undefined;
                    switch (cat.title) {
                        case "Недорогие":
                            price = formatPrice(cheapPrice);
                            break;
                        case "Одиночные":
                            price = formatPrice(singlePrice);
                            break;
                        case "Двойные":
                            price = formatPrice(doublePrice);
                            break;
                        case "Эксклюзивные":
                            price = formatPrice(exclusivePrice);
                            break;
                        case "Мемориальные комплексы":
                            price = formatPrice(complexPrice);
                            break;
                        case "Памятники":
                            price = formatPrice(monumentPrice);
                            break;
                    }
                    return { ...cat, price };
                });

                setCategories(updatedCategories);
            } catch (error) {
                console.error("Error loading category prices:", error);
                setCategories(categoriesMonuments);
            }
        };
        loadCategoryPrices();
    }, []);

    // Для адаптивности
    useEffect(() => {
        setIsClient(true)
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsTablet(width < 1024);
            setIsMobile(width < 768);
            setIsNarrowMobile(width < 420)
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Получаем продукты для текущей страницы
    const currentProducts = getProductsForPage(monuments, currentPage, productsPerPage);

    // Рассчитываем общее количество страниц
    const totalPages = getTotalPages(monuments.length, productsPerPage);

    // Обработчик изменения количества товаров на странице
    const handleProductsPerPageChange = (count: number) => {
        setProductsPerPage(count);
        setCurrentPage(1); // Сбрасываем на первую страницу при изменении количества
    };

    return (
        <>
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">

                    <div className={`${isTablet ? 'container-centered' : ''}`}>
                        <PathPage />
                        <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Гранитные памятники на могилу</h1>

                        {/* Блок категорий */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-7.5">
                            {categories.map((category) => (
                                <a
                                    key={category.title}
                                    href={category.link}
                                    className="block overflow-hidden rounded-lg"
                                >
                                    <div className="relative flex h-[80px] lg:h-[120px] py-5 pl-3.75 pr-12.5 lg:pr-25 justify-between bg-[#f5f6fa] rounded-lg hover:border-2 border-[#2c3a54]">
                                        <div className="flex flex-col w-[70%] self-center z-10">
                                            <h2 className="text-[16px] font-bold text-[#222222] mb-2.5">{category.title}</h2>
                                            <p className="text-[12px] text-[#969ead]">{category.price || "\u00A0"}</p>
                                        </div>
                                        <div className="absolute self-center -right-2 rounded-lg max-w-[130px] overflow-hidden">
                                            <img
                                                src={category.img}
                                                alt={category.title}
                                                className={`h-full object-cover rounded-lg ${isTablet ? 'w-[75px]' : 'w-[130px]'}`}
                                            />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Выбор количества товаров на страницу */}
                    <div hidden={isTablet} className="flex justify-end mb-5">
                        <span className="text-[14px] text-[#6B809E] mr-2 self-center">Выводить по:</span>
                        {[60, 120].map((count) => (
                            <button
                                key={count}
                                onClick={() => handleProductsPerPageChange(count)}
                                className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === count
                                    ? ""
                                    : "cursor-pointer underline underline-offset-3 hover:no-underline"
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                        <button
                            onClick={() => handleProductsPerPageChange(monuments.length)}
                            className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === monuments.length
                                ? ""
                                : "cursor-pointer underline underline-offset-3 hover:no-underline"
                                }`}
                        >
                            Все
                        </button>
                    </div>

                    {/* Сетка продуктов */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-lg">Загрузка памятников...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 mb-7.5">
                            {isClient ? (
                                currentProducts.map((product: any, index: number) => (
                                    <ProductCard
                                        key={`${product.category || 'unknown'}-${product.id}-${index}`}
                                        product={product}
                                        isTablet={isTablet}
                                        isMobile={isMobile}
                                        isNarrowMobile={isNarrowMobile}
                                    />
                                ))
                            ) : (
                                currentProducts.map((product: any, index: number) => (
                                    <div key={`placeholder-${product.category || 'unknown'}-${product.id}-${index}`} className="invisible h-0" />
                                ))
                            )}
                        </div>
                    )}

                    {/* Пагинация */}
                    <Pagination
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        initialPage={1}
                    />

                    {/* Описание страницы */}
                    <PageDescriptionBlock pageSlug="monuments-catalog" />

                    {/* Блок "Другие категории" */}
                    <div className={`mt-17 lg:mt-30 ${isTablet ? 'container-centered' : ''}`}>
                        <h2 className="text-[28px] font-bold text-[#2c3a54] ml-2.5 mb-3.5 lg:mb-5">Другие категории</h2>
                        {/* Общий блок с flex */}
                        <div className={`flex flex-wrap ${isNarrowMobile ? 'flex-col space-y-2.5' : ''}`}>
                            {/* Карточка "Услуги" */}
                            <div className={`px-1.25 md:px-2.5 max-w-1/2 flex-1/2 min-h-[60px] lg:min-h-[140px] ${isNarrowMobile ? 'max-w-full' : ''}`}>
                                <a
                                    href="/services"
                                    className="block overflow-hidden rounded-lg hover:border-2 border-[#2c3a54] bg-[#f5f6fa] relative h-full items-center p-7.5"
                                >
                                    {/* Текст */}
                                    <h2 className="text-[16px] font-bold text-[#222222] self-start">Услуги</h2>
                                    {/* Изображение с абсолютным позиционированием */}
                                    <img
                                        src="/landscape.webp"
                                        alt="Услуги"
                                        className="w-[75px] lg:w-[130px] h-auto object-cover rounded-lg"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '10px',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                </a>
                            </div>

                            {/* Карточка "Ограды" */}
                            <div className={`px-1.25 md:px-2.5 max-w-1/2 flex-1/2 min-h-[60px] lg:min-h-[140px] ${isNarrowMobile ? 'max-w-full' : ''}`}>
                                <a
                                    href="/fences"
                                    className="block overflow-hidden rounded-lg hover:border-2 border-[#2c3a54] bg-[#f5f6fa] relative h-full items-center p-7.5"
                                >
                                    {/* Текст */}
                                    <h2 className="text-[16px] font-bold text-[#222222] self-start">Ограды</h2>
                                    {/* Изображение с абсолютным позиционированием */}
                                    <img
                                        src="/fences.webp"
                                        alt="Ограды"
                                        className="w-[75px] lg:w-[130px] h-auto object-cover rounded-lg"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '10px',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OurWorksSlider внизу страницы */}
            <div className="mb-22.5">
                <OurWorksSlider />
            </div>
        </>
    );
};

export default MonumentsPage;