"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from '@/lib/api-client';

interface Work {
    id: number;
    title: string;
    description?: string;
    image: string;
    category?: string;
}

interface ProductWorksGalleryProps {
    productId: string;
    productType: "monuments" | "fences" | "accessories" | "landscape" | "exclusive";
    category: string;
    title?: string;
    className?: string;
}

const ProductWorksGallery = ({ 
    productId, 
    productType,
    category,
    title = "Готовые работы с этим товаром",
    className = ""
}: ProductWorksGalleryProps) => {
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModalSlide, setCurrentModalSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Адаптивность
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Маппинг slug категорий в их русские названия (как они хранятся в БД)
    const categorySlugToName: Record<string, string> = {
        // Памятники
        'single': 'Одиночные',
        'double': 'Двойные',
        'exclusive': 'Эксклюзивные',
        'cheap': 'Недорогие',
        'cross': 'В виде креста',
        'heart': 'В виде сердца',
        'composite': 'Составные',
        'europe': 'Европейские',
        'artistic': 'Художественная резка',
        'tree': 'В виде деревьев',
        'complex': 'Мемориальные комплексы',
        // Ограды
        'granite': 'Гранитные ограды',
        'polymer': 'С полимерным покрытием',
        'metal': 'Металлические ограды',
        // Аксессуары
        'benches': 'Лавки и столики',
        'vases': 'Вазы для цветов',
        'lanterns': 'Фонари',
        'plates': 'Таблички',
        // Благоустройство
        'foundation': 'Основания',
        'graves': 'Могильные плиты'
    };

    // Загрузка работ для конкретного товара
    useEffect(() => {
        loadWorks();
    }, [productId, productType]);

    const loadWorks = async () => {
        try {
            const params = new URLSearchParams();
            params.append('productId', productId);
            params.append('productType', productType);
            // Преобразуем slug категории в русское название
            const categoryName = categorySlugToName[category] || category;
            params.append('category', categoryName);
            
            const data = await apiClient.get(`/works?${params.toString()}`);
            
            if (data.success) {
                setWorks(data.data);
            }
        } catch (error) {
            console.error('Error loading works:', error);
        } finally {
            setLoading(false);
        }
    };

    // Модальное окно
    const openModal = (index: number) => {
        setCurrentModalSlide(index);
        setIsModalOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = "auto";
    };

    const nextSlide = () => {
        setCurrentModalSlide((prev) => (prev + 1) % works.length);
    };

    const prevSlide = () => {
        setCurrentModalSlide((prev) => (prev - 1 + works.length) % works.length);
    };

    // Закрытие по Esc и навигация стрелками
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
    }, [isModalOpen]);

    // Карточка работы
    const WorkCard = ({ work, index }: { work: Work; index: number }) => {
        const cardBasis = isMobile
            ? "basis-[50%]" // 2 фото в ряду на мобильных
            : "basis-[33.33%]"; // 3 фото в ряду на десктопе

        return (
            <div
                key={work.id}
                className={`relative flex-shrink-0 cursor-pointer ${cardBasis} px-1.5`}
                onClick={() => openModal(index)}
            >
                <div className="relative w-full aspect-square overflow-hidden rounded-xl group">
                    <img
                        src={work.image}
                        alt={work.title || `Работа ${work.id}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:opacity-80"
                    />
                </div>
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
            <section className={`mb-15 md:mb-22.5 mt-17 lg:mt-30 ${className}`} style={{ backgroundColor: 'white' }}>
                <div className="pt-15 md:pt-[93px] max-w-[1300px] container-centered">
                    <div className="text-center text-gray-500">Загрузка работ...</div>
                </div>
            </section>
        );
    }

    // Если нет работ для товара - не показываем секцию
    if (works.length === 0) {
        return null;
    }

    return (
        <section className={`mb-15 md:mb-22.5 mt-17 lg:mt-30 ${className}`} style={{ backgroundColor: 'white' }}>
            <div className="pt-15 md:pt-[93px] max-w-[1300px] container-centered">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-4xl font-bold text-[#2c3a54] ml-2.5">
                        {title}
                    </h2>
                </div>

                <div className="relative">
                    <div className="flex flex-wrap gap-0 pb-4">
                        {works.map((work, index) => (
                            <WorkCard key={work.id} work={work} index={index} />
                        ))}
                    </div>
                </div>

                {/* Модальное окно */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                        onClick={closeModal}
                    >
                        <div
                            className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Индикатор текущего слайда */}
                            <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-70 px-3 py-1 rounded z-10">
                                {currentModalSlide + 1} / {works.length}
                            </div>

                            {/* Кнопка закрытия */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center bg-black bg-opacity-70 rounded-full hover:bg-opacity-90 transition z-10"
                            >
                                ×
                            </button>

                            {/* Стрелка влево */}
                            {works.length > 1 && (
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-4 z-10 w-10 h-10 flex items-center justify-center text-white text-xl rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition"
                                >
                                    ←
                                </button>
                            )}

                            {/* Стрелка вправо */}
                            {works.length > 1 && (
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-4 z-10 w-10 h-10 flex items-center justify-center text-white text-xl rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition"
                                >
                                    →
                                </button>
                            )}

                            {/* Изображение */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={works[currentModalSlide].image}
                                    alt={works[currentModalSlide].title}
                                    className="max-w-full max-h-[90vh] object-contain"
                                />
                            </div>

                            {/* Подпись под изображением */}
                            <div className="text-center text-white mt-4">
                                <div className="text-xl font-medium">
                                    {works[currentModalSlide]?.title || 'Наша работа'}
                                </div>
                                {works[currentModalSlide]?.description && (
                                    <div className="text-sm text-gray-300 mt-2 max-w-2xl">
                                        {works[currentModalSlide].description}
                                    </div>
                                )}
                                {works[currentModalSlide]?.category && (
                                    <div className="text-sm text-gray-400 mt-1">
                                        {works[currentModalSlide].category}
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

export default ProductWorksGallery;