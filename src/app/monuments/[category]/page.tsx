"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PathPage from "@/app/components/PathPage";
import SidebarCatalogMenu from "@/app/components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "@/app/components/Sidebar/SidebarStickyHelp";
import ProductCard from "@/app/components/ProductCard";
import Pagination from "@/app/components/Pagination";
// import { productsMonuments } from "@/app/mock/products"; // Убираем импорт mock данных
import SubcategoryDescription from "@/app/components/SubcategoryDescription";
import Promo from "@/app/components/Promo";
import { Product, ColorOption } from "@/app/types/types";
import { apiClient } from "@/lib/api-client";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { getPageDescription, getPageSlugForCategory, PageDescription } from "@/lib/page-descriptions";

export const categorySlugToName: Record<string, string> = {
    'single': 'Одиночные',
    'double': 'Двойные',
    'cheap': 'Недорогие',
    'cross': 'В виде креста',
    'heart': 'В виде сердца',
    'composite': 'Составные',
    'europe': 'Европейские',
    'artistic': 'Художественная резка',
    'tree': 'В виде деревьев',
    'complex': 'Мемориальные комплексы',
    'exclusive': 'Эксклюзивные',
};

// Функция для конвертации товара из БД в формат ProductCard
function convertExclusiveToProductFormat(dbProduct: Record<string, unknown>) {
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
        colors: parsedColors, // Массив цветов
        options: parsedOptions, // Объект опций
        hit: Boolean(dbProduct.hit),
        popular: Boolean(dbProduct.popular),
        new: Boolean(dbProduct.new),
    };
}

// Типы
interface CategoryData {
    title: string;
    description?: DescriptionSection[]; // Описание может быть необязательным
    products: Product[]; // Массив продуктов для этой категории
    otherCategories: {
        title: string;
        image: string;
        link: string;
    }[];
    sortOptions?: string[]; // Опционально: опции сортировки
}

interface DescriptionSection {
    type: 'paragraph' | 'heading' | 'orderedList' | 'unorderedList';
    content?: string;
    items?: string[];
}

// Данные для подкатегорий
const subcategoryData: Record<string, CategoryData> = {
    "single": {
        title: "Одиночные памятники",
        products: [], // Будет загружено через API
        otherCategories: [
            { title: "Недорогие", image: "/section/cheap.webp", link: "/monuments/cheap" },
            { title: "Памятники", image: "/section/single.webp", link: "/monuments" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "double": {
        title: "Двойные памятники",
        products: [], // Будет загружено через API
        otherCategories: [
            { title: "Недорогие", image: "/section/cheap.webp", link: "/monuments/cheap" },
            { title: "Памятники", image: "/section/single.webp", link: "/monuments" },
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "exclusive": {
        title: "Эксклюзивные памятники",
        products: [],
        otherCategories: [
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
            { title: "Недорогие", image: "/section/cheap.webp", link: "/monuments/cheap" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },

    "cheap": {
        title: "Недорогие памятники",
        products: [], // Будет загружено через API
        otherCategories: [
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
            { title: "Памятники", image: "/section/single.webp", link: "/monuments" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки"],
    },
    "composite": {
        title: "Составные памятники",
        products: [], // Будет загружено через API
        otherCategories: [
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
            { title: "Недорогие", image: "/section/cheap.webp", link: "/monuments/cheap" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "cross": {
        title: "В виде креста",
        products: [],
        otherCategories: [
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
            { title: "В виде сердца", image: "/section/single.webp", link: "/monuments/heart" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "heart": {
        title: "В виде сердца",
        products: [],
        otherCategories: [
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
            { title: "В виде креста", image: "/section/single.webp", link: "/monuments/cross" },
            { title: "Эксклюзивные", image: "/section/single.webp", link: "/monuments/exclusive" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "europe": {
        title: "Европейские",
        products: [],
        otherCategories: [
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
            { title: "Эксклюзивные", image: "/section/single.webp", link: "/monuments/exclusive" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "artistic": {
        title: "Художественная резка",
        products: [],
        otherCategories: [
            { title: "Эксклюзивные", image: "/section/single.webp", link: "/monuments/exclusive" },
            { title: "Одиночные", image: "/section/single.webp", link: "/monuments/single" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "tree": {
        title: "В виде деревьев",
        products: [],
        otherCategories: [
            { title: "Эксклюзивные", image: "/section/single.webp", link: "/monuments/exclusive" },
            { title: "В виде креста", image: "/section/single.webp", link: "/monuments/cross" },
            { title: "В виде сердца", image: "/section/single.webp", link: "/monuments/heart" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    },
    "complex": {
        title: "Мемориальные комплексы",
        products: [],
        otherCategories: [
            { title: "Составные", image: "/section/single.webp", link: "/monuments/composite" },
            { title: "Эксклюзивные", image: "/section/single.webp", link: "/monuments/exclusive" },
            { title: "Двойные", image: "/section/double.webp", link: "/monuments/double" },
        ],
        sortOptions: ["Со скидкой", "По цене", "По высоте", "Новинки", "Популярные", "Хит"],
    }
};

// Генерируем статические параметры для всех категорий
export async function generateStaticParams() {
    return Object.keys(subcategoryData).map((slug) => ({
        category: slug,
    }));
}

const MonumentsSubcategoryPage = () => {
    const params = useParams();
    const categorySlug = params?.category as string;

    const [isClient, setIsClient] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(60);
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [categoryData, setCategoryData] = useState<Record<string, CategoryData>>(subcategoryData);
    const [dynamicPageDescription, setDynamicPageDescription] = useState<PageDescription | null>(null);
    const [loadingDescription, setLoadingDescription] = useState(false);

    // Получаем данные для текущей подкатегории
    const currentCategoryData = categorySlug ? categoryData[categorySlug.toLowerCase()] || null : null;

    // Обработчик сортировки (если есть опции)
    const [sortOption, setSortOption] = useState(currentCategoryData?.sortOptions ? currentCategoryData.sortOptions[0] : "");

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

    // Загрузка динамического описания страницы
    useEffect(() => {
        const loadPageDescription = async () => {
            if (!categorySlug) return;

            setLoadingDescription(true);
            try {
                const pageSlug = getPageSlugForCategory(categorySlug.toLowerCase());
                const description = await getPageDescription(pageSlug);
                setDynamicPageDescription(description);
            } catch (error) {
                console.error("Ошибка загрузки описания страницы:", error);
            } finally {
                setLoadingDescription(false);
            }
        };

        loadPageDescription();
    }, [categorySlug]);

    // Загружаем памятники для текущей категории при монтировании компонента
    useEffect(() => {
        const loadMonuments = async () => {
            if (!categorySlug) return;

            try {
                // Определяем API endpoint в зависимости от категории
                let apiEndpoint = "";
                const lowerCategorySlug = categorySlug.toLowerCase();

                switch (lowerCategorySlug) {
                    case "одиночные":
                    case "single":
                        apiEndpoint = "/monuments/single";
                        break;
                    case "двойные":
                    case "double":
                        apiEndpoint = "/monuments/double";
                        break;
                    case "недорогие":
                    case "cheap":
                        apiEndpoint = "/monuments/cheap";
                        break;
                    case "составные":
                    case "composite":
                        apiEndpoint = "/monuments/composite";
                        break;
                    case "exclusive":
                    case "эксклюзивные":
                        apiEndpoint = "/monuments/exclusive";
                        break;
                    default:
                        // Для других категорий используем общий API
                        apiEndpoint = `/monuments?category=${encodeURIComponent(lowerCategorySlug)}`;
                }

                const data = await apiClient.get(apiEndpoint);

                if (data.success && data.data) {
                    const convertedProducts = data.data.map(convertExclusiveToProductFormat);
                    
                    // Сортируем памятники по порядку (О-1, О-2, Д-1, Д-2 и т.д.)
                    const sortedProducts = convertedProducts.sort((a: Product, b: Product) => {
                        const nameA = a.name.toLowerCase();
                        const nameB = b.name.toLowerCase();
                        
                        // Извлекаем префикс (буквы) и номер из названия
                        const matchA = nameA.match(/^([а-яё\-]+)(\d+)/) || nameA.match(/^(.+?)(\d+)/);
                        const matchB = nameB.match(/^([а-яё\-]+)(\d+)/) || nameB.match(/^(.+?)(\d+)/);
                        
                        if (matchA && matchB) {
                            const prefixA = matchA[1];
                            const prefixB = matchB[1];
                            const numberA = parseInt(matchA[2], 10);
                            const numberB = parseInt(matchB[2], 10);
                            
                            // Сначала сортируем по префиксу
                            if (prefixA !== prefixB) {
                                return prefixA.localeCompare(prefixB, 'ru');
                            }
                            
                            // Затем по номеру
                            return numberA - numberB;
                        }
                        
                        // Если не удалось извлечь номер, сортируем по алфавиту
                        return nameA.localeCompare(nameB, 'ru');
                    });
                    
                    console.log(`Загружено ${sortedProducts.length} памятников для категории ${lowerCategorySlug}`);

                    setCategoryData(prev => ({
                        ...prev,
                        [lowerCategorySlug]: {
                            ...prev[lowerCategorySlug],
                            products: sortedProducts,
                        }
                    }));
                } else {
                    console.error("Ошибка в ответе API:", data);
                }
            } catch (error) {
                console.error("Ошибка при загрузке памятников:", error);
            }
        };

        loadMonuments();
    }, [categorySlug]);

    if (!currentCategoryData) {
        // Если подкатегория не найдена, можно показать 404 или заглушку
        return (
            <div className="container-centered mt-5 max-w-[1300px]">
                <h1>Подкатегория не найдена</h1>
            </div>
        );
    }

    // Получаем продукты для текущей страницы
    const products = currentCategoryData.products || [];
    const currentProducts = products.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    // Рассчитываем общее количество страниц
    const totalPages = Math.ceil(products.length / productsPerPage);

    // Обработчик изменения количества товаров на странице
    const handleProductsPerPageChange = (count: number) => {
        setProductsPerPage(count);
        setCurrentPage(1);
    };

    // Функция для сортировки
    const sortedProducts = [...products].sort((a, b) => {
        switch (sortOption) {
            case "Со скидкой":
                return (b.discount || 0) - (a.discount || 0);
            
            case "По цене":
                // Сортировка от меньшей цены к большей
                return (a.price || 0) - (b.price || 0);
            
            case "По высоте":
                // Извлекаем числовое значение из строки высоты (например, "123 см" -> 123)
                const heightA = parseInt(String(a.height || '0').match(/\d+/)?.[0] || '0', 10);
                const heightB = parseInt(String(b.height || '0').match(/\d+/)?.[0] || '0', 10);
                // Сортировка от большей высоты к меньшей
                return heightB - heightA;
            
            case "Новинки":
                // Сначала новые (new: true), потом остальные
                if (a.new && !b.new) return -1;
                if (!a.new && b.new) return 1;
                return 0;
            
            case "Популярные":
                // Сначала популярные (popular: true), потом остальные
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                return 0;
            
            case "Хит":
                // Для эксклюзивных памятников проверяем хит в цветах
                if (categorySlug.toLowerCase() === 'exclusive') {
                    const aHasHit = a.colors && a.colors.some(color => color.hit === true);
                    const bHasHit = b.colors && b.colors.some(color => color.hit === true);
                    
                    if (aHasHit && !bHasHit) return -1;
                    if (!aHasHit && bHasHit) return 1;
                    return 0;
                } else {
                    // Для остальных памятников проверяем хит на уровне продукта
                    if (a.hit && !b.hit) return -1;
                    if (!a.hit && b.hit) return 1;
                    return 0;
                }
            
            default:
                return 0;
        }
    });

    // Пересчитываем products и pages при изменении сортировки
    const sortedCurrentProducts = sortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );
    const sortedTotalPages = Math.ceil(sortedProducts.length / productsPerPage);

    // Для простоты используем отфильтрованные продукты, а не отсортированные, если сортировка не активна
    const finalProducts = sortOption && currentCategoryData.sortOptions ? sortedCurrentProducts : currentProducts;
    const finalTotalPages = sortOption && currentCategoryData.sortOptions ? sortedTotalPages : totalPages;

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
                        <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">{currentCategoryData.title}</h1>

                        {/* Блок сортировки (если есть) */}
                        {currentCategoryData.sortOptions && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {currentCategoryData.sortOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSortOption(option)}
                                        className={`px-4 py-2 border border-gray-300 rounded-full text-[16px] font-medium transition ${sortOption === option
                                            ? "bg-[#2c3a54] text-white"
                                            : "text-[#2c3a54] hover:bg-[#2c3a54] hover:text-white"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

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
                                onClick={() => handleProductsPerPageChange(currentCategoryData.products.length)}
                                className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === currentCategoryData.products.length
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
                                finalProducts.map((product) => (
                                    <ProductCard
                                        key={product.slug || `product-${product.id}`}
                                        product={product}
                                        isTablet={isTablet}
                                        isMobile={isMobile}
                                        isNarrowMobile={isNarrowMobile}
                                    />
                                ))
                            ) : (
                                finalProducts.map((product) => (
                                    <div key={product.slug || `product-${product.id}`} className="invisible h-0" />
                                ))
                            )}
                        </div>

                        {/* Пагинация */}
                        <Pagination
                            totalPages={finalTotalPages}
                            onPageChange={setCurrentPage}
                            initialPage={1}
                        />

                        {/* Описание страницы (динамическое или статическое) */}
                        {dynamicPageDescription ? (
                            <div className="mt-8">
                                {dynamicPageDescription.blocks && dynamicPageDescription.blocks.length > 0 ? (
                                    <PageBlocksRenderer 
                                        blocks={dynamicPageDescription.blocks} 
                                        className="prose prose-lg max-w-none"
                                    />
                                ) : null}
                            </div>
                        ) : (
                            currentCategoryData.description && (
                                <SubcategoryDescription sections={currentCategoryData.description} />
                            )
                        )}
                        
                        {loadingDescription && (
                            <div className="mt-8 text-center text-gray-500">
                                Загрузка описания...
                            </div>
                        )}

                        {/* Блок "Другие категории" */}
                        {currentCategoryData?.otherCategories && (
                            <div className={`mt-17 lg:mt-30 ${isTablet ? 'container-centered' : ''}`}>
                                <h2 className="text-[28px] font-bold text-[#2c3a54] ml-2.5 mb-3.5 lg:mb-5">Другие категории</h2>
                                <div className={`flex flex-wrap ${isMobile ? 'flex-col space-y-2.5' : ''}`}>
                                    {currentCategoryData.otherCategories.map((cat) => (
                                        <div
                                            key={cat.title}
                                            className={`px-1.25 md:px-2.5 max-w-1/3 flex-1/3 min-h-[60px] lg:min-h-[140px] ${isMobile ? 'max-w-full' : ''}`}
                                        >
                                            <a
                                                href={cat.link}
                                                className="block overflow-hidden rounded-lg hover:border-2 border-[#2c3a54] bg-[#f5f6fa] relative h-full items-center p-7.5"
                                            >
                                                <h2 className="text-[16px] font-bold text-[#222222] self-start">{cat.title}</h2>
                                                <img
                                                    src={cat.image}
                                                    alt={cat.title}
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
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* внизу страницы */}
            <div className="mb-12.5 lg:mb-15">
                <Promo />
            </div>
        </>
    );
};

export default MonumentsSubcategoryPage;