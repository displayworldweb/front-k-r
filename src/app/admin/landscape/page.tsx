"use client";

import { useState, useEffect } from "react";
import { generateSlug } from "@/lib/slug-generator";
import { apiClient } from "@/lib/api-client";
import { SeoFieldsForm, SeoFieldsData } from "@/components/admin/SeoFieldsForm";
import { useSeoSave } from "@/lib/hooks/use-seo-save";

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

const LANDSCAPE_CATEGORIES = ["Щебень", "Столы и скамейки"];

export default function LandscapeAdminPage() {
  const [landscape, setLandscape] = useState<Landscape[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [textPrice, setTextPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Landscape>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // SEO хук
  const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('landscape');
  
  // SEO state для create режима
  const [createSeoFields, setCreateSeoFields] = useState({
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_image: ''
  });
  
  // Для характеристик
  const [specifications, setSpecifications] = useState({
    color: '',      // для щебня
    chair: '',      // для столов и скамеек
    leg: '',        // для столов и скамеек
    height: ''      // для столов и скамеек
  });

  const fetchLandscape = async () => {
    try {
      const data = await apiClient.get("/admin/landscape");
      if (data.success) {
        setLandscape(data.products || []);
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
          "https://api.k-r.by/api/static/landscape/landscape-1.webp",
          "https://api.k-r.by/api/static/landscape/landscape-2.webp",
          "https://api.k-r.by/api/static/landscape/landscape-3.webp",
        ];
        setAvailableImages(predefinedImages);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      // Fallback к предустановленному списку при ошибке с правильными путями
      const predefinedImages = [
        "https://api.k-r.by/api/static/landscape/landscape-1.webp",
        "https://api.k-r.by/api/static/landscape/landscape-2.webp",
        "https://api.k-r.by/api/static/landscape/landscape-3.webp",
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api'}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImage(data.data.path);
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

  useEffect(() => {
    fetchLandscape();
    fetchAvailableImages();
  }, []);

  useEffect(() => {
    if (name && !editingId) {
      setSlug(generateSlug(name));
    }
  }, [name, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm("Вы уверены, что хотите добавить этот товар?")) return;
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const finalSlug = slug || generateSlug(name);
      
      // Очищаем спецификации от пустых значений
      const cleanedSpecifications: any = {};
      
      if (category === "Щебень") {
        if (specifications.color) cleanedSpecifications.color = specifications.color;
      } else if (category === "Столы и скамейки") {
        if (specifications.chair) cleanedSpecifications.chair = specifications.chair;
        if (specifications.leg) cleanedSpecifications.leg = specifications.leg;
        if (specifications.height) cleanedSpecifications.height = specifications.height;
      }
      
      const body = {
        slug: finalSlug,
        name,
        price,
        textPrice,
        category,
        image,
        specifications: cleanedSpecifications,
      };

      const data = await apiClient.post("/admin/landscape", body);
      if (data.success) {
        const newLandscapeId = data.landscape.id;
        
        // Если есть SEO поля, сохраняем их
        if (createSeoFields.seo_title || createSeoFields.seo_description || createSeoFields.seo_keywords || createSeoFields.og_image) {
          await saveSeoFields(newLandscapeId, createSeoFields);
        }
        
        setSuccess("✓ Товар добавлен");
        setName("");
        setSlug("");
        setPrice("");
        setTextPrice("");
        setCategory("");
        setImage("");
        setSpecifications({
          color: "",
          chair: "",
          leg: "",
          height: ""
        });
        setCreateSeoFields({
          seo_title: '',
          seo_description: '',
          seo_keywords: '',
          og_image: ''
        });
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

  const handleSaveSeo = async (data: SeoFieldsData) => {
    if (!editingId) return;
    try {
      await saveSeoFields(editingId, data);
      setSuccess('✓ SEO успешно сохранено');
      await fetchLandscape();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError('Ошибка при сохранении SEO');
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!window.confirm("Вы уверены, что хотите сохранить изменения?")) return;
    
    try {
      const data = await apiClient.put(`/admin/landscape/${id}`, editData);
      if (data.success) {
        setSuccess("✓ Товар обновлен");
        setEditingId(null);
        setEditData({});
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
    <div className="space-y-8">
      <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Добавить товар (Landscape)</h2>
        {error && <div className="text-red-600 mb-4 p-2 bg-red-50">{error}</div>}
        {success && <div className="text-green-600 mb-4 p-2 bg-green-50">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded">
          <input
            type="text"
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Slug (автогенерируется из названия)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 border rounded text-gray-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Цена (число)"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (e.target.value) setTextPrice("");
              }}
              step="0.01"
              disabled={!!textPrice}
              className="px-4 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              placeholder="Цена (текст, напр. 'от 75 руб.')"
              value={textPrice}
              onChange={(e) => {
                setTextPrice(e.target.value);
                if (e.target.value) setPrice("");
              }}
              disabled={!!price}
              className="px-4 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
                value={image}
                onChange={(e) => setImage(e.target.value)}
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
            {image && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Превью:</p>
                <img src={image} alt="Preview" className="h-24 w-24 object-cover rounded" />
              </div>
            )}
          </div>
          
          {/* Характеристики в зависимости от категории */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
            
            {/* Щебень: только Цвет */}
            {category === "Щебень" && (
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
            {category === "Столы и скамейки" && (
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
          </div>

          {/* SEO Поля */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">SEO (опционально)</h3>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">SEO Заголовок</label>
                  <input
                    type="text"
                    placeholder="Заголовок для SEO"
                    value={createSeoFields.seo_title}
                    onChange={(e) => setCreateSeoFields({...createSeoFields, seo_title: e.target.value})}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SEO Описание</label>
                  <input
                    type="text"
                    placeholder="Описание для SEO"
                    value={createSeoFields.seo_description}
                    onChange={(e) => setCreateSeoFields({...createSeoFields, seo_description: e.target.value})}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SEO Ключевые слова</label>
                  <input
                    type="text"
                    placeholder="Ключевые слова для SEO"
                    value={createSeoFields.seo_keywords}
                    onChange={(e) => setCreateSeoFields({...createSeoFields, seo_keywords: e.target.value})}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">OG Изображение (URL)</label>
                  <input
                    type="text"
                    placeholder="URL изображения для социальных сетей"
                    value={createSeoFields.og_image}
                    onChange={(e) => setCreateSeoFields({...createSeoFields, og_image: e.target.value})}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
          
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
        <h2 className="text-2xl font-bold mb-4">Список товаров ({landscape.length})</h2>
        <div className="grid gap-4">
          {landscape.map((item) => (
            <div key={item.id} className="border p-4 rounded bg-white">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name || item.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={editData.category || item.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {/* SEO Fields */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3 text-gray-800">SEO Данные</h4>
                    <SeoFieldsForm
                      entityType="landscape"
                      categoryName="Благоустройство"
                      initialData={{
                        seo_title: item.seo_title || "",
                        seo_description: item.seo_description || "",
                        seo_keywords: item.seo_keywords || "",
                        og_image: item.og_image || "",
                      }}
                      onSave={handleSaveSeo}
                      isLoading={seoLoading}
                      error={seoError || undefined}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
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
                      onClick={() => {
                        setEditingId(item.id);
                        setEditData(item);
                      }}
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
  );
}
