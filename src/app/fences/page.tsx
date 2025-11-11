"use client";
import { useEffect, useState } from "react";
import OurWorksSlider from "../components/OurWorksSlider";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { categoriesFences } from "../mock/categories";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { PageDescriptionBlock } from "../components/PageDescriptionBlock";

interface Fence {
  id: number;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  createdAt: string;
}

interface FenceProduct {
  id: number;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  createdAt: string;
}

// Функция для получения продуктов для конкретной страницы
const getProductsForPage = (cards: FenceProduct[], page: number, productsPerPage: number) => {
    const startIndex = (page - 1) * productsPerPage;
    return cards.slice(startIndex, startIndex + productsPerPage);
};

// Функция для получения количества страниц
const getTotalPages = (totalProducts: number, productsPerPage: number) => {
    return Math.ceil(totalProducts / productsPerPage);
};

const FencesPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [fences, setFences] = useState<FenceProduct[]>([]);
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
        
        // Загружаем ограды из БД
        const fetchFences = async () => {
            try {
                const data = await apiClient.get("/fences?limit=200");
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
                    setFences(transformed);
                }
            } catch (error) {
                console.error("Error fetching fences:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchFences();
        
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Получаем продукты для текущей страницы
    const currentProducts = getProductsForPage(fences, currentPage, productsPerPage);

    // Рассчитываем общее количество страниц
    const totalPages = getTotalPages(fences.length, productsPerPage);

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
                        <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Ограды на кладбище</h1>

                        {/* Блок категорий */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-7.5">
                            {categoriesFences.map((category) => (
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
                            onClick={() => handleProductsPerPageChange(fences.length)}
                            className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === fences.length
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
                                    key={product.id}
                                    product={product}
                                    isTablet={isTablet}
                                    isMobile={isMobile}
                                    isNarrowMobile={isNarrowMobile}
                                />
                            ))
                        ) : (
                            currentProducts.map((product) => (
                                <div key={product.id} className="invisible h-0" />
                            ))
                        )}
                    </div>

                    {/* Пагинация */}
                    <Pagination
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        initialPage={1}
                    />

                    {/* Описание страницы */}
                    <PageDescriptionBlock pageSlug="fences-catalog" />

                    {/* Блок "Другие категории" */}
                    <div className={`mt-17 lg:mt-30 ${isTablet ? 'container-centered' : ''}`}>
                        <h2 className="text-[28px] font-bold text-[#2c3a54] ml-2.5 mb-3.5 lg:mb-5">Другие категории</h2>
                        {/* Общий блок с flex */}
                        <div className={`flex flex-wrap ${isNarrowMobile ? 'flex-col space-y-2.5' : ''}`}>
                            {/* Карточка "Памятники" */}
                            <div className={`px-1.25 md:px-2.5 max-w-1/2 flex-1/2 min-h-[60px] lg:min-h-[140px] ${isNarrowMobile ? 'max-w-full' : ''}`}>
                                <Link
                                    href="/monuments"
                                    className="block overflow-hidden rounded-lg hover:border-2 border-[#2c3a54] bg-[#f5f6fa] relative h-full items-center p-7.5"
                                >
                                    {/* Текст */}
                                    <h2 className="text-[16px] font-bold text-[#222222] self-start">Памятники</h2>
                                    {/* Изображение с абсолютным позиционированием */}
                                    <img
                                        src="/section/monuments.webp"
                                        alt="Памятники"
                                        className="w-[75px] lg:w-[130px] h-auto object-cover rounded-lg"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '10px',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                </Link>
                            </div>

                            {/* Карточка "Аксессуары" */}
                            <div className={`px-1.25 md:px-2.5 max-w-1/2 flex-1/2 min-h-[60px] lg:min-h-[140px] ${isNarrowMobile ? 'max-w-full' : ''}`}>
                                <Link
                                    href="/accessories"
                                    className="block overflow-hidden rounded-lg hover:border-2 border-[#2c3a54] bg-[#f5f6fa] relative h-full items-center p-7.5"
                                >
                                    {/* Текст */}
                                    <h2 className="text-[16px] font-bold text-[#222222] self-start">Аксессуары</h2>
                                    {/* Изображение с абсолютным позиционированием */}
                                    <img
                                        src="/section/accessories.webp"
                                        alt="Аксессуары"
                                        className="w-[75px] lg:w-[130px] h-auto object-cover rounded-lg"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '10px',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                </Link>
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

export default FencesPage;