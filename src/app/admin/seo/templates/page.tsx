'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api';

interface SeoTemplate {
  id: number;
  categoryKey: string;
  categoryName: string;
  entityType: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  categoryKey: string;
  categoryName: string;
  entityType: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

const ENTITY_TYPES = [
  { value: 'monuments', label: 'Памятники' },
  { value: 'fences', label: 'Ограды' },
  { value: 'accessories', label: 'Аксессуары' },
  { value: 'landscape', label: 'Благоустройство' },
  { value: 'campaigns', label: 'Акции' },
  { value: 'blogs', label: 'Блог' },
];

const MONUMENT_CATEGORIES = [
  { key: 'single', name: 'Одиночные' },
  { key: 'double', name: 'Двойные' },
  { key: 'cheap', name: 'Недорогие' },
  { key: 'cross', name: 'В виде креста' },
  { key: 'heart', name: 'В виде сердца' },
  { key: 'composite', name: 'Составные' },
  { key: 'europe', name: 'Европейские' },
  { key: 'artistic', name: 'Художественная резка' },
  { key: 'tree', name: 'В виде деревьев' },
  { key: 'complex', name: 'Мемориальные комплексы' },
];

const FENCE_CATEGORIES = [
  { key: 'granite', name: 'Гранитные' },
  { key: 'polymer', name: 'Полимерные' },
  { key: 'metal', name: 'Из металла' },
];

const ACCESSORY_CATEGORIES = [
  { key: 'vases', name: 'Вазы' },
  { key: 'lamps', name: 'Лампады' },
  { key: 'sculptures', name: 'Скульптуры' },
  { key: 'frames', name: 'Рамки' },
  { key: 'bronze', name: 'Бронза' },
  { key: 'plates', name: 'Таблички' },
];

const LANDSCAPE_CATEGORIES = [
  { key: 'tables', name: 'Столы' },
  { key: 'gravel', name: 'Щебень' },
  { key: 'artificial_grass', name: 'Искусственный газон' },
];

const getCategoriesForEntity = (entityType: string) => {
  switch (entityType) {
    case 'monuments':
      return MONUMENT_CATEGORIES;
    case 'fences':
      return FENCE_CATEGORIES;
    case 'accessories':
      return ACCESSORY_CATEGORIES;
    case 'landscape':
      return LANDSCAPE_CATEGORIES;
    case 'campaigns':
      return [{ key: 'campaigns', name: 'Акции (без категорий)' }];
    case 'blogs':
      return [{ key: 'blogs', name: 'Блоги (без категорий)' }];
    default:
      return [];
  }
};

const isCategoryRequired = (entityType: string) => {
  return entityType !== 'campaigns' && entityType !== 'blogs';
};

export default function SeoTemplatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [templates, setTemplates] = useState<SeoTemplate[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('monuments');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    categoryKey: '',
    categoryName: '',
    entityType: 'monuments',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
  });

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

      // Проверяем доступ
      if (userData.role !== 'superadmin') {
        setCheckingAuth(false);
        setError('У вас нет доступа к SEO разделу. Только superadmin может управлять SEO.');
        setTimeout(() => router.push('/admin'), 2000);
        return;
      }

      setCheckingAuth(false);
      loadTemplates();
    } catch (e) {
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

  if (error && user?.role !== 'superadmin') {
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

  // Закрытие формы при смене типа сущности
  useEffect(() => {
    if (isFormOpen) {
      setIsFormOpen(false);
    }
  }, [selectedEntityType]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/admin/seo-templates`);
      if (!response.ok) throw new Error('Failed to load templates');
      const result = await response.json();
      setTemplates(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => t.entityType === selectedEntityType);

  const handleEdit = (template: SeoTemplate) => {
    setFormData({
      categoryKey: template.categoryKey,
      categoryName: template.categoryName,
      entityType: template.entityType,
      seoTitle: template.seoTitle || '',
      seoDescription: template.seoDescription || '',
      seoKeywords: template.seoKeywords || '',
      ogImage: template.ogImage || '',
    });
    setEditingId(template.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/seo-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (isCategoryRequired(formData.entityType) && (!formData.categoryKey || !formData.categoryName)) {
      setError('Категория обязательна');
      return;
    }
    if (!formData.categoryKey || !formData.categoryName) {
      setError('Категория обязательна');
      return;
    }
    if (formData.seoTitle.length > 255) {
      setError('Заголовок SEO не должен превышать 255 символов');
      return;
    }
    if (formData.seoDescription.length > 500) {
      setError('Описание SEO не должно превышать 500 символов');
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/admin/seo-templates/${editingId}`
        : `${API_URL}/admin/seo-templates`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save template');
      }

      await loadTemplates();
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        categoryKey: '',
        categoryName: '',
        entityType: 'monuments',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        ogImage: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleAddNew = () => {
    const categories = getCategoriesForEntity(selectedEntityType);
    const defaultCategory = categories.length > 0 ? categories[0] : { key: '', name: '' };
    
    setFormData({
      categoryKey: defaultCategory.key,
      categoryName: defaultCategory.name,
      entityType: selectedEntityType,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      ogImage: '',
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const categories = getCategoriesForEntity(selectedEntityType);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Управление SEO шаблонами</h1>
        <p className="text-gray-600">Создавайте и редактируйте SEO шаблоны для категорий товаров</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Типы сущностей</h3>
          <div className="space-y-2">
            {ENTITY_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedEntityType(type.value)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedEntityType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {ENTITY_TYPES.find(t => t.value === selectedEntityType)?.label}
            </h2>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              + Добавить шаблон
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-600">Загрузка...</div>
          ) : isFormOpen ? (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {editingId ? 'Редактировать' : 'Создать'} шаблон
              </h3>

              {/* Category Select */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория {isCategoryRequired(formData.entityType) ? '*' : '(опционально)'}
                </label>
                <select
                  value={formData.categoryKey}
                  onChange={e => {
                    const selected = categories.find(c => c.key === e.target.value);
                    setFormData({
                      ...formData,
                      categoryKey: e.target.value,
                      categoryName: selected?.name || '',
                    });
                  }}
                  required={isCategoryRequired(formData.entityType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SEO Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Заголовок ({formData.seoTitle.length}/255)
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={formData.seoTitle}
                  onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Оптимальная длина: 50-60 символов"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500">Не более 255 символов</p>
              </div>

              {/* SEO Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Описание ({formData.seoDescription.length}/500)
                </label>
                <textarea
                  maxLength={500}
                  value={formData.seoDescription}
                  onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Оптимальная длина: 150-160 символов"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500">Не более 500 символов</p>
              </div>

              {/* SEO Keywords */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Ключевые слова</label>
                <textarea
                  maxLength={500}
                  value={formData.seoKeywords}
                  onChange={e => setFormData({ ...formData, seoKeywords: e.target.value })}
                  placeholder="Ключевые слова через запятую"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              {/* OG Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">OG Image URL</label>
                <input
                  type="url"
                  value={formData.ogImage}
                  onChange={e => setFormData({ ...formData, ogImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Обновить' : 'Создать'} шаблон
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-md font-medium hover:bg-gray-400 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-lg">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600 mb-4">Нет шаблонов для этого типа</p>
                  <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Создать первый шаблон
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                      {/* Card Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900">{template.categoryName}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(template)}
                            className="text-lg hover:scale-125 transition-transform"
                            title="Редактировать"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="text-lg hover:scale-125 transition-transform"
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="px-4 py-3 max-h-64 overflow-y-auto">
                        {template.seoTitle && (
                          <div className="mb-3 pb-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Title</p>
                            <p className="text-sm text-gray-800">{template.seoTitle}</p>
                          </div>
                        )}
                        {template.seoDescription && (
                          <div className="mb-3 pb-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                            <p className="text-sm text-gray-800 line-clamp-2">{template.seoDescription}</p>
                          </div>
                        )}
                        {template.seoKeywords && (
                          <div className="mb-3 pb-3 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Keywords</p>
                            <p className="text-sm text-gray-800 line-clamp-2">{template.seoKeywords}</p>
                          </div>
                        )}
                        {template.ogImage && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">OG Image</p>
                            <p className="text-xs text-blue-600 break-all font-mono">{template.ogImage}</p>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Обновлено: {new Date(template.updatedAt || '').toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
