"use client";
import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";
import Link from "next/link";

const ReviewsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false); // Только для мобильного
  const startX = useRef(0);
  const isDragging = useRef(false);

  // Для адаптивности
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsTablet(width < 1024);
      setIsMobile(width < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  interface ReviewItem {
    id: number | string;
    name: string;
    date: string; // already formatted or relative
    rating: number;
    text: string;
    source: string; // Google / Yandex
  }

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'google' | 'yandex'>('all');

  // Форматирование даты в человеческий формат
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Сброс слайда при изменении фильтра
  useEffect(() => {
    setCurrentSlide(0);
  }, [filter]);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get('/reviews');
        const items: ReviewItem[] = Array.isArray(data) ? data : data?.data || [];
        // Ensure stable id and format date
        const withIds = items.map((r, idx) => ({ 
          ...r, 
          id: r.id || idx,
          date: formatDate(r.date)
        }));
        setReviews(withIds);
      } catch (e: any) {
        setError(e.message || 'Ошибка загрузки отзывов');
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  // Функции навигации
  const nextSlide = () => {
    if (isMobile) {
      setCurrentSlide((prev) => (prev + 1) % filteredReviews.length);
    } else if (isTablet) {
      setCurrentSlide((prev) => Math.min(prev + 1, filteredReviews.length - 2));
    } else {
      setCurrentSlide((prev) => Math.min(prev + 1, filteredReviews.length - 4));
    }
  };

  const prevSlide = () => {
    if (isMobile) {
      setCurrentSlide((prev) => (prev - 1 + filteredReviews.length) % filteredReviews.length);
    } else if (isTablet) {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    } else {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }
  };

  const goToSlide = (index: number) => {
    if (isMobile) {
      setCurrentSlide(index);
    } else if (isTablet) {
      setCurrentSlide(Math.min(index, filteredReviews.length - 2));
    } else {
      setCurrentSlide(Math.min(index, filteredReviews.length - 4));
    }
  };

  // Обработка свайпа мышью
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    isDragging.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      isDragging.current = false;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Обработка свайпа пальцем
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.touches[0].clientX - startX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      isDragging.current = false;
    }
  };

  // Добавляем и убираем слушатели событий
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [isMobile]);

  // Отображение звезд рейтинга
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`inline-block w-4 h-4 ${i < rating ? "text-yellow-500" : "text-gray-300"
          }`}
      >
        ★
      </span>
    ));
  };

  // Фильтрация отзывов
  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'google') return review.source.toLowerCase().includes('google');
    if (filter === 'yandex') return review.source.toLowerCase().includes('яндекс');
    return true;
  });

  // Вычисление средней оценки для каждой платформы
  const calculateAverageRating = (platform: 'google' | 'yandex'): string => {
    const platformReviews = reviews.filter(review => {
      if (platform === 'google') return review.source.toLowerCase().includes('google');
      if (platform === 'yandex') return review.source.toLowerCase().includes('яндекс');
      return false;
    });
    
    if (platformReviews.length === 0) return '5.0';
    
    const sum = platformReviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / platformReviews.length;
    return average.toFixed(1);
  };

  const googleRating = calculateAverageRating('google');
  const yandexRating = calculateAverageRating('yandex');

  // Ширина одного слайда
  const slideWidth = isMobile ? 100 : isTablet ? 50 : 25;

  // Для мобильного режима: если showAllReviews === true — показываем все отзывы как статичный список
  const renderMobileReviews = () => {
    return filteredReviews.map((review) => (
      <div
        key={review.id}
        className="w-full p-6 bg-[#f5f6fa]"
        style={{ padding: "0 0 17px", margin: "20px 0" }}
      >
        <div className="flex-1">
          <h3 className="font-bold text-lg text-[#2c3a54]">{review.name}</h3>
          <p
            className="text-sm text-gray-500 mt-1"
            style={{ fontSize: "12px", marginTop: "4px", lineHeight: "20px" }}
          >
            {review.date}
          </p>
          <div className="flex mt-2.25" style={{ marginTop: "9px" }}>
            {renderStars(review.rating)}
          </div>
          <p
            className="text-sm text-gray-700 mt-2"
            style={{
              marginTop: "8px",
              color: "#566176",
              fontSize: "14px",
              lineHeight: "22px",
            }}
          >
            {review.text}
          </p>
          <p
            className="text-sm text-[#2c3a54] font-bold mt-3.75"
            style={{
              fontSize: "16px",
              lineHeight: "22px",
              marginTop: "15px",
            }}
          >
            {review.source}
          </p>
        </div>
      </div>
    ));
  };

  return (
    <section className="bg-[#f5f6fa]">
      <div className="max-w-[1300px] pt-17 md:pt-30 md:pb-[140px] container-centered">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-[#2c3a54] mb-4">
            Клиенты о нас
          </h2>

          {isMobile ? (
            // Мобильная версия: 3 кнопки + отдельная кнопка "Оставить отзыв"
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4.5 py-2.5 rounded-full border border-[#2c3a54] transition ${
                    filter === 'all' ? 'bg-[#2c3a54] text-white' : 'bg-white text-[#2c3a54] hover:bg-[#2c3a54] hover:text-white'
                  }`}
                >
                  Все отзывы
                </button>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setFilter('google')} 
                    className={`px-4.5 py-2.5 rounded-full flex items-center justify-center border border-[#2c3a54] transition ${
                      filter === 'google' ? 'bg-[#2c3a54]' : 'bg-white hover:bg-[#2c3a54]'
                    } group`}
                  >
                    <Image
                      src="/review/1.webp"
                      alt="Google"
                      width={21}
                      height={21}
                      className="mr-2.5"
                    />
                    <span className={`text-md leading-5.5 ${
                      filter === 'google' ? 'text-white' : 'text-[#2c3a54] group-hover:text-white'
                    }`}>
                      {googleRating}
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setFilter('yandex')} 
                    className={`px-4.5 py-2.5 rounded-full flex items-center justify-center border border-[#2c3a54] transition ${
                      filter === 'yandex' ? 'bg-[#2c3a54]' : 'bg-white hover:bg-[#2c3a54]'
                    } group`}
                  >
                    <Image
                      src="/review/2.webp"
                      alt="Yandex"
                      width={21}
                      height={21}
                      className="mr-2.5"
                    />
                    <span className={`text-md leading-5.5 ${
                      filter === 'yandex' ? 'text-white' : 'text-[#2c3a54] group-hover:text-white'
                    }`}>
                      {yandexRating}
                    </span>
                  </button>
                </div>
              </div>
              <Link href={'https://maps.app.goo.gl/E2EA3z9Y5ChgMqfa6'} target="_blank" className="w-full text-center px-3.75 py-2.25 border border-[#2c3a54] text-[#2c3a54] rounded-full font-bold hover:bg-[#2c3a54] hover:text-white transition">
                Оставить свой отзыв
              </Link>
            </div>
          ) : (
            // Десктоп/планшет: 3 кнопки + кнопка "Оставить отзыв" в одной строке с разделителем
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4.5 py-2.5 rounded-full border border-[#2c3a54] transition ${
                  filter === 'all' ? 'bg-[#2c3a54] text-white' : 'bg-white text-[#2c3a54] hover:bg-[#2c3a54] hover:text-white'
                }`}
              >
                Все отзывы
              </button>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setFilter('google')} 
                  className={`px-4.5 py-2.5 rounded-full flex items-center justify-center border border-[#2c3a54] transition ${
                    filter === 'google' ? 'bg-[#2c3a54]' : 'bg-white hover:bg-[#2c3a54]'
                  } group`}
                >
                  <Image
                    src="/review/1.webp"
                    alt="Google"
                    width={21}
                    height={21}
                    className="mr-2.5"
                  />
                  <span className={`text-md leading-5.5 ${
                    filter === 'google' ? 'text-white' : 'text-[#2c3a54] group-hover:text-white'
                  }`}>
                    {googleRating}
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setFilter('yandex')} 
                  className={`px-4.5 py-2.5 rounded-full flex items-center justify-center border border-[#2c3a54] transition ${
                    filter === 'yandex' ? 'bg-[#2c3a54]' : 'bg-white hover:bg-[#2c3a54]'
                  } group`}
                >
                  <Image
                    src="/review/2.webp"
                    alt="Yandex"
                    width={21}
                    height={21}
                    className="mr-2.5"
                  />
                  <span className={`text-md leading-5.5 ${
                    filter === 'yandex' ? 'text-white' : 'text-[#2c3a54] group-hover:text-white'
                  }`}>
                    {yandexRating}
                  </span>
                </button>
              </div>
              <div className="border-l border-gray-300 mx-4 h-8"></div>
              <Link href={'https://maps.app.goo.gl/E2EA3z9Y5ChgMqfa6'} target="_blank" className="px-3.75 py-2.25 border border-[#2c3a54] text-[#2c3a54] rounded-full font-bold hover:bg-[#2c3a54] hover:text-white transition">
                Оставить свой отзыв
              </Link>
            </div>
          )}
        </div>

        {/* Слайдер (только если НЕ мобильный или мобильный, но НЕ показаны все отзывы) */}
        {!isMobile || !showAllReviews ? (
          <div
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onMouseDown={handleMouseDown}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * slideWidth}%)`,
              }}
            >
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className={`shrink-0 ${isMobile ? "w-full bg-[#f5f6fa]" : isTablet ? "w-1/2 shadow-sm" : "w-1/4 shadow-sm"
                    } p-6 bg-white relative`}
                  style={
                    isMobile
                      ? { padding: "0 0 17px", margin: "20px 0" }
                      : { padding: "33px 24px 67px" }
                  }
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#2c3a54]">
                      {review.name}
                    </h3>
                    <p
                      className="text-sm text-gray-500 mt-1"
                      style={{
                        fontSize: "12px",
                        marginTop: "4px",
                        lineHeight: "20px",
                      }}
                    >
                      {review.date}
                    </p>
                    <div className="flex mt-2.25" style={{ marginTop: "9px" }}>
                      {renderStars(review.rating)}
                    </div>
                    <p
                      className="text-sm text-gray-700 mt-2"
                      style={{
                        marginTop: "8px",
                        color: "#566176",
                        fontSize: "14px",
                        lineHeight: "22px",
                      }}
                    >
                      {review.text}
                    </p>
                    {/* Позиционирование "Отзыв из Google" — абсолютное для >=768px, margin-top для <768px */}
                    <p
                      className={`text-sm text-[#2c3a54] font-bold ${isMobile ? "mt-3.75" : "absolute bottom-8.25 left-6"
                        }`}
                      style={
                        isMobile
                          ? {
                            fontSize: "16px",
                            lineHeight: "22px",
                            marginTop: "15px",
                          }
                          : {
                            fontSize: "16px",
                            lineHeight: "22px",
                          }
                      }
                    >
                      {review.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Индикаторы — только если НЕ мобильный ИЛИ если мобильный, но НЕ показаны все отзывы */}
        {!isMobile && !showAllReviews && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({
              length: filteredReviews.length === 0 ? 0 : (isMobile ? filteredReviews.length : isTablet ? Math.max(filteredReviews.length - 1, 1) : Math.max(filteredReviews.length - 3, 1))
            }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full ${index === currentSlide ? 'bg-[#2c3a54]' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}

        {/* Кнопка "Показать ещё" — только на мобильных, если не показаны все отзывы */}
        {isMobile && !showAllReviews && (
          <div className="mt-6">
            <button
              onClick={() => setShowAllReviews(true)}
              className="w-full py-3 bg-[#2c3a54] text-white rounded-full font-bold text-center hover:bg-opacity-90 transition"
            >
              Показать ещё
            </button>
          </div>
        )}

        {/* Если мобильный и показаны все отзывы — рендерим весь список статично */}
        {isMobile && showAllReviews && (
          <div className="mt-6">{renderMobileReviews()}</div>
        )}
        {loading && <div className="mt-6 text-[#6B809E]">Загрузка отзывов...</div>}
        {error && <div className="mt-6 text-red-600">{error}</div>}
        {!loading && !error && reviews.length === 0 && (
          <div className="mt-6 text-[#6B809E]">Отзывы отсутствуют</div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSlider;
