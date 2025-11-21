"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/slug-generator";
import { apiClient } from "@/lib/api-client";
import { SeoFieldsForm, SeoFieldsData } from "@/app/components/admin/SeoFieldsForm";
import { BulkSeoUpdateButton } from "@/app/components/admin/BulkSeoUpdateButton";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}
import { useSeoSave } from "@/lib/hooks/use-seo-save";

interface Fence {
  id: number;
  slug: string;
  name: string;
  price?: number;
  oldPrice?: number;
  discount?: number;
  textPrice?: string;
  category: string;
  image: string;
  popular?: boolean;
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
    // Общие поля
    [key: string]: string | undefined;
  };
  description?: string;
  createdAt: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
}

interface FenceCategory {
  key: string;
  title: string;
  description: string;
  apiEndpoint: string;
}

export default function FencesAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [fences, setFences] = useState<Fence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingFence, setEditingFence] = useState<Fence | null>(null);
  const [addingFence, setAddingFence] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  
  // SEO хук для сохранения SEO данных
  const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('fences');
  
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    discount: "",
    textPrice: "",
    category: "",
    image: "",
    description: "",
    popular: false,
    specifications: {} as {[key: string]: string},
    customSpecs: [] as Array<{key: string; value: string}>,
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image: "",
  });

  // Категории оград
  const fenceCategories: FenceCategory[] = [
    { 
      key: "granite", 
      title: "Гранитные ограды", 
      description: "Ограды из натурального гранита",
      apiEndpoint: "/fences"
    },
    { 
      key: "metal", 
      title: "Металлические ограды", 
      description: "Металлические ограды без покрытия",
      apiEndpoint: "/fences"
    },
    { 
      key: "polymer", 
      title: "С полимерным покрытием", 
      description: "Металлические ограды с полимерным покрытием",
      apiEndpoint: "/fences"
    },
  ];

  // Загрузка доступных изображений
  const loadAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=fences");
      if (data.success) {
        setAvailableImages(data.data || []);
      } else {
        // Fallback к предустановленному списку
        const fallbackImages = [
          'https://k-r.by/api/static/fences/fence-1.webp',
          'https://k-r.by/api/static/fences/fence-2.webp',
          'https://k-r.by/api/static/fences/fence-3.webp'
        ];
        setAvailableImages(fallbackImages);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setAvailableImages([]);
    }
  };

  const fetchFences = async (category: string) => {
    if (!category) return;
    
    try {
      setLoading(true);
      const categoryConfig = fenceCategories.find(c => c.key === category);
      if (!categoryConfig) return;
      
      // Используем параметры для фильтрации по категории
      const categoryNames: {[key: string]: string} = {
        granite: "Гранитные ограды",
        metal: "Металлические ограды", 
        polymer: "С полимерным покрытием"
      };
      
      const categoryName = categoryNames[category];
      const endpoint = `${categoryConfig.apiEndpoint}?category=${encodeURIComponent(categoryName)}`;
      
      console.log('Fetching fences for category:', category, 'endpoint:', endpoint);
      const data = await apiClient.get(endpoint);
      console.log('API response:', data);
      
      if (data.success) {
        // Публичный API возвращает в поле data, admin API в поле products
        const fencesList = data.data || data.products || [];
        setFences(fencesList);
        setError("");
      } else {
        setError(data.error || "Ошибка при загрузке оград");
        setFences([]);
      }
    } catch (error) {
      console.error('Error fetching fences:', error);
      setError("Ошибка при загрузке оград");
      setFences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFences([]);
    setError("");
    setSuccess("");
    setEditingFence(null);
    if (category) {
      fetchFences(category);
    }
  };

  const startEditing = (fence: Fence) => {
    console.log('Starting edit for fence:', fence);
    console.log('Fence data from API:', JSON.stringify(fence, null, 2));
    console.log('Fence SEO fields - seo_title:', fence.seo_title, 'seo_description:', fence.seo_description, 'seo_keywords:', fence.seo_keywords, 'og_image:', fence.og_image);
    console.log('Fence SEO fields camelCase - seoTitle:', (fence as any).seoTitle, 'seoDescription:', (fence as any).seoDescription, 'seoKeywords:', (fence as any).seoKeywords, 'ogImage:', (fence as any).ogImage);
    
    setEditingFence(fence);
    
    // Берем реальные динамические характеристики и отделяем от кастомных
    let dynamicSpecs: {[key: string]: string} = {};
    let customSpecs: Array<{key: string; value: string}> = [];
    
    if (fence.specifications) {
      Object.entries(fence.specifications).forEach(([key, value]) => {
        if (value?.trim()) {
          // Стандартные динамические поля для каждой категории
          if (selectedCategory === "granite" && (key === "Размер бордюра" || key === "Размер столбиков")) {
            dynamicSpecs[key] = value;
          } else if (selectedCategory === "metal" && key === "Профиль/прут") {
            dynamicSpecs[key] = value;
          } else {
            // Все остальное идет в кастомные
            customSpecs.push({ key, value });
          }
        }
      });
    }

    const filledForm = {
      name: fence.name,
      price: fence.price?.toString() || "",
      oldPrice: fence.oldPrice?.toString() || "",
      discount: fence.discount?.toString() || "",
      textPrice: fence.textPrice === null ? "Цена по запросу" : (fence.textPrice || ""),
      category: fence.category,
      image: fence.image,
      description: fence.description || "",
      popular: fence.popular || false,
      specifications: dynamicSpecs,
      customSpecs: customSpecs,
      // SEO поля - могут быть в snake_case или camelCase в зависимости от API
      seo_title: fence.seo_title || (fence as any).seoTitle || "",
      seo_description: fence.seo_description || (fence as any).seoDescription || "",
      seo_keywords: fence.seo_keywords || (fence as any).seoKeywords || "",
      og_image: fence.og_image || (fence as any).ogImage || "",
    };
    
    console.log('Filled form SEO:', filledForm.seo_title, filledForm.seo_description, filledForm.seo_keywords, filledForm.og_image);
    setEditForm(filledForm);
  };

  const cancelEditing = () => {
    setEditingFence(null);
    setAddingFence(false);
    setEditForm({
      name: "",
      price: "",
      oldPrice: "",
      discount: "",
      textPrice: "",
      category: "",
      image: "",
      description: "",
      popular: false,
      specifications: {},
      customSpecs: [],
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      og_image: "",
    });
  };

  const startAdding = () => {
    setAddingFence(true);
    setEditingFence(null);
    
    // Получаем правильное имя категории для API
    const categoryNames: {[key: string]: string} = {
      granite: "Гранитные ограды",
      metal: "Металлические ограды", 
      polymer: "С полимерным покрытием"
    };
    
    setEditForm({
      name: "",
      price: "",
      oldPrice: "",
      discount: "",
      textPrice: "",
      category: categoryNames[selectedCategory] || selectedCategory,
      image: "",
      description: "",
      popular: false,
      specifications: {},
      customSpecs: [],
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      og_image: "",
    });
  };

  // Функции для автоматического расчета цен и скидок
  const handlePriceChange = (price: string) => {
    const newPrice = parseFloat(price) || 0;
    const oldPrice = parseFloat(editForm.oldPrice) || 0;
    
    setEditForm(prev => {
      const updatedForm = { ...prev, price, textPrice: "" }; // Очищаем текстовую цену
      
      // Если есть старая цена, рассчитываем скидку
      if (oldPrice > 0 && newPrice > 0 && oldPrice > newPrice) {
        updatedForm.discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100).toString();
      } else if (oldPrice > 0 && newPrice >= oldPrice) {
        updatedForm.discount = "0";
      }
      
      return updatedForm;
    });
  };

  const handleOldPriceChange = (oldPrice: string) => {
    const newOldPrice = parseFloat(oldPrice) || 0;
    const currentPrice = parseFloat(editForm.price) || 0;
    
    setEditForm(prev => {
      const updatedForm = { ...prev, oldPrice, textPrice: "" }; // Очищаем текстовую цену
      
      // Если есть текущая цена, рассчитываем скидку
      if (currentPrice > 0 && newOldPrice > 0 && newOldPrice > currentPrice) {
        updatedForm.discount = Math.round(((newOldPrice - currentPrice) / newOldPrice) * 100).toString();
      } else if (currentPrice > 0 && newOldPrice <= currentPrice) {
        updatedForm.discount = "0";
      }
      
      return updatedForm;
    });
  };

  const handleDiscountChange = (discount: string) => {
    const newDiscount = parseFloat(discount) || 0;
    const currentPrice = parseFloat(editForm.price) || 0;
    const oldPrice = parseFloat(editForm.oldPrice) || 0;
    
    setEditForm(prev => {
      const updatedForm = { ...prev, discount, textPrice: "" }; // Очищаем текстовую цену
      
      // Если есть текущая цена и скидка, переносим текущую цену в старую (если старой нет), и пересчитываем новую цену
      if (currentPrice > 0 && newDiscount > 0 && newDiscount < 100) {
        // Если старой цены нет, текущая цена становится старой
        if (oldPrice === 0) {
          updatedForm.oldPrice = currentPrice.toString();
        }
        // Пересчитываем текущую цену с учетом скидки от старой цены
        const priceBase = oldPrice > 0 ? oldPrice : currentPrice;
        const calculatedPrice = Math.round(priceBase * (100 - newDiscount) / 100);
        updatedForm.price = calculatedPrice.toString();
      } else if (newDiscount <= 0) {
        // Если скидка 0 или очистили, возвращаем старую цену в текущую
        if (oldPrice > 0) {
          updatedForm.price = oldPrice.toString();
          updatedForm.oldPrice = "";
        }
      }
      
      return updatedForm;
    });
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api'}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setEditForm({ ...editForm, image: data.data.path });
        setSuccess("✓ Изображение успешно загружено");
        await loadAvailableImages(); // Обновляем список доступных изображений
        setTimeout(() => setSuccess(""), 3000);
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
    // Автоматически выбираем первую категорию при загрузке
    if (fenceCategories.length > 0 && !selectedCategory) {
      handleCategoryChange(fenceCategories[0].key);
    }
    // Загружаем доступные изображения
    loadAvailableImages();
  }, []);

  const saveFence = async () => {
    if (!selectedCategory) return;

    try {
      setLoading(true);
      // Собираем все спецификации (динамические + кастомные)
      let specificationsJson = "";
      const allSpecs: {[key: string]: string} = {};
      
      // Добавляем динамические характеристики
      Object.entries(editForm.specifications).forEach(([key, value]) => {
        if (value?.trim()) {
          allSpecs[key] = value;
        }
      });
      
      // Добавляем кастомные характеристики
      editForm.customSpecs.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          allSpecs[spec.key] = spec.value;
        }
      });
      
      if (Object.keys(allSpecs).length > 0) {
        specificationsJson = JSON.stringify(allSpecs);
      }

      const categoryConfig = fenceCategories.find(c => c.key === selectedCategory);
      if (!categoryConfig) return;

      // Загружаем шаблонное SEO для категории, если не заполнены SEO поля
      let seoTitle = editForm.seo_title;
      let seoDescription = editForm.seo_description;
      let seoKeywords = editForm.seo_keywords;
      let ogImage = editForm.og_image;

      console.log('[FENCES] Initial SEO from editForm:', { seoTitle, seoDescription, seoKeywords, ogImage });
      console.log('[FENCES] editForm values:', editForm.seo_title, editForm.seo_description, editForm.seo_keywords, editForm.og_image);

      // Если юзер вписал хоть что-то в SEO - используем его значения
      // Загружаем шаблон ТОЛЬКО если все SEO поля пусты
      const hasUserProvidedSeo = seoTitle || seoDescription || seoKeywords || ogImage;
      console.log('[FENCES] hasUserProvidedSeo:', hasUserProvidedSeo);
      
      if (!hasUserProvidedSeo) {
        // Только загружаем шаблон если все поля пусты
        try {
          const { fetchSeoTemplate } = await import('@/lib/hooks/use-seo-hierarchy');
          console.log('Fetching SEO template for fences category:', selectedCategory);
          const template = await fetchSeoTemplate("fences", selectedCategory);
          console.log('Template received:', template);
          
          if (template) {
            seoTitle = template.seoTitle || editForm.name;
            seoDescription = template.seoDescription || `Ограда ${editForm.name}`;
            seoKeywords = template.seoKeywords || editForm.name;
            ogImage = template.ogImage || "";
            console.log('Applied template SEO:', { seoTitle, seoDescription, seoKeywords, ogImage });
          } else {
            // Если шаблона нет - используем данные ограды как fallback
            seoTitle = editForm.name;
            seoDescription = `Ограда ${editForm.name}`;
            seoKeywords = editForm.name;
            console.log('No template found, using fallback:', { seoTitle, seoDescription, seoKeywords });
          }
        } catch (err) {
          console.warn('Failed to load SEO template, using defaults:', err);
          // Используем данные ограды как fallback
          seoTitle = editForm.name;
          seoDescription = `Ограда ${editForm.name}`;
          seoKeywords = editForm.name;
          console.log('Template load error, using fallback:', { seoTitle, seoDescription, seoKeywords });
        }
      } else {
        // Юзер вписал что-то - используем его значения, заполняя пропуски fallback'ом
        console.log('User provided SEO, using user values:', { seoTitle, seoDescription, seoKeywords, ogImage });
        seoTitle = seoTitle || editForm.name;
        seoDescription = seoDescription || `Ограда ${editForm.name}`;
        seoKeywords = seoKeywords || editForm.name;
        ogImage = ogImage || "";
      }

      if (editingFence) {
        // Обновление существующей ограды
        const currentPrice = editForm.price ? parseFloat(editForm.price) : null;
        const oldPrice = editForm.oldPrice ? parseFloat(editForm.oldPrice) : null;
        const discount = editForm.discount ? parseFloat(editForm.discount) : null;

        // Получаем правильное имя категории для API
        const categoryNames: {[key: string]: string} = {
          granite: "Гранитные ограды",
          metal: "Металлические ограды", 
          polymer: "С полимерным покрытием"
        };
        
        console.log('Updating fence:', editingFence.id, 'endpoint:', `/admin/fences/${editingFence.id}`);
        
        const data = await apiClient.put(`/admin/fences/${editingFence.id}`, {
          name: editForm.name,
          price: currentPrice,
          oldPrice: oldPrice,
          discount: discount,
          textPrice: editForm.textPrice === "Цена по запросу" ? null : (editForm.textPrice || null),
          category: categoryNames[selectedCategory] || editForm.category,
          image: editForm.image || "",
          popular: editForm.popular,
          specifications: specificationsJson,
          description: editForm.description || "",
          seoTitle: seoTitle,
          seoDescription: seoDescription,
          seoKeywords: seoKeywords,
          ogImage: ogImage,
        });
        console.log('Update response:', data);
        if (data.success) {
          setSuccess("✓ Ограда успешно обновлена");
          await fetchFences(selectedCategory);
          cancelEditing();
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Ошибка при обновлении ограды");
        }
      } else {
        // Добавление новой ограды
        const currentPrice = editForm.price ? parseFloat(editForm.price) : null;
        const oldPrice = editForm.oldPrice ? parseFloat(editForm.oldPrice) : null;
        const discount = editForm.discount ? parseFloat(editForm.discount) : null;

        // Получаем правильное имя категории для API
        const categoryNames: {[key: string]: string} = {
          granite: "Гранитные ограды",
          metal: "Металлические ограды", 
          polymer: "С полимерным покрытием"
        };
        
        console.log('Adding fence, endpoint:', '/admin/fences');
        const postData = {
          name: editForm.name,
          slug: generateSlug(editForm.name),
          price: currentPrice,
          oldPrice: oldPrice,
          discount: discount,
          textPrice: editForm.textPrice === "Цена по запросу" ? null : (editForm.textPrice || null),
          category: categoryNames[selectedCategory] || editForm.category,
          image: editForm.image || "",
          popular: editForm.popular,
          specifications: specificationsJson,
          description: editForm.description || "",
          seoTitle: seoTitle,
          seoDescription: seoDescription,
          seoKeywords: seoKeywords,
          ogImage: ogImage,
        };
        console.log('POST data being sent:', postData);
        const data = await apiClient.post('/admin/fences', postData);
        console.log('Add response:', data);
        
        if (data.success) {
          setSuccess("✓ Ограда успешно добавлена");
          
          // Оставляем форму открытой для редактирования SEO
          if (data.data) {
            // Обновляем editingFence чтобы был ID для сохранения SEO
            setEditingFence(data.data);
            
            // Обновляем editForm с полными данными ограды
            setEditForm(prev => ({
              ...prev,
              seo_title: data.data?.seoTitle || "",
              seo_description: data.data?.seoDescription || "",
              seo_keywords: data.data?.seoKeywords || "",
              og_image: data.data?.ogImage || "",
            }));
            
            // Сразу добавляем созданную ограду в локальный список
            setFences(prev => [...prev, data.data]);
            
            // Скрываем форму добавления
            setAddingFence(false);
          }
          
          // Также делаем перезагрузку для синхронизации
          setTimeout(async () => {
            console.log('Reloading fences for category:', selectedCategory);
            await fetchFences(selectedCategory);
            // После перезагрузки закрываем форму редактирования
            cancelEditing();
          }, 1000);
          
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Ошибка при добавлении ограды");
        }
      }
    } catch (error) {
      setError("Ошибка при сохранении ограды");
    } finally {
      setLoading(false);
    }
  };

  // Функция для сохранения SEO данных
  const handleSaveSeo = async (data: SeoFieldsData) => {
    if (!editingFence) return;
    
    try {
      await saveSeoFields(editingFence.id, data);
      setSuccess('✓ SEO успешно сохранено');
      // Обновляем форму с новыми данными
      setEditForm(prev => ({ 
        ...prev, 
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        seo_keywords: data.seoKeywords,
        og_image: data.ogImage,
      }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError('Ошибка при сохранении SEO');
    }
  };

  const deleteFence = async (id: number) => {
    if (!selectedCategory) return;

    // Подтверждение удаления
    if (!window.confirm('Вы уверены, что хотите удалить эту ограду? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setLoading(true);
      
      const categoryConfig = fenceCategories.find(c => c.key === selectedCategory);
      if (!categoryConfig) return;
      
      console.log('Deleting fence:', id, 'endpoint:', `/admin/fences/${id}`);
      const data = await apiClient.delete(`/admin/fences/${id}`);
      console.log('Delete response:', data);
      
      if (data.success) {
        setSuccess("✓ Ограда успешно удалена");
        await fetchFences(selectedCategory);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при удалении ограды");
      }
    } catch (error) {
      console.error('Error deleting fence:', error);
      setError("Ошибка при удалении ограды");
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold">Управление оградами</h2>
          {selectedCategory && (
            <BulkSeoUpdateButton
              entityType="fences"
              categoryKey={selectedCategory}
              categoryName={fenceCategories.find(c => c.key === selectedCategory)?.title}
              onSuccess={async (stats) => {
                setSuccess(`✅ Обновлено ${stats.updated} оград`);
                await fetchFences(selectedCategory);
                setTimeout(() => setSuccess(""), 3000);
              }}
            />
          )}
        </div>
        
        {/* Выбор категории */}
        <div className="bg-gray-50 p-6 rounded mb-6">
          <h3 className="text-lg font-semibold mb-4">Выберите категорию оград</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fenceCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategoryChange(category.key)}
                className={`p-4 rounded border text-left transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="font-medium">{category.title}</div>
                <div className={`text-sm mt-1 ${
                  selectedCategory === category.key ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {category.description}
                </div>
              </button>
            ))}
          </div>
          
          {selectedCategory && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="text-blue-800 font-medium">
                Выбранная категория: {fenceCategories.find(c => c.key === selectedCategory)?.title}
              </span>
            </div>
          )}
        </div>

        {/* Сообщения */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Статистика - показывается только когда выбрана категория */}
        {selectedCategory && (
          <div className="bg-gray-50 p-6 rounded mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Статистика - {fenceCategories.find(c => c.key === selectedCategory)?.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{fences.length}</div>
                <div className="text-sm text-gray-600">Всего оград</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{fences.filter(f => f.price && f.price > 0).length}</div>
                <div className="text-sm text-gray-600">С ценой</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">{fences.filter(f => !f.price || f.price <= 0).length}</div>
                <div className="text-sm text-gray-600">С текстовой ценой</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-purple-600">{fences.filter(f => f.discount && f.discount > 0).length}</div>
                <div className="text-sm text-gray-600">Со скидкой</div>
              </div>
            </div>
          </div>
        )}

        {/* Список оград */}
        {selectedCategory && (
          <div className="bg-gray-50 p-6 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Список оград - {fenceCategories.find(c => c.key === selectedCategory)?.title}
              </h3>
              <button
                onClick={startAdding}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                ➕ Добавить ограду
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Загрузка оград...</div>
              </div>
            ) : fences.length === 0 ? (
              <p className="text-gray-600">Ограды в данной категории не найдены</p>
            ) : (
            <div className="space-y-4">
              {fences.map((fence) => (
                <div key={fence.id} className="bg-white border p-4 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={fence.image.startsWith('http') ? fence.image : `https://k-r.by${fence.image}`} 
                        alt={fence.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          {fence.name}
                          {fence.popular && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              ⭐ Популярное
                            </span>
                          )}
                        </h4>
                        <div className="text-sm text-gray-600">Категория: {fence.category}</div>
                        {fence.price && (
                          <div className="text-sm">
                            <span className="font-medium">Цена: {fence.price} руб.</span>
                            {fence.oldPrice && (
                              <span className="text-gray-500 line-through ml-2">{fence.oldPrice} руб.</span>
                            )}
                            {fence.discount && fence.discount > 0 && (
                              <span className="text-red-600 ml-2">-{fence.discount}%</span>
                            )}
                          </div>
                        )}
                        {!fence.price && (
                          <div className="text-sm text-gray-600">
                            Текст цены: {fence.textPrice || "Цена по запросу"}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => startEditing(fence)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        ✏️ Редактировать
                      </button>
                      
                      <button
                        onClick={() => deleteFence(fence.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        title="Удалить ограду"
                      >
                        🗑️ Удалить
                      </button>
                      
                      <a
                        href={`/fences/${selectedCategory}/${fence.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        👁️ Просмотр
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Модальное окно для редактирования/добавления */}
        {(editingFence || addingFence) && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  {editingFence ? "Редактировать ограду" : "Добавить ограду"}
                </h3>
                
                <div className="space-y-4">
                  {/* Название */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Цена - показываем если нет реальной текстовой цены */}
                  {(!editForm.textPrice || editForm.textPrice === "Цена по запросу") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Текущая цена (руб.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Старая цена (руб.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.oldPrice}
                            onChange={(e) => handleOldPriceChange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Скидка */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Скидка (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={editForm.discount}
                          onChange={(e) => handleDiscountChange(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Введите процент скидки"
                        />
                      </div>
                    </>
                  )}

                  {/* Текстовая цена - показываем только если не указаны обычные цены */}
                  {!editForm.price && !editForm.oldPrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Текстовая цена (например "от 500 руб.")
                      </label>
                      <input
                        type="text"
                        value={editForm.textPrice}
                        onChange={(e) => {
                          // При вводе текстовой цены очищаем обычные цены
                          setEditForm(prev => ({ 
                            ...prev, 
                            textPrice: e.target.value,
                            price: "",
                            oldPrice: "",
                            discount: ""
                          }));
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="от 500 руб."
                      />
                    </div>
                  )}

                  {/* Категория */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория
                    </label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Описание */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Описание ограды"
                    />
                  </div>



                  {/* Изображение */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Изображение
                    </label>
                    
                    <div className="space-y-3">
                      <select
                        value={editForm.image}
                        onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="flex-1 p-2 border border-gray-300 rounded"
                          />
                          {uploading && <span className="text-blue-600">Загрузка...</span>}
                        </div>
                        {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
                      </div>
                    </div>
                    
                    {editForm.image && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Превью:</p>
                        <img 
                          src={editForm.image} 
                          alt="Preview" 
                          className="h-24 w-24 object-cover rounded" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Динамические характеристики */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Характеристики для категории: {fenceCategories.find(c => c.key === selectedCategory)?.title}
                    </label>
                    
                    <div className="space-y-3">
                      {/* Поля для гранитных оград */}
                      {selectedCategory === "granite" && (
                        <>
                          <input
                            type="text"
                            placeholder="Размер бордюра (напр. 8х5 см)"
                            value={editForm.specifications["Размер бордюра"] || ""}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              specifications: { ...prev.specifications, "Размер бордюра": e.target.value }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            placeholder="Размер столбиков (напр. 20х10х10 см)"
                            value={editForm.specifications["Размер столбиков"] || ""}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              specifications: { ...prev.specifications, "Размер столбиков": e.target.value }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </>
                      )}
                      
                      {/* Поля для металлических оград */}
                      {selectedCategory === "metal" && (
                        <>
                          <input
                            type="text"
                            placeholder="Профиль/прут (напр. 15х15 мм)"
                            value={editForm.specifications["Профиль/прут"] || ""}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              specifications: { ...prev.specifications, "Профиль/прут": e.target.value }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Популярность */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.popular}
                        onChange={(e) => setEditForm(prev => ({ ...prev, popular: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Популярная ограда</span>
                    </label>
                  </div>

                  {/* Кастомные характеристики */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дополнительные характеристики
                    </label>
                    <div className="space-y-2">
                      {editForm.customSpecs.map((spec, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Название характеристики"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...editForm.customSpecs];
                              newSpecs[index].key = e.target.value;
                              setEditForm(prev => ({ ...prev, customSpecs: newSpecs }));
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            placeholder="Значение"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...editForm.customSpecs];
                              newSpecs[index].value = e.target.value;
                              setEditForm(prev => ({ ...prev, customSpecs: newSpecs }));
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSpecs = editForm.customSpecs.filter((_, i) => i !== index);
                              setEditForm(prev => ({ ...prev, customSpecs: newSpecs }));
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            customSpecs: [...prev.customSpecs, { key: "", value: "" }]
                          }));
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        ➕ Добавить характеристику
                      </button>
                    </div>
                  </div>
                </div>

                {/* SEO Fields Form */}
                {user?.role === 'superadmin' && (editingFence || addingFence) && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">SEO Данные</h3>
                    <SeoFieldsForm
                      entityType="fences"
                      categoryName="Ограды"
                      key={`${editingFence?.id}-${addingFence}`}
                      initialData={{
                        seoTitle: editForm.seo_title,
                        seoDescription: editForm.seo_description,
                        seoKeywords: editForm.seo_keywords,
                        ogImage: editForm.og_image,
                      }}
                      onChange={(data) => {
                        // Синхронизируем SEO значения в editForm при создании/редактировании
                        console.log('[FENCES] onChange called with:', data);
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

                {/* Кнопки */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={cancelEditing}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={saveFence}
                    disabled={loading || !editForm.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      )}
    </>
  );
}
