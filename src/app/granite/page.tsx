"use client";
import { useEffect, useState } from "react";
import OurWorksSlider from "../components/OurWorksSlider";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import { graniteTypes } from "../mock/graniteTypes";
import { PageDescriptionBlock } from "../components/PageDescriptionBlock";

const GraniteTypesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModalSlide, setCurrentModalSlide] = useState(0);

    // Функция для открытия модального окна
    const openModal = (index: number) => {
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
        setCurrentModalSlide((prev) => (prev + 1) % graniteTypes.length);
    };

    const prevSlide = () => {
        setCurrentModalSlide((prev) => (prev - 1 + graniteTypes.length) % graniteTypes.length);
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

    return (
        <>
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <div className="ml-2.5"><PathPage /></div>
                    <h1 className="text-black text-[28px] ml-2.5 my-5 lg:ml-5 lg:my-7.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Виды гранита</h1>

                    {/* Сетка видов гранита */}
                    <div className="grid space-y-5 lg:space-y-7.5 pb-5 lg:px-2.5 grid-cols-3 md:grid-cols-6 shadow-xs">
                        {graniteTypes.map((type, index) => (
                            <div
                                key={type.id}
                                className="flex flex-col space-y-2 cursor-pointer px-2.5 hover:opacity-80 duration-500"
                                onClick={() => openModal(index)}
                            >
                                <img
                                    src={type.image}
                                    alt={type.name}
                                    className="w-full h-auto object-cover"
                                />
                                <p className="text-[14px] text-[#6B809E]">{type.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* OurWorksSlider внизу страницы */}
            <div className="mb-22.5">
                <OurWorksSlider />
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
                        {/* Индикатор текущего слайда (например, "1 / 36") */}
                        <div className="fixed top-4 left-4 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded z-10">
                            {currentModalSlide + 1} / {graniteTypes.length}
                        </div>

                        {/* Стрелка влево */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        >
                            {"<"}
                        </button>

                        {/* Стрелка вправо */}
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-lg sm:text-xl rounded-full hover:bg-opacity-70 transition cursor-pointer"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        >
                            {">"}
                        </button>

                        {/* Изображение */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={graniteTypes[currentModalSlide].image}
                                alt={graniteTypes[currentModalSlide].name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Подпись под изображением */}
                        <div className="text-center text-white text-lg font-medium mt-2">
                            {graniteTypes[currentModalSlide].name}
                        </div>
                    </div>
                </div>
            )}

            <PageDescriptionBlock pageSlug="granite" />
        </>
    );
};

export default GraniteTypesPage;