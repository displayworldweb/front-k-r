"use client";

import { useState, useEffect, useRef } from "react";
import { generateSlug } from "@/lib/slug-generator";
import { apiClient } from "@/lib/api-client";
import { SeoFieldsForm, SeoFieldsData } from "@/components/admin/SeoFieldsForm";

interface MonumentColor {
  name: string;
  color: string;
  image: string;
  price: number;
  oldPrice: number | null;
  discount: number | null;
  hit?: boolean;
}

interface Monument {
  id: number;
  slug: string;
  name: string;
  price?: string;
  oldPrice?: string;
  discount?: string;
  textPrice?: string;
  category: string;
  image: string;
  popular?: boolean;
  hit?: boolean;
  new?: boolean;
  height?: string;
  options?: string; // JSON строка с характеристиками
  colors?: string; // JSON строка с массивом цветов для эксклюзивных
  description?: string;
  availability?: string;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

interface MonumentCategory {
  key: string;
  title: string;
  description: string;
  apiEndpoint: string;
  characteristics: string[]; // Реальные поля API для каждой категории
}

export default function ProductsAdminPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api';
  
  const [monuments, setMonuments] = useState<Monument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingMonument, setEditingMonument] = useState<Monument | null>(null);
  const [addingMonument, setAddingMonument] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [nameCheckResult, setNameCheckResult] = useState<{isUnique: boolean, checked: boolean}>({isUnique: true, checked: false});
  
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState("");

  // Функция для сохранения SEO данных
  // SEO сохраняется через обновление памятника (PUT /monuments/id/{id})
  const saveSeoFields = async (entityId: number, data: SeoFieldsData, categoryKey?: string): Promise<boolean> => {
    try {
      setSeoLoading(true);
      setSeoError("");

      let category = categoryKey || selectedCategory;
      
      // Преобразуем русские названия категорий в английские для API
      if (category === "Эксклюзивные") {
        category = "exclusive";
      }
      
      // Отправляем SEO данные как часть обновления памятника
      // Обязательно включаем category чтобы backend знал в какой таблице искать
      const response = await fetch(`${API_URL}/monuments/id/${entityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category, // Указываем категорию чтобы backend нашел правильную таблицу
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
          seoKeywords: data.seoKeywords || "",
          ogImage: data.ogImage || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Ошибка при сохранении SEO');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSeoError(message);
      return false;
    } finally {
      setSeoLoading(false);
    }
  };
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    discount: "",
    priceByRequest: false,
    category: "",
    image: "",
    options: "",
    height: "",
    description: "",
    popular: false,
    hit: false,
    new: false,
    // Реальные динамические характеристики
    realOptions: {} as {[key: string]: string},
    customOptions: [] as Array<{key: string, value: string}>,
    // Цвета для эксклюзивных памятников
    colors: [] as MonumentColor[],
    // SEO поля
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image: "",
  });

  // Вспомогательная функция для проверки хитов в цветах эксклюзивных памятников
  const hasHitInColors = (monument: Monument): boolean => {
    if (!monument.colors) return false;
    
    // Если colors это строка (JSON), парсим её
    let colorsArray: any[] = [];
    if (typeof monument.colors === 'string') {
      try {
        colorsArray = JSON.parse(monument.colors);
      } catch (e) {
        return false;
      }
    } else if (Array.isArray(monument.colors)) {
      colorsArray = monument.colors;
    }
    
    return colorsArray.some((color: any) => color.hit === true);
  };

  // Категории памятников с реальными API endpoints и характеристиками
  const monumentCategories: MonumentCategory[] = [
    { 
      key: "single", 
      title: "Одиночные памятники", 
      description: "Памятники для одиночных захоронений",
      apiEndpoint: "/monuments/single",
      characteristics: ["Стела", "Тумба", "Цветник"]
    },
    { 
      key: "double", 
      title: "Двойные памятники", 
      description: "Памятники для двойных захоронений",
      apiEndpoint: "/monuments/double", 
      characteristics: ["Стела", "Тумба", "Цветник"]
    },
    { 
      key: "cheap", 
      title: "Недорогие памятники", 
      description: "Бюджетные варианты памятников",
      apiEndpoint: "/monuments/cheap",
      characteristics: ["Стела", "Тумба", "Цветник"]
    },
    { 
      key: "composite", 
      title: "Составные памятники", 
      description: "Многокомпонентные памятники",
      apiEndpoint: "/monuments/composite",
      characteristics: ["Ширина", "Длина", "Высота"]
    },
    { 
      key: "cross", 
      title: "В виде креста", 
      description: "Памятники в форме креста",
      apiEndpoint: "/monuments/cross",
      characteristics: [] // Пустые характеристики в API
    },
    { 
      key: "heart", 
      title: "В виде сердца", 
      description: "Памятники в форме сердца",
      apiEndpoint: "/monuments/heart",
      characteristics: [] // Пустые характеристики в API
    },
    { 
      key: "europe", 
      title: "Европейские памятники", 
      description: "Памятники в европейском стиле",
      apiEndpoint: "/monuments/europe",
      characteristics: [] // Пустые характеристики в API
    },
    { 
      key: "artistic", 
      title: "Художественная резка", 
      description: "Памятники с художественной резкой",
      apiEndpoint: "/monuments/artistic",
      characteristics: []
    },
    { 
      key: "tree", 
      title: "В виде деревьев", 
      description: "Памятники в форме деревьев",
      apiEndpoint: "/monuments/tree",
      characteristics: []
    },
    { 
      key: "complex", 
      title: "Мемориальные комплексы", 
      description: "Комплексные мемориальные сооружения",
      apiEndpoint: "/monuments/complex",
      characteristics: []
    },
    { 
      key: "exclusive", 
      title: "Эксклюзивные памятники", 
      description: "Уникальные памятники из редких пород гранита",
      apiEndpoint: "/monuments/exclusive",
      characteristics: [] // У эксклюзивных разные характеристики
    },
  ];

  // Загрузка доступных изображений
  const loadAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=monuments");
      if (data.success) {
        setAvailableImages(data.data || []);
      } else {
        // Fallback к предустановленному списку
        const fallbackImages = [
          'https://api.k-r.by/api/static/monuments/default1.jpg',
          'https://api.k-r.by/api/static/monuments/default2.jpg',
          'https://api.k-r.by/api/static/monuments/default3.jpg'
        ];
        setAvailableImages(fallbackImages);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setAvailableImages([]);
    }
  };

  const fetchMonuments = async (category: string) => {
    if (!category) return;
    
    try {
      setLoading(true);
      
      // Используем публичный эндпоинт с категорией
      console.log('Fetching monuments for category:', category);
      const data = await apiClient.get(`/monuments/${category}`);
      
      console.log('Fetch response for', category, ':', data);
      
      if (data.success) {
        const monuments = data.data || [];
        console.log('Monuments loaded:', monuments.length, monuments.map((m: Monument) => ({id: m.id, name: m.name, category: m.category})));
        setMonuments(monuments);
        setError("");
      } else {
        setError(data.error || "Ошибка при загрузке памятников");
        setMonuments([]);
      }
    } catch (error) {
      setError("Ошибка при загрузке памятников");
      setMonuments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateMonumentStatus = async (id: number, hit?: boolean, popular?: boolean, isNew?: boolean) => {
    if (!selectedCategory) {
      setError("Выберите категорию");
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiClient.post("/admin/monuments", {
          action: "update_status",
          id,
          hit,
          popular,
          new: isNew,
          category: selectedCategory,
        });
      if (data.success) {
        setSuccess("✓ Статус памятника обновлен");
        await fetchMonuments(selectedCategory);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при обновлении статуса");
      }
    } catch (error) {
      setError("Ошибка при обновлении статуса");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setMonuments([]);
    setError("");
    setSuccess("");
    setEditingMonument(null);
    if (category) {
      fetchMonuments(category);
    }
  };

  // Функция для получения динамических полей по категории
  const getDynamicFields = (category: string) => {
    const fieldsMap: {[key: string]: Array<{key: string, label: string, placeholder: string}>} = {
      single: [
        { key: "Стела", label: "Стела", placeholder: "напр. 100x50x8 см" },
        { key: "Тумба", label: "Тумба", placeholder: "напр. 15x40x20 см" },
        { key: "Цветник", label: "Цветник", placeholder: "напр. 100x50x15 см" },
      ],
      double: [
        { key: "Стела", label: "Стела", placeholder: "напр. 100x50x8 см" },
        { key: "Тумба", label: "Тумба", placeholder: "напр. 15x40x20 см" },
        { key: "Цветник", label: "Цветник", placeholder: "напр. 100x50x15 см" },
      ],
      cheap: [
        { key: "Стела", label: "Стела", placeholder: "напр. 100x50x8 см" },
        { key: "Тумба", label: "Тумба", placeholder: "напр. 15x40x20 см" },
        { key: "Цветник", label: "Цветник", placeholder: "напр. 100x50x15 см" },
      ],
      composite: [
        { key: "Ширина", label: "Ширина", placeholder: "напр. 120 см" },
        { key: "Длина", label: "Длина", placeholder: "напр. 200 см" },
        { key: "Высота", label: "Высота", placeholder: "напр. 180 см" },
      ],
      // Остальные категории не имеют стандартных характеристик в API
      cross: [],
      heart: [],
      europe: [],
      artistic: [],
      tree: [],
      complex: [],
      exclusive: []
    };
    
    return fieldsMap[category] || [];
  };

  const startEditing = (monument: Monument) => {
    setEditingMonument(monument);
    
    // Парсим options (характеристики) из JSON
    let realOptions: {[key: string]: string} = {};
    let customOptions: Array<{key: string, value: string}> = [];
    
    if (monument.options) {
      try {
        const allOptions = JSON.parse(monument.options);
        const categoryConfig = monumentCategories.find(c => c.key === selectedCategory);
        
        if (categoryConfig && categoryConfig.characteristics.length > 0) {
          // Разделяем на стандартные и кастомные характеристики
          Object.entries(allOptions).forEach(([key, value]) => {
            if (categoryConfig.characteristics.includes(key)) {
              realOptions[key] = value as string;
            } else {
              customOptions.push({ key, value: value as string });
            }
          });
        } else {
          // Если нет стандартных характеристик, все идет в кастомные
          Object.entries(allOptions).forEach(([key, value]) => {
            customOptions.push({ key, value: value as string });
          });
        }
      } catch (e) {
        console.warn('Failed to parse options:', monument.options);
      }
    }

    // Парсим colors для эксклюзивных памятников
    let colors: MonumentColor[] = [];
    if (monument.colors) {
      try {
        colors = JSON.parse(monument.colors);
      } catch (e) {
        console.warn('Failed to parse colors:', monument.colors);
      }
    }
    
    // Определяем, используется ли "Цена по запросу" или обычная цена
    // Если price = 0/null - это значит "Цена по запросу"
    let price = "";
    let oldPrice = "";
    let discount = "";
    let priceByRequest = false;
    
    const monumentPrice = monument.price ? parseFloat(monument.price as any) : 0;
    const monumentOldPrice = monument.oldPrice ? parseFloat(monument.oldPrice as any) : 0;
    const monumentDiscount = monument.discount ? parseFloat(monument.discount as any) : 0;
    
    if (monumentPrice <= 0) {
      // Если цена 0 или null - это "Цена по запросу"
      priceByRequest = true;
      price = "";
      oldPrice = "";
      discount = "";
    } else {
      // Иначе используем обычные цены
      priceByRequest = false;
      price = monumentPrice.toString();
      oldPrice = monumentOldPrice > 0 ? monumentOldPrice.toString() : "";
      discount = monumentDiscount > 0 ? monumentDiscount.toString() : "";
    }
    
    setEditForm({
      name: monument.name,
      price: price,
      oldPrice: oldPrice,
      discount: discount,
      priceByRequest: priceByRequest,
      category: monument.category,
      image: monument.image,
      options: monument.options || "",
      height: monument.height || "",
      description: monument.description || "",
      popular: monument.popular || false,
      hit: monument.hit || false,
      new: monument.new || false,
      realOptions: realOptions,
      customOptions: customOptions,
      colors: colors,
      seo_title: monument.seoTitle || "",
      seo_description: monument.seoDescription || "",
      seo_keywords: monument.seoKeywords || "",
      og_image: monument.ogImage || "",
    });
  };

  const cancelEditing = () => {
    setEditingMonument(null);
    setAddingMonument(false);
    setEditForm({
      name: "",
      price: "",
      oldPrice: "",
      discount: "",
      priceByRequest: false,
      category: "",
      image: "",
      options: "",
      height: "",
      description: "",
      popular: false,
      hit: false,
      new: false,
      realOptions: {},
      customOptions: [],
      colors: [],
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      og_image: "",
    });
  };

  const startAdding = () => {
    setAddingMonument(true);
    setEditingMonument(null);
    setEditForm({
      name: "",
      price: "",
      oldPrice: "",
      discount: "",
      priceByRequest: false,
      category: selectedCategory,
      image: "",
      options: "",
      height: "",
      description: "",
      popular: false,
      hit: false,
      new: false,
      realOptions: {},
      customOptions: [],
      colors: [],
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
      const updatedForm = { ...prev, price, priceByRequest: false }; // Очищаем priceByRequest при вводе числовой цены
      
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
      const updatedForm = { ...prev, oldPrice, priceByRequest: false }; // Очищаем priceByRequest при вводе числовой цены
      
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
    
    setEditForm(prev => {
      const updatedForm = { ...prev, discount, priceByRequest: false }; // Очищаем priceByRequest при вводе числовой цены
      
      // Если есть текущая цена и скидка, рассчитываем старую цену
      if (currentPrice > 0 && newDiscount > 0 && newDiscount < 100) {
        const calculatedOldPrice = Math.round((currentPrice * 100) / (100 - newDiscount));
        updatedForm.oldPrice = calculatedOldPrice.toString();
      } else if (newDiscount <= 0) {
        updatedForm.oldPrice = "";
      }
      
      return updatedForm;
    });
  };

  // Отложенная проверка уникальности названия в реальном времени
  const debouncedNameCheck = useRef<NodeJS.Timeout | null>(null);
  const checkNameInRealTime = (name: string) => {
    if (debouncedNameCheck.current) clearTimeout(debouncedNameCheck.current);
    setNameCheckResult({isUnique: true, checked: false});
    
    if (!name.trim()) return;
    
    debouncedNameCheck.current = setTimeout(async () => {
      const isUnique = await checkNameUniqueness(name);
      setNameCheckResult({isUnique, checked: true});
    }, 500);
  };

  // Проверка уникальности названия памятника
  const checkNameUniqueness = async (name: string): Promise<boolean> => {
    if (!name.trim()) return true; // Пустое название не проверяем здесь
    
    try {
      // Проверяем во всех категориях
      for (const category of monumentCategories) {
        const data = await apiClient.get(`/monuments/${category.key}`);
        if (data.success && data.data) {
          const existingMonument = data.data.find((m: Monument) => 
            m.name.toLowerCase() === name.toLowerCase() && 
            (!editingMonument || m.id !== editingMonument.id) // Исключаем текущий редактируемый памятник
          );
          if (existingMonument) {
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.warn('Error checking name uniqueness:', error);
      return true; // В случае ошибки позволяем продолжить
    }
  };

  const saveProduct = async () => {
    if (!selectedCategory) return;

    // Проверяем заполненность обязательных полей
    if (!editForm.name.trim()) {
      setError("Название памятника обязательно для заполнения");
      return;
    }

    // Проверяем уникальность названия
    const isNameUnique = await checkNameUniqueness(editForm.name);
    if (!isNameUnique) {
      setError(`Памятник с названием "${editForm.name}" уже существует. Пожалуйста, выберите другое название.`);
      return;
    }

    try {
      setLoading(true);
      // Генерируем JSON options из реальных и кастомных характеристик
      let optionsJson = "";
      const optionsObj: { [key: string]: string } = {};
      
      // Добавляем реальные характеристики API
      Object.entries(editForm.realOptions).forEach(([key, value]) => {
        if (key && value) {
          optionsObj[key] = value;
        }
      });
      
      // Добавляем кастомные характеристики
      if (editForm.customOptions && editForm.customOptions.length > 0) {
        editForm.customOptions.forEach(char => {
          if (char.key && char.value) {
            optionsObj[char.key] = char.value;
          }
        });
      }
      
      if (Object.keys(optionsObj).length > 0) {
        optionsJson = JSON.stringify(optionsObj);
      }

      // Генерируем JSON colors для эксклюзивных памятников
      let colorsJson = "";
      if (selectedCategory === "exclusive" && editForm.colors.length > 0) {
        // Нормализуем colors - преобразуем цены в числа
        const normalizedColors = editForm.colors.map((color: MonumentColor) => ({
          name: color.name || "",
          color: color.color || "#000000",
          image: color.image || "",
          price: color.price ? parseFloat(String(color.price)) : 0,
          oldPrice: color.oldPrice ? parseFloat(String(color.oldPrice)) : null,
          discount: color.discount ? parseInt(String(color.discount)) : null,
          hit: color.hit || false
        }));
        colorsJson = JSON.stringify(normalizedColors);
        console.log('Normalized colors for exclusive monument:', normalizedColors);
      }

      if (editingMonument) {
        // Обновление существующего памятника
        // Если прижата "Цена по запросу", то price/oldPrice/discount = 0/null
        let currentPrice: number | null = null;
        let oldPrice: number | null = null;
        let discount: number | null = null;
        
        if (editForm.priceByRequest) {
          // Если "Цена по запросу" включена - отправляем 0 для price
          currentPrice = 0;
          oldPrice = null;
          discount = null;
        } else {
          // Иначе используем обычные цены
          currentPrice = editForm.price ? parseFloat(editForm.price) : null;
          oldPrice = editForm.oldPrice ? parseFloat(editForm.oldPrice) : null;
          discount = editForm.discount ? parseFloat(editForm.discount) : null;
        }

        // Загружаем шаблонное SEO для категории, если не заполнены SEO поля при редактировании
        let seoTitle = editForm.seo_title;
        let seoDescription = editForm.seo_description;
        let seoKeywords = editForm.seo_keywords;
        let ogImage = editForm.og_image;

        // При редактировании НЕ загружаем шаблон - используем только то что в форме
        // Шаблон загружается только при создании нового памятника
        console.log('Edit SEO data:', { seo_title: seoTitle, seo_description: seoDescription, seo_keywords: seoKeywords, og_image: ogImage });

        // Определяем правильную категорию для отправки (преобразуем русские названия в английские)
        let updateCategory = editForm.category || selectedCategory;
        if (updateCategory === "Эксклюзивные") {
          updateCategory = "exclusive";
        }

        const updateData: any = {
          name: editForm.name,
          price: currentPrice,
          oldPrice: oldPrice,
          discount: discount,
          category: updateCategory,
          image: editForm.image || "",
          options: optionsJson,
          height: editForm.height || "",
          description: editForm.description || "",
          // NOTE: SEO поля сохраняются отдельным запросом после обновления памятника
        };

        // Добавляем colors только для эксклюзивных памятников
        if (selectedCategory === "exclusive") {
          updateData.colors = colorsJson;
        }

        // Используем правильный эндпоинт для редактирования
        const updateEndpoint = `/monuments/id/${editingMonument.id}`;
        
        // Добавляем category в тело запроса для API
        updateData.category = selectedCategory;
        
        console.log('Update endpoint:', updateEndpoint);
        console.log('Update data:', updateData);
        console.log('Selected category:', selectedCategory);
        console.log('SEO data:', { seo_title: seoTitle, seo_description: seoDescription, seo_keywords: seoKeywords });
        
        const data = await apiClient.put(updateEndpoint, updateData);
        if (data.success) {
          // Если есть SEO данные - сохраняем их отдельным запросом
          if (seoTitle || seoDescription || seoKeywords || ogImage) {
            try {
              console.log('Saving SEO data for monument ID:', editingMonument.id);
              await saveSeoFields(editingMonument.id, {
                seoTitle: seoTitle,
                seoDescription: seoDescription,
                seoKeywords: seoKeywords,
                ogImage: ogImage,
              }, selectedCategory);
              console.log('✓ SEO данные сохранены');
            } catch (seoErr) {
              console.warn('Failed to save SEO data:', seoErr);
              // Продолжаем даже если SEO не сохранилось
            }
          }
          
          setSuccess("✓ Памятник успешно обновлен");
          await fetchMonuments(selectedCategory);
          cancelEditing();
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Ошибка при обновлении памятника");
        }
      } else {
        // Добавление нового памятника
        // Если прижата "Цена по запросу", то price/oldPrice/discount = 0/null
        let currentPrice: number | null = null;
        let oldPrice: number | null = null;
        let discount: number | null = null;
        
        if (editForm.priceByRequest) {
          // Если "Цена по запросу" включена - отправляем 0 для price
          currentPrice = 0;
          oldPrice = null;
          discount = null;
        } else {
          // Иначе используем обычные цены
          currentPrice = editForm.price ? parseFloat(editForm.price) : null;
          oldPrice = editForm.oldPrice ? parseFloat(editForm.oldPrice) : null;
          discount = editForm.discount ? parseFloat(editForm.discount) : null;
        }

        // Определяем правильную категорию и эндпоинт
        let category = editForm.category || selectedCategory;
        let createEndpoint = "/monuments";
        
        if (selectedCategory === "exclusive") {
          category = "exclusive"; // Используем английское название как в других категориях
          createEndpoint = "/monuments"; // Теперь используем /monuments для всех
        }

        // Загружаем шаблонное SEO для категории, если не заполнены SEO поля
        let seoTitle = editForm.seo_title;
        let seoDescription = editForm.seo_description;
        let seoKeywords = editForm.seo_keywords;
        let ogImage = editForm.og_image;

        console.log('Initial SEO values:', { seoTitle, seoDescription, seoKeywords, ogImage });

        // Если юзер вписал хоть что-то в SEO - используем его значения
        // Загружаем шаблон ТОЛЬКО если все SEO поля пусты
        const hasUserProvidedSeo = seoTitle || seoDescription || seoKeywords || ogImage;
        
        if (!hasUserProvidedSeo) {
          // Только загружаем шаблон если все поля пусты
          try {
            const { fetchSeoTemplate } = await import('@/lib/hooks/use-seo-hierarchy');
            // Для всех типов памятников используем entityType "monuments"
            console.log('Fetching SEO template for monuments category:', selectedCategory);
            const template = await fetchSeoTemplate("monuments", selectedCategory);
            console.log('Template received:', template);
            
            if (template) {
              seoTitle = template.seoTitle || editForm.name;
              seoDescription = template.seoDescription || `Памятник ${editForm.name}`;
              seoKeywords = template.seoKeywords || editForm.name;
              ogImage = template.ogImage || "";
              console.log('Applied template SEO:', { seoTitle, seoDescription, seoKeywords, ogImage });
            } else {
              // Если шаблона нет - используем данные памятника как fallback
              seoTitle = editForm.name;
              seoDescription = `Памятник ${editForm.name}`;
              seoKeywords = editForm.name;
              console.log('No template found, using fallback:', { seoTitle, seoDescription, seoKeywords });
            }
          } catch (err) {
            console.warn('Failed to load SEO template, using defaults:', err);
            // Используем данные памятника как fallback
            seoTitle = editForm.name;
            seoDescription = `Памятник ${editForm.name}`;
            seoKeywords = editForm.name;
            console.log('Template load error, using fallback:', { seoTitle, seoDescription, seoKeywords });
          }
        } else {
          // Юзер вписал что-то - используем его значения, заполняя пропуски fallback'ом
          console.log('User provided SEO, using user values:', { seoTitle, seoDescription, seoKeywords, ogImage });
          seoTitle = seoTitle || editForm.name;
          seoDescription = seoDescription || `Памятник ${editForm.name}`;
          seoKeywords = seoKeywords || editForm.name;
          ogImage = ogImage || "";
        }

        // Используем правильный endpoint /monuments с данными напрямую
        const createData: any = {
          name: editForm.name,
          slug: generateSlug(editForm.name),
          price: currentPrice,
          oldPrice: oldPrice,
          discount: discount,
          category: category,
          image: editForm.image || "",
          options: optionsJson,
          height: editForm.height || "",
          description: editForm.description || "",
          hit: false,
          popular: false,
          // Включаем SEO поля в основной запрос создания
          seoTitle: seoTitle,
          seoDescription: seoDescription,
          seoKeywords: seoKeywords,
          ogImage: ogImage,
        };

        // Добавляем colors только для эксклюзивных памятников
        if (selectedCategory === "exclusive") {
          createData.colors = colorsJson;
        }

        console.log('Creating monument with data:', createData);
        console.log('Selected category:', selectedCategory);
        console.log('Final category sent to backend:', createData.category);
        console.log('Create endpoint:', createEndpoint);
        console.log('SEO data being sent:', { seoTitle: createData.seoTitle, seoDescription: createData.seoDescription, seoKeywords: createData.seoKeywords, ogImage: createData.ogImage });
        console.log('=============== BEFORE POST REQUEST ===============');
        console.log('Full createData object:', JSON.stringify(createData, null, 2));
        
        const data = await apiClient.post(createEndpoint, createData);
        
        console.log('=============== AFTER POST RESPONSE ===============');
        console.log('Response from server:', data);
        
        console.log('Create response:', data);
        
        if (data.success) {
          setSuccess("✓ Памятник успешно добавлен");
          console.log('Created monument with ID:', data.data?.id, 'category:', selectedCategory);
          
          // Оставляем форму открытой для редактирования SEO
          if (data.data) {
            // Обновляем editingMonument чтобы был ID для сохранения SEO
            setEditingMonument(data.data);
            
            // Обновляем editForm с полными данными памятника
            setEditForm(prev => ({
              ...prev,
              seo_title: data.data?.seoTitle || "",
              seo_description: data.data?.seoDescription || "",
              seo_keywords: data.data?.seoKeywords || "",
              og_image: data.data?.ogImage || "",
            }));
            
            // Сразу добавляем созданный памятник в локальный список
            setMonuments(prev => [...prev, data.data]);
            
            // Скрываем форму добавления
            setAddingMonument(false);
          }
          
          // Также делаем перезагрузку для синхронизации
          setTimeout(async () => {
            console.log('Reloading monuments for category:', selectedCategory);
            await fetchMonuments(selectedCategory);
            // После перезагрузки закрываем форму редактирования
            cancelEditing();
          }, 1000);
          
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Ошибка при добавлении памятника");
        }
      }
    } catch (error) {
      setError("Ошибка при сохранении памятника");
    } finally {
      setLoading(false);
    }
  };

  // Функция для сохранения SEO данных
  const handleSaveSeo = async (data: SeoFieldsData) => {
    if (!editingMonument) return;
    
    try {
      await saveSeoFields(editingMonument.id, data, selectedCategory);
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

  const deleteMonument = async (monument: Monument) => {
    if (!selectedCategory || loading) return; // Предотвращаем двойной клик

    // Подтверждение удаления
    if (!window.confirm(`Вы уверены, что хотите удалить памятник "${monument.name}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Определяем эндпоинт удаления в зависимости от категории
      // Используем ID с проверкой slug для дополнительной безопасности
      let deleteUrl: string;
      
      if (selectedCategory === "exclusive") {
        // Для эксклюзивных памятников тоже используем /monuments/id/:id
        deleteUrl = `/monuments/id/${monument.id}?category=exclusive&slug=${encodeURIComponent(monument.slug)}`;
      } else {
        // Для остальных используем /monuments/id/:id с категорией
        deleteUrl = `/monuments/id/${monument.id}?category=${selectedCategory}&slug=${encodeURIComponent(monument.slug)}`;
      }
      
      console.log('Delete URL:', deleteUrl, 'Monument ID:', monument.id, 'Slug:', monument.slug, 'Name:', monument.name, 'Category:', selectedCategory);
      
      const data = await apiClient.delete(deleteUrl);
      
      console.log('Delete response:', data);
      
      if (data.success) {
        setSuccess("✓ Памятник успешно удален");
        // Сразу удаляем из локального списка для быстрого обновления
        setMonuments(prev => prev.filter(m => m.id !== monument.id));
        setTimeout(async () => {
          await fetchMonuments(selectedCategory);
        }, 500);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при удалении памятника");
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError("Ошибка при удалении памятника");
    } finally {
      setLoading(false);
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
      formData.append("folder", "monuments");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api'}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        const imagePath = data.data.path;
        
        // Обновляем основное изображение
        const updatedForm = { ...editForm, image: imagePath };
        
        // Для эксклюзивных памятников - устанавливаем это изображение как первый цвет
        if (selectedCategory === "exclusive" && editForm.colors && editForm.colors.length > 0) {
          const updatedColors = [...editForm.colors];
          updatedColors[0] = {
            ...updatedColors[0],
            image: imagePath
          };
          updatedForm.colors = updatedColors;
        }
        
        setEditForm(updatedForm);
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

  useEffect(() => {
    // Автоматически выбираем первую категорию при загрузке
    if (monumentCategories.length > 0 && !selectedCategory) {
      handleCategoryChange(monumentCategories[0].key);
    }
    // Загружаем доступные изображения
    loadAvailableImages();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Управление памятниками</h2>
        
        {/* Выбор категории */}
        <div className="bg-gray-50 p-6 rounded mb-6">
          <h3 className="text-lg font-semibold mb-4">Выберите категорию памятников</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {monumentCategories.map((category) => (
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
                Выбранная категория: {monumentCategories.find(c => c.key === selectedCategory)?.title}
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
              Статистика - {monumentCategories.find(c => c.key === selectedCategory)?.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{monuments.length}</div>
                <div className="text-sm text-gray-600">Всего памятников</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {selectedCategory === "exclusive" 
                    ? monuments.filter(p => hasHitInColors(p)).length
                    : monuments.filter(p => p.hit).length}
                </div>
                <div className="text-sm text-gray-600">Хиты продаж</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{monuments.filter(p => p.popular).length}</div>
                <div className="text-sm text-gray-600">Популярные</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-purple-600">{monuments.filter(p => p.new).length}</div>
                <div className="text-sm text-gray-600">Новинки</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {selectedCategory === "exclusive"
                    ? monuments.filter(p => p.popular && hasHitInColors(p)).length
                    : monuments.filter(p => p.hit && p.popular).length}
                </div>
                <div className="text-sm text-gray-600">Хит + Популярный</div>
              </div>
            </div>
          </div>
        )}

        {/* Список памятников */}
        {selectedCategory && (
          <div className="bg-gray-50 p-6 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Список памятников - {monumentCategories.find(c => c.key === selectedCategory)?.title}
              </h3>
              <button
                onClick={startAdding}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                ➕ Добавить памятник
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Загрузка памятников...</div>
              </div>
            ) : monuments.length === 0 ? (
              <p className="text-gray-600">Памятники в данной категории не найдены</p>
            ) : (
            <div className="space-y-4">
              {monuments.map((monument, index) => (
                <div key={`${monument.id}-${monument.slug}-${index}`} className="bg-white border p-4 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={monument.image.startsWith('http') ? monument.image : `https://api.k-r.by${monument.image}`} 
                        alt={monument.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{monument.name}</h4>
                        <p className="text-sm text-gray-600">Slug: {monument.slug}</p>
                        <p className="text-sm text-gray-600">Категория: {selectedCategory}</p>
                        {monument.price && parseFloat(monument.price as any) > 0 ? (
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-green-600">Цена: {monument.price}₽</p>
                            {monument.oldPrice && parseFloat(monument.oldPrice as any) > parseFloat(monument.price as any) && (
                              <>
                                <span className="text-sm text-gray-500 line-through">{monument.oldPrice}₽</span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                                  -{Math.round(((parseFloat(monument.oldPrice as any) - parseFloat(monument.price as any)) / parseFloat(monument.oldPrice as any)) * 100)}%
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            Текстовая цена: <span className="font-medium">{monument.textPrice || "Цена по запросу"}</span>
                          </div>
                        )}
                        {monument.height && (
                          <p className="text-sm text-gray-600">Высота: {monument.height}</p>
                        )}
                        {monument.discount && parseFloat(monument.discount as any) > 0 && (
                          <p className="text-sm text-green-600">Скидка: {monument.discount}%</p>
                        )}
                        {monument.description && (
                          <p className="text-sm text-gray-600">{monument.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Статус HIT - скрываем для эксклюзивных памятников */}
                      {selectedCategory !== "exclusive" && (
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={monument.hit}
                              onChange={(e) => updateMonumentStatus(monument.id, e.target.checked, undefined, undefined)}
                              disabled={loading}
                              className="w-4 h-4"
                            />
                            <span className={`text-sm font-medium ${monument.hit ? 'text-red-600' : 'text-gray-600'}`}>
                              🔥 ХИТ
                            </span>
                          </label>
                        </div>
                      )}
                      
                      {/* Статус ПОПУЛЯРНЫЙ */}
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={monument.popular}
                            onChange={(e) => updateMonumentStatus(monument.id, undefined, e.target.checked, undefined)}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <span className={`text-sm font-medium ${monument.popular ? 'text-green-600' : 'text-gray-600'}`}>
                            ⭐ ПОПУЛЯРНЫЙ
                          </span>
                        </label>
                      </div>
                      
                      {/* Статус НОВИНКА */}
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={monument.new}
                            onChange={(e) => updateMonumentStatus(monument.id, undefined, undefined, e.target.checked)}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <span className={`text-sm font-medium ${monument.new ? 'text-purple-600' : 'text-gray-600'}`}>
                            🆕 НОВИНКА
                          </span>
                        </label>
                      </div>
                      
                      {/* Кнопка редактирования */}
                      <button
                        onClick={() => startEditing(monument)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        ✏️ Редактировать
                      </button>
                      
                      {/* Кнопка удаления */}
                      <button
                        onClick={() => deleteMonument(monument)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        title="Удалить памятник"
                      >
                        🗑️ Удалить
                      </button>
                      
                      {/* Превью ссылка */}
                      <a
                        href={`/monuments/${selectedCategory}/${monument.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        👁️ Просмотр
                      </a>
                    </div>
                  </div>
                  
                  {/* Бейджи статуса */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Показываем ХИТ только для не-эксклюзивных памятников */}
                    {selectedCategory !== "exclusive" && monument.hit && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                        🔥 ХИТ ПРОДАЖ
                      </span>
                    )}
                    {monument.popular && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        ⭐ ПОПУЛЯРНЫЙ
                      </span>
                    )}
                    {monument.new && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                        🆕 НОВИНКА
                      </span>
                    )}
                    {/* Для эксклюзивных памятников показываем "Эксклюзивный товар" */}
                    {selectedCategory === "exclusive" && !monument.popular && !monument.new && (
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                        💎 ЭКСКЛЮЗИВНЫЙ ТОВАР
                      </span>
                    )}
                    {/* Для остальных памятников показываем "Обычный товар" если нет статусов */}
                    {selectedCategory !== "exclusive" && !monument.hit && !monument.popular && !monument.new && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        Обычный товар
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Модальное окно для редактирования/добавления */}
        {(editingMonument || addingMonument) && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  {editingMonument ? "Редактировать памятник" : "Добавить памятник"}
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
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, name: e.target.value }));
                        checkNameInRealTime(e.target.value);
                      }}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        nameCheckResult.checked && !nameCheckResult.isUnique 
                          ? 'border-red-300 bg-red-50' 
                          : nameCheckResult.checked && nameCheckResult.isUnique 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300'
                      }`}
                      placeholder="Введите название памятника"
                    />
                    {nameCheckResult.checked && !nameCheckResult.isUnique && (
                      <div className="mt-1 text-xs text-red-600">
                        ⚠️ Памятник с таким названием уже существует
                      </div>
                    )}
                    {nameCheckResult.checked && nameCheckResult.isUnique && editForm.name.trim() && (
                      <div className="mt-1 text-xs text-green-600">
                        ✓ Название доступно
                      </div>
                    )}
                  </div>

                  {/* Цена */}
                  <div className="space-y-4">
                    {/* Галочка "Цена по запросу" */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <input
                        type="checkbox"
                        id="priceByRequest"
                        checked={editForm.priceByRequest}
                        onChange={(e) => {
                          setEditForm(prev => ({
                            ...prev,
                            priceByRequest: e.target.checked,
                            // При включении "Цена по запросу" очищаем обычные цены
                            ...(e.target.checked && {
                              price: "",
                              oldPrice: "",
                              discount: ""
                            })
                          }));
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="priceByRequest" className="cursor-pointer text-sm font-medium text-gray-700">
                        ℹ️ Цена по запросу (вместо обычной цены)
                      </label>
                    </div>

                    {/* Показываем числовые поля цены если НЕ включена "Цена по запросу" */}
                    {!editForm.priceByRequest && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Цена (руб.)
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
                          {editForm.discount && parseFloat(editForm.discount) > 0 && (
                            <div className="mt-1 text-xs text-green-600">
                              ✓ Старая цена рассчитывается автоматически: {editForm.oldPrice} руб.
                            </div>
                          )}
                          {!editForm.discount && editForm.price && editForm.oldPrice && parseFloat(editForm.oldPrice) > parseFloat(editForm.price) && (
                            <div className="mt-1 text-xs text-blue-600">
                              ℹ️ Автоматическая скидка: -{Math.round(((parseFloat(editForm.oldPrice) - parseFloat(editForm.price)) / parseFloat(editForm.oldPrice)) * 100)}%
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

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

                  {/* Характеристики */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Высота
                      </label>
                      <input
                        type="text"
                        value={editForm.height}
                        onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="например: 120 см"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                      </label>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Краткое описание памятника"
                      />
                    </div>
                  </div>

                  {/* Изображение */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Изображение
                    </label>
                    
                    <div className="space-y-3">
                      {/* Выбор из списка доступных изображений */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Выберите из доступных изображений:
                        </label>
                        <select
                          value={editForm.image}
                          onChange={(e) => {
                            const newImage = e.target.value;
                            const updatedForm = { ...editForm, image: newImage };
                            
                            // Для эксклюзивных - обновляем colors[0].image
                            if (selectedCategory === "exclusive" && editForm.colors && editForm.colors.length > 0) {
                              const updatedColors = [...editForm.colors];
                              updatedColors[0] = {
                                ...updatedColors[0],
                                image: newImage
                              };
                              updatedForm.colors = updatedColors;
                            }
                            
                            setEditForm(updatedForm);
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Выберите изображение</option>
                          {availableImages.map(img => (
                            <option key={img} value={img}>
                              {img.split('/').pop() || img}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* URL input */}
                      <div className="border-t pt-3">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Или введите URL изображения:
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={editForm.image}
                          onChange={(e) => {
                            const newImage = e.target.value;
                            const updatedForm = { ...editForm, image: newImage };
                            
                            // Для эксклюзивных - обновляем colors[0].image
                            if (selectedCategory === "exclusive" && editForm.colors && editForm.colors.length > 0) {
                              const updatedColors = [...editForm.colors];
                              updatedColors[0] = {
                                ...updatedColors[0],
                                image: newImage
                              };
                              updatedForm.colors = updatedColors;
                            }
                            
                            setEditForm(updatedForm);
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Загрузка файла */}
                      <div className="border-t pt-3">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Или загрузите новое изображение:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept=".webp,.png,.jpg,.jpeg"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {uploading && <span className="text-blue-600 flex items-center">Загрузка...</span>}
                        </div>
                        {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
                      </div>
                    </div>
                    
                    {/* Превью */}
                    {editForm.image && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Превью:</p>
                          <button
                            type="button"
                            onClick={() => setEditForm(prev => ({ ...prev, image: "" }))}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Очистить
                          </button>
                        </div>
                        <img 
                          src={(() => {
                            if (!editForm.image) return '';
                            if (editForm.image.startsWith('http')) return editForm.image;
                            if (editForm.image.startsWith('/')) return `https://api.k-r.by${editForm.image}`;
                            return `https://api.k-r.by/api/static/monuments/${editForm.image}`;
                          })()} 
                          alt="Превью" 
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            console.error('Image load error:', editForm.image);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMTI4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4OFY1Nkg0MFY0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KUGF0aCBkPSJNNDggNDhIODBWNTZINDhWNDhaIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI2NCIgeT0iNzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+0J7RiNC40LHQutCwINC30LDQs9GA0YPQt9C60Lg8L3RleHQ+Cjwvc3ZnPg==';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Динамические характеристики для категории */}
                  {selectedCategory && getDynamicFields(selectedCategory).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Характеристики для категории: {monumentCategories.find(c => c.key === selectedCategory)?.title}
                      </label>
                      <div className="space-y-3">
                        {getDynamicFields(selectedCategory).map((field) => (
                          <div key={field.key}>
                            <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              value={editForm.realOptions[field.key] || ""}
                              onChange={(e) => setEditForm(prev => ({ 
                                ...prev, 
                                realOptions: { ...prev.realOptions, [field.key]: e.target.value }
                              }))}
                              className="w-full p-2 border border-gray-300 rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Управление цветами для эксклюзивных памятников */}
                  {selectedCategory === "exclusive" && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Цвета и варианты
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm(prev => ({
                              ...prev,
                              colors: [...prev.colors, {
                                name: "",
                                color: "#000000",
                                image: "",
                                price: 0,
                                oldPrice: null,
                                discount: null,
                                hit: false
                              }]
                            }));
                          }}
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          + Добавить цвет
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {editForm.colors.map((color, index) => (
                          <div key={index} className="border border-gray-300 rounded p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Название цвета</label>
                                <input
                                  type="text"
                                  placeholder="Например: Лезниковский"
                                  value={color.name}
                                  onChange={(e) => {
                                    setEditForm(prev => ({
                                      ...prev,
                                      colors: prev.colors.map((c, i) => 
                                        i === index ? { ...c, name: e.target.value } : c
                                      )
                                    }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Изображение</label>
                                <input
                                  type="text"
                                  placeholder="Путь к изображению"
                                  value={color.image}
                                  onChange={(e) => {
                                    setEditForm(prev => ({
                                      ...prev,
                                      colors: prev.colors.map((c, i) => 
                                        i === index ? { ...c, image: e.target.value } : c
                                      )
                                    }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Цена</label>
                                <input
                                  type="number"
                                  placeholder="Цена"
                                  value={color.price || ""}
                                  onChange={(e) => {
                                    const newPrice = parseFloat(e.target.value) || 0;
                                    setEditForm(prev => ({
                                      ...prev,
                                      colors: prev.colors.map((c, i) => {
                                        if (i === index) {
                                          const updatedColor = { ...c, price: newPrice };
                                          // Автоматический расчет скидки если есть старая цена
                                          if (c.oldPrice && c.oldPrice > newPrice) {
                                            updatedColor.discount = Math.round(((c.oldPrice - newPrice) / c.oldPrice) * 100);
                                          }
                                          return updatedColor;
                                        }
                                        return c;
                                      })
                                    }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Старая цена (необязательно)</label>
                                <input
                                  type="number"
                                  placeholder="Старая цена"
                                  value={color.oldPrice || ""}
                                  onChange={(e) => {
                                    const newOldPrice = e.target.value ? parseFloat(e.target.value) : null;
                                    setEditForm(prev => ({
                                      ...prev,
                                      colors: prev.colors.map((c, i) => {
                                        if (i === index) {
                                          const updatedColor = { ...c, oldPrice: newOldPrice };
                                          // Автоматический расчет скидки
                                          if (newOldPrice && newOldPrice > c.price) {
                                            updatedColor.discount = Math.round(((newOldPrice - c.price) / newOldPrice) * 100);
                                          } else {
                                            updatedColor.discount = null;
                                          }
                                          return updatedColor;
                                        }
                                        return c;
                                      })
                                    }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Скидка (автоматически %)</label>
                                <input
                                  type="number"
                                  placeholder="Скидка %"
                                  value={color.discount || ""}
                                  onChange={(e) => {
                                    const newDiscount = e.target.value ? parseFloat(e.target.value) : null;
                                    setEditForm(prev => ({
                                      ...prev,
                                      colors: prev.colors.map((c, i) => {
                                        if (i === index) {
                                          const updatedColor = { ...c, discount: newDiscount };
                                          // Автоматический расчет старой цены если есть скидка
                                          if (newDiscount && newDiscount > 0 && c.price > 0) {
                                            updatedColor.oldPrice = Math.round(c.price / (1 - newDiscount / 100));
                                          }
                                          return updatedColor;
                                        }
                                        return c;
                                      })
                                    }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Статус ХИТ</label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={color.hit || false}
                                    onChange={(e) => {
                                      setEditForm(prev => ({
                                        ...prev,
                                        colors: prev.colors.map((c, i) => 
                                          i === index ? { ...c, hit: e.target.checked } : c
                                        )
                                      }));
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className={`text-sm font-medium ${color.hit ? 'text-red-600' : 'text-gray-600'}`}>
                                    🔥 ХИТ цвет
                                  </span>
                                </label>
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditForm(prev => ({
                                      ...prev,
                                      colors: prev.colors.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="w-full px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50"
                                >
                                  Удалить цвет
                                </button>
                              </div>
                            </div>
                            {color.discount && color.oldPrice && (
                              <div className="mt-2 text-sm text-green-600">
                                ✓ Скидка {color.discount}%: {color.oldPrice}₽ → {color.price}₽
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {editForm.colors.length === 0 && (
                          <p className="text-gray-500 text-sm italic">
                            Нет цветов. Нажмите "Добавить цвет" чтобы создать новый вариант.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Дополнительные характеристики */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Дополнительные характеристики
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            customOptions: [...prev.customOptions, { key: "", value: "" }]
                          }));
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        + Добавить
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {editForm.customOptions.map((char, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Название характеристики"
                            value={char.key}
                            onChange={(e) => {
                              setEditForm(prev => {
                                const newChars = [...prev.customOptions];
                                newChars[index] = { ...newChars[index], key: e.target.value };
                                return { ...prev, customOptions: newChars };
                              });
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Значение"
                            value={char.value}
                            onChange={(e) => {
                              setEditForm(prev => {
                                const newChars = [...prev.customOptions];
                                newChars[index] = { ...newChars[index], value: e.target.value };
                                return { ...prev, customOptions: newChars };
                              });
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditForm(prev => ({
                                ...prev,
                                customOptions: prev.customOptions.filter((_, i) => i !== index)
                              }));
                            }}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {editForm.customOptions.length === 0 && (
                        <p className="text-gray-500 text-sm italic">
                          Нет характеристик. Нажмите "Добавить" чтобы создать новую.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SEOFields Form */}
                {(editingMonument || addingMonument) && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">SEO Данные</h3>
                    <SeoFieldsForm
                      entityType="monuments"
                      categoryName={monumentCategories.find(c => c.key === selectedCategory)?.title || "Памятники"}
                      initialData={{
                        seoTitle: editForm.seo_title,
                        seoDescription: editForm.seo_description,
                        seoKeywords: editForm.seo_keywords,
                        ogImage: editForm.og_image,
                      }}
                      onChange={(data) => {
                        // Синхронизируем SEO значения в editForm при создании/редактировании
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
                    onClick={saveProduct}
                    disabled={loading || !editForm.name.trim() || (nameCheckResult.checked && !nameCheckResult.isUnique)}
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
  );
}