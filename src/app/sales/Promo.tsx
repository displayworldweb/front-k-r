"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface Campaign {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  image: string;
  createdAt: string;
}

const Promo = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await apiClient.get("/campaigns");
        
        if (data.success) {
          // Показываем все акции
          setCampaigns(data.data || []);
        } else {
          setError("Ошибка загрузки акций");
        }
      } catch (err) {
        setError("Ошибка загрузки акций");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <section className="max-w-[1300px]">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка акций...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-[1300px]">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="max-w-[1300px]">
        <div className="text-center py-12">
          <p className="text-gray-600">В данный момент акции отсутствуют</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1300px]">
      <div className="flex flex-col flex-wrap -mx-2.5 md:flex-row space-y-5 md:space-y-0">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="w-full px-2.5 md:w-1/2 lg:w-1/3 overflow-hidden mb-5"
          >
            <a href={`/sales/${campaign.slug}`} className="bg-[#f5f6fa] rounded-lg block hover:shadow-lg transition-shadow">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-48 rounded-t-lg object-cover"
              />
              <div className="px-4.25 py-3.75 md:p-6">
                <h3 className="font-bold text-md lg:text-xl text-[#2c3a54] mb-1.25">{campaign.title}</h3>
                <p className="text-sm md:text-md text-[#2c3a54cc] leading-relaxed">
                  {campaign.description}
                </p>
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(campaign.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Promo;