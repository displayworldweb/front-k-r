"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/slug-generator";
import { apiClient } from "@/lib/api-client";
import { SeoFieldsForm, SeoFieldsData } from "@/components/admin/SeoFieldsForm";
import { useSeoSave } from "@/lib/hooks/use-seo-save";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface Landscape {
  id: number;
  slug?: string;
  name: string;
  price?: string | number;
  textPrice?: string;
  category: string;
  image: string;
  specifications?: any;
  createdAt: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
}

const LANDSCAPE_CATEGORIES = ["Щебень", "Столы и скамейки", "Укладка плитки", "Искусственный газон"];

// Маппинг категорий на categoryKey для SEO шаблонов
const CATEGORY_TO_KEY_MAP: {[key: string]: string} = {
  "Щебень": "gravel",
  "Столы и скамейки": "benches",
  "Укладка плитки": "tiles",
  "Искусственный газон": "lawn"
};

export default function LandscapeAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [landscapes, setLandscapes] = useState<Landscape[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [addingLandscape, setAddingLandscape] = useState(false);
  const [editingLandscape, setEditingLandscape] = useState<Landscape | null>(null);
  
  // SEO хук
  const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('landscape');
  
  // Объединённая форма для create и edit
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    price: "",
    textPrice: "",
    category: "",
    image: "",
    specifications: {} as {[key: string]: string},
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image: "",
  });
  
  // Для характеристик
  const [specifications, setSpecifications] = useState({
    color: '',      // для щебня
    chair: '',      // для столов и скамеек
    leg: '',        // для столов и скамеек
    height: '',     // для столов и скамеек / газона
    type: '',       // для плитки / газона
    size: ''        // для плитки
  });
  
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchLandscape = async () => {
    try {
      const data = await apiClient.get("/admin/landscape");
      if (data.success) {
        setLandscapes(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching landscape:", err);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=landscape");
      if (data.success) {
        setAvailableImages(data.data || []);
      } else {
        // Fallback к предустановленному списку с правильными путями
        const predefinedImages = [
          "https://k-r.by/api/static/landscape/landscape-1.webp",
          "https://k-r.by/api/static/landscape/landscape-2.webp",
          "https://k-r.by/api/static/landscape/landscape-3.webp",
        ];
        setAvailableImages(predefinedImages);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      // Fallback к предустановленному списку при ошибке с правильными путями
      const predefinedImages = [
        "https://k-r.by/api/static/landscape/landscape-1.webp",
        "https://k-r.by/api/static/landscape/landscape-2.webp",
        "https://k-r.by/api/static/landscape/landscape-3.webp",
      ];
      setAvailableImages(predefinedImages);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "landscape");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api'}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setEditForm(prev => ({ ...prev, image: data.data.path }));
        await fetchAvailableImages();
      } else {
        setUploadError(data.error || "Ошибка загрузки");
      }
    } catch (err: any) {
      setUploadError("Ошибка: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Проверка доступа
  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setCheckingAuth(false);
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    fetchLandscape();
    fetchAvailableImages();
  }, []);

  useEffect(() => {
    if (editForm.name && !editingLandscape) {
      setEditForm(prev => ({
        ...prev,
        slug: generateSlug(editForm.name)
      }));
    }
  }, [editForm.name, editingLandscape]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm("Вы уверены, что хотите добавить этот товар?")) return;
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const finalSlug = editForm.slug || generateSlug(editForm.name);
      
      // Очищаем спецификации от пустых значений
      const cleanedSpecifications: any = {};
      
      if (editForm.category === "Щебень") {
        if (specifications.color) cleanedSpecifications.color = specifications.color;
      } else if (editForm.category === "Столы и скамейки") {
        if (specifications.chair) cleanedSpecifications.chair = specifications.chair;
        if (specifications.leg) cleanedSpecifications.leg = specifications.leg;
        if (specifications.height) cleanedSpecifications.height = specifications.height;
      } else if (editForm.category === "Укладка плитки") {
        if (specifications.type) cleanedSpecifications.type = specifications.type;
        if (specifications.size) cleanedSpecifications.size = specifications.size;
      } else if (editForm.category === "Искусственный газон") {
        if (specifications.type) cleanedSpecifications.type = specifications.type;
        if (specifications.height) cleanedSpecifications.height = specifications.height;
      }
      
      // Загружаем SEO шаблон если все поля пусты
      let seoTitle = editForm.seo_title;
      let seoDescription = editForm.seo_description;
      let seoKeywords = editForm.seo_keywords;
      let ogImage = editForm.og_image;

      console.log('[LANDSCAPE] Initial SEO:', { seoTitle, seoDescription, seoKeywords, ogImage });

      const hasUserProvidedSeo = seoTitle || seoDescription || seoKeywords || ogImage;
      console.log('[LANDSCAPE] hasUserProvidedSeo:', hasUserProvidedSeo);
      
      if (!hasUserProvidedSeo) {
        // Только загружаем шаблон если все поля пусты
        try {
          const { fetchSeoTemplate } = await import('@/lib/hooks/use-seo-hierarchy');
          const categoryKey = CATEGORY_TO_KEY_MAP[editForm.category] || editForm.category;
          console.log('Fetching SEO template for landscape category:', editForm.category, 'key:', categoryKey);
          const template = await fetchSeoTemplate("landscape", categoryKey);
          console.log('Template received:', template);
          
          if (template) {
            seoTitle = template.seoTitle || editForm.name;
            seoDescription = template.seoDescription || `Благоустройство ${editForm.name}`;
            seoKeywords = template.seoKeywords || editForm.name;
            ogImage = template.ogImage || "";
            console.log('Applied template SEO:', { seoTitle, seoDescription, seoKeywords, ogImage });
          } else {
            // Если шаблона нет - используем данные как fallback
            seoTitle = editForm.name;
            seoDescription = `Благоустройство ${editForm.name}`;
            seoKeywords = editForm.name;
            console.log('No template found, using fallback:', { seoTitle, seoDescription, seoKeywords });
          }
        } catch (err) {
          console.warn('Failed to load SEO template, using defaults:', err);
          // Используем данные как fallback
          seoTitle = editForm.name;
          seoDescription = `Благоустройство ${editForm.name}`;
          seoKeywords = editForm.name;
          console.log('Template load error, using fallback:', { seoTitle, seoDescription, seoKeywords });
        }
      } else {
        // Юзер вписал что-то - используем его значения, заполняя пропуски fallback'ом
        console.log('User provided SEO, using user values:', { seoTitle, seoDescription, seoKeywords, ogImage });
        seoTitle = seoTitle || editForm.name;
        seoDescription = seoDescription || `Благоустройство ${editForm.name}`;
        seoKeywords = seoKeywords || editForm.name;
        ogImage = ogImage || "";
      }
      
      const body = {
        slug: finalSlug,
        name: editForm.name,
        price: editForm.price,
        textPrice: editForm.textPrice,
        category: editForm.category,
        image: editForm.image,
        specifications: cleanedSpecifications,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
      };

      const data = await apiClient.post("/admin/landscape", body);
      if (data.success) {
        setSuccess("✓ Товар добавлен");
        setEditForm({
          name: "",
          slug: "",
          price: "",
          textPrice: "",
          category: "",
          image: "",
          specifications: {},
          seo_title: "",
          seo_description: "",
          seo_keywords: "",
          og_image: "",
        });
        setSpecifications({
          color: "",
          chair: "",
          leg: "",
          height: "",
          type: "",
          size: ""
        });
        setAddingLandscape(false);
        await fetchLandscape();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при добавлении");
      }
    } catch (err: any) {
      setError("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот товар? Действие необратимо!")) return;

    try {
      const data = await apiClient.delete(`/admin/landscape/${id}`);
      if (data.success) {
        setSuccess("✓ Товар удален");
        setError("");
        await fetchLandscape();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при удалении");
        console.error("Delete error:", data);
      }
    } catch (err: any) {
      setError("Ошибка: " + err.message);
      console.error("Delete exception:", err);
    }
  };

  const startEditing = (landscapeItem: Landscape) => {
    console.log('Starting edit for landscape:', JSON.stringify(landscapeItem, null, 2));
    
    // Конвертируем API ответ (может быть camelCase или snake_case)
    const seoTitle = landscapeItem.seo_title || (landscapeItem as any).seoTitle || "";
    const seoDescription = landscapeItem.seo_description || (landscapeItem as any).seoDescription || "";
    const seoKeywords = landscapeItem.seo_keywords || (landscapeItem as any).seoKeywords || "";
    const ogImage = landscapeItem.og_image || (landscapeItem as any).ogImage || "";
    
    console.log('SEO data extracted:', { seoTitle, seoDescription, seoKeywords, ogImage });
    
    setEditingLandscape(landscapeItem);
    setEditForm({
      name: landscapeItem.name || "",
      slug: landscapeItem.slug || "",
      price: landscapeItem.price?.toString() || "",
      textPrice: landscapeItem.textPrice || "",
      category: landscapeItem.category || "",
      image: landscapeItem.image || "",
      specifications: (landscapeItem as any).specifications || {},
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      og_image: ogImage,
    });
    
    // Загружаем спецификации
    const specs = (landscapeItem as any).specifications || {};
    setSpecifications({
      color: specs.color || '',
      chair: specs.chair || '',
      leg: specs.leg || '',
      height: specs.height || '',
      type: specs.type || '',
      size: specs.size || ''
    });
  };

  const handleSaveSeo = async (data: SeoFieldsData) => {
    if (!editingLandscape) return;
    try {
      await saveSeoFields(editingLandscape.id, data);
      setSuccess('✓ SEO успешно сохранено');
      await fetchLandscape();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError('Ошибка при сохранении SEO');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLandscape) return;
    if (!window.confirm("Вы уверены, что хотите сохранить изменения?")) return;
    
    try {
      // Очищаем спецификации от пустых значений
      const cleanedSpecifications: any = {};
      
      if (editForm.category === "Щебень") {
        if (specifications.color) cleanedSpecifications.color = specifications.color;
      } else if (editForm.category === "Столы и скамейки") {
        if (specifications.chair) cleanedSpecifications.chair = specifications.chair;
        if (specifications.leg) cleanedSpecifications.leg = specifications.leg;
        if (specifications.height) cleanedSpecifications.height = specifications.height;
      } else if (editForm.category === "Укладка плитки") {
        if (specifications.type) cleanedSpecifications.type = specifications.type;
        if (specifications.size) cleanedSpecifications.size = specifications.size;
      } else if (editForm.category === "Искусственный газон") {
        if (specifications.type) cleanedSpecifications.type = specifications.type;
        if (specifications.height) cleanedSpecifications.height = specifications.height;
      }
      
      const body = {
        name: editForm.name,
        slug: editForm.slug,
        price: editForm.price ? parseFloat(editForm.price) : undefined,
        textPrice: editForm.textPrice,
        category: editForm.category,
        image: editForm.image,
        specifications: cleanedSpecifications,
        seoTitle: editForm.seo_title,
        seoDescription: editForm.seo_description,
        seoKeywords: editForm.seo_keywords,
        ogImage: editForm.og_image,
      };
      
      const data = await apiClient.put(`/admin/landscape/${editingLandscape.id}`, body);
      if (data.success) {
        setSuccess("✓ Товар обновлен");
        setEditingLandscape(null);
        await fetchLandscape();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при обновлении");
      }
    } catch (err: any) {
      setError("Ошибка: " + err.message);
    }
  };

  return (
    <>
      {checkingAuth && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      )}
      
      {!checkingAuth && (
        <div className="space-y-8">
          <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Добавить товар (Landscape)</h2>
        {error && <div className="text-red-600 mb-4 p-2 bg-red-50">{error}</div>}
        {success && <div className="text-green-600 mb-4 p-2 bg-green-50">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded">
          <input
            type="text"
            placeholder="Название"
            value={editForm.name}
            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Slug (автогенерируется из названия)"
            value={editForm.slug}
            onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
            className="w-full px-4 py-2 border rounded text-gray-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Цена (число)"
              value={editForm.price}
              onChange={(e) => {
                setEditForm({...editForm, price: e.target.value});
                if (e.target.value) setEditForm(prev => ({...prev, textPrice: ""}));
              }}
              step="0.01"
              disabled={!!editForm.textPrice}
              className="px-4 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              placeholder="Цена (текст, напр. 'от 75 руб.')"
              value={editForm.textPrice}
              onChange={(e) => {
                setEditForm({...editForm, textPrice: e.target.value});
                if (e.target.value) setEditForm(prev => ({...prev, price: ""}));
              }}
              disabled={!!editForm.price}
              className="px-4 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
          </div>
          <select
            value={editForm.category}
            onChange={(e) => {
              setEditForm({...editForm, category: e.target.value});
              // Очищаем характеристики при смене категории
              setSpecifications({
                color: "",
                chair: "",
                leg: "",
                height: "",
                type: "",
                size: ""
              });
            }}
            required
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">-- Выберите категорию --</option>
            {LANDSCAPE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-medium mb-2">Выберите изображение</label>
            <div className="space-y-3">
              <select
                value={editForm.image}
                onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">-- Выберите изображение --</option>
                {availableImages.map((img: string) => (
                  <option key={img} value={img}>{img}</option>
                ))}
              </select>
              <div className="border-t pt-3">
                <label className="block text-sm font-medium mb-2">Или загрузите новое</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".webp,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 border rounded"
                  />
                  {uploading && <span className="text-blue-600">Загрузка...</span>}
                </div>
                {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
              </div>
            </div>
            {editForm.image && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Превью:</p>
                <img src={editForm.image} alt="Preview" className="h-24 w-24 object-cover rounded" />
              </div>
            )}
          </div>
          
          {/* Характеристики в зависимости от категории */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
            
            {/* Щебень: только Цвет */}
            {editForm.category === "Щебень" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Цвет (напр. Серый)"
                  value={specifications.color}
                  onChange={(e) => setSpecifications({ ...specifications, color: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Столы и скамейки: Стул, Ножка, Высота */}
            {editForm.category === "Столы и скамейки" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Стул (напр. со спинкой)"
                  value={specifications.chair}
                  onChange={(e) => setSpecifications({ ...specifications, chair: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Ножка (напр. Металлическая)"
                  value={specifications.leg}
                  onChange={(e) => setSpecifications({ ...specifications, leg: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Высота (напр. 75 см)"
                  value={specifications.height}
                  onChange={(e) => setSpecifications({ ...specifications, height: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Укладка плитки: Тип, Размер */}
            {editForm.category === "Укладка плитки" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Тип плитки (напр. Гранитная)"
                  value={specifications.type}
                  onChange={(e) => setSpecifications({ ...specifications, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Размер (напр. 50x50 см)"
                  value={specifications.size}
                  onChange={(e) => setSpecifications({ ...specifications, size: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Искусственный газон: Тип, Высота ворса */}
            {editForm.category === "Искусственный газон" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Тип (напр. Спортивный)"
                  value={specifications.type}
                  onChange={(e) => setSpecifications({ ...specifications, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Высота ворса (напр. 25 мм)"
                  value={specifications.height}
                  onChange={(e) => setSpecifications({ ...specifications, height: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
          </div>

          {/* SEO Поля */}
          {user?.role === 'superadmin' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">SEO (опционально)</h3>
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Заголовок</label>
                    <input
                      type="text"
                      placeholder="Заголовок для SEO"
                      value={editForm.seo_title}
                      onChange={(e) => setEditForm({...editForm, seo_title: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Описание</label>
                    <input
                      type="text"
                      placeholder="Описание для SEO"
                      value={editForm.seo_description}
                      onChange={(e) => setEditForm({...editForm, seo_description: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Ключевые слова</label>
                    <input
                      type="text"
                      placeholder="Ключевые слова для SEO"
                      value={editForm.seo_keywords}
                      onChange={(e) => setEditForm({...editForm, seo_keywords: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">OG Изображение (URL)</label>
                    <input
                      type="text"
                      placeholder="URL изображения для социальных сетей"
                      value={editForm.og_image}
                      onChange={(e) => setEditForm({...editForm, og_image: e.target.value})}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Добавление..." : "Добавить"}
          </button>
        </form>
      </div>

      <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Список товаров ({landscapes.length})</h2>
        <div className="grid gap-4">
          {landscapes.map((item: Landscape) => (
            <div key={item.id} className="border p-4 rounded bg-white">
              {editingLandscape?.id === item.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Название"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="Категория"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      placeholder="Цена"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editForm.textPrice}
                      onChange={(e) => setEditForm({ ...editForm, textPrice: e.target.value })}
                      placeholder="Текстовая цена"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  
                  {/* SEO Fields */}
                  {user?.role === 'superadmin' && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3 text-gray-800">SEO Данные</h4>
                      <SeoFieldsForm
                        key={`${editingLandscape?.id}-${addingLandscape}`}
                        entityType="landscape"
                        categoryName="Благоустройство"
                        initialData={{
                          seoTitle: editForm.seo_title,
                          seoDescription: editForm.seo_description,
                          seoKeywords: editForm.seo_keywords,
                          ogImage: editForm.og_image,
                        }}
                        onChange={(data) => {
                          console.log('SeoFieldsForm onChange:', data);
                          setEditForm(prev => ({
                            ...prev,
                            seo_title: data.seoTitle,
                            seo_description: data.seoDescription,
                            seo_keywords: data.seoKeywords,
                            og_image: data.ogImage,
                          }));
                        }}
                        onSave={handleSaveSeo}
                        isLoading={seoLoading}
                        error={seoError || undefined}
                      />
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => {
                        setEditingLandscape(null);
                        setSpecifications({
                          color: "",
                          chair: "",
                          leg: "",
                          height: "",
                          type: "",
                          size: ""
                        });
                      }}
                      className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-lg">{item.name}</div>
                  <div className="text-sm text-gray-600">Категория: {item.category}</div>
                  {item.price && <div className="text-sm">Цена: {item.price} руб.</div>}
                  {item.textPrice && <div className="text-sm">Цена: {item.textPrice}</div>}
                  <div className="text-sm text-gray-500">ID: {item.id}</div>
                  {item.specifications && Object.keys(item.specifications).length > 0 && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Характеристики:</strong>
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <div key={key} className="ml-2">• {key}: {String(value)}</div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => startEditing(item)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
      )}
    </>
  );
}
