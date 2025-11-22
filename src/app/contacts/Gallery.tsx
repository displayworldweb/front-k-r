"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

// Предполагаем, что у вас уже есть массив slides
const slides = [
    { id: 1, src: "/shop-slider/1.jpg", alt: "Слайд 1" },
    { id: 2, src: "/shop-slider/2.jpg", alt: "Слайд 2" },
    { id: 3, src: "/shop-slider/4.jpg", alt: "Слайд 3" },
    { id: 4, src: "/shop-slider/5.jpg", alt: "Слайд 4" },
];

const Gallery = () => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // Индекс текущего слайда

    // Модальное окно
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentModalSlide, setCurrentModalSlide] = useState(0);

    // Функция для изменения текущего слайда (для миниатюр)
    const handleThumbnailClick = (index: number) => {
        setCurrentSlideIndex(index);
    };

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
        setCurrentModalSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentModalSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
            <div className="relative mt-2.5 p-5 lg:p-7.5 max-w-[872px] mx-auto">
                {/* Основной слайдер */}
                <div className="w-full md:max-h-[563px] relative overflow-hidden">
                    {/* Контейнер для основного слайда */}
                    <div className="max-w-[747px] md:max-w-[709px] md:pr-[163px] box-content h-full relative">
                        {/* Основное изображение */}
                        <div
                            className="w-full max-h-[563px] cursor-pointer"
                            onClick={() => openModal(currentSlideIndex)} // Открываем модалку при клике
                        >
                            <Image
                                src={slides[currentSlideIndex].src}
                                alt={slides[currentSlideIndex].alt}
                                width={709}
                                height={506}
                                className="w-full max-h-[563px] object-cover"
                            />
                        </div>
                        {/* Контейнер миниатюр */}
                        <div
                            className="md:absolute md:right-0 md:top-0 h-[52px] mt-2.5 md:mt-0 justify-self-center md:w-[135px] md:h-auto space-x-2.5 md:space-y-4 flex md:flex-col"
                        >
                            {/* Миниатюры */}
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className={`w-[70px] h-[52px] md:w-[135px] md:h-[101px] relative ${index === currentSlideIndex ? "opacity-100" : "opacity-70"
                                        } transition-opacity duration-250 cursor-pointer`}
                                    onClick={() => handleThumbnailClick(index)}
                                >
                                    <Image
                                        src={slide.src}
                                        alt={slide.alt}
                                        width={70}
                                        height={52}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                            {currentModalSlide + 1} / {slides.length}
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
                                src={slides[currentModalSlide].src}
                                alt={slides[currentModalSlide].alt}
                                className="max-w-full max-h-[90vh] object-contain" loading="lazy"
                            />
                        </div>

                        {/* Подпись под изображением */}
                        <div className="text-center text-white text-lg font-medium">
                            {slides[currentModalSlide].alt}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;