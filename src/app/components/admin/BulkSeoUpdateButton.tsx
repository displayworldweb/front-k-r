'use client';

import { useState } from 'react';

interface UpdateStats {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface PreviewData {
  templateName: string;
  entityType: string;
  categoryKey: string;
  totalInCategory: number;
  withoutSeo: number;
  willBeUpdated: number;
  template: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords?: string;
    ogImage?: string;
  };
}

interface BulkSeoUpdateButtonProps {
  entityType: string;
  categoryKey: string;
  categoryName?: string;
  onSuccess?: (stats: UpdateStats) => void;
  className?: string;
}

export function BulkSeoUpdateButton({
  entityType,
  categoryKey,
  categoryName,
  onSuccess,
  className = '',
}: BulkSeoUpdateButtonProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api';
  
  const [isChecking, setIsChecking] = useState(false);
  const [hasTemplate, setHasTemplate] = useState<boolean | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UpdateStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(false);

  // Проверить наличие шаблона
  const checkTemplate = async () => {
    if (hasTemplate !== null) return hasTemplate;
    
    setIsChecking(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/bulk-seo/check-template/${entityType}/${categoryKey}`
      );
      const data = await response.json();
      setHasTemplate(data.hasTemplate);
      return data.hasTemplate;
    } catch (err) {
      console.error('Ошибка проверки шаблона:', err);
      setHasTemplate(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Загрузить предпросмотр
  const loadPreview = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/bulk-seo/preview/${entityType}/${categoryKey}?forceUpdate=${forceUpdate}`
      );
      const data = await response.json();
      
      if (data.success) {
        setPreview(data.preview);
        setShowPreview(true);
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки предпросмотра');
      }
    } catch (err) {
      setError('Ошибка загрузки предпросмотра');
      console.error(err);
    }
  };

  // Выполнить обновление
  const performUpdate = async () => {
    setIsUpdating(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch(
        `${API_URL}/admin/bulk-seo/update/${entityType}/${categoryKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ forceUpdate }),
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (data.success) {
        setResult(data.stats);
        onSuccess?.(data.stats);
        
        // Закрыть диалог через 3 секунды после успеха
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(data.error || 'Ошибка обновления SEO');
      }
    } catch (err) {
      setError('Ошибка выполнения обновления');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Открыть диалог
  const handleClick = async () => {
    const templateExists = await checkTemplate();
    if (!templateExists) {
      setError('Нет шаблона для данной категории');
      return;
    }
    
    setShowDialog(true);
    await loadPreview();
  };

  // Закрыть диалог
  const handleClose = () => {
    setShowDialog(false);
    setShowPreview(false);
    setPreview(null);
    setResult(null);
    setError(null);
    setForceUpdate(false);
    setProgress(0);
  };

  // Переключить режим обновления
  const handleForceUpdateChange = async (value: boolean) => {
    setForceUpdate(value);
    if (showPreview) {
      await loadPreview();
    }
  };

  if (isChecking) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors ${className}`}
        title="Массовое обновление SEO по шаблону"
      >
        🔄 Обновить SEO
      </button>

      {/* Диалоговое окно */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                🔄 Массовое обновление SEO
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                disabled={isUpdating}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                  ⚠️ {error}
                </div>
              )}

              {/* Preview */}
              {showPreview && preview && !result && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      📋 Информация об обновлении
                    </h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>Категория:</strong> {preview.templateName}</p>
                      <p><strong>Всего товаров в категории:</strong> {preview.totalInCategory}</p>
                      <p><strong>Без SEO:</strong> {preview.withoutSeo}</p>
                      <p className="text-lg font-bold mt-2">
                        <strong>Будет обновлено:</strong> {preview.willBeUpdated} шт.
                      </p>
                    </div>
                  </div>

                  {/* Опция принудительного обновления */}
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceUpdate}
                        onChange={(e) => handleForceUpdateChange(e.target.checked)}
                        disabled={isUpdating}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">
                          Принудительное обновление
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Обновить SEO даже для товаров, у которых оно уже заполнено.
                          Используйте эту опцию для обновления старых шаблонов.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Предпросмотр шаблона */}
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      🎯 Шаблон SEO
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Title:</span>
                        <p className="text-gray-900 mt-1">{preview.template.seoTitle}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="text-gray-900 mt-1">{preview.template.seoDescription}</p>
                      </div>
                      {preview.template.seoKeywords && (
                        <div>
                          <span className="font-medium text-gray-700">Keywords:</span>
                          <p className="text-gray-900 mt-1">{preview.template.seoKeywords}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Предупреждение */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Это действие обновит SEO данные для {preview.willBeUpdated} товаров.
                      {forceUpdate && ' Текущие SEO данные будут заменены шаблоном.'}
                      {' '}Операция необратима.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress */}
              {isUpdating && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-700 font-medium">
                      Обновление SEO данных...
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-600 h-3 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    {progress}% завершено
                  </p>
                </div>
              )}

              {/* Result */}
              {result && !isUpdating && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      ✅ Обновление завершено
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Всего обработано:</span>
                        <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Обновлено:</span>
                        <p className="text-2xl font-bold text-green-600">{result.updated}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Пропущено:</span>
                        <p className="text-2xl font-bold text-gray-600">{result.skipped}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Ошибок:</span>
                        <p className="text-2xl font-bold text-red-600">{result.errors}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Окно закроется автоматически через 3 секунды...
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!result && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  disabled={isUpdating}
                >
                  Отмена
                </button>
                <button
                  onClick={performUpdate}
                  disabled={isUpdating || !preview}
                  className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Обновление...' : 'Обновить SEO'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
