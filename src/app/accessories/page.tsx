"use client";
import { useEffect, useState } from "react";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { categoriesAccessories } from "../mock/categories";
import Promo from "../components/Promo";
import { PageDescriptionBlock } from "../components/PageDescriptionBlock";
import { apiClient } from "@/lib/api-client";

interface Accessory {
  id: number;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  createdAt: string;
}

interface AccessoryProduct {
  id: number;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  createdAt: string;
}

// Функция для получения продуктов для конкретной страницы
const getProductsForPage = (cards: AccessoryProduct[], page: number, productsPerPage: number) => {
    const startIndex = (page - 1) * productsPerPage;
    return cards.slice(startIndex, startIndex + productsPerPage);
};

// Функция для получения количества страниц
const getTotalPages = (totalProducts: number, productsPerPage: number) => {
    return Math.ceil(totalProducts / productsPerPage);
};

const AccessoriesPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [accessories, setAccessories] = useState<AccessoryProduct[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(60); // По умолчанию показываем 60 товаров
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    // Для адаптивности и загрузки данных
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
        
        // Загружаем аксессуары из БД
        const fetchAccessories = async () => {
            try {
                const data = await apiClient.get("/accessories");
                if (data.success) {
                    // Преобразуем в формат с colors для совместимости с ProductCard
                    const transformed = (data.data || []).map((item: any) => ({
                        ...item,
                        // Оборачиваем в один "цвет" с основным изображением
                        colors: [{
                            name: item.category,
                            image: item.image,
                            price: item.price,
                        }],
                    }));
                    setAccessories(transformed);
                }
            } catch (error) {
                console.error("Error fetching accessories:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAccessories();
        
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Получаем продукты для текущей страницы
    const currentProducts = getProductsForPage(accessories, currentPage, productsPerPage);

    // Рассчитываем общее количество страниц
    const totalPages = getTotalPages(accessories.length, productsPerPage);

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
                        <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Аксессуары для памятников</h1>

                        {/* Блок категорий */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-7.5">
                            {categoriesAccessories.map((category) => (
                                <a
                                    key={category.title}
                                    href={category.link}
                                    className="block overflow-hidden rounded-lg"
                                >
                                    <div className="relative flex h-[80px] lg:h-[120px] py-5 pl-3.75 pr-12.5 lg:pr-25 justify-between bg-[#f5f6fa] rounded-lg hover:border-2 border-[#2c3a54]">
                                        <div className="flex flex-col w-[70%] self-center z-10">
                                            <h2 className="text-[16px] font-bold text-[#222222] mb-2.5">{category.title}</h2>
                                            <p className="text-[12px] text-[#969ead]">{category.price}</p>
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
                            onClick={() => handleProductsPerPageChange(accessories.length)}
                            className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === accessories.length
                                ? ""
                                : "cursor-pointer underline underline-offset-3 hover:no-underline"
                                }`}
                        >
                            Все
                        </button>
                    </div>

                    {/* Сетка продуктов */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 mb-7.5">
                        {isClient ? (
                            currentProducts.map((product: any) => (
                                <ProductCard
                                    key={`accessories-${product.id}`}
                                    product={product}
                                    isTablet={isTablet}
                                    isMobile={isMobile}
                                    isNarrowMobile={isNarrowMobile}
                                />
                            ))
                        ) : (
                            currentProducts.map((product) => (
                                <div key={`product-${product.id}`} className="invisible h-0" />
                            ))
                        )}
                    </div>

                    {/* Пагинация */}
                    <Pagination
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        initialPage={1}
                    />

                    <PageDescriptionBlock pageSlug="accessories" />
                </div>
            </section>

            {/* OurWorksSlider внизу страницы */}
            <div className="mb-12.5 lg:mb-15">
                <Promo />
            </div>
        </>
    );
};

export default AccessoriesPage;