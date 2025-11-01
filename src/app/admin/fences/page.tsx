"use client";

import { useState, useEffect } from "react";
import { generateSlug } from "@/lib/slug-generator";
import { apiClient } from "@/lib/api-client";

interface Fence {
  id: number;
  slug?: string;
  name: string;
  price?: string | number;
  textPrice?: string;
  category: string;
  image: string;
  specifications?: {
    // Гранитные ограды - динамические поля
    size?: string;
    pillar?: string;
    frameBorder?: string;
    stainlessTube?: string;
    pillarBase?: string;
    plotType?: string;
    // Металлические ограды - динамические поля
    pillarSection?: string;
    patternSection?: string;
    frameSection?: string;
    // Металлические ограды с полимерным покрытием - динамические поля (но в данном случае все статичные)
    // Общие поля
    [key: string]: string | undefined;
  };
  createdAt: string;
}

const FENCE_CATEGORIES = ["Гранитные ограды", "С полимерным покрытием", "Металлические ограды"];

export default function FencesAdminPage() {
  const [fences, setFences] = useState<Fence[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [textPrice, setTextPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [specifications, setSpecifications] = useState({
    // Гранитные ограды - динамические
    size: "",
    pillar: "",
    frameBorder: "",
    stainlessTube: "",
    pillarBase: "",
    plotType: "",
    // Металлические ограды - динамические
    pillarSection: "",
    patternSection: "",
    frameSection: "",
  });
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Fence>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchFences = async () => {
    try {
      const data = await apiClient.get("/admin/fences?limit=200");
      if (data.success) {
        setFences(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching fences:", err);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=fences");
      if (data.success) {
        setAvailableImages(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
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
      formData.append("folder", "fences");

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api') + "/upload", {
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
      e.target.value = ""; // Очищаем input
    }
  };

  useEffect(() => {
    fetchFences();
    fetchAvailableImages();
  }, []);

  // Автогенерация slug при изменении названия
  useEffect(() => {
    if (name && !editingId) {
      setSlug(generateSlug(name));
    }
  }, [name, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm("Вы уверены, что хотите добавить эту ограду?")) return;
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const finalSlug = slug || generateSlug(name);
      
      // Очищаем пустые спецификации
      const cleanedSpecs = Object.fromEntries(
        Object.entries(specifications).filter(([, value]) => value?.trim())
      );
      
      const body = {
        slug: finalSlug,
        name,
        price,
        textPrice,
        category,
        image,
        specifications: cleanedSpecs,
      };

      const data = await apiClient.post("/admin/fences", body);
      if (data.success) {
        setSuccess("✓ Ограда добавлена");
        setName("");
        setSlug("");
        setPrice("");
        setTextPrice("");
        setCategory("");
        setImage("");
        setSpecifications({
          size: "",
          pillar: "",
          frameBorder: "",
          stainlessTube: "",
          pillarBase: "",
          plotType: "",
          pillarSection: "",
          patternSection: "",
          frameSection: "",
        });
        await fetchFences();
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
    if (!window.confirm("Вы уверены, что хотите удалить эту ограду? Действие необратимо!")) return;

    try {
      const data = await apiClient.delete(`/admin/fences/${id}`);
      if (data.success) {
        setSuccess("✓ Ограда удалена");
        setError(""); // Очищаем ошибку
        await fetchFences();
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

  const handleSaveEdit = async (id: number) => {
    if (!window.confirm("Вы уверены, что хотите сохранить изменения?")) return;
    
    try {
      const data = await apiClient.put(`/admin/fences/${id}`, editData);
      if (data.success) {
        setSuccess("✓ Ограда обновлена");
        setEditingId(null);
        setEditData({});
        await fetchFences();
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
        <h2 className="text-2xl font-bold mb-4">Добавить ограду</h2>
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
          <input
            type="number"
            placeholder="Цена (численное значение, напр. 1500.50)"
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (e.target.value) setTextPrice(""); // Очищаем текстовую цену при заполнении числовой
            }}
            disabled={!!textPrice}
            className="w-full px-4 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
          <input
            type="text"
            placeholder="Текст цены (опционально, напр. 'от 515 руб.')"
            value={textPrice}
            onChange={(e) => {
              setTextPrice(e.target.value);
              if (e.target.value) setPrice(""); // Очищаем числовую цену при заполнении текстовой
            }}
            disabled={!!price}
            className="w-full px-4 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">-- Выберите категорию --</option>
            {FENCE_CATEGORIES.map((cat) => (
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
          
          {/* Характеристики */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Динамические характеристики (зависят от категории)</h3>
            <div className="space-y-3">
              {/* Поля для гранитных оград */}
              {category === "Гранитные ограды" && (
                <>
                  <input
                    type="text"
                    placeholder="Размер участка (напр. 200x230 см)"
                    value={specifications.size}
                    onChange={(e) => setSpecifications({ ...specifications, size: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Столб (размеры, напр. 20x10x10 см (8 шт))"
                    value={specifications.pillar}
                    onChange={(e) => setSpecifications({ ...specifications, pillar: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Брус ограды (высота, толщина, напр. 10x8 см)"
                    value={specifications.frameBorder}
                    onChange={(e) => setSpecifications({ ...specifications, frameBorder: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Нерж. труба (напр. 30x1 мм)"
                    value={specifications.stainlessTube}
                    onChange={(e) => setSpecifications({ ...specifications, stainlessTube: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Пятка под столб (напр. 14x14x3 см (8 шт))"
                    value={specifications.pillarBase}
                    onChange={(e) => setSpecifications({ ...specifications, pillarBase: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Тип участка (напр. Двойной)"
                    value={specifications.plotType}
                    onChange={(e) => setSpecifications({ ...specifications, plotType: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </>
              )}
              
              {/* Поля для металлических оград */}
              {category === "Металлические ограды" && (
                <>
                  <input
                    type="text"
                    placeholder="Столб, сечение (напр. 30x30 мм)"
                    value={specifications.pillarSection}
                    onChange={(e) => setSpecifications({ ...specifications, pillarSection: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Рисунок, сечение (напр. Катанка, 8 мм)"
                    value={specifications.patternSection}
                    onChange={(e) => setSpecifications({ ...specifications, patternSection: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Рамка, сечение (напр. 20x20 мм)"
                    value={specifications.frameSection}
                    onChange={(e) => setSpecifications({ ...specifications, frameSection: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </>
              )}
              
              {/* Для металлических оград с полимерным покрытием все характеристики статичные */}
              {category === "С полимерным покрытием" && (
                <div className="text-gray-600 italic">
                  Для металлических оград с полимерным покрытием все характеристики статичные и отображаются автоматически на фронтенде.
                </div>
              )}
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
        <h2 className="text-2xl font-bold mb-4">Список оград ({fences.length})</h2>
        <div className="grid gap-4">
          {fences.map((item) => (
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
                    type="number"
                    placeholder="Цена"
                    step="0.01"
                    value={editData.price || item.price || ""}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={editData.category || item.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="flex gap-2">
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
                  {item.textPrice && <div className="text-sm">Текст цены: {item.textPrice}</div>}
                  <div className="text-sm text-gray-500">ID: {item.id}</div>
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
