"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import PathPage from "@/app/components/PathPage";
import SidebarCatalogMenu from "@/app/components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "@/app/components/Sidebar/SidebarStickyHelp";
import ProductCard from "@/app/components/ProductCard";
import Pagination from "@/app/components/Pagination";
import SubcategoryDescription from "@/app/components/SubcategoryDescription";
import { Product, ColorOption } from "@/app/types/types";
import { apiClient } from "@/lib/api-client";
import { PageBlocksRenderer } from "@/app/components/PageBlocksRenderer";
import { getPageDescription, PageDescription } from "@/lib/page-descriptions";

// Функция для конвертации товара из БД в формат ProductCard
function convertProductToFormat(dbProduct: Record<string, unknown>) {
    // Парсим options если это строка JSON
    let parsedOptions = {};
    if (typeof dbProduct.options === 'string') {
        try {
            parsedOptions = JSON.parse(dbProduct.options as string);
        } catch (e) {
            console.warn('Failed to parse options:', dbProduct.options);
        }
    } else if (dbProduct.options) {
        parsedOptions = dbProduct.options as Record<string, unknown>;
    }

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

    const imageUrl = String(dbProduct.image || '');

    return {
        id: Number(dbProduct.id),
        slug: String(dbProduct.slug || ''),
        name: String(dbProduct.name || ''),
        category: String(dbProduct.category || ''),
        price: Number(dbProduct.price) || 0,
        oldPrice: dbProduct.oldPrice ? Number(dbProduct.oldPrice) : undefined,
        discount: Number(dbProduct.discount) || 0,
        image: imageUrl,
        description: String(dbProduct.description || ''),
        height: String(dbProduct.height || ''),
        colors: parsedColors,
        options: parsedOptions,
        hit: Boolean(dbProduct.hit),
        popular: Boolean(dbProduct.popular),
        new: Boolean(dbProduct.new),
        productType: String(dbProduct.productType || 'monuments'), // Добавляем тип товара
    };
}

const DiscountPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(60);
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [sortOption, setSortOption] = useState("Сначала популярные");
    const [dynamicPageDescription, setDynamicPageDescription] = useState<PageDescription | null>(null);
    const [loadingDescription, setLoadingDescription] = useState(false);

    const sortOptions = ["Сначала популярные", "Сначала дешевые", "Сначала дорогие"];

    useEffect(() => {
        setIsClient(true);
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

    // Загрузка описания страницы
    useEffect(() => {
        const loadPageDesc = async () => {
            setLoadingDescription(true);
            try {
                const description = await getPageDescription('discount');
                setDynamicPageDescription(description);
            } catch (error) {
                console.error("Ошибка загрузки описания страницы:", error);
            } finally {
                setLoadingDescription(false);
            }
        };

        loadPageDesc();
    }, []);

    // Загружаем все товары со скидкой
    useEffect(() => {
        const loadDiscountProducts = async () => {
            setLoading(true);
            try {
                const allProducts: Product[] = [];

                // Загружаем памятники со скидкой из всех категорий
                const monumentCategories = ['single', 'double', 'cheap', 'composite', 'exclusive', 'cross', 'heart', 'europe', 'artistic', 'tree', 'complex'];
                
                for (const category of monumentCategories) {
                    try {
                        const data = await apiClient.get(`/monuments/${category}`);
                        if (data.success && data.data) {
                            const converted = data.data
                                .filter((item: any) => item.discount && item.discount > 0)
                                .map((item: any) => ({
                                    ...convertProductToFormat(item),
                                    productType: 'monuments',
                                    categorySlug: category
                                }));
                            allProducts.push(...converted);
                        }
                    } catch (error) {
                        console.error(`Ошибка загрузки ${category}:`, error);
                    }
                }

                // Загружаем ограды со скидкой
                const fenceCategories = ['granite', 'polymer', 'metal'];
                
                for (const category of fenceCategories) {
                    try {
                        const data = await apiClient.get(`/fences/${category}`);
                        if (data.success && data.data) {
                            const converted = data.data
                                .filter((item: any) => item.discount && item.discount > 0)
                                .map((item: any) => ({
                                    ...convertProductToFormat(item),
                                    productType: 'fences',
                                    categorySlug: category
                                }));
                            allProducts.push(...converted);
                        }
                    } catch (error) {
                        console.error(`Ошибка загрузки оград ${category}:`, error);
                    }
                }

                console.log(`Загружено ${allProducts.length} товаров со скидкой`);
                setProducts(allProducts);
            } catch (error) {
                console.error("Ошибка загрузки товаров со скидкой:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDiscountProducts();
    }, []);

    // Сортировка товаров
    const sortedProducts = [...products].sort((a, b) => {
        switch (sortOption) {
            case "Сначала популярные":
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                return 0;
            case "Сначала дешевые":
                return (a.price || 999999) - (b.price || 999999);
            case "Сначала дорогие":
                return (b.price || 0) - (a.price || 0);
            default:
                return 0;
        }
    });

    // Пагинация
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleProductsPerPageChange = (count: number) => {
        setProductsPerPage(count);
        setCurrentPage(1);
    };

    if (!isClient) {
        return null;
    }

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
                        <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">
                            Товары на скидке
                        </h1>

                        {/* Блок сортировки и выбора количества товаров */}
                        <div hidden={isTablet} className="flex justify-between items-center mb-5">
                            {/* Сортировка слева */}
                            <div className="flex items-center gap-2 relative">
                                <span className="text-[14px] text-[#6B809E]">Показывать:</span>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                        className="text-[14px] text-[#2c3a54] bg-transparent cursor-pointer focus:outline-none underline decoration-dashed underline-offset-3 hover:no-underline"
                                    >
                                        {sortOption}
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[200px]">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSortOption(option);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-[14px] text-[#2c3a54] hover:bg-[#f5f6fa] transition-colors"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Выбор количества товаров справа */}
                            <div className="flex items-center">
                                <span className="text-[14px] text-[#6B809E] mr-2">Выводить по:</span>
                                {[60, 120].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => handleProductsPerPageChange(count)}
                                        className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${
                                            productsPerPage === count
                                                ? ""
                                                : "cursor-pointer underline underline-offset-3 hover:no-underline"
                                        }`}
                                    >
                                        {count}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleProductsPerPageChange(products.length)}
                                    className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${
                                        productsPerPage === products.length
                                            ? ""
                                            : "cursor-pointer underline underline-offset-3 hover:no-underline"
                                    }`}
                                >
                                    Все
                                </button>
                            </div>
                        </div>

                        {/* Сетка товаров */}
                        {loading ? (
                            <div className="text-center py-20 text-[#6B809E]">
                                Загрузка товаров...
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="text-center py-20 text-[#6B809E]">
                                Товары со скидкой не найдены
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-7.5">
                                    {currentProducts.map((product) => (
                                        <ProductCard
                                            key={`${product.productType}-${product.categorySlug}-${product.id}`}
                                            product={product}
                                            isTablet={isTablet}
                                            isMobile={isMobile}
                                            isNarrowMobile={isNarrowMobile}
                                        />
                                    ))}
                                </div>

                                {/* Пагинация */}
                                {totalPages > 1 && (
                                    <Pagination
                                        initialPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Динамическое описание страницы */}
                    {!loadingDescription && dynamicPageDescription && dynamicPageDescription.blocks && dynamicPageDescription.blocks.length > 0 && (
                        <div className={`mt-15 ${isTablet ? 'container-centered' : ''}`}>
                            <PageBlocksRenderer blocks={dynamicPageDescription.blocks} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default DiscountPage;
