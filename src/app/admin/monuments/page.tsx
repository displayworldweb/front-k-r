"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { generateSlug } from "@/lib/slug-generator";

interface Product {
  id: number;
  slug: string;
  name: string;
  height?: string;
  price?: string;
  oldPrice?: string;
  discount?: string;
  category: string;
  image: string;
  colors?: string;
  options?: string;
  hit: boolean;
  popular: boolean;
  createdAt: string;
}

interface MonumentCategory {
  key: string;
  title: string;
  description: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    category: "",
    image: "",
    options: "",
  });

  // Категории памятников
  const monumentCategories: MonumentCategory[] = [
    { key: "single", title: "Одиночные памятники", description: "Памятники для одного человека" },
    { key: "double", title: "Двойные памятники", description: "Памятники для двух человек" },
    { key: "cheap", title: "Недорогие памятники", description: "Доступные варианты памятников" },
    { key: "cross", title: "Памятники в виде креста", description: "Памятники крестообразной формы" },
    { key: "heart", title: "Памятники в виде сердца", description: "Памятники сердцевидной формы" },
    { key: "composite", title: "Составные памятники", description: "Многокомпонентные памятники" },
    { key: "europe", title: "Европейские памятники", description: "Памятники в европейском стиле" },
    { key: "artistic", title: "Художественная резка", description: "Памятники с художественной резьбой" },
    { key: "tree", title: "Памятники в виде деревьев", description: "Памятники древовидной формы" },
    { key: "complex", title: "Мемориальные комплексы", description: "Комплексные мемориальные сооружения" },
    { key: "exclusive", title: "Эксклюзивные памятники", description: "Эксклюзивные и премиальные памятники" },
  ];

  const fetchProducts = async (category: string) => {
    if (!category) return;
    
    try {
      setLoading(true);
      const data = await apiClient.get(`/admin/monuments?category=${category}`);
      
      if (data.success) {
        setProducts(data.products);
        setError("");
      } else {
        setError(data.error || "Ошибка при загрузке памятников");
        setProducts([]);
      }
    } catch (error) {
      setError("Ошибка при загрузке памятников");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (id: number, hit?: boolean, popular?: boolean) => {
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
          category: selectedCategory,
        });
      if (data.success) {
        setSuccess("✓ Статус памятника обновлен");
        await fetchProducts(selectedCategory);
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
    setProducts([]);
    setError("");
    setSuccess("");
    setEditingProduct(null);
    if (category) {
      fetchProducts(category);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price?.toString() || "",
      oldPrice: product.oldPrice?.toString() || "",
      category: product.category,
      image: product.image,
      options: product.options || "",
    });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setAddingProduct(false);
    setEditForm({
      name: "",
      price: "",
      oldPrice: "",
      category: "",
      image: "",
      options: "",
    });
  };

  const startAdding = () => {
    setAddingProduct(true);
    setEditingProduct(null);
    setEditForm({
      name: "",
      price: "",
      oldPrice: "",
      category: selectedCategory,
      image: "",
      options: "",
    });
  };

  const saveProduct = async () => {
    if (!selectedCategory) return;

    try {
      setLoading(true);
      
      if (editingProduct) {
        // Обновление существующего памятника
        const data = await apiClient.post("/admin/monuments", {
          action: "update_product",
          id: editingProduct.id,
          category: selectedCategory,
          data: {
            name: editForm.name,
            price: editForm.price ? parseFloat(editForm.price) : null,
            oldPrice: editForm.oldPrice ? parseFloat(editForm.oldPrice) : null,
            category: editForm.category,
            image: editForm.image,
            options: editForm.options,
          },
        });
        if (data.success) {
          setSuccess("✓ Памятник успешно обновлен");
          await fetchProducts(selectedCategory);
          cancelEditing();
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Ошибка при обновлении памятника");
        }
      } else {
        // Добавление нового памятника
        const data = await apiClient.post("/admin/monuments", {
          action: "add_product",
          category: selectedCategory,
          data: {
            name: editForm.name,
            slug: generateSlug(editForm.name),
            price: editForm.price ? parseFloat(editForm.price) : null,
            oldPrice: editForm.oldPrice ? parseFloat(editForm.oldPrice) : null,
            category: editForm.category || selectedCategory,
            image: editForm.image,
            options: editForm.options,
          },
        });
        if (data.success) {
          setSuccess("✓ Памятник успешно добавлен");
          await fetchProducts(selectedCategory);
          cancelEditing();
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
        setEditForm({ ...editForm, image: data.data.path });
        setSuccess("✓ Изображение успешно загружено");
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">Всего памятников</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-red-600">{products.filter(p => p.hit).length}</div>
                <div className="text-sm text-gray-600">Хиты продаж</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{products.filter(p => p.popular).length}</div>
                <div className="text-sm text-gray-600">Популярные</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">{products.filter(p => p.hit && p.popular).length}</div>
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
            ) : products.length === 0 ? (
              <p className="text-gray-600">Памятники в данной категории не найдены</p>
            ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white border p-4 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={product.image.startsWith('http') ? product.image : `https://api.k-r.by${product.image}`} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <p className="text-sm text-gray-600">Slug: {product.slug}</p>
                        <p className="text-sm text-gray-600">Категория: {selectedCategory}</p>
                        {product.price && (
                          <p className="text-sm font-medium text-green-600">Цена: {product.price}₽</p>
                        )}
                        {product.height && (
                          <p className="text-sm text-gray-600">Высота: {product.height}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Статус HIT */}
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.hit}
                            onChange={(e) => updateProductStatus(product.id, e.target.checked, undefined)}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <span className={`text-sm font-medium ${product.hit ? 'text-red-600' : 'text-gray-600'}`}>
                            🔥 ХИТ
                          </span>
                        </label>
                      </div>
                      
                      {/* Статус ПОПУЛЯРНЫЙ */}
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.popular}
                            onChange={(e) => updateProductStatus(product.id, undefined, e.target.checked)}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <span className={`text-sm font-medium ${product.popular ? 'text-green-600' : 'text-gray-600'}`}>
                            ⭐ ПОПУЛЯРНЫЙ
                          </span>
                        </label>
                      </div>
                      
                      {/* Кнопка редактирования */}
                      <button
                        onClick={() => startEditing(product)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        ✏️ Редактировать
                      </button>
                      
                      {/* Превью ссылка */}
                      <a
                        href={`/monuments/${selectedCategory}/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        👁️ Просмотр
                      </a>
                    </div>
                  </div>
                  
                  {/* Бейджи статуса */}
                  <div className="mt-3 flex space-x-2">
                    {product.hit && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                        🔥 ХИТ ПРОДАЖ
                      </span>
                    )}
                    {product.popular && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        ⭐ ПОПУЛЯРНЫЙ
                      </span>
                    )}
                    {!product.hit && !product.popular && (
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
        {(editingProduct || addingProduct) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  {editingProduct ? "Редактировать памятник" : "Добавить памятник"}
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

                  {/* Цена */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Цена (руб.)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
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
                        onChange={(e) => setEditForm(prev => ({ ...prev, oldPrice: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
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

                  {/* Изображение */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Изображение
                    </label>
                    
                    {/* URL input */}
                    <input
                      type="url"
                      placeholder="URL изображения"
                      value={editForm.image}
                      onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                    />
                    
                    {/* Загрузка файла */}
                    <div className="border-t pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Или загрузите новое изображение
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
                    
                    {/* Превью */}
                    {editForm.image && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Превью:</p>
                        <img 
                          src={editForm.image.startsWith('http') ? editForm.image : `https://api.k-r.by${editForm.image}`} 
                          alt="Превью" 
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Опции (JSON) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Опции (JSON)
                    </label>
                    <textarea
                      value={editForm.options}
                      onChange={(e) => setEditForm(prev => ({ ...prev, options: e.target.value }))}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder='{"colors": [], "materials": []}'
                    />
                  </div>
                </div>

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
  );
}