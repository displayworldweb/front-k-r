"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface PageSEO {
  id?: number;
  pageSlug: string;
  pageTitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  ogImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Доступные страницы для редактирования SEO
const AVAILABLE_PAGES = [
  // Главная страница
  { slug: 'home', title: 'Главная страница' },
  // Памятники
  { slug: 'monuments-catalog', title: 'Главный каталог памятников' },
  { slug: 'monuments-single', title: 'Одиночные памятники' },
  { slug: 'monuments-double', title: 'Двойные памятники' },
  { slug: 'monuments-exclusive', title: 'Эксклюзивные памятники' },
  { slug: 'monuments-cheap', title: 'Недорогие памятники' },
  { slug: 'monuments-composite', title: 'Составные памятники' },
  { slug: 'monuments-cross', title: 'В виде креста' },
  { slug: 'monuments-heart', title: 'В виде сердца' },
  { slug: 'monuments-europe', title: 'Европейские' },
  { slug: 'monuments-artistic', title: 'Художественная резка' },
  { slug: 'monuments-tree', title: 'В виде деревьев' },
  { slug: 'monuments-complex', title: 'Мемориальные комплексы' },
  // Ограды
  { slug: 'fences-catalog', title: 'Главный каталог оград' },
  { slug: 'fences-granite', title: 'Гранитные ограды' },
  { slug: 'fences-polymer', title: 'Ограды с полимерным покрытием' },
  { slug: 'fences-metal', title: 'Металлические ограды' },
  // Прочие страницы
  { slug: 'discount', title: 'Товары на скидке' },
  { slug: 'sales', title: 'Акции' },
  { slug: 'blogs', title: 'Блоги' },
  { slug: 'granite', title: 'Гранит' },
  { slug: 'favorites', title: 'Избранное' },
  { slug: 'payment', title: 'Оплата' },
  { slug: 'design', title: 'Дизайн' },
  { slug: 'design-portrait', title: 'Дизайн - Портреты' },
  { slug: 'design-medallions', title: 'Дизайн - Медальоны' },
  { slug: 'design-text-engraving', title: 'Дизайн - Текстовая гравировка' },
  { slug: 'services', title: 'Услуги' },
  { slug: 'services-monument-installation', title: 'Услуги - Установка памятников' },
  { slug: 'services-fence-installation', title: 'Услуги - Установка оград' },
  { slug: 'services-monument-production', title: 'Услуги - Производство памятников' },
  { slug: 'services-monument-dismantle', title: 'Услуги - Демонтаж памятников' },
  { slug: 'services-3d', title: 'Услуги - 3D визуализация' },
  { slug: 'landscape', title: 'Благоустройство' },
  { slug: 'landscape-foundation', title: 'Благоустройство - Фундамент' },
  { slug: 'landscape-graves', title: 'Благоустройство - Могил' },
  { slug: 'landscape-tiles', title: 'Благоустройство - Укладка плитки' },
  { slug: 'accessories', title: 'Аксессуары' },
  { slug: 'accessories-vases', title: 'Аксессуары - Вазы' },
  { slug: 'accessories-lamps', title: 'Аксессуары - Лампады' },
  { slug: 'accessories-sculptures', title: 'Аксессуары - Скульптуры' },
  { slug: 'accessories-frames', title: 'Аксессуары - Рамки' },
  { slug: 'accessories-bronze', title: 'Аксессуары - Бронза' },
  { slug: 'accessories-plates', title: 'Аксессуары - Плиты' },
  { slug: 'accessories-tables', title: 'Аксессуары - Столики' },
  // Почему нам доверяют
  { slug: 'why-granite', title: 'Работаем более чем с 30 породами гранита' },
  { slug: 'why-contract', title: 'Работаем строго по договору' },
  { slug: 'why-payment', title: 'Предоставляем разные варианты оплаты' },
  { slug: 'why-report', title: 'Предоставляем фото и видео отчёт' },
  { slug: 'why-quality', title: 'Гарантируем качество работ' },
  { slug: 'why-experience', title: 'Опыт работы более 30 лет' },
];

export default function SEOAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pageSeoData, setPageSeoData] = useState<PageSEO[]>([]);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("");
  const [seoData, setSeoData] = useState<PageSEO | null>(null);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Объявляем функции ДО useEffect чтобы они были доступны при вызове
  const fetchPageSeoData = async () => {
    try {
      const data = await apiClient.get("/admin/page-seo");
      if (data.success) {
        setPageSeoData(data.data || []);
      }
    } catch (err: any) {
      console.error("Ошибка загрузки SEO данных:", err);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=pages");
      if (data.success) {
        setAvailableImages(data.data || []);
      }
    } catch (err) {
      console.error("Ошибка загрузки изображений:", err);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    console.log('[/admin/seo] useEffect 1: checking auth, userStr:', userStr ? 'present' : 'missing');
    
    if (!userStr) {
      console.log('[/admin/seo] No user found, redirecting to /login');
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      console.log('[/admin/seo] User data:', { role: userData.role, username: userData.username });
      setUser(userData);
      setCheckingAuth(false);
      
      // Если пользователь НЕ superadmin - устанавливаем ошибку, но НЕ редиректим в useEffect
      // Редирект будет в return блоке компонента
      if (userData.role !== 'superadmin') {
        console.log('[/admin/seo] User is not superadmin, setting error');
        setError('У вас нет доступа к SEO разделу. Только superadmin может управлять SEO.');
        return; // НЕ загружаем данные для non-superadmin
      }
      
      // Только если superadmin - загружаем данные
      console.log('[/admin/seo] User is superadmin, loading data');
      fetchPageSeoData();
      fetchAvailableImages();
    } catch (e) {
      console.error('[/admin/seo] Error parsing user:', e);
      router.push('/login');
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700 font-semibold mb-2">⛔ Доступ запрещён</p>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-gray-600 text-sm mt-4">Перенаправление на главную панель...</p>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "pages");

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || "https://k-r.by/api") + "/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchAvailableImages();
        setSuccess("✓ Изображение загружено");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка загрузки");
      }
    } catch (err) {
      setError("Ошибка загрузки файла");
    } finally {
      setUploading(false);
    }
  };

  const loadPageSeo = async (pageSlug: string) => {
    const existing = pageSeoData.find((p) => p.pageSlug === pageSlug);
    if (existing) {
      setSeoData(existing);
      setEditingId(existing.id || null);
    } else {
      // Создаем шаблон с предложенными значениями
      const page = AVAILABLE_PAGES.find((p) => p.slug === pageSlug);
      setSeoData({
        pageSlug,
        pageTitle: page?.title || pageSlug,
        seoTitle: page?.title || pageSlug,
        seoDescription: `${page?.title || pageSlug} - услуги и товары`,
        seoKeywords: "",
        ogImage: ""
      });
      setEditingId(null);
    }
  };

  const handlePageSelect = (pageSlug: string) => {
    setSelectedPageSlug(pageSlug);
    loadPageSeo(pageSlug);
    setError("");
    setSuccess("");
  };

  const updateSeoField = (field: keyof PageSEO, value: any) => {
    setSeoData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const validateSeoData = (): boolean => {
    if (!seoData?.seoTitle || !seoData?.seoDescription) {
      setError("SEO Title и Description обязательны");
      return false;
    }
    if (seoData.seoTitle.length > 60) {
      setError("SEO Title не должен превышать 60 символов");
      return false;
    }
    if (seoData.seoDescription.length > 160) {
      setError("SEO Description не должна превышать 160 символов");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSeoData() || !seoData) return;

    setLoading(true);
    setError("");

    try {
      let data;
      if (editingId) {
        data = await apiClient.put(`/admin/page-seo/${editingId}`, seoData);
      } else {
        data = await apiClient.post("/admin/page-seo", seoData);
      }

      if (data.success) {
        setSuccess("✓ SEO данные сохранены");
        
        // Инвалидируем кэш SEO для этой страницы
        try {
          await fetch("/api/revalidate-seo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageSlug: seoData.pageSlug }),
          });
          console.log(`[Admin SEO] Кэш инвалидирован для ${seoData.pageSlug}`);
        } catch (e) {
          console.warn("[Admin SEO] Не удалось инвалидировать кэш:", e);
          // Не ошибка - данные всё равно сохранены
        }
        
        await fetchPageSeoData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при сохранении");
      }
    } catch (err: any) {
      setError("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeoStats = () => {
    if (!seoData) return { title: 0, desc: 0 };
    return {
      title: seoData.seoTitle?.length || 0,
      desc: seoData.seoDescription?.length || 0,
    };
  };

  const stats = getSeoStats();

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Если есть ошибка (доступ запрещён), покажем ошибку
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700 font-semibold mb-2">⛔ Доступ запрещён</p>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-gray-600 text-sm mt-4">Перенаправление на главную панель...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Оптимизация</h1>
        <p className="text-gray-600 mb-8">Управляйте SEO метаданными всех страниц</p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Левая панель - выбор страницы */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Выберите страницу</h2>

              <select
                value={selectedPageSlug}
                onChange={(e) => handlePageSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Выберите страницу --</option>
                {AVAILABLE_PAGES.map((page) => {
                  const hasSeo = pageSeoData.some((p) => p.pageSlug === page.slug);
                  return (
                    <option key={page.slug} value={page.slug}>
                      {page.title} {hasSeo ? "✓" : ""}
                    </option>
                  );
                })}
              </select>

              {selectedPageSlug && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      Статус: {editingId ? "Редактирование" : "Создание"}
                    </p>
                  </div>

                  <h3 className="font-medium text-gray-700 mt-4">Загрузить OG изображение:</h3>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-black bg-white text-sm"
                    />
                    {uploading && <span className="text-xs text-gray-600 ml-2">Загрузка...</span>}
                  </div>

                  {availableImages.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Загруженные изображения:</p>
                      <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                        {availableImages.map((img) => (
                          <div
                            key={img}
                            className="p-1 bg-white rounded cursor-pointer text-black hover:bg-blue-50"
                            onClick={() => updateSeoField("ogImage", img)}
                          >
                            {img.split("/").pop()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Главная панель - редактор SEO */}
          <div className="lg:col-span-3">
            {selectedPageSlug && seoData ? (
              <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    SEO: {AVAILABLE_PAGES.find((p) => p.slug === selectedPageSlug)?.title}
                  </h2>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    {loading ? "Сохранение..." : "💾 Сохранить"}
                  </button>
                </div>

                {/* Tabs-like navigation */}
                <div className="space-y-8">
                  {/* 1. Основные SEO теги и OG изображение */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                        1
                      </span>
                      SEO метаданные
                    </h3>

                    <div className="space-y-6">
                      {/* SEO Title */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            SEO Title (Meta Title) *
                          </label>
                          <span
                            className={`text-xs font-medium ${
                              stats.title <= 60 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {stats.title}/60
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={60}
                          value={seoData.seoTitle || ""}
                          onChange={(e) => updateSeoField("seoTitle", e.target.value)}
                          placeholder="Оптимальная длина 50-60 символов"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Это то, что видит пользователь в результатах поиска
                        </p>
                      </div>

                      {/* SEO Description */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Meta Description *
                          </label>
                          <span
                            className={`text-xs font-medium ${
                              stats.desc <= 160 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {stats.desc}/160
                          </span>
                        </div>
                        <textarea
                          maxLength={160}
                          value={seoData.seoDescription || ""}
                          onChange={(e) => updateSeoField("seoDescription", e.target.value)}
                          placeholder="Оптимальная длина 150-160 символов"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Краткое описание страницы для поисковых систем
                        </p>
                      </div>

                      {/* SEO Keywords */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SEO Ключевые слова / Теги
                        </label>
                        <input
                          type="text"
                          value={seoData.seoKeywords || ""}
                          onChange={(e) => updateSeoField("seoKeywords", e.target.value)}
                          placeholder="Ключевое слово 1, Ключевое слово 2, Ключевое слово 3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Ключевые слова через запятую
                        </p>
                      </div>

                      {/* OG Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OG Image для социальных сетей (URL)
                        </label>
                        <input
                          type="text"
                          value={seoData.ogImage || ""}
                          onChange={(e) => updateSeoField("ogImage", e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Рекомендуемый размер: 1200x630px
                        </p>
                        {seoData.ogImage && (
                          <div className="mt-4">
                            <img
                              src={seoData.ogImage}
                              alt="OG Preview"
                              className="max-h-48 rounded-lg border border-gray-300"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Сохранение */}
                  <div className="flex gap-4 pt-8 border-t border-gray-200">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      {loading ? "Сохранение..." : "💾 Сохранить"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
                <p className="text-gray-600 text-lg">Выберите страницу для редактирования SEO метаданных</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
