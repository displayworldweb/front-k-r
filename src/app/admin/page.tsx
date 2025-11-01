"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface Stats {
  epitaphs: number;
  products: number;
  campaigns: number;
  blogs: number;
  works: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ epitaphs: 0, products: 0, campaigns: 0, blogs: 0, works: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const epitaphsData = await apiClient.get("/epitaphs");
      const epitaphsCount = epitaphsData.data?.length || 0;

      const productsData = await apiClient.get("/monuments");
      const productsCount = productsData.data?.length || 0;

      const campaignsData = await apiClient.get("/campaigns");
      const campaignsCount = campaignsData.data?.length || 0;

      const blogsData = await apiClient.get("/blogs");
      const blogsCount = blogsData.data?.length || 0;

      const worksData = await apiClient.get("/works");
      const worksCount = worksData.data?.length || 0;

      setStats({
        epitaphs: epitaphsCount,
        products: productsCount,
        campaigns: campaignsCount,
        blogs: blogsCount,
        works: worksCount,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const modules = [
    {
      href: "/admin/epitaphs",
      title: "Эпитафии",
      description: "Управление текстами эпитафий для памятников",
      icon: "✝️",
      color: "bg-purple-50 border-purple-200",
      count: stats.epitaphs,
    },
    {
      href: "/admin/accessories",
      title: "Аксессуары",
      description: "Управление вазами, лампадами, скульптурами",
      icon: "💎",
      color: "bg-pink-50 border-pink-200",
      count: 0,
    },
    {
      href: "/admin/fences",
      title: "Ограды",
      description: "Управление гранитными и металлическими оградами",
      icon: "🚧",
      color: "bg-amber-50 border-amber-200",
      count: 0,
    },
    {
      href: "/admin/landscape",
      title: "Landscape",
      description: "Управление товарами для благоустройства",
      icon: "🌳",
      color: "bg-green-50 border-green-200",
      count: 0,
    },
    {
      href: "/admin/campaigns",
      title: "Акции",
      description: "Управление промо-акциями и спецпредложениями",
      icon: "🎯",
      color: "bg-red-50 border-red-200",
      count: stats.campaigns,
    },
    {
      href: "/admin/blogs",
      title: "Блоги",
      description: "Управление статьями и блогами",
      icon: "📝",
      color: "bg-indigo-50 border-indigo-200",
      count: stats.blogs,
    },
    {
      href: "/admin/monuments",
      title: "Памятники",
      description: "Управление памятниками и монументами (HIT/ПОПУЛЯРНЫЙ)",
      icon: "🏛️",
      color: "bg-blue-50 border-blue-200",
      count: stats.products,
    },
    {
      href: "/admin/works",
      title: "Готовые работы",
      description: "Управление портфолио выполненных работ",
      icon: "📸",
      color: "bg-teal-50 border-teal-200",
      count: stats.works,
    },

  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Панель управления
        </h1>
        <p className="text-gray-600">
          Добро пожаловать в админ-панель. Выберите модуль для управления.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего эпитафий</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats.epitaphs}
              </p>
            </div>
            <span className="text-4xl">✝️</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Активных акций</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats.campaigns}
              </p>
            </div>
            <span className="text-4xl">🎯</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего блогов</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats.blogs}
              </p>
            </div>
            <span className="text-4xl">📝</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Всего товаров</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats.products}
              </p>
            </div>
            <span className="text-4xl">🛍️</span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Доступные модули
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <div
              key={module.href}
              className={`rounded-lg shadow border-2 p-6 transition-all ${module.color} hover:shadow-lg hover:scale-105 cursor-pointer`}
            >
              <Link href={module.href}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {module.icon} {module.title}
                    </h3>
                  </div>
                  {module.count !== undefined && (
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {module.count}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{module.description}</p>
                <div className="text-blue-600 font-semibold hover:text-blue-700">
                  Перейти →
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Link
            href="/admin/epitaphs"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 hover:shadow-lg transition-shadow font-semibold text-center"
          >
            + Добавить эпитафию
          </Link>
          <Link
            href="/admin/campaigns"
            className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4 hover:shadow-lg transition-shadow font-semibold text-center"
          >
            + Добавить акцию
          </Link>
          <Link
            href="/admin/blogs"
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg p-4 hover:shadow-lg transition-shadow font-semibold text-center"
          >
            + Добавить блог
          </Link>
          <Link
            href="/admin/accessories"
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg p-4 hover:shadow-lg transition-shadow font-semibold text-center"
          >
            + Добавить аксессуар
          </Link>
          <Link
            href="/admin/fences"
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-4 hover:shadow-lg transition-shadow font-semibold text-center"
          >
            + Добавить ограду
          </Link>
          <Link
            href="/admin/monuments"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 hover:shadow-lg transition-shadow font-semibold text-center"
          >
            🏛️ Управление памятниками
          </Link>
          <Link
            href="/admin/works"
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-4 hover:shadow-lg transition-shadow font-semibold text-center"
          >
            📸 Готовые работы
          </Link>
        </div>
      </div>
    </div>
  );
}
