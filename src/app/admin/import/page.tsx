"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface ImportResult {
  backupTableName: string;
  tableName: string;
  totalProcessed: number;
  created: number;
  updated: number;
  errors?: string[];
}

export default function MonumentsImportPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [category, setCategory] = useState<string>("single");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const categories = [
    { value: "single", label: "Одиночные памятники" },
    { value: "double", label: "Двойные памятники" },
    { value: "exclusive", label: "Эксклюзивные памятники" },
    { value: "composite", label: "Составные памятники" },
  ];

  // Проверка доступа
  useEffect(() => {
    const userStr = localStorage.getItem("adminUser");
    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setCheckingAuth(false);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Проверяем расширение файла
      const validExtensions = [".xlsx", ".xls"];
      const fileName = selectedFile.name.toLowerCase();
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        setError("Пожалуйста, выберите файл Excel (.xlsx или .xls)");
        setFile(null);
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Размер файла не должен превышать 10 МБ");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Пожалуйста, выберите файл для импорта");
      return;
    }

    if (!category) {
      setError("Пожалуйста, выберите категорию памятников");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setResult(null);

    try {
      // Получаем токен авторизации (в production используйте более безопасный метод)
      const token = "demo-token"; // В production используйте sessionStorage или другой метод

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch("/api/admin/monuments-import", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при импорте");
      }

      if (data.success) {
        setResult(data.data);
        setSuccess(`✓ Импорт завершен успешно!`);
        setFile(null);
        
        // Очищаем форму через 3 секунды
        setTimeout(() => {
          setFile(null);
          document.querySelectorAll('input[type="file"]').forEach(input => {
            (input as HTMLInputElement).value = '';
          });
        }, 500);
      } else {
        setError(data.error || "Ошибка при импорте");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка при импорте памятников");
      console.error("Import error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Проверка доступа...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-black space-y-8">
        {/* Заголовок */}
        <div>
          <h1 className="text-3xl font-bold mb-2">📥 Импорт памятников</h1>
          <p className="text-gray-600">
            Загрузите файл Excel с данными памятников для импорта в базу данных
          </p>
        </div>

        {/* Предупреждение */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Важная информация перед импортом
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>
                  Перед импортом будет создан <strong>автоматический бэкап</strong> таблицы
                </li>
                <li>
                  Памятники с одинаковым <strong>slug или названием</strong> будут обновлены
                </li>
                <li>
                  Новые памятники будут добавлены в базу
                </li>
                <li>
                  Убедитесь, что выбрали <strong>правильную категорию</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Форма импорта */}
        <form onSubmit={handleImport} className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
          {/* Выбор категории */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              1️⃣ Выберите категорию памятников
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Выбор файла */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              2️⃣ Загрузите файл Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                disabled={loading}
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-700 font-medium mb-1">
                  {file ? file.name : "Выберите файл или перетащите его сюда"}
                </p>
                <p className="text-sm text-gray-500">
                  Поддерживаемые форматы: .xlsx, .xls (максимум 10 МБ)
                </p>
              </label>
            </div>
            {file && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Выбран файл: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} КБ)
                </p>
              </div>
            )}
          </div>

          {/* Сообщения об ошибках */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">❌ {error}</p>
            </div>
          )}

          {/* Успешный результат импорта */}
          {result && success && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-3">✅ {success}</p>
                
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Таблица:</span>
                    <strong>{result.tableName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>📊 Всего обработано:</span>
                    <strong>{result.totalProcessed}</strong>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>✨ Создано новых:</span>
                    <strong className="text-green-600">{result.created}</strong>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>📝 Обновлено:</span>
                    <strong className="text-blue-600">{result.updated}</strong>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span>💾 Бэкап таблицы:</span>
                      <code className="bg-green-100 px-2 py-1 rounded text-xs font-mono">
                        {result.backupTableName}
                      </code>
                    </div>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="font-medium text-yellow-800 mb-2">⚠️ Ошибки в строках:</p>
                    <div className="bg-yellow-50 rounded p-2 max-h-40 overflow-y-auto">
                      {result.errors.slice(0, 10).map((err, idx) => (
                        <p key={idx} className="text-xs text-yellow-700 mb-1">
                          • {err}
                        </p>
                      ))}
                      {result.errors.length > 10 && (
                        <p className="text-xs text-yellow-700 font-medium">
                          ... и ещё {result.errors.length - 10} ошибок
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Кнопка отправки */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !file}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                loading || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Импортирование...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Начать импорт
                </>
              )}
            </button>

            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  document.querySelectorAll('input[type="file"]').forEach(input => {
                    (input as HTMLInputElement).value = '';
                  });
                }}
                disabled={loading}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50"
              >
                Отменить
              </button>
            )}
          </div>
        </form>

        {/* Справка по формату файла */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">📋 Требования к файлу Excel</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">Обязательные колонки:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="bg-blue-100 px-1 rounded">Название</code> - название памятника (обязательно)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Опциональные колонки:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="bg-blue-100 px-1 rounded">Цена</code> - числовое значение (руб.)</li>
                <li><code className="bg-blue-100 px-1 rounded">Старая цена</code> - для скидок</li>
                <li><code className="bg-blue-100 px-1 rounded">Скидка</code> - процент скидки</li>
                <li><code className="bg-blue-100 px-1 rounded">Высота</code> - высота памятника</li>
                <li><code className="bg-blue-100 px-1 rounded">Изображение</code> - путь к изображению</li>
                <li><code className="bg-blue-100 px-1 rounded">Описание</code> - краткое описание</li>
                <li><code className="bg-blue-100 px-1 rounded">Категория</code> - категория памятника</li>
              </ul>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded">
              <p className="font-medium">💡 Совет:</p>
              <p className="mt-1">
                Памятники с одинаковым названием или slug будут <strong>обновлены</strong> вместо добавления дубликатов.
                Это защищает от случайного дублирования при повторном импорте.
              </p>
            </div>
          </div>
        </div>

        {/* Примеры файлов */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-4">📥 Примеры файлов для скачивания</h2>
          <p className="text-sm text-green-800 mb-4">
            Скачайте пример Excel файла для нужной категории, отредактируйте данные и загрузите обратно
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="/import-examples/single-monuments.xlsx"
              download="single-monuments.xlsx"
              className="flex items-center gap-2 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-100 transition-colors text-green-700 font-medium"
            >
              <span>📥</span>
              <span>Одиночные памятники</span>
              <span className="text-xs ml-auto text-gray-600">(59 шт)</span>
            </a>
            <a
              href="/import-examples/double-monuments.xlsx"
              download="double-monuments.xlsx"
              className="flex items-center gap-2 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-100 transition-colors text-green-700 font-medium"
            >
              <span>📥</span>
              <span>Двойные памятники</span>
              <span className="text-xs ml-auto text-gray-600">(32 шт)</span>
            </a>
            <a
              href="/import-examples/composite-monuments.xlsx"
              download="composite-monuments.xlsx"
              className="flex items-center gap-2 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-100 transition-colors text-green-700 font-medium"
            >
              <span>📥</span>
              <span>Составные памятники</span>
              <span className="text-xs ml-auto text-gray-600">(106 шт)</span>
            </a>
            <a
              href="/import-examples/exclusive-monuments.xlsx"
              download="exclusive-monuments.xlsx"
              className="flex items-center gap-2 p-3 bg-white border border-green-300 rounded-lg hover:bg-green-100 transition-colors text-green-700 font-medium"
            >
              <span>📥</span>
              <span>Эксклюзивные памятники</span>
              <span className="text-xs ml-auto text-gray-600">(49 шт)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
