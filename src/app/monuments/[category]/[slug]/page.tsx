"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import ProductWorksGallery from "@/app/components/ProductWorksGallery";
import PathPage from "../../../components/PathPage";
import SidebarCatalogMenu from "../../../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../../../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../../../components/ProductCard";
import { graniteTypes } from "../../../mock/graniteTypes";
import Image from "next/image";
import Tooltip from "../../../components/Tooltip";
import { apiClient } from "@/lib/api-client";
import ModalCommunication from "../../../components/Modal/ModalCommunication";
import { categorySlugToName } from "../page";

// Функция для конвертации товара из админки в формат ProductCard
function convertMonumentToProductFormat(dbProduct: Record<string, unknown>) {
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
    let parsedColors: any[] = [];
    if (typeof dbProduct.colors === 'string') {
        try {
            parsedColors = JSON.parse(dbProduct.colors as string);
        } catch (e) {
            console.warn('Failed to parse colors:', dbProduct.colors);
            parsedColors = [];
        }
    } else if (Array.isArray(dbProduct.colors)) {
        parsedColors = dbProduct.colors as any[];
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
    };
}

// Статические характеристики для памятников
const STATIC_CHARACTERISTICS = {
  "Изготовление в других размерах": "Да",
  "Изготовление в другом цвете": "Возможно", 
  "Оформление": "Входит в стоимость",
  "Хранение": "Бесплатно в течении 1 года",
  "Установка": "Не входит в стоимость",
};

interface ImageItem {
    id: number;
    src: string; // Путь к изображению
    alt: string; // Альтернативный текст
    caption?: string; // Опциональный подпись
}

const ProductPage = () => {
    const params = useParams();
    const productSlug = params?.slug as string; // Теперь это slug
    const categorySlug = params?.category as string;

    // Состояния компонента
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Остальные состояния
    const [selectedColor, setSelectedColor] = useState<{
        name: string;
        image: string;
    } | null>(null);
    const [activeTab, setActiveTab] = useState<
        "characteristics" | "description" | "granite"
    >("characteristics"); // Активная вкладка
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipContent, setTooltipContent] = useState({
        image: "",
        description: "",
    });
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null); // Реф для элемента тултипа
    const characteristicsContentRef = useRef<HTMLDivElement>(null); // Ref для содержимого вкладки "Характеристики"
    const tooltipOpenRef = useRef(tooltipOpen);
    const activeTabRef = useRef(activeTab);
    const [tooltipAbsolutePosition, setTooltipAbsolutePosition] = useState({
        top: 0,
        left: 0,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    // Модальное окно для видов гранита (как на странице /granite)
    const [isGraniteModalOpen, setIsGraniteModalOpen] = useState(false);
    const [currentGraniteSlide, setCurrentGraniteSlide] = useState(0);
    //Модальное окно для примеров оформления
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImageSlide, setCurrentImageSlide] = useState(0);

    const [imageSlides, setImageSlides] = useState<ImageItem[]>([]); // Массив изображений для модалки

    // Состояние для похожих товаров
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);

    // Функция для отображения цены
    const formatPriceDisplay = (price: number | null | undefined, description?: string | null): string | null => {
        // Если есть описание с текстовой ценой (для новых категорий памятников)
        if (description && (description.includes('цена по запросу') || description.includes('под заказ'))) {
            return 'цена по запросу';
        }
        
        // Если цена равна 0, null или undefined, показываем "цена по запросу"
        if (!price || price === 0) {
            return 'цена по запросу';
        }
        
        return null; // Используем обычную логику отображения цены
    };

    // Refs
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    // Загрузка данных продукта и похожих товаров
    useEffect(() => {
        const loadProduct = async () => {
            if (!productSlug || !categorySlug) return;
            
            try {
                setIsLoading(true);
                const data = await apiClient.get(`/monuments/${categorySlug}/${productSlug}`);
                if (data.success && data.data) {
                    // Парсим JSON строку options в объект
                    let parsedOptions = {};
                    if (typeof data.data.options === 'string') {
                        try {
                            parsedOptions = JSON.parse(data.data.options);
                        } catch (e) {
                            console.warn('Failed to parse options:', data.data.options);
                        }
                    } else if (data.data.options) {
                        parsedOptions = data.data.options;
                    }
                    
                    // Обновляем данные продукта с распарсенными options
                    setProduct({
                        ...data.data,
                        options: parsedOptions
                    });
                    
                    // Загружаем похожие товары из той же категории
                    try {
                        console.log('Loading similar products for category:', categorySlug);
                        // Используем правильный endpoint для категории
                        const similarData = await apiClient.get(`/admin/monuments?category=${categorySlug}`);
                        console.log('Similar products response:', similarData);
                        if (similarData.success && similarData.products) {
                            // Фильтруем товары, исключая текущий товар, и конвертируем в нужный формат
                            const filtered = similarData.products
                                .filter((p: any) => p.id !== data.data.id)
                                .sort(() => 0.5 - Math.random()) // Рандомизируем
                                .slice(0, 6) // Берем максимум 6 товаров
                                .map(convertMonumentToProductFormat); // Конвертируем в формат ProductCard
                            console.log('Filtered similar products:', filtered);
                            setSimilarProducts(filtered);
                        }
                    } catch (error) {
                        console.error("Ошибка загрузки похожих товаров:", error);
                        // Fallback: пробуем другой endpoint
                        try {
                            const fallbackData = await apiClient.get("/monuments");
                            if (fallbackData.success && fallbackData.data) {
                                const filtered = fallbackData.data
                                    .filter((p: any) => p.category === data.data.category && p.id !== data.data.id)
                                    .sort(() => 0.5 - Math.random()) 
                                    .slice(0, 6)
                                    .map(convertMonumentToProductFormat); // Конвертируем в формат ProductCard
                                setSimilarProducts(filtered);
                            }
                        } catch (fallbackError) {
                            console.error("Ошибка загрузки похожих товаров (fallback):", fallbackError);
                        }
                    }
                } else {
                    setError("Продукт не найден");
                }
            } catch (err) {
                setError("Ошибка загрузки продукта");
            } finally {
                setIsLoading(false);
            }
        };
        
        loadProduct();
    }, [productSlug, categorySlug]);

    // Обработчики событий
    const handleClickOutside = (e: MouseEvent) => {
        if (
            modalRef.current &&
            !modalRef.current.contains(e.target as Node) &&
            backdropRef.current &&
            e.target === backdropRef.current
        ) {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);

    // Функция для открытия модалки
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Функция для закрытия модалки
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        document.body.style.overflow = "auto";
    };

    const nextImageSlide = () => {
        setCurrentImageSlide((prev) => (prev + 1) % imageSlides.length);
    };

    const prevImageSlide = () => {
        setCurrentImageSlide(
            (prev) => (prev - 1 + imageSlides.length) % imageSlides.length
        );
    };


    const nextGraniteSlide = () => {
        setCurrentGraniteSlide((prev) => (prev + 1) % graniteTypes.length);
    };

    const prevGraniteSlide = () => {
        setCurrentGraniteSlide(
            (prev) => (prev - 1 + graniteTypes.length) % graniteTypes.length
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isGraniteModalOpen) return;
            if (e.key === "Escape") {
                closeGraniteModal();
            } else if (e.key === "ArrowLeft") {
                prevGraniteSlide();
            } else if (e.key === "ArrowRight") {
                nextGraniteSlide();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isGraniteModalOpen, nextGraniteSlide, prevGraniteSlide]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isImageModalOpen) return;
            if (e.key === "Escape") {
                closeImageModal();
            } else if (e.key === "ArrowLeft") {
                prevImageSlide();
            } else if (e.key === "ArrowRight") {
                nextImageSlide();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isImageModalOpen, nextImageSlide, prevImageSlide]);

    // Блокировка скролла при открытии модалки
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isModalOpen]);

    // Закрытие по Esc
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsModalOpen(false);
            }
        };
        if (isModalOpen) {
            window.addEventListener("keydown", handleEsc);
        }
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isModalOpen]);

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

    useEffect(() => {
        if (product?.slug) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            // Проверяем как по slug, так и по старому id для совместимости
            const isFavoriteBySlug = favorites.includes(product.slug);
            const isFavoriteById = favorites.includes(product.id);
            setIsFavorite(isFavoriteBySlug || isFavoriteById);
        }
    }, [product?.slug, product?.id]);

    // Используем useRef для хранения актуального значения tooltipOpen
    useEffect(() => {
        tooltipOpenRef.current = tooltipOpen;
    }, [tooltipOpen]);

    // Обработчик клика вне, использующий useRef
    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!tooltipOpenRef.current) return;

            const target = event.target as Node;

            // Единственное исключение: клик по самому тултипу
            if (tooltipRef.current && tooltipRef.current.contains(target)) {
                return;
            }

            // Во ВСЕХ остальных случаях — закрываем
            setTooltipOpen(false);
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Обработка состояний загрузки
    if (isLoading) {
        return (
            <section className="container-centered mt-5 max-w-[1300px]">
                <div className="w-full lg:ml-5 lg:max-w-[75%]">
                    <PathPage />
                    <div className="flex items-center justify-center py-20">
                        <div className="text-[#2c3a54] text-lg">Загрузка...</div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !product) {
        return (
            <section className="container-centered mt-5 max-w-[1300px]">
                <div className="w-full lg:ml-5 lg:max-w-[75%]">
                    <PathPage />
                    <h1 className="text-black text-[28px] mt-2.5 mb-5">
                        {error || "Товар не найден"}
                    </h1>
                </div>
            </section>
        );
    }

    // Обработчик клика на звезду (избранное)
    const toggleFavorite = () => {
        if (!product.slug) {
            console.warn('Товар не имеет slug, нельзя добавить в избранное');
            return;
        }

        const newIsFavorite = !isFavorite;
        setIsFavorite(newIsFavorite);

        // Получаем текущие избранные и очищаем от старых числовых ID
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // Фильтруем только строки (slug'и), удаляя числовые ID
        favorites = favorites.filter((item: any) => typeof item === 'string');

        if (newIsFavorite) {
            // Добавляем в избранное
            if (!favorites.includes(product.slug)) {
                favorites.push(product.slug);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                console.log('Добавлен в избранное:', product.slug);
            }
        } else {
            // Удаляем из избранного (убираем и по slug, и по старому ID на всякий случай)
            const newFavorites = favorites.filter((item: any) => 
                item !== product.slug && item !== product.id
            );
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            console.log('Удалён из избранного:', product.slug);
        }

        // Отправляем кастомное событие
        window.dispatchEvent(new Event('favoritesChanged'));
    };

    const openGraniteModal = (index: number) => {
        setCurrentGraniteSlide(index);
        setIsGraniteModalOpen(true);
        document.body.style.overflow = "hidden";
    };

    // Компонент для отображения одной характеристики с тултипом
    const CharacteristicItem = ({
        label,
        value,
        tooltipImage,
        tooltipDescription,
    }: {
        label: string;
        value: string;
        tooltipImage?: string;
        tooltipDescription?: string;
    }) => {
        const tooltipTriggerRef = useRef<HTMLSpanElement>(null);

        const handleClick = (e: React.MouseEvent) => {
            if (tooltipImage && tooltipDescription) {
                const element = tooltipTriggerRef.current;
                if (!element) return;

                const parentContainer = characteristicsContentRef.current;
                if (!parentContainer) return;

                const elementRect = element.getBoundingClientRect();
                const parentRect = parentContainer.getBoundingClientRect();

                // Относительная позиция (для позиционирования тултипа внутри контейнера)
                const relativeTop = elementRect.top - parentRect.top;
                const relativeLeft = elementRect.left - parentRect.left;

                // Абсолютная позиция (для расчёта места сверху/снизу)
                const absoluteTop = elementRect.top;
                const absoluteLeft = elementRect.left;

                setTooltipPosition({
                    top: relativeTop - 10,
                    left: relativeLeft + elementRect.width / 2,
                });

                // Передаём абсолютные координаты отдельно
                setTooltipAbsolutePosition({
                    top: absoluteTop,
                    left: absoluteLeft,
                });

                setTooltipContent({
                    image: tooltipImage,
                    description: tooltipDescription,
                });

                const img = new window.Image();
                img.src = tooltipImage;
                img.onload = () => setTooltipOpen(true);
                img.onerror = () => setTooltipOpen(true);
            }
        };

        return (
            <div className="flex justify-between items-center py-2 border-b border-[#969ead]">
                <div className="flex items-center space-x-3">
                    <span className="text-[#2D4266]">{label}</span>
                    {tooltipImage && tooltipDescription && (
                        <span
                            className="text-[#969ead] text-xs font-bold border-1 border-[#969ead] hover:border-[#2c3a54] hover:text-[#2c3a54] rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                            ref={tooltipTriggerRef}
                            onClick={handleClick}
                        >
                            ?
                        </span>
                    )}
                </div>
                <span className="text-[#2D4266]">{value}</span>
            </div>
        );
    };

    // Выбираем изображение для отображения
    const displayImage = selectedColor ? selectedColor.image : product.image;



    const closeGraniteModal = () => {
        setIsGraniteModalOpen(false);
        document.body.style.overflow = "auto";
    };


    const openImageModal = (index: number) => {
        // Подготовьте массив изображений для примеров оформления
        const slides: ImageItem[] = [
            {
                id: 1,
                src: "/single/example1.webp",
                alt: "Пример оформления 1",
                caption:
                    "Гравировка портрета A4, текста (ФИО, даты, памятная надпись), крестика",
            },
            {
                id: 2,
                src: "/single/example2.webp",
                alt: "Пример оформления 2",
                caption:
                    "Гравировка портрета, текст (ФИО, даты, памятная надпись), крест - сусальное золото или золотая краска+ бронзовые буквы",
            },
            {
                id: 3,
                src: "/single/example3.webp",
                alt: "Пример оформления 3",
                caption:
                    "Медальон в нише, текст (ФИО, даты, памятная надпись), крест - сусальное золото или золотая краска",
            },
            {
                id: 4,
                src: "/single/example4.webp",
                alt: "Пример оформления 4",
                caption:
                    "Медальон в рамке, текст (ФИО, даты), крест - итальянская бронза Caggiati",
            },
        ];

        setImageSlides(slides);
        setCurrentImageSlide(index);
        setIsImageModalOpen(true);
        document.body.style.overflow = "hidden";
    };


    // Обработчик отправки формы
    const handleModalSubmit = (formData: { name: string; phone: string }) => {
        // Здесь будет отправка данных на сервер
        // TODO: Реализовать отправку формы на бэкенд
        closeModal();
    };

    // Компонент для слайдера цветов (для мобильных устройств)
    const ColorSlider = ({ colors, selectedColor, onSelectColor }: { colors: { name: string; image: string }[]; selectedColor: { name: string; image: string } | null; onSelectColor: (color: { name: string; image: string } | null) => void }) => {
        const sliderRef = useRef<HTMLDivElement>(null);
        const startX = useRef(0);
        const isDragging = useRef(false);

        const handleMouseDown = (e: React.MouseEvent) => {
            isDragging.current = true;
            startX.current = e.clientX;
            if (sliderRef.current) {
                sliderRef.current.style.cursor = "grabbing";
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            if (sliderRef.current) {
                sliderRef.current.style.cursor = "grab";
            }
        };

        const handleMouseMove = (e: React.MouseEvent) => {
            if (!isDragging.current || !sliderRef.current) return;
            const deltaX = e.clientX - startX.current;
            sliderRef.current.scrollLeft -= deltaX;
            startX.current = e.clientX;
        };

        const handleTouchStart = (e: React.TouchEvent) => {
            isDragging.current = true;
            startX.current = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            isDragging.current = false;
        };

        const handleTouchMove = (e: React.TouchEvent) => {
            if (!isDragging.current || !sliderRef.current) return;
            const deltaX = e.touches[0].clientX - startX.current;
            sliderRef.current.scrollLeft -= deltaX;
            startX.current = e.touches[0].clientX;
        };

        return (
            <div className="relative">
                <h3 className="text-[16px] text-[#222222]">Выберите материал:</h3>
                <p className="text-[14px] text-[#969ead] mb-1">
                    {selectedColor ? selectedColor.name : "Габбро Карелия"}
                </p>
                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto scrollbar-hide py-2 gap-2"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    style={{
                        cursor: "grab",
                        scrollSnapType: "x mandatory",
                    }}
                >
                    <div
                        key="default"
                        onClick={() => onSelectColor(null)}
                        className={`w-[calc(25%-8px)] aspect-3/2 flex-shrink-0 rounded-lg border-2 transition ${selectedColor === null
                            ? "border-[#2c3a54]"
                            : "border-gray-300 hover:border-[#2c3a54]"
                            }`}
                        style={{
                            backgroundImage: `url(${product.image})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                        aria-label="Габбро Карелия"
                    />


                    {colors.map((color, index) => (
                        <div
                            key={index}
                            onClick={() => onSelectColor(color)}
                            className={`w-[calc(25%-8px)] aspect-3/2 flex-shrink-0 rounded-lg border-2 transition ${selectedColor?.name === color.name
                                ? "border-[#2c3a54]"
                                : "border-gray-300 hover:border-[#2c3a54]"
                                }`}
                            style={{
                                backgroundImage: `url(${color.image})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                            aria-label={color.name}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <section className="container-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <PathPage />
                    <h1 className="text-black text-[24px] md:text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">
                        {product.name}
                    </h1>

                    <div className={`mb-7.5 font-[600] ${isMobile ? 'block' : 'flex p-5'}`}>
                        <div className="relative max-w-[523px] md:w-7/12 mx-auto">

                            {product.discount && product.discount > 0 && (
                                <div className="absolute top-2 left-2 z-10 bg-[#cd5554] text-white text-xs font-bold px-2.5 py-0.75 rounded">
                                    Сегодня -{Math.round(Number(product.discount))}%
                                </div>
                            )}

                            {/* Плашка ХИТ */}
                            {product.hit && (
                                <div className={`absolute left-2 z-20 bg-gray-600 text-white text-xs font-bold px-2.5 py-0.75 rounded-xl ${
                                    product.discount && product.discount > 0 ? 'top-12' : 'top-2'
                                }`}>
                                    ХИТ
                                </div>
                            )}

                            <div
                                className={`absolute ${
                                    product.discount && product.discount > 0 && product.hit 
                                        ? 'top-20' 
                                        : product.discount && product.discount > 0 
                                            ? 'top-12' 
                                            : product.hit 
                                                ? 'top-12' 
                                                : 'top-2'
                                } left-2 z-10 w-11 h-11 text-center content-center flex-wrap text-2xl shadow-xs rounded-full hover:text-[#2c3a54] transition cursor-pointer ${isFavorite ? "text-[#2c3a54]" : "text-gray-400"
                                    }`}
                                onClick={toggleFavorite}
                            >
                                ★
                            </div>

                            <img
                                src={displayImage}
                                alt={product.name}
                                className="w-full h-auto object-contain rounded-lg md:pr-4"
                            />
                        </div>


                        <div className={`${isMobile ? 'w-full' : 'flex flex-col w-5/12'}`}>
                            <div className={`${isMobile ? "mb-5" : 'bg-[#f5f6fa] p-5 rounded-lg mb-5'}`}>

                                {product.colors && product.colors.length > 0 && (
                                    <div className="mb-2 md:mb-5">
                                        {isMobile ? (
                                            <ColorSlider
                                                colors={product.colors}
                                                selectedColor={selectedColor}
                                                onSelectColor={(color) => setSelectedColor(color)}
                                            />
                                        ) : (
                                            <>
                                                <h3 className="text-[16px] text-[#222222]">Выберите материал:</h3>
                                                <p className="text-[14px] text-[#969ead]">
                                                    {selectedColor ? selectedColor.name : "Габбро Карелия"}
                                                </p>
                                                <div className="flex flex-wrap mt-3 gap-2">
                                                    <button
                                                        key="default"
                                                        onClick={() => setSelectedColor(null)}
                                                        className={`w-[calc(25%-8px)] aspect-square rounded-lg border-2 transition ${selectedColor === null
                                                            ? "border-[#2c3a54] bg-[#f5f6fa]"
                                                            : "border-gray-300 hover:border-[#2c3a54]"
                                                            }`}
                                                        style={{
                                                            backgroundImage: `url(${product.image})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                        }}
                                                        aria-label="Габбро Карелия"
                                                    />
                                                    {product.colors.map((color: any, index: number) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedColor(color)}
                                                            className={`w-[calc(25%-8px)] aspect-square rounded-lg border-2 transition ${selectedColor?.name === color.name
                                                                ? "border-[#2c3a54] bg-[#f5f6fa]"
                                                                : "border-gray-300 hover:border-[#2c3a54]"
                                                                }`}
                                                            style={{
                                                                backgroundImage: `url(${color.image})`,
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                            }}
                                                            aria-label={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}


                                <div className="mb-5">
                                    <span className="text-[#2c3a54]">Цена:</span>
                                    <div className="flex items-center space-x-2">
                                        {(() => {
                                            const specialPrice = formatPriceDisplay(product.price, product.description);
                                            
                                            if (specialPrice) {
                                                return (
                                                    <p className="text-3xl font-bold text-[#2c3a54]">
                                                        {specialPrice}
                                                    </p>
                                                );
                                            }
                                            
                                            if (product.oldPrice && product.oldPrice > 0 && product.discount && product.discount > 0) {
                                                return (
                                                    <>
                                                        <p className="text-3xl font-bold text-[#cd5554]">
                                                            {categorySlug === 'composite' || categorySlug === 'составные' ? 'от ' : ''}{product.price} руб.
                                                        </p>
                                                        <p className="text-lg text-gray-500 line-through">
                                                            {product.oldPrice} руб.
                                                        </p>
                                                    </>
                                                );
                                            } else {
                                                return (
                                                    <p className="text-3xl font-bold text-[#2c3a54]">
                                                        {categorySlug === 'composite' || categorySlug === 'составные' ? 'от ' : ''}{product.price} руб.
                                                    </p>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>


                                <div className="space-y-2.5 mb-5">
                                    <button
                                        className="w-full py-3 bg-[#2c3a54] text-white rounded-full font-bold hover:bg-[#1a273b] transition"
                                        onClick={openModal}
                                    >
                                        Заказать
                                    </button>
                                </div>
                            </div>


                            <div className={`max-w-[550px] ${isMobile ? 'flex flex-wrap gap-y-3' : 'flex flex-wrap gap-y-5'}`}>
                                <div className={`flex w-1/2 items-center space-x-2`}>
                                    <Image src="/guarantee.svg" width={24} height={24} alt="Гарантия 10 лет" />
                                    <span className="text-[12px] text-[#2D4266]">Гарантия 10 лет</span>
                                </div>
                                <div className={`flex w-1/2 items-center space-x-2`}>
                                    <Image src="/3d.svg" width={24} height={24} alt="Бесплатный 3D эскиз" />
                                    <span className="text-[12px] text-[#2D4266]">Бесплатный 3D эскиз</span>
                                </div>
                                <div className={`flex w-1/2 items-center space-x-2`}>
                                    <Image src="/credit.svg" width={24} height={24} alt="Рассрочка платежа" />
                                    <span className="text-[12px] text-[#2D4266]">Рассрочка платежа</span>
                                </div>
                                <div className={`flex w-1/2 items-center space-x-2`}>
                                    <Image src="/safe.svg" width={24} height={24} alt="Бесплатное хранение" />
                                    <span className="text-[12px] text-[#2D4266]">Бесплатное хранение</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="border-b border-gray-200 mb-5">
                        <div className="flex space-x-4 md:space-x-6 text-[14px] md:text-[16px]">
                            <button
                                onClick={() => setActiveTab("characteristics")}
                                className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${activeTab === "characteristics"
                                    ? ""
                                    : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                                    }`}
                            >
                                Характеристики
                            </button>
                            <button
                                onClick={() => setActiveTab("description")}
                                className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${activeTab === "description"
                                    ? ""
                                    : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                                    }`}
                            >
                                Описание
                            </button>
                            <button
                                onClick={() => setActiveTab("granite")}
                                className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${activeTab === "granite"
                                    ? ""
                                    : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                                    }`}
                            >
                                Варианты гранита
                            </button>
                        </div>
                    </div>


                    <div className="mb-7.5 font-[600]">
                        {activeTab === "characteristics" && (
                            <div>
                                <div
                                    className="space-y-1 relative"
                                    ref={characteristicsContentRef}
                                >
                                    {/* Динамические характеристики из базы данных */}
                                    {product.options && Object.entries(product.options).map(([key, value]) => (
                                        <CharacteristicItem
                                            key={key}
                                            label={key}
                                            value={String(value)}
                                            tooltipImage={
                                                key === "Общая высота"
                                                    ? "/single/height.webp"
                                                    : key === "Общая ширина"
                                                        ? "/single/width.webp"
                                                        : key === "Стела"
                                                            ? "/single/stela.webp"
                                                            : undefined
                                            }
                                            tooltipDescription={
                                                key === "Общая высота"
                                                    ? "Высота от нижней до верхней точки памятника"
                                                    : key === "Общая ширина"
                                                        ? "Ширина памятника по крайним точкам"
                                                        : key === "Стела"
                                                            ? "Размеры стелы памятника"
                                                            : undefined
                                            }
                                        />
                                    ))}
                                    
                                    {/* Характеристика наличия из базы данных */}
                                    {product.availability && (
                                        <CharacteristicItem
                                            key="availability"
                                            label="Наличие"
                                            value={product.availability}
                                        />
                                    )}
                                    
                                    {/* Статические характеристики */}
                                    {Object.entries(STATIC_CHARACTERISTICS).map(([key, value]) => (
                                        <CharacteristicItem
                                            key={key}
                                            label={key}
                                            value={value}
                                        />
                                    ))}
                                    
                                    <Tooltip
                                        isOpen={tooltipOpen}
                                        image={tooltipContent.image}
                                        description={tooltipContent.description}
                                        position={tooltipPosition}
                                        ref={tooltipRef}
                                        absolutePosition={tooltipAbsolutePosition}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "description" && (
                            <div>
                                <p className="text-[#2D4266]">
                                    {product.description || 
                                        `${product.name} — это качественный памятник, изготовленный из натурального гранита. Он отличается прочностью, долговечностью и эстетической привлекательностью. Памятник подойдет для обустройства могилы близкого человека и станет символом памяти и уважения.`
                                    }
                                </p>
                            </div>
                        )}

                        {activeTab === "granite" && (
                            <div>
                                <p className="text-[#2D4266] mb-5">
                                    Данный памятник можно изготовить более чем из 20 видов
                                    гранита.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                                    {graniteTypes.map((type, index) => (
                                        <div
                                            key={type.id}
                                            className="flex flex-col space-y-2 cursor-pointer px-2.5 hover:opacity-80 duration-500"
                                            onClick={() => openGraniteModal(index)}
                                        >
                                            <img
                                                src={type.image}
                                                alt={type.name}
                                                className="w-full h-auto object-cover rounded-lg"
                                            />
                                            <p className="text-[14px] text-[#6B809E]">{type.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Готовые работы с этим товаром */}
                    <ProductWorksGallery 
                        productId={product.id.toString()}
                        productType="monuments"
                        category={Array.isArray(params.category) ? params.category[0] : (params.category || 'single')}
                        title="Готовые работы с этим товаром"
                    />

                    <div className="mb-7.5">
                        <h2 className="text-[28px] font-[600] text-[#2D4266] mb-5">
                            Примеры оформления
                        </h2>
                        <p className="text-[#2D4266] mb-5">
                            На фото представлены классические варианты оформления памятников.
                            При оформлении договора можно выбрать любой из вариантов нанесения
                            портрета и текста (в том числе размер портрета, размер текста, тип
                            шрифта, дополнительные рисунки и т.д.).
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {[1, 2, 3, 4].map((id) => (
                                <div
                                    key={id}
                                    className="cursor-pointer group overflow-hidden rounded-lg"
                                    onClick={() => openImageModal(id - 1)}
                                >
                                    <img
                                        src={`/single/example${id}.webp`}
                                        alt={`Пример оформления ${id}`}
                                        className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <p className="text-[12px] text-[#2D4266] mt-2 text-center">
                                        {imageSlides[currentImageSlide]?.caption ||
                                            (id === 1
                                                ? "Гравировка портрета A4, текста (ФИО, даты, памятная надпись), крестика"
                                                : id === 2
                                                    ? "Гравировка портрета, текст (ФИО, даты, памятная надпись), крест - сусальное золото или золотая краска+ бронзовые буквы"
                                                    : id === 3
                                                        ? "Медальон в нише, текст (ФИО, даты, памятная надпись), крест - сусальное золото или золотая краска"
                                                        : "Медальон в рамке, текст (ФИО, даты), крест - итальянская бронза Caggiati")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="mb-7.5">
                        <h2 className="text-[28px] font-[600] text-[#2D4266] mb-5">
                            Похожие товары
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3">
                            {similarProducts.map((similarProduct) => (
                                <ProductCard
                                    key={similarProduct.id}
                                    product={similarProduct}
                                    isTablet={isTablet}
                                    isMobile={isMobile}
                                    isNarrowMobile={isNarrowMobile}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <ModalCommunication
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
            />


            {isGraniteModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                    onClick={closeGraniteModal}
                >
                    <div
                        className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="fixed top-4 left-4 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded z-10">
                            {currentGraniteSlide + 1} / {graniteTypes.length}
                        </div>

                        <button
                            onClick={prevGraniteSlide}
                            className="absolute left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        >
                            {"<"}
                        </button>

                        <button
                            onClick={nextGraniteSlide}
                            className="absolute right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        >
                            {">"}
                        </button>

                        {/* Изображение */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={graniteTypes[currentGraniteSlide].image}
                                alt={graniteTypes[currentGraniteSlide].name}
                                className="max-w-full max-h-[90vh] object-contain"
                            />
                        </div>

                        {/* Подпись под изображением */}
                        <div className="text-center text-white text-lg font-medium mt-2">
                            {graniteTypes[currentGraniteSlide].name}
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для готовых работ и примеров оформления */}
            {isImageModalOpen &&
                imageSlides.length > 0 && ( // Убедитесь, что массив не пуст
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                        onClick={closeImageModal}
                    >
                        <div
                            className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Индикатор текущего слайда */}
                            <div className="fixed top-4 left-4 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded z-10">
                                {currentImageSlide + 1} / {imageSlides.length}
                            </div>

                            {/* Стрелка влево */}
                            <button
                                onClick={prevImageSlide}
                                className="absolute left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                            >
                                {"<"}
                            </button>

                            {/* Стрелка вправо */}
                            <button
                                onClick={nextImageSlide}
                                className="absolute right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                            >
                                {">"}
                            </button>

                            {/* Изображение */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={imageSlides[currentImageSlide].src}
                                    alt={imageSlides[currentImageSlide].alt}
                                    className="max-w-full max-h-[90vh] object-contain"
                                />
                            </div>

                            {/* Подпись под изображением (если есть) */}
                            {imageSlides[currentImageSlide].caption && (
                                <div className="text-center text-white text-lg font-medium mt-2">
                                    {imageSlides[currentImageSlide].caption}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {/* Модальное окно для заказа звонка */}
            <ModalCommunication
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                productData={{
                    name: product.name,
                    image: displayImage,
                    color: selectedColor?.name,
                    price: product.price,
                    category: product.category,
                }}
            />
        </>
    );
};

export default ProductPage;
