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
import { graniteTypes } from "@/app/mock/graniteTypes";

interface Specifications {
  color?: string;
  height?: string;
  dimensions?: string;
  material?: string;
  warranty?: string;
  drainageHole?: string;
  attachmentMethod?: string;
  [key: string]: string | undefined;
}

interface Accessory {
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
  height: "Высота",
  dimensions: "Габариты",
  material: "Материал",
  drainageHole: "Сливное отверстие",
  attachmentMethod: "Способ крепления",
  graniteTypes: "Другие виды гранита",
  secondarySize: "Другой размер",
  storage: "Хранение",
  warranty: "Гарантия",
  antirain: "Антидождь"
};

// Статичные характеристики для каждой категории
const STATIC_CHARACTERISTICS: Record<string, Record<string, string>> = {
  "Вазы": {
    material: "Полимербетон",
    warranty: "1 год",
    drainageHole: "есть",
    attachmentMethod: "на поверхность гранита с помощью штырей и клея-герметика"
  },
  "Лампады": {
    material: "Гранит",
    warranty: "1 год",
    attachmentMethod: "на поверхность гранита с помощью штырей и клея-герметика"
  },
  "Надгробные плиты": {
    material: "Гранит Габбро Карелия",
    graniteTypes: "Более 20",
    secondarySize: "Возможно",
    storage: "Бесплатно",
    warranty: "10 лет"
  },
  "Гранитные таблички": {
    material: "Гранит Габбро Карелия",
    warranty: "10 лет",
    graniteTypes: "Более 20",
    secondarySize: "Возможно",
    storage: "Бесплатно",
    antirain: "Бесплатно"
  },
  "Скульптуры": {
    material: "Полимербетон",
    attachmentMethod: "На клей-герметик",
    warranty: "1 год"
  }
};

const AccessoryDetailPage = () => {
  const params = useParams();
  const categorySlug = params?.category as string;
  const accessorySlug = params?.slug as string;

  const [accessory, setAccessory] = useState<Accessory | null>(null);
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

  // Загрузка данных аксессуара
  useEffect(() => {
    const loadAccessory = async () => {
      try {
        const data = await apiClient.get(`/accessories?slug=${accessorySlug}`);

        if (data.success && data.data) {
          const foundAccessory = Array.isArray(data.data)
            ? data.data.find((a: Accessory) => a.slug === accessorySlug)
            : data.data;

          if (!foundAccessory) {
            notFound();
          } else {
            setAccessory(foundAccessory);
          }
        }
      } catch (err) {
        console.error("Error loading accessory:", err);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (accessorySlug) {
      loadAccessory();
    }
  }, [accessorySlug]);

  // Инициализация избранного из localStorage
  useEffect(() => {
    if (accessory) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.includes(accessory.id));
    }
  }, [accessory?.id]);

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
    if (!accessory) return;

    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite);

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (newIsFavorite) {
      if (!favorites.includes(accessory.id)) {
        favorites.push(accessory.id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    } else {
      const newFavorites = favorites.filter((id: number) => id !== accessory.id);
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
  const dynamicSpecs = accessory?.specifications || {};
  const staticSpecs = STATIC_CHARACTERISTICS[accessory?.category || ""] || {};
  const allSpecs = { ...dynamicSpecs, ...staticSpecs };

  const hasCharacteristics = Object.keys(allSpecs).some(key => allSpecs[key]);
  const hasDescription = accessory?.description || (accessory?.category === "Изделия из бронзы") || (accessory?.category === "Рамки") || (accessory?.category === "Скульптуры");

  // Устанавливаем активную вкладку по умолчанию
  useEffect(() => {
    if (accessory) {
      if (hasCharacteristics && !hasDescription) {
        setActiveTab("characteristics");
      } else if (!hasCharacteristics && hasDescription) {
        setActiveTab("description");
      } else if (hasCharacteristics && hasDescription) {
        setActiveTab("characteristics");
      }
    }
  }, [accessory, hasCharacteristics, hasDescription]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (error || !accessory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{error || "Аксессуар не найден"}</p>
      </div>
    );
  }

  // Генерируем описание для изделий из бронзы
  const getBronzeDescription = () => {
    return `Материал, производство, производитель: 
Бронза, Италия, Caggiati

Монтаж: с помощью штырей на задней стороне

Важно: розничная продажа не осуществляется. Образцы представлены для ознакомления перед заказом памятника.`;
  };

  const getSculptureDescription = () => {
    return "Скульптура из полимербетона - отличный способ дополнить надгробие, придать ему индивидуальность. Они подходят для памятников, изготовленных из любого вида гранита.\n\nПри выборе скульптуры из полимербетона необходимо ориентироваться на размеры памятника, способ художественного оформления и вид гранита.\n\nБронзовые скульптуры хорошо сочетаются памятники, оформленными буквами из бронзы или позолоченным текстом. Скульптуры цвета белого мрамора хорошо дополняют белый гравированный текст. Модели цвета серебра и бронзы хорошо подходят под любой способ оформления.";
  };

  // Генерируем описание для рамок (определяем тип по названию)
  const getFrameDescription = () => {
    const name = accessory?.name?.toLowerCase() || "";
    if (name.includes("бронз")) {
      return "Материал, производство, производитель: Бронза, Италия, Caggiati\n\nМонтаж: с помощью штырей на задней стороне\n\nВажно: розничная продажа не осуществляется. Образцы представлены для ознакомления перед заказом памятника.";
    } else {
      return "Материал, страна производитель: металл с полимерным покрытием, Беларусь\nРазмеры: 13x18 см, 18x24 см, 20x30 см и другие\nЦвет: чёрный\nСпособ крепления: на поверхность гранита с помощью штырей и клея-герметика\n\nВажно: розничная продажа не осуществляется. Образцы представлены для ознакомления перед заказом памятника с медальоном.";
    }
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
            {accessory.name}
          </h1>

          {/* Основной контент карточки */}
          <div className={`mb-7.5 font-[600] ${isMobile ? 'block' : 'flex p-5'}`}>
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
                src={accessory.image}
                alt={accessory.name}
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
                    {accessory.price ? (
                      <p className="text-3xl font-bold text-[#2c3a54]">
                        {accessory.price} руб.
                      </p>
                    ) : accessory.textPrice ? (
                      <p className="text-3xl font-bold text-[#2c3a54]">
                        {accessory.textPrice}
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
              <div className="mb-7.5 font-[600]">
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
                      {accessory.description || 
                        (accessory.category === "Изделия из бронзы" && getBronzeDescription()) ||
                        (accessory.category === "Скульптуры" && getSculptureDescription()) ||
                        (accessory.category === "Рамки" && getFrameDescription()) ||
                        ""}
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
        productId={accessory.id.toString()}
        productType="accessories"
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
          name: accessory.name,
          image: accessory.image,
          price: accessory.price,
          category: accessory.category,
        }}
      />
    </>
  );
};

export default AccessoryDetailPage;