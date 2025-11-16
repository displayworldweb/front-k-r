'use client'
import React, { useEffect, useState } from "react";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

interface CategoryWithPrice {
  title: string;
  img: string;
  link: string;
  price?: string;
}

function IconArrow() {
  return (
    <svg
      className="w-5 h-5 ml-2 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function PopularCategories() {
  const [categories, setCategories] = useState<CategoryWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoriesWithPrices = async () => {
      setLoading(true);
      try {
        // Загружаем цены для категорий
        const fetchMinPrice = async (endpoint: string): Promise<number> => {
          try {
            const res = await apiClient.get(endpoint);
            const items = Array.isArray(res) ? res : res?.data || [];
            const prices = items
              .map((p: any) => {
                const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
                return price;
              })
              .filter((p: any) => p && !isNaN(p) && p > 0);
            return prices.length > 0 ? Math.min(...prices) : 0;
          } catch (e) {
            console.error('Error fetching min price from', endpoint, ':', e);
            return 0;
          }
        };

        const cheapPrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/cheap`);
        const singlePrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/single`);
        const doublePrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/double`);
        const exclusivePrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/exclusive`);
        const complexPrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}/complex`);
        const granitePrice = await fetchMinPrice(`${API_ENDPOINTS.fences}/granite`);
        const landscapePrice = await fetchMinPrice(`${API_ENDPOINTS.landscape}`);
        const monumentPrice = await fetchMinPrice(`${API_ENDPOINTS.monuments}`);

        const formattedPrice = (price: number) => 
          price > 0 ? `от ${Math.round(price)} руб.` : undefined;

        const categoriesData: CategoryWithPrice[] = [
          {
            title: "Недорогие",
            price: formattedPrice(cheapPrice),
            img: "/section/cheap.webp",
            link: "/monuments/cheap",
          },
          {
            title: "Одиночные",
            price: formattedPrice(singlePrice),
            img: "/section/single.webp",
            link: "/monuments/single",
          },
          {
            title: "Двойные",
            price: formattedPrice(doublePrice),
            img: "/section/double.webp",
            link: "/monuments/double",
          },
          {
            title: "Эксклюзивные",
            price: formattedPrice(exclusivePrice),
            img: "/section/exclusive.webp",
            link: "/monuments/exclusive",
          },
          {
            title: "Мемориальные комплексы",
            price: formattedPrice(complexPrice),
            img: "/section/complex.webp",
            link: "/monuments/complex",
          },
          {
            title: "Гранитные ограды",
            price: formattedPrice(granitePrice),
            img: "/section/granite.webp",
            link: "/fences",
          },
          {
            title: "Благоустройство могил",
            price: formattedPrice(landscapePrice),
            img: "/section/landscape.webp",
            link: "/landscape",
          },
          {
            title: "Памятники",
            price: formattedPrice(monumentPrice),
            img: "/section/monuments.webp",
            link: "/monuments",
          },
        ];

        setCategories(categoriesData);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoriesWithPrices();
  }, []);
  return (
    <section className="max-w-[1300px] container-centered mt-17 lg:mt-30">
      <h2 className="text-4xl font-bold text-[#2c3a54] md:ml-2.5 mb-3.5 md:mb-7.5">Популярные категории</h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-600">Загрузка категорий...</p>
        </div>
      ) : (
        <>
          {/* Список для экранов <768px */}
          <div className="block md:hidden">
            <ul className="space-y-3">
              {categories.map(({ title, img, link, price }) => (
                <li key={title}>
                  <a
                    href={link}
                    className="flex items-center bg-[#f5f6fa] rounded-lg px-4 py-3 text-gray-800 "
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-8 h-8 object-contain mr-4"
                      loading="lazy"
                      width={32}
                      height={32}
                    />
                    <span className="grow text-base font-medium">{title}</span>
                    <IconArrow />
                  </a>
                </li>
              ))}
            </ul>

            <button className="mt-6 w-full bg-[#2c3a54] text-white text-lg font-bold py-3 rounded-4xl">
              Смотреть весь каталог
            </button>
          </div>

          {/* Сетка для экранов >=768px (md и выше) */}
          <div className="hidden md:grid grid-cols-2 xl:grid-cols-4">
            {categories.map(({ title, price, img, link }) => (
              <div className="mt-5 px-2.5" key={title}>
                <a
                  href={link}
                  className="flex flex-col bg-[#f5f6fa] rounded-2xl px-2.5 pb-5 pt-0.75 text-[20px] text-center transition-shadow hover:shadow-md min-h-80"
                >
                  <img
                    src={img}
                    alt={title}
                    className="mx-auto mb-4.5 object-contain"
                    loading="lazy"
                    width={198}
                    height={198}
                  />
                  <h3 className="font-bold text-gray-800">{title}</h3>
                  <div className="grow" />
                  <p className="text-[#cd5554] leading-6 min-h-5">
                    {price && price.trim() !== "" ? price : "\u00A0"}
                  </p>
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}