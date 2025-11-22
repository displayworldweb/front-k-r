"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import OurWorksSlider from "../components/OurWorksSlider";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import Pagination from "../components/Pagination";
import Blog from "../components/Blog";

interface Work {
  id: number;
  title: string;
  description?: string;
  image: string;
  productId?: string;
  productType: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
}

// Функция для получения работ для конкретной страницы
const getWorksForPage = (cards: Work[], page: number, worksPerPage = 24) => {
    const startIndex = (page - 1) * worksPerPage;
    return cards.slice(startIndex, startIndex + worksPerPage);
};

const OurWorksPage = () => {
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeCategory, setActiveCategory] = useState("Все работы");
    const [categories, setCategories] = useState<string[]>(["Все работы"]);
    // Состояние для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModalSlide, setCurrentModalSlide] = useState(0);

    // Загрузка работ
    useEffect(() => {
        loadWorks();
    }, []);

    const loadWorks = async () => {
        try {
            const data = await apiClient.get('/works');
            
            if (data.success) {
                setWorks(data.data);
                
                // Извлекаем уникальные категории
                const uniqueCategories = Array.from(
                    new Set(data.data.map((work: Work) => work.category).filter(Boolean))
                ) as string[];
                setCategories(["Все работы", ...uniqueCategories]);
            }
        } catch (error) {
            console.error('Error loading works:', error);
        } finally {
            setLoading(false);
        }
    };

    // Фильтруем работы по категории
    const filteredWorks = activeCategory === "Все работы"
        ? works
        : works.filter(work => work.category === activeCategory);

    const totalPages = Math.ceil(filteredWorks.length / 24); // Рассчитываем общее количество страниц

    // Получаем работы для текущей страницы ИЗ ОТФИЛЬТРОВАННОГО МАССИВА
    const currentWorks = getWorksForPage(filteredWorks, currentPage);

    // Функция для открытия модального окна
    const openModal = (index: number) => {
        // Индекс в массиве filteredWorks
        setCurrentModalSlide(index);
        setIsModalOpen(true);
        document.body.style.overflow = "hidden"; // Блокируем скролл
    };

    // Функция для закрытия модального окна
    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = "auto"; // Возвращаем скролл
    };

    // Функции для навигации в модалке
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

    if (loading) {
        return (
            <section className="container-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <PathPage />
                    <div className="text-center py-10">Загрузка работ...</div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="container-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <PathPage />
                    <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Наши работы</h1>

                    {/* Панель категорий */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setActiveCategory(category);
                                    setCurrentPage(1); // Сбрасываем на первую страницу при смене категории
                                }}
                                className={`px-4 py-2 border border-gray-300 rounded-full text-[16px] font-medium transition ${activeCategory === category
                                    ? "bg-[#2c3a54] text-white"
                                    : "text-[#2c3a54] hover:bg-[#2c3a54] hover:text-white"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Сетка работ */}
                    {filteredWorks.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 space-y-2.5 mb-7.5">
                            {currentWorks.map((work: Work) => (
                                <div
                                    key={work.id}
                                    className="block overflow-hidden rounded-lg cursor-pointer hover:opacity-80 duration-500"
                                    onClick={() => openModal(
                                        // Индекс в массиве filteredWorks
                                        filteredWorks.findIndex((w: Work) => w.id === work.id)
                                    )}
                                >
                                    <img
                                        src={work.image}
                                        alt={work.title || `Работа ${work.id}`}
                                        className="w-full h-auto object-cover px-1.25" loading="lazy"
                                    />
                                    {work.title && (
                                        <div className="p-2 text-center text-sm text-gray-700">
                                            {work.title}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            {activeCategory === "Все работы" ? 
                                "Нет добавленных работ" : 
                                `Нет работ в категории "${activeCategory}"`
                            }
                        </div>
                    )}

                    {/* Пагинация */}
                    <Pagination
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        initialPage={1}
                    />
                </div>
            </section>

            {/* Blog внизу страницы */}
            <div className="mb-15 md:mb-22.5">
                <Blog />
            </div>

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
                        <div className="fixed top-4 left-4 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded z-10">
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
                            <img
                                src={filteredWorks[currentModalSlide].image}
                                alt={`Работа ${filteredWorks[currentModalSlide].id}`}
                                className="max-w-full max-h-[90vh] object-contain" loading="lazy"
                            />
                        </div>

                        {/* Подпись под изображением */}
                        <div className="text-center text-white mt-2">
                            <div className="text-lg font-medium">
                                {filteredWorks[currentModalSlide]?.title || 'Наша работа'}
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
        </>
    );
};

export default OurWorksPage;