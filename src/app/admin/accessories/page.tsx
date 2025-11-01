"use client";

import { useState, useEffect } from "react";
import { generateSlug } from "@/lib/slug-generator";
import { apiClient } from "@/lib/api-client";

interface Accessory {
  id: number;
  slug?: string;
  name: string;
  price?: string | number;
  textPrice?: string;
  category: string;
  image: string;
  specifications?: any;
  createdAt: string;
}

const ACCESSORY_CATEGORIES = ["Вазы", "Лампады", "Скульптуры", "Рамки", "Изделия из бронзы", "Надгробные плиты", "Гранитные таблички"];

// Специальные описания для рамок
const FRAME_DESCRIPTIONS = {
  "metal": "Материал, страна производитель: металл с полимерным покрытием, Беларусь\nРазмеры: 13x18 см, 18x24 см, 20x30 см и другие\nЦвет: чёрный\nСпособ крепления: на поверхность гранита с помощью штырей и клея-герметика\n\nВажно: розничная продажа не осуществляется. Образцы представлены для ознакомления перед заказом памятника с медальоном.",
  "bronze": "Материал, производство, производитель: Бронза, Италия, Caggiati\n\nМонтаж: с помощью штырей на задней стороне\n\nВажно: розничная продажа не осуществляется. Образцы представлены для ознакомления перед заказом памятника."
};

export default function AccessoriesAdminPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [textPrice, setTextPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Для характеристик
  const [specifications, setSpecifications] = useState({
    color: '',
    height: '',
    dimensions: ''
  });
  
  // Для рамок
  const [frameType, setFrameType] = useState('metal');
  const [description, setDescription] = useState("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Accessory>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchAccessories = async () => {
    try {
      const data = await apiClient.get("/admin/accessories?limit=200");
      if (data.success) {
        setAccessories(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching accessories:", err);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=accessories");
      if (data.success) {
        setAvailableImages(data.data || []);
      } else {
        // Fallback к предустановленному списку
        const predefinedImages = [
          "/accessories/vases.webp",
          "/accessories/lamps.webp", 
          "/accessories/sculptures.webp",
          "/accessories/frames.webp",
          "/accessories/bronze.webp",
          "/accessories/plates.webp",
          "/accessories/tables.webp"
        ];
        setAvailableImages(predefinedImages);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      // Fallback к предустановленному списку при ошибке
      const predefinedImages = [
        "/accessories/vases.webp",
        "/accessories/lamps.webp", 
        "/accessories/sculptures.webp",
        "/accessories/frames.webp",
        "/accessories/bronze.webp",
        "/accessories/plates.webp",
        "/accessories/tables.webp"
      ];
      setAvailableImages(predefinedImages);
    }
  };

  useEffect(() => {
    fetchAccessories();
    fetchAvailableImages();
  }, []);

  // Автогенерация slug при изменении названия
  useEffect(() => {
    if (name && !editingId) {
      setSlug(generateSlug(name));
    }
  }, [name, editingId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "accessories");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm("Вы уверены, что хотите добавить этот аксессуар?")) return;
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const finalSlug = slug || generateSlug(name);
      
      // Очищаем пустые спецификации
      const cleanedSpecs = Object.fromEntries(
        Object.entries(specifications).filter(([, value]) => value?.trim())
      );
      
      // Определяем описание для рамок или изделий из бронзы
      let finalDescription = "";
      if (category === "Рамки") {
        finalDescription = FRAME_DESCRIPTIONS[frameType as keyof typeof FRAME_DESCRIPTIONS];
      } else if (category === "Изделия из бронзы") {
        finalDescription = "Скульптура из полимербетона - отличный способ дополнить надгробие, придать ему индивидуальность. Они подходят для памятников, изготовленных из любого вида гранита.\n\nПри выборе скульптуры из полимербетона необходимо ориентироваться на размеры памятника, способ художественного оформления и вид гранита.\n\nБронзовые скульптуры хорошо сочетаются памятники, оформленными буквами из бронзы или позолоченным текстом. Скульптуры цвета белого мрамора хорошо дополняют белый гравированный текст. Модели цвета серебра и бронзы хорошо подходят под любой способ оформления.";
      } else {
        finalDescription = description;
      }
      
      const body = {
        slug: finalSlug,
        name,
        price,
        textPrice,
        category,
        image,
        specifications: cleanedSpecs,
        description: finalDescription,
      };

      const data = await apiClient.post("/admin/accessories", body);
      if (data.success) {
        setSuccess("✓ Аксессуар добавлен");
        setName("");
        setSlug("");
        setPrice("");
        setTextPrice("");
        setCategory("");
        setImage("");
        setSpecifications({
          color: "",
          height: "",
          dimensions: ""
        });
        setDescription("");
        setFrameType("metal");
        await fetchAccessories();
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
    if (!window.confirm("Вы уверены, что хотите удалить этот аксессуар? Действие необратимо!")) return;

    try {
      const data = await apiClient.delete(`/admin/accessories/${id}`);
      if (data.success) {
        setSuccess("✓ Аксессуар удален");
        setError(""); // Очищаем ошибку
        await fetchAccessories();
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
      const data = await apiClient.put(`/admin/accessories/${id}`, editData);
      if (data.success) {
        setSuccess("✓ Аксессуар обновлен");
        setEditingId(null);
        setEditData({});
        await fetchAccessories();
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
        <h2 className="text-2xl font-bold mb-4">Добавить аксессуар</h2>
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
                if (e.target.value) setTextPrice(""); // Очищаем текстовую цену при заполнении числовой
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
                if (e.target.value) setPrice(""); // Очищаем числовую цену при заполнении текстовой
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
            {ACCESSORY_CATEGORIES.map((cat) => (
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
          
          {/* Характеристики и описание в зависимости от категории */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Характеристики и описание</h3>
            
            {/* Вазы: Цвет и Высота */}
            {category === "Вазы" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Цвет (напр. Чёрный)"
                  value={specifications.color}
                  onChange={(e) => setSpecifications({ ...specifications, color: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Высота (напр. 30 см)"
                  value={specifications.height}
                  onChange={(e) => setSpecifications({ ...specifications, height: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Лампады: Цвет и Габариты */}
            {category === "Лампады" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Цвет (напр. Чёрный)"
                  value={specifications.color}
                  onChange={(e) => setSpecifications({ ...specifications, color: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Габариты (напр. 24x15x15 см)"
                  value={specifications.dimensions}
                  onChange={(e) => setSpecifications({ ...specifications, dimensions: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Скульптуры: Цвет и Габариты */}
            {category === "Скульптуры" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Цвет (напр. Бронза)"
                  value={specifications.color}
                  onChange={(e) => setSpecifications({ ...specifications, color: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Габариты (напр. 18x16x48 см)"
                  value={specifications.dimensions}
                  onChange={(e) => setSpecifications({ ...specifications, dimensions: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Рамки: Выбор типа описания */}
            {category === "Рамки" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium mb-2">Тип рамки</label>
                <select
                  value={frameType}
                  onChange={(e) => setFrameType(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="metal">Металлическая рамка</option>
                  <option value="bronze">Бронзовая рамка</option>
                </select>
              </div>
            )}
            
            {/* Надгробные плиты: Надгробная плита */}
            {category === "Надгробные плиты" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Надгробная плита (напр. 98x46x3 см)"
                  value={specifications.dimensions}
                  onChange={(e) => setSpecifications({ ...specifications, dimensions: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Гранитные таблички: Табличка */}
            {category === "Гранитные таблички" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Табличка (напр. 50x30x3 см)"
                  value={specifications.dimensions}
                  onChange={(e) => setSpecifications({ ...specifications, dimensions: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            )}
            
            {/* Изделия из бронзы: Описание уже предустановлено */}
            {category === "Изделия из бронзы" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Описание будет автоматически добавлено для изделий из бронзы</p>
              </div>
            )}
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
        <h2 className="text-2xl font-bold mb-4">Список аксессуаров ({accessories.length})</h2>
        <div className="grid gap-4">
          {accessories.map((item) => (
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
                  {item.textPrice && <div className="text-sm">Цена: {item.textPrice}</div>}
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
