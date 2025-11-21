"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/slug-generator";
import { apiClient } from "@/lib/api-client";
import { SeoFieldsForm, SeoFieldsData } from "@/app/components/admin/SeoFieldsForm";
import { useSeoSave } from "@/lib/hooks/use-seo-save";
import { BulkSeoUpdateButton } from "@/app/components/admin/BulkSeoUpdateButton";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

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
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
}

const ACCESSORY_CATEGORIES = ["Вазы", "Лампады", "Скульптуры", "Рамки", "Изделия из бронзы", "Надгробные плиты", "Гранитные таблички"];

// Специальные описания для рамок
const FRAME_DESCRIPTIONS = {
  "metal": "Материал, страна производитель: металл с полимерным покрытием, Беларусь\nРазмеры: 13x18 см, 18x24 см, 20x30 см и другие\nЦвет: чёрный\nСпособ крепления: на поверхность гранита с помощью штырей и клея-герметика\n\nВажно: розничная продажа не осуществляется. Образцы представлены для ознакомления перед заказом памятника с медальоном.",
  "bronze": "Материал, производство, производитель: Бронза, Италия, Caggiati\n\nМонтаж: с помощью штырей на задней стороне\n\nВажно: розничная продажа не осуществляется. Образцы представлены для ознакомления перед заказом памятника."
};

// Маппинг категорий на categoryKey для SEO шаблонов
const CATEGORY_TO_KEY_MAP: {[key: string]: string} = {
  "Вазы": "vases",
  "Лампады": "lamps",
  "Скульптуры": "sculptures",
  "Рамки": "frames",
  "Изделия из бронзы": "bronze-items",
  "Надгробные плиты": "tombstones",
  "Гранитные таблички": "granite-tablets"
};

export default function AccessoriesAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [textPrice, setTextPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingAccessory, setAddingAccessory] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  
  // SEO хук
  const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('accessories');
  
  // Объединённая форма для create и edit
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    price: "",
    textPrice: "",
    category: "",
    image: "",
    description: "",
    specifications: {} as {[key: string]: string},
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image: "",
  });
  
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
        // Fallback к предустановленному списку с правильными путями
        const predefinedImages = [
          "https://k-r.by/api/static/accessories/vases.webp",
          "https://k-r.by/api/static/accessories/lamps.webp", 
          "https://k-r.by/api/static/accessories/sculptures.webp",
          "https://k-r.by/api/static/accessories/frames.webp",
          "https://k-r.by/api/static/accessories/bronze.webp",
          "https://k-r.by/api/static/accessories/plates.webp",
          "https://k-r.by/api/static/accessories/tables.webp"
        ];
        setAvailableImages(predefinedImages);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      // Fallback к предустановленному списку при ошибке с правильными путями
      const predefinedImages = [
        "https://k-r.by/api/static/accessories/vases.webp",
        "https://k-r.by/api/static/accessories/lamps.webp", 
        "https://k-r.by/api/static/accessories/sculptures.webp",
        "https://k-r.by/api/static/accessories/frames.webp",
        "https://k-r.by/api/static/accessories/bronze.webp",
        "https://k-r.by/api/static/accessories/plates.webp",
        "https://k-r.by/api/static/accessories/tables.webp"
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
    if (editForm.name && !editingAccessory) {
      setEditForm(prev => ({
        ...prev,
        slug: generateSlug(editForm.name)
      }));
    }
  }, [editForm.name, editingAccessory]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "accessories");

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api') + "/upload", {
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
      const finalSlug = editForm.slug || generateSlug(editForm.name);
      
      // Очищаем пустые спецификации
      const cleanedSpecs = Object.fromEntries(
        Object.entries(editForm.specifications).filter(([, value]) => value?.trim())
      );
      
      // Определяем описание для рамок или изделий из бронзы
      let finalDescription = "";
      if (editForm.category === "Рамки") {
        finalDescription = FRAME_DESCRIPTIONS[frameType as keyof typeof FRAME_DESCRIPTIONS];
      } else if (editForm.category === "Изделия из бронзы") {
        finalDescription = "Скульптура из полимербетона - отличный способ дополнить надгробие, придать ему индивидуальность. Они подходят для памятников, изготовленных из любого вида гранита.\n\nПри выборе скульптуры из полимербетона необходимо ориентироваться на размеры памятника, способ художественного оформления и вид гранита.\n\nБронзовые скульптуры хорошо сочетаются памятники, оформленными буквами из бронзы или позолоченным текстом. Скульптуры цвета белого мрамора хорошо дополняют белый гравированный текст. Модели цвета серебра и бронзы хорошо подходят под любой способ оформления.";
      } else {
        finalDescription = editForm.description;
      }
      
      // Загружаем SEO шаблон если все поля пусты
      let seoTitle = editForm.seo_title;
      let seoDescription = editForm.seo_description;
      let seoKeywords = editForm.seo_keywords;
      let ogImage = editForm.og_image;

      console.log('[ACCESSORIES] Initial SEO:', { seoTitle, seoDescription, seoKeywords, ogImage });

      const hasUserProvidedSeo = seoTitle || seoDescription || seoKeywords || ogImage;
      console.log('[ACCESSORIES] hasUserProvidedSeo:', hasUserProvidedSeo);
      
      if (!hasUserProvidedSeo) {
        // Только загружаем шаблон если все поля пусты
        try {
          const { fetchSeoTemplate } = await import('@/lib/hooks/use-seo-hierarchy');
          const categoryKey = CATEGORY_TO_KEY_MAP[editForm.category] || editForm.category;
          console.log('Fetching SEO template for accessories category:', editForm.category, 'key:', categoryKey);
          const template = await fetchSeoTemplate("accessories", categoryKey);
          console.log('Template received:', template);
          
          if (template) {
            seoTitle = template.seoTitle || editForm.name;
            seoDescription = template.seoDescription || `Аксессуар ${editForm.name}`;
            seoKeywords = template.seoKeywords || editForm.name;
            ogImage = template.ogImage || "";
            console.log('Applied template SEO:', { seoTitle, seoDescription, seoKeywords, ogImage });
          } else {
            // Если шаблона нет - используем данные как fallback
            seoTitle = editForm.name;
            seoDescription = `Аксессуар ${editForm.name}`;
            seoKeywords = editForm.name;
            console.log('No template found, using fallback:', { seoTitle, seoDescription, seoKeywords });
          }
        } catch (err) {
          console.warn('Failed to load SEO template, using defaults:', err);
          // Используем данные как fallback
          seoTitle = editForm.name;
          seoDescription = `Аксессуар ${editForm.name}`;
          seoKeywords = editForm.name;
          console.log('Template load error, using fallback:', { seoTitle, seoDescription, seoKeywords });
        }
      } else {
        // Юзер вписал что-то - используем его значения, заполняя пропуски fallback'ом
        console.log('User provided SEO, using user values:', { seoTitle, seoDescription, seoKeywords, ogImage });
        seoTitle = seoTitle || editForm.name;
        seoDescription = seoDescription || `Аксессуар ${editForm.name}`;
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
        specifications: cleanedSpecs,
        description: finalDescription,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
      };

      const data = await apiClient.post("/admin/accessories", body);
      if (data.success) {
        setSuccess("✓ Аксессуар добавлен");
        setEditForm({
          name: "",
          slug: "",
          price: "",
          textPrice: "",
          category: "",
          image: "",
          description: "",
          specifications: {},
          seo_title: "",
          seo_description: "",
          seo_keywords: "",
          og_image: "",
        });
        setAddingAccessory(false);
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

  const startEditing = (accessory: Accessory) => {
    console.log('Starting edit for accessory:', JSON.stringify(accessory, null, 2));
    
    // Конвертируем API ответ (может быть camelCase или snake_case)
    const seoTitle = accessory.seo_title || (accessory as any).seoTitle || "";
    const seoDescription = accessory.seo_description || (accessory as any).seoDescription || "";
    const seoKeywords = accessory.seo_keywords || (accessory as any).seoKeywords || "";
    const ogImage = accessory.og_image || (accessory as any).ogImage || "";
    
    console.log('SEO data extracted:', { seoTitle, seoDescription, seoKeywords, ogImage });
    
    setEditingAccessory(accessory);
    setEditForm({
      name: accessory.name || "",
      slug: accessory.slug || "",
      price: accessory.price?.toString() || "",
      textPrice: accessory.textPrice || "",
      category: accessory.category || "",
      image: accessory.image || "",
      description: (accessory as any).description || "",
      specifications: (accessory as any).specifications || {},
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      og_image: ogImage,
    });
  };

  const handleSaveSeo = async (data: SeoFieldsData) => {
    if (!editingAccessory) return;
    try {
      await saveSeoFields(editingAccessory.id, data);
      setSuccess('✓ SEO успешно сохранено');
      await fetchAccessories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError('Ошибка при сохранении SEO');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAccessory) return;
    if (!window.confirm("Вы уверены, что хотите сохранить изменения?")) return;
    
    try {
      const cleanedSpecs = Object.fromEntries(
        Object.entries(editForm.specifications).filter(([, value]) => value?.trim())
      );
      
      const body = {
        name: editForm.name,
        slug: editForm.slug,
        price: editForm.price ? parseFloat(editForm.price) : undefined,
        textPrice: editForm.textPrice,
        category: editForm.category,
        image: editForm.image,
        description: editForm.description,
        specifications: cleanedSpecs,
        seoTitle: editForm.seo_title,
        seoDescription: editForm.seo_description,
        seoKeywords: editForm.seo_keywords,
        ogImage: editForm.og_image,
      };
      
      const data = await apiClient.put(`/admin/accessories/${editingAccessory.id}`, body);
      if (data.success) {
        setSuccess("✓ Аксессуар обновлен");
        setEditingAccessory(null);
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
    <>
      {checkingAuth && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      )}
      
      {!checkingAuth && (
        <div className="space-y-8">
          <div className="text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Добавить аксессуар</h2>
          <BulkSeoUpdateButton
            entityType="accessories"
            categoryKey="accessories"
            categoryName="Аксессуары"
            onSuccess={async (stats) => {
              setSuccess(`✅ Обновлено ${stats.updated} аксессуаров`);
              await fetchAccessories();
              setTimeout(() => setSuccess(""), 3000);
            }}
          />
        </div>
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
                if (e.target.value) setEditForm(prev => ({...prev, textPrice: ""})); // Очищаем текстовую цену при заполнении числовой
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
                if (e.target.value) setEditForm(prev => ({...prev, price: ""})); // Очищаем числовую цену при заполнении текстовой
              }}
              disabled={!!editForm.price}
              className="px-4 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
          </div>
          <select
            value={editForm.category}
            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
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
          
          {/* Характеристики и описание в зависимости от категории */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Характеристики и описание</h3>
            
            {/* Вазы: Цвет и Высота */}
            {editForm.category === "Вазы" && (
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
            {editForm.category === "Лампады" && (
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
            {editForm.category === "Скульптуры" && (
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
            {editForm.category === "Рамки" && (
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
            {editForm.category === "Надгробные плиты" && (
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
            {editForm.category === "Гранитные таблички" && (
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
            {editForm.category === "Изделия из бронзы" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Описание будет автоматически добавлено для изделий из бронзы</p>
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
        <h2 className="text-2xl font-bold mb-4">Список аксессуаров ({accessories.length})</h2>
        <div className="grid gap-4">
          {accessories.map((item) => (
            <div key={item.id} className="border p-4 rounded bg-white">
              {editingAccessory?.id === item.id ? (
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
                        key={`${editingAccessory?.id}-${addingAccessory}`}
                        entityType="accessories"
                        categoryName="Аксессуары"
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
                      onClick={() => setEditingAccessory(null)}
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
