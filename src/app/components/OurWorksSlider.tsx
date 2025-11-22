"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from '@/lib/api-client';

interface Work {
    id: number;
    title: string;
    description?: string;
    image: string;
    category?: string;
    alt?: string; // для совместимости со старым кодом
}

interface OurWorksSliderProps {
    // Если передаются - показываем работы для конкретного товара
    productId?: string;
    productType?: "monuments" | "fences" | "accessories" | "landscape";
    // Заголовок секции
    title?: string;
    // CSS классы
    className?: string;
    // Максимальное количество работ для показа (по умолчанию - все)
    maxWorks?: number;
}

const OurWorksSlider = ({ 
    productId, 
    productType, 
    title = "Наши работы",
    className = "",
    maxWorks
}: OurWorksSliderProps = {}) => {
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false); // <768px
    const [isTablet, setIsTablet] = useState(false); // <1024px
    const [activeCategory, setActiveCategory] = useState("Все");
    const [categories, setCategories] = useState<string[]>(["Все"]);

    // Для адаптивности
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width < 1024);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Загрузка работ
    useEffect(() => {
        loadWorks();
    }, [productId, productType]);

    const loadWorks = async () => {
        try {
            const params = new URLSearchParams();
            
            if (productId && productType) {
                params.append('productId', productId);
                params.append('productType', productType);
            }
            
            const queryString = params.toString() ? `?${params.toString()}` : '';
            const data = await apiClient.get(`/works${queryString}`);
            
            if (data.success) {
                let worksData = data.data;
                
                // Ограничиваем количество работ если задан maxWorks
                if (maxWorks && worksData.length > maxWorks) {
                    worksData = worksData.slice(0, maxWorks);
                }
                
                setWorks(worksData);
                
                // Для общего слайдера - показываем категории
                if (!productId && !productType) {
                    const uniqueCategories = Array.from(
                        new Set(worksData.map((work: Work) => work.category).filter(Boolean))
                    ) as string[];
                    setCategories(["Все", ...uniqueCategories]);
                }
            }
        } catch (error) {
            console.error('Error loading works:', error);
        } finally {
            setLoading(false);
        }
    };

    // Фильтрация работ по категории
    const filteredWorks = works.filter((work: Work) => {
        if (activeCategory === "Все") return true;
        return work.category === activeCategory;
    });

    // Рефы для слайдера
    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Модальное окно
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModalSlide, setCurrentModalSlide] = useState(0);

    const openModal = (index: number) => {
        setCurrentModalSlide(index);
        setIsModalOpen(true);
        document.body.style.overflow = "hidden"; // Блокируем скролл
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = "auto"; // Возвращаем скролл
    };

    const nextSlide = () => {
        setCurrentModalSlide((prev) => (prev + 1) % filteredWorks.length);
    };

    const prevSlide = () => {
        setCurrentModalSlide((prev) => (prev - 1 + filteredWorks.length) % filteredWorks.length);
    };

    // Закрытие по Esc
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isModalOpen) return;
            if (e.key === "Escape") {
                closeModal();
            } else if (e.key === "ArrowLeft") {
                prevSlide();
            } else if (e.key === "ArrowRight") {
                nextSlide();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, nextSlide, prevSlide]);

    // Функции для навигации (аналогично CompleteSolutionSlider)
    const getVisibleCards = () => {
        if (isMobile) return 1;
        return isTablet ? 2 : 4; // <1024: 2, ≥1024: 4
    };

    const getSlideWidth = () => {
        if (!containerRef.current) return 0;
        const containerWidth = containerRef.current.offsetWidth;
        const visibleCards = getVisibleCards();
        return containerWidth / visibleCards;
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

    // Карточка работы (без цен, без кнопок, только фото)
    const WorkCard = ({ work, index }: { work: Work; index: number }) => {
        const cardBasis = isMobile
            ? "basis-[100%]" // 100%
            : isTablet
                ? "basis-[50%]" // 50%
                : "basis-[25%]"; // 25%

        return (
            <div
                key={work.id}
                className={`relative flex-shrink-0 cursor-pointer ${cardBasis} px-1.5`}
                onClick={() => openModal(index)}
            >
                <Image
                    src={work.image}
                    alt={work.alt || work.title || `Работа ${work.id}`}
                    width={301}
                    height={401}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="w-full h-auto aspect-square object-cover rounded-xl hover:opacity-80 duration-500"
                    quality={65}
                    loading={index < 4 ? "eager" : "lazy"}
                    style={{ aspectRatio: '1/1' }}
                />
                {work.title && (
                    <div className="mt-2 text-sm text-gray-700 text-center">
                        {work.title}
                    </div>
                )}
            </div>
        );
    };

    // Если загрузка
    if (loading) {
        return (
            <section className={`mb-15 md:mb-22.5 mt-17 lg:mt-30 gradient ${className}`}>
                <div className="pt-15 md:pt-[93px] max-w-[1300px] container-centered">
                    <div className="text-center text-gray-500">Загрузка работ...</div>
                </div>
            </section>
        );
    }

    // Если нет работ для товара - не показываем секцию
    if ((productId || productType) && filteredWorks.length === 0) {
        return null;
    }

    return (
        <section className={`mb-15 md:mb-22.5 mt-17 lg:mt-30 gradient ${className}`}>
            <div className="pt-15 md:pt-[93px] max-w-[1300px] container-centered">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-4xl font-bold text-[#2c3a54] ml-2.5">
                        {productId ? `${title} с этим товаром` : title}
                    </h2>
                    {productId && (
                        <Link href="/works" className="text-[#2c3a54] hover:underline text-sm md:text-base mr-2.5">
                            Посмотреть все работы →
                        </Link>
                    )}
                </div>

                {/* Панель категорий - только для общего слайдера */}
                {!productId && !productType && (
                    <div className="flex flex-wrap gap-2 ml-2.5 mb-6">
                        {categories.map((category) => (
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
                )}

                <div ref={containerRef} className="relative">
                    {/* На мобильных — только свайп, без стрелок */}
                    {isMobile ? (
                        <div
                            ref={sliderRef}
                            className="flex overflow-x-auto pb-4 snap-x snap-mandatory"
                            style={{
                                scrollSnapType: "x mandatory",
                                msOverflowStyle: "none",
                                scrollbarWidth: "none",
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            {filteredWorks.map((work, index) => (
                                <WorkCard key={work.id} work={work} index={index} />
                            ))}
                        </div>
                    ) : (
                        // На таблетах и десктопах — со стрелками
                        <>
                            {!isTablet && (
                                <button
                                    onClick={scrollLeft}
                                    className="absolute -left-2 border border-[#2c3a54] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition"
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
                            )}
                            <div
                                ref={sliderRef}
                                className={`flex gap-0 overflow-x-auto pb-4 snap-x snap-mandatory ${!isTablet ? "px-0.5" : ""
                                    }`}
                                style={{
                                    scrollSnapType: "x mandatory",
                                    msOverflowStyle: "none",
                                    scrollbarWidth: "none",
                                    WebkitOverflowScrolling: "touch",
                                }}
                            >
                                {filteredWorks.map((work, index) => (
                                    <WorkCard key={work.id} work={work} index={index} />
                                ))}
                            </div>
                            {!isTablet && (
                                <button
                                    onClick={scrollRight}
                                    className="absolute -right-2 border border-[#2c3a54] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-100 transition"
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
                            )}
                        </>
                    )}
                </div>

                {/* Кнопка внизу - только для общего слайдера */}
                {!productId && !productType && (
                    <div className="mt-10 flex">
                        <Link href={'/works'} className="font-bold md:min-w-[330px] px-7.5 py-3 bg-[#2c3a54] border border-[#2c3a54] text-white rounded-full hover:bg-white hover:text-[#2c3a54] transition">
                            Смотреть все
                        </Link>
                    </div>
                )}

                {/* Модальное окно */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                        onClick={closeModal} // Закрытие при клике вне изображения
                    >
                        <div
                            className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()} // Не закрывать при клике на контент
                        >
                            {/* Индикатор текущего слайда (например, "1 / 16") */}
                            <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded z-10">
                                {currentModalSlide + 1} / {filteredWorks.length}
                            </div>

                            {/* Стрелка влево */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                                style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                            >
                                {"<"}
                            </button>

                            {/* Стрелка вправо */}
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                                style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                            >
                                {">"}
                            </button>

                            {/* Изображение */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                    src={filteredWorks[currentModalSlide].image}
                                    alt={filteredWorks[currentModalSlide].alt || "Работа"}
                                    width={1200}
                                    height={1200}
                                    className="max-w-full max-h-[90vh] object-contain"
                                    quality={85}
                                />
                            </div>

                            {/* Подпись под изображением */}
                            <div className="text-center text-white mt-4">
                                <div className="text-lg font-medium">
                                    {filteredWorks[currentModalSlide]?.title || 
                                     filteredWorks[currentModalSlide]?.alt || 
                                     'Наша работа'}
                                </div>
                                {filteredWorks[currentModalSlide]?.description && (
                                    <div className="text-sm text-gray-300 mt-1">
                                        {filteredWorks[currentModalSlide].description}
                                    </div>
                                )}
                                {filteredWorks[currentModalSlide]?.category && (
                                    <div className="text-sm text-gray-400 mt-1">
                                        Категория: {filteredWorks[currentModalSlide].category}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OurWorksSlider;