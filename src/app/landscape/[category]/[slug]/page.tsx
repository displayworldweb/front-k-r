"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import PathPage from "@/app/components/PathPage";
import SidebarCatalogMenu from "@/app/components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "@/app/components/Sidebar/SidebarStickyHelp";
import ModalCommunication from "@/app/components/Modal/ModalCommunication";
import OurWorksSlider from "@/app/components/OurWorksSlider";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";

interface Specifications {
  color?: string;
  chair?: string;
  leg?: string;
  height?: string;
  material?: string;
  warranty?: string;
  fractionSize?: string;
  composition?: string;
  [key: string]: string | undefined;
}

interface LandscapeItem {
  id: number;
  slug: string;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  specifications?: Specifications;
  description?: string;
  createdAt: string;
}

const SPEC_LABELS: Record<string, string> = {
  color: "Цвет",
  chair: "Стул",
  leg: "Ножка",
  height: "Высота",
  weight: "Вес",
  material: "Материал",
  warranty: "Гарантия",
  fractionSize: "Размер фракции",
  composition: "Состав",
  graveExpenses: "Расходы на могилу",
  flowerBedExpenses: "Расходы на цветник",
  graniteTypes: "Другие виды гранита",
  secondarySize: "Другой размер",
  storage: "Хранение",
  antirain: "Антидождь"
};

// Статичные характеристики для каждой категории
const STATIC_CHARACTERISTICS: Record<string, Record<string, string>> = {
  "Щебень": {
    weight: "20 кг",
    graveExpenses: "4-8 мешков",
    flowerBedExpenses: "1-2 мешка"
  },
  "Столы и скамейки": {
    material: "Гранит Габбро Карелия",
    graniteTypes: "Более 20",
    secondarySize: "Возможно",
    storage: "Бесплатно",
    warranty: "10 лет"
  }
};

const LandscapeDetailPage = () => {
  const params = useParams();
  const categorySlug = params?.category as string;
  const landscapeSlug = params?.slug as string;

  const [landscapeItem, setLandscapeItem] = useState<LandscapeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrowMobile, setIsNarrowMobile] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"characteristics" | "description">("characteristics");

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Проверка размера экрана
  useEffect(() => {
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

  // Загрузка данных элемента благоустройства
  useEffect(() => {
    const loadLandscapeItem = async () => {
      try {
        const data = await apiClient.get(`/landscape?slug=${landscapeSlug}`);

        if (data.success && data.data) {
          const foundItem = Array.isArray(data.data)
            ? data.data.find((l: LandscapeItem) => l.slug === landscapeSlug)
            : data.data;

          if (!foundItem) {
            notFound();
          } else {
            setLandscapeItem(foundItem);
          }
        }
      } catch (err) {
        console.error("Error loading landscape item:", err);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (landscapeSlug) {
      loadLandscapeItem();
    }
  }, [landscapeSlug]);

  // Инициализация избранного из localStorage
  useEffect(() => {
    if (landscapeItem) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.includes(landscapeItem.id));
    }
  }, [landscapeItem?.id]);

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

  const toggleFavorite = () => {
    if (!landscapeItem) return;

    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite);

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (newIsFavorite) {
      if (!favorites.includes(landscapeItem.id)) {
        favorites.push(landscapeItem.id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    } else {
      const newFavorites = favorites.filter((id: number) => id !== landscapeItem.id);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    }

    window.dispatchEvent(new Event("favoritesChanged"));
  };

  // Компонент для отображения одной характеристики
  const CharacteristicItem = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => {
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-[#6B809E] text-sm">{SPEC_LABELS[label] || label}</span>
        <span className="text-[#2c3a54] font-medium text-sm">{value}</span>
      </div>
    );
  };

  // Определяем, есть ли характеристики или описание
  const dynamicSpecs = landscapeItem?.specifications || {};
  const staticSpecs = STATIC_CHARACTERISTICS[landscapeItem?.category || ""] || {};
  const allSpecs = { ...dynamicSpecs, ...staticSpecs };
  
  const hasCharacteristics = Object.keys(allSpecs).some(key => allSpecs[key]);
  const hasDescription = landscapeItem?.description;

  // Устанавливаем активную вкладку по умолчанию
  useEffect(() => {
    if (landscapeItem) {
      if (hasCharacteristics && !hasDescription) {
        setActiveTab("characteristics");
      } else if (!hasCharacteristics && hasDescription) {
        setActiveTab("description");
      } else if (hasCharacteristics && hasDescription) {
        setActiveTab("characteristics");
      }
    }
  }, [landscapeItem, hasCharacteristics, hasDescription]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (error || !landscapeItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{error || "Элемент благоустройства не найден"}</p>
      </div>
    );
  }

  return (
    <>
      <section className="container-centered mt-5 max-w-[1300px] flex">
        <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
          <SidebarCatalogMenu />
          <SidebarStickyHelp />
        </div>

        <div className="w-full lg:ml-5 lg:max-w-[75%]">
          <PathPage />

          <h1 className="text-black text-[24px] md:text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-semibold">
            {landscapeItem.name}
          </h1>

          {/* Основной контент карточки */}
          <div className={`mb-7.5 font-semibold ${isMobile ? 'block' : 'flex p-5'}`}>
            {/* Изображение */}
            <div className="relative max-w-[523px] md:w-7/12 mx-auto">
              {/* Звезда (избранное) */}
              <div
                className={`absolute top-2 left-2 z-10 w-11 h-11 text-center content-center text-2xl shadow-xs rounded-full hover:text-[#2c3a54] transition cursor-pointer ${isFavorite ? "text-[#2c3a54]" : "text-gray-400"
                  }`}
                onClick={toggleFavorite}
              >
                ★
              </div>

              <img
                src={landscapeItem.image}
                alt={landscapeItem.name}
                className="w-full h-auto object-contain rounded-lg md:pr-4" loading="lazy"
              />
            </div>

            {/* Блок с информацией о товаре */}
            <div className={`${isMobile ? 'w-full' : 'flex flex-col w-5/12'}`}>
              <div className={`${isMobile ? "mb-5" : 'bg-[#f5f6fa] p-5 rounded-lg mb-5'}`}>
                {/* Цена */}
                <div className="mb-5">
                  <span className="text-[#2c3a54]">Цена:</span>
                  <div className="flex items-center space-x-2 mt-2">
                    {landscapeItem.price ? (
                      <p className="text-3xl font-bold text-[#2c3a54]">
                        {landscapeItem.price} руб.
                      </p>
                    ) : landscapeItem.textPrice ? (
                      <p className="text-3xl font-bold text-[#2c3a54]">
                        {landscapeItem.textPrice}
                      </p>
                    ) : (
                      <p className="text-3xl font-bold text-[#2c3a54]">
                        Цена по запросу
                      </p>
                    )}
                  </div>
                </div>

                {/* Кнопки */}
                <div className="space-y-2.5 mb-5">
                  <button
                    className="w-full py-3 bg-[#2c3a54] text-white rounded-full font-bold hover:bg-[#1a273b] transition"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Заказать
                  </button>
                </div>
              </div>

              {/* Блок с иконками и текстом */}
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

          {/* Вкладки: Характеристики, Описание (только если есть что показать) */}
          {(hasCharacteristics || hasDescription) && (
            <>
              <div className="border-b border-gray-200 mb-5">
                <div className="flex space-x-4 md:space-x-6 text-[14px] md:text-[16px]">
                  {hasCharacteristics && (
                    <button
                      onClick={() => setActiveTab("characteristics")}
                      className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${activeTab === "characteristics"
                          ? ""
                          : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                        }`}
                    >
                      Характеристики
                    </button>
                  )}
                  {hasDescription && (
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`pb-2 font-bold text-[#2c3a54] hover:no-underline ${activeTab === "description"
                          ? ""
                          : "decoration-dashed decoration-[0.5px] underline underline-offset-4"
                        }`}
                    >
                      Описание
                    </button>
                  )}
                </div>
              </div>

              {/* Контент вкладок */}
              <div className="mb-7.5 font-semibold">
                {activeTab === "characteristics" && hasCharacteristics && (
                  <div>
                    <div className="space-y-1">
                      {Object.entries(allSpecs).map(([key, value]) =>
                        value ? (
                          <CharacteristicItem
                            key={key}
                            label={key}
                            value={value}
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "description" && hasDescription && (
                  <div>
                    <p className="text-[#2D4266] whitespace-pre-wrap">
                      {landscapeItem.description}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Слайдер готовых работ с этим товаром */}
      <OurWorksSlider 
        productId={landscapeItem.id.toString()}
        productType="landscape"
        title="Наши работы"
        maxWorks={8}
      />

      {/* Модальное окно */}
      <div
        ref={backdropRef}
        className={`fixed inset-0 bg-black transition-opacity z-40 ${isModalOpen ? "opacity-30" : "opacity-0 pointer-events-none"
          }`}
      />
      <ModalCommunication
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
        productData={{
          name: landscapeItem.name,
          image: landscapeItem.image,
          price: landscapeItem.price,
          category: landscapeItem.category,
        }}
      />
    </>
  );
};

export default LandscapeDetailPage;