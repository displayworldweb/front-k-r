'use client';

import { useState, useEffect } from 'react';

export interface SeoFieldsData {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

interface SeoFieldsFormProps {
  entityType: string;
  categoryName?: string;
  initialData?: SeoFieldsData;
  onSave?: (data: SeoFieldsData) => Promise<void> | void;
  onChange?: (data: SeoFieldsData) => void;  // Синхронизация в реальном времени
  isLoading?: boolean;
  error?: string;
}

/**
 * Переиспользуемый компонент для редактирования SEO полей
 * Используется во всех админ страницах товаров/сущностей
 */
export function SeoFieldsForm({
  entityType,
  categoryName,
  initialData,
  onSave,
  onChange,
  isLoading = false,
  error,
}: SeoFieldsFormProps) {
  const [formData, setFormData] = useState<SeoFieldsData>({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof SeoFieldsData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setLocalError(null);
    // Синхронизируем с родительским компонентом в реальном времени
    onChange?.(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Убедимся, что formData инициализирован
    if (!formData || !formData.seoTitle) {
      setFormData({
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        ogImage: '',
      });
      return;
    }

    // Валидация
    if (formData.seoTitle.length > 255) {
      setLocalError('Заголовок SEO не должен превышать 255 символов');
      return;
    }
    if (formData.seoDescription.length > 500) {
      setLocalError('Описание SEO не должно превышать 500 символов');
      return;
    }

    onSave?.(formData);
  };

  const displayError = error || localError;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        🔍 SEO Оптимизация
        {categoryName && (
          <span className="text-sm font-normal text-gray-600">— {categoryName}</span>
        )}
      </h3>

      {displayError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEO Title */}
        <div>
          <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
            SEO Заголовок ({(formData?.seoTitle || '').length}/255)
          </label>
          <input
            id="seoTitle"
            type="text"
            maxLength={255}
            value={formData?.seoTitle || ''}
            onChange={e => handleChange('seoTitle', e.target.value)}
            placeholder="Оптимальная длина: 50-60 символов"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            💡 Оставьте пусто для использования шаблонного SEO
          </p>
        </div>

        {/* SEO Description */}
        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
            SEO Описание ({(formData?.seoDescription || '').length}/500)
          </label>
          <textarea
            id="seoDescription"
            maxLength={500}
            value={formData?.seoDescription || ''}
            onChange={e => handleChange('seoDescription', e.target.value)}
            placeholder="Оптимальная длина: 150-160 символов"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            💡 Оставьте пусто для использования шаблонного SEO
          </p>
        </div>

        {/* SEO Keywords */}
        <div>
          <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-2">
            SEO Ключевые слова
          </label>
          <textarea
            id="seoKeywords"
            maxLength={500}
            value={formData?.seoKeywords || ''}
            onChange={e => handleChange('seoKeywords', e.target.value)}
            placeholder="Ключевые слова через запятую. Оставьте пусто для использования шаблонного SEO"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* OG Image */}
        <div>
          <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 mb-2">
            OG Image URL
          </label>
          <input
            id="ogImage"
            type="url"
            value={formData?.ogImage || ''}
            onChange={e => handleChange('ogImage', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            💡 Оставьте пусто для использования шаблонного SEO
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить SEO'}
          </button>
        </div>
      </form>
    </div>
  );
}
