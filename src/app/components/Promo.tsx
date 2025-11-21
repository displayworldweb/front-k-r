"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

interface CampaignApiItem {
  id: number | string;
  title: string;
  description?: string;
  image?: string; // иногда может быть просто image
  featuredImage?: string; // основное поле
  images?: string[]; // массив изображений
  link?: string;
  slug?: string;
}

const Promo = () => {
  const [campaigns, setCampaigns] = useState<CampaignApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(API_ENDPOINTS.campaigns);
        // Ожидаем либо массив, либо объект { success, data }
        let items: CampaignApiItem[] = Array.isArray(data)
          ? data
          : data?.data || [];
        // На главной странице показываем только последние 4 акции
        items = items.slice(-4);
        setCampaigns(items);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки акций");
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, []);

  return (
    <section className="max-w-[1300px] container-centered mt-17 lg:mt-30">
      <h2 className="text-4xl font-bold text-[#2c3a54] ml-2.5 mb-7.5">Наши акции</h2>

      {loading && <div className="ml-2.5 text-[#6B809E]">Загрузка...</div>}
      {error && <div className="ml-2.5 text-red-600">{error}</div>}

      <div className="flex flex-col md:flex-row space-y-5 md:space-y-0">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="max-w-full md:w-1/3 px-2.5 overflow-hidden"
          >
            <a
              href={campaign.link || (campaign.slug ? `/sales/${campaign.slug}` : '#')}
              className="block h-full bg-[#f5f6fa] rounded-lg shadow-sm"
            >
              {(() => {
                const imgSrc = campaign.featuredImage || campaign.image || campaign.images?.[0];
                if (!imgSrc) return null;
                return (
                  <img
                    src={imgSrc}
                    alt={campaign.title}
                    className="w-full h-auto object-cover rounded-lg"
                    loading="lazy"
                  />
                );
              })()}
              <div className="px-4.25 py-3.75 md:p-6">
                <h3 className="font-bold text-md lg:text-xl text-[#2c3a54] mb-1.25">{campaign.title}</h3>
                {campaign.description && (
                  <p className="text-sm md:text-md text-[#2c3a54cc] leading-relaxed">
                    {campaign.description}
                  </p>
                )}
              </div>
            </a>
          </div>
        ))}
        {!loading && campaigns.length === 0 && !error && (
          <div className="text-[#6B809E] ml-2.5">Нет доступных акций</div>
        )}
      </div>

      <div className="mt-6 md:mt-8 flex text-center">
        <Link href={'/sales'} className="font-bold w-full md:max-w-[338px] px-7.5 py-3 bg-[#2c3a54] border border-[#2c3a54] text-white rounded-full hover:bg-white hover:text-[#2c3a54] transition">
          Смотреть все
        </Link>
      </div>
    </section>
  );
};

export default Promo;