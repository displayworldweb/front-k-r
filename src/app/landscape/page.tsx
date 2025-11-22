"use client";
import { useEffect, useState } from "react";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../components/ProductCard";
import Promo from "../components/Promo";
import { PageDescriptionBlock } from "../components/PageDescriptionBlock";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

interface LandscapeItem {
  id: number;
  slug: string;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  specifications?: any;
  description?: string;
  createdAt: string;
}

// Функция для получения минимальной цены по категории
const fetchMinPrice = async (categoryName: string): Promise<number> => {
    try {
        const res = await apiClient.get(`${API_ENDPOINTS.landscape}`);
        const allItems = Array.isArray(res) ? res : res?.data || [];
        // Фильтруем по категории (на русском языке)
        const items = allItems.filter((item: any) => item.category === categoryName);
        const prices = items
          .map((p: any) => {
            const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
            return price;
          })
          .filter((p: any) => p && !isNaN(p) && p > 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
    } catch (e) {
        console.error('Error fetching min price for category', categoryName, ':', e);
        return 0;
    }
};

// Функция для форматирования цены
const formatPrice = (price: number): string | undefined =>
    price > 0 ? `от ${Math.round(price)} руб.` : undefined;

// Статичные категории landscape с правильными изображениями
const categoriesLandscapeMock = [
  {
    title: "Щебень",
    price: undefined,
    img: "/landscape/gravel.webp",
    link: "/landscape/gravel",
    hasProducts: true,
  },
  {
    title: "Столы и скамейки",
    price: undefined,
    img: "/landscape/tables.webp", 
    link: "/landscape/benches",
    hasProducts: true,
  },
  {
    title: "Укладка плитки",
    price: undefined,
    img: "/landscape/tiles.webp",
    link: "/landscape/tiles",
    hasProducts: true,
  },
  {
    title: "Искусственный газон",
    price: undefined,
    img: "/landscape/lawn.webp",
    link: "/landscape/lawn",
    hasProducts: true,
  },
  {
    title: "Благоустройство могил",
    price: undefined,
    img: "/landscape/graves.webp",
    link: "/landscape/graves",
    hasProducts: false,
  },
  {
    title: "Фундамент для памятников",
    price: undefined,
    img: "/landscape/foundation.webp",
    link: "/landscape/foundation",
    hasProducts: false,
  },
];

// Функция для получения продуктов для конкретной страницы
const getProductsForPage = (cards: LandscapeItem[], page: number, productsPerPage: number) => {
    const startIndex = (page - 1) * productsPerPage;
    return cards.slice(startIndex, startIndex + productsPerPage);
};

const LandscapePage = () => {
    const [isClient, setIsClient] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(60);
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [landscapeItems, setLandscapeItems] = useState<LandscapeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

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

    // Загрузка данных из API
    useEffect(() => {
        const fetchLandscapeData = async () => {
            try {
                const data = await apiClient.get("/landscape");
                
                if (data.success && data.data) {
                    setLandscapeItems(data.data);
                }
            } catch (error) {
                console.error("Error fetching landscape data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLandscapeData();
    }, []);

    // Загрузка цен для категорий
    useEffect(() => {
        const loadCategoryPrices = async () => {
            try {
                const gravelPrice = await fetchMinPrice("Щебень");
                const benchesPrice = await fetchMinPrice("Столы и скамейки");
                const tilesPrice = await fetchMinPrice("Укладка плитки");
                const lawnPrice = await fetchMinPrice("Искусственный газон");

                const updatedCategories = categoriesLandscapeMock.map((cat) => {
                    let price: string | undefined;
                    switch (cat.title) {
                        case "Щебень":
                            price = formatPrice(gravelPrice);
                            break;
                        case "Столы и скамейки":
                            price = formatPrice(benchesPrice);
                            break;
                        case "Укладка плитки":
                            price = formatPrice(tilesPrice);
                            break;
                        case "Искусственный газон":
                            price = formatPrice(lawnPrice);
                            break;
                        default:
                            price = undefined;
                    }
                    return { ...cat, price };
                });

                setCategories(updatedCategories);
            } catch (error) {
                console.error("Error loading category prices:", error);
                setCategories(categoriesLandscapeMock);
            }
        };
        loadCategoryPrices();
    }, []);

    // Обработчик изменения количества товаров на странице
    const handleProductsPerPageChange = (count: number) => {
        setProductsPerPage(count);
        setCurrentPage(1);
    };

    // Получаем продукты для текущей страницы
    const currentProducts = getProductsForPage(landscapeItems, currentPage, productsPerPage);

    if (loading) {
        return (
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <div className="text-center py-8">
                        <p className="text-gray-600">Загрузка...</p>
                    </div>
                </div>
            </section>
        );
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
                        <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Благоустройство могил</h1>

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
                                                className={`h-full object-cover rounded-lg ${isTablet ? 'w-[75px]' : 'w-[130px]'}`} loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </a>
                            ))}
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
                            onClick={() => handleProductsPerPageChange(landscapeItems.length)}
                            className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === landscapeItems.length
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
                            currentProducts.map((product) => (
                                <ProductCard
                                    key={product.slug || `product-${product.id}`}
                                    product={{
                                        id: product.id,
                                        slug: product.slug,
                                        name: product.name,
                                        price: product.price,
                                        textPrice: product.textPrice,
                                        category: product.category,
                                        image: product.image,
                                        colors: product.image ? [{
                                            name: "Стандартный",
                                            color: "#000000",
                                            image: product.image,
                                            price: product.price
                                        }] : []
                                    }}
                                    isTablet={isTablet}
                                    isMobile={isMobile}
                                    isNarrowMobile={isNarrowMobile}
                                />
                            ))
                        ) : (
                            currentProducts.map((product) => (
                                <div key={product.slug || `product-${product.id}`} className="invisible h-0" />
                            ))
                        )}
                    </div>
                    {/* Описание страницы */}
                    <PageDescriptionBlock pageSlug="landscape" />
                    </div>
                </div>
            </section>

            {/* Promo внизу страницы */}
            <div className="mb-12.5 lg:mb-15">
                <Promo />
            </div>
        </>
    );
};

export default LandscapePage;