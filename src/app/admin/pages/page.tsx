"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface PageBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'quote';
  content: any;
}

interface PageDescription {
  id?: number;
  pageSlug: string;
  pageTitle: string;
  blocks: PageBlock[];
  createdAt?: string;
  updatedAt?: string;
}

// Доступные страницы для редактирования описаний
const AVAILABLE_PAGES = [
  // Памятники
  { slug: 'monuments-catalog', title: 'Главный каталог памятников' },
  { slug: 'monuments-single', title: 'Одиночные памятники' },
  { slug: 'monuments-double', title: 'Двойные памятники' },
  { slug: 'monuments-exclusive', title: 'Эксклюзивные памятники' },
  { slug: 'monuments-cheap', title: 'Недорогие памятники' },
  { slug: 'monuments-composite', title: 'Составные памятники' },
  { slug: 'monuments-cross', title: 'В виде креста' },
  { slug: 'monuments-heart', title: 'В виде сердца' },
  { slug: 'monuments-europe', title: 'Европейские' },
  { slug: 'monuments-artistic', title: 'Художественная резка' },
  { slug: 'monuments-tree', title: 'В виде деревьев' },
  { slug: 'monuments-complex', title: 'Мемориальные комплексы' },
  // Ограды
  { slug: 'fences-catalog', title: 'Главный каталог оград' },
  { slug: 'fences-granite', title: 'Гранитные ограды' },
  { slug: 'fences-polymer', title: 'Ограды с полимерным покрытием' },
  { slug: 'fences-metal', title: 'Металлические ограды' },
  // Прочие страницы
  { slug: 'discount', title: 'Товары на скидке' },
  { slug: 'sales', title: 'Акции' },
  { slug: 'blogs', title: 'Блоги' },
  { slug: 'granite', title: 'Гранит' },
  { slug: 'favorites', title: 'Избранное' },
  { slug: 'payment', title: 'Оплата' },
  { slug: 'design', title: 'Оформление памятников' },
  { slug: 'design-portrait', title: 'Оформление памятников - Портреты' },
  { slug: 'design-medallions', title: 'Оформление памятников - Медальоны' },
  { slug: 'design-text-engraving', title: 'Оформление памятников - Текстовая гравировка' },
  { slug: 'design-epitaphs', title: 'Эпитафии' },
  { slug: 'services', title: 'Услуги' },
  { slug: 'services-monument-installation', title: 'Услуги - Установка памятников' },
  { slug: 'services-fence-installation', title: 'Услуги - Установка оград' },
  { slug: 'services-monument-production', title: 'Услуги - Производство памятников' },
  { slug: 'services-monument-dismantle', title: 'Услуги - Демонтаж памятников' },
  { slug: 'services-3d', title: 'Услуги - 3D визуализация' },
  { slug: 'landscape', title: 'Благоустройство' },
  { slug: 'landscape-foundation', title: 'Благоустройство - Основание' },
  { slug: 'landscape-graves', title: 'Благоустройство - Захоронения' },
  { slug: 'landscape-tiles', title: 'Благоустройство - Укладка плитки' },
  { slug: 'landscape-gravel', title: 'Благоустройство - Щебень' },
  { slug: 'landscape-lawn', title: 'Благоустройство - Газон' },
  { slug: 'accessories', title: 'Аксессуары' },
  { slug: 'accessories-vases', title: 'Аксессуары - Вазы' },
  { slug: 'accessories-lamps', title: 'Аксессуары - Лампады' },
  { slug: 'accessories-sculptures', title: 'Аксессуары - Скульптуры' },
  { slug: 'accessories-frames', title: 'Аксессуары - Рамки' },
  { slug: 'accessories-bronze', title: 'Аксессуары - Бронза' },
  { slug: 'accessories-plates', title: 'Аксессуары - Плиты' },
  { slug: 'accessories-tables', title: 'Аксессуары - Столики' },
  // Почему нам доверяют
  { slug: 'why-granite', title: 'Работаем более чем с 30 породами гранита' },
  { slug: 'why-contract', title: 'Работаем строго по договору' },
  { slug: 'why-payment', title: 'Предоставляем разные варианты оплаты' },
  { slug: 'why-report', title: 'Предоставляем фото и видео отчёт' },
  { slug: 'why-quality', title: 'Гарантируем качество работ' },
  { slug: 'why-experience', title: 'Опыт работы более 30 лет' },
];

export default function PagesAdminPage() {
  const [pageDescriptions, setPageDescriptions] = useState<PageDescription[]>([]);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("");
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetchPageDescriptions();
    fetchAvailableImages();
  }, []);

  const fetchPageDescriptions = async () => {
    try {
      const data = await apiClient.get("/admin/page-descriptions");
      if (data.success) {
        setPageDescriptions(data.data || []);
      }
    } catch (err: any) {
      console.error("Ошибка загрузки описаний страниц:", err);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=pages");
      if (data.success) {
        setAvailableImages(data.data || []);
      }
    } catch (err) {
      console.error("Ошибка загрузки изображений:", err);
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
      formData.append("folder", "pages");

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api') + "/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        await fetchAvailableImages();
        setSuccess("✓ Изображение загружено");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setUploadError(data.error || "Ошибка загрузки");
      }
    } catch (err) {
      setUploadError("Ошибка загрузки файла");
    } finally {
      setUploading(false);
    }
  };

  const generateBlockId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addBlock = (type: PageBlock['type']) => {
    const newBlock: PageBlock = {
      id: generateBlockId(),
      type,
      content: getDefaultContent(type)
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: PageBlock['type']) => {
    switch (type) {
      case 'heading':
        return { text: '', level: 2 };
      case 'paragraph':
        return { text: '' };
      case 'list':
        return { items: [''], type: 'unordered' };
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'quote':
        return { text: '', author: '' };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, newContent: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, content: { ...block.content, ...newContent } }
        : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === blockId);
    if (index === -1) return;

    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    }
    setBlocks(newBlocks);
  };

  const loadPageDescription = async (pageSlug: string) => {
    const existingDescription = pageDescriptions.find(pd => pd.pageSlug === pageSlug);
    if (existingDescription) {
      setBlocks(existingDescription.blocks || []);
      setEditingId(existingDescription.id || null);
    } else {
      setBlocks([]);
      setEditingId(null);
    }
  };

  const handlePageSelect = (pageSlug: string) => {
    setSelectedPageSlug(pageSlug);
    loadPageDescription(pageSlug);
  };

  const handleSubmit = async () => {
    if (!selectedPageSlug) {
      setError("Выберите страницу");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selectedPage = AVAILABLE_PAGES.find(p => p.slug === selectedPageSlug);
      const body = {
        pageSlug: selectedPageSlug,
        pageTitle: selectedPage?.title || selectedPageSlug,
        blocks: blocks
      };

      let data;
      if (editingId) {
        data = await apiClient.put(`/admin/page-descriptions/${editingId}`, body);
      } else {
        data = await apiClient.post("/admin/page-descriptions", body);
      }

      if (data.success) {
        setSuccess("✓ Описание страницы сохранено");
        await fetchPageDescriptions();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при сохранении");
      }
    } catch (err: any) {
      setError("Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBlockEditor = (block: PageBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-3">
            <select
              value={block.content.level || 2}
              onChange={(e) => updateBlock(block.id, { level: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded text-black bg-white"
            >
              <option value={2}>H2 - Заголовок</option>
              <option value={3}>H3 - Подзаголовок</option>
              <option value={4}>H4 - Малый заголовок</option>
            </select>
            <input
              type="text"
              value={block.content.text || ''}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              placeholder="Текст заголовка"
              className="w-full px-3 py-2 border rounded text-black bg-white"
            />
          </div>
        );

      case 'paragraph':
        return (
          <textarea
            value={block.content.text || ''}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="Введите текст параграфа..."
            rows={4}
            className="w-full px-3 py-2 border rounded text-black bg-white"
          />
        );

      case 'list':
        return (
          <div className="space-y-3">
            <select
              value={block.content.type || 'unordered'}
              onChange={(e) => updateBlock(block.id, { type: e.target.value })}
              className="px-3 py-2 border rounded text-black bg-white"
            >
              <option value="unordered">Маркированный список</option>
              <option value="ordered">Нумерованный список</option>
            </select>
            <div className="space-y-2">
              {(block.content.items || ['']).map((item: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.content.items || [''])];
                      newItems[index] = e.target.value;
                      updateBlock(block.id, { items: newItems });
                    }}
                    placeholder={`Пункт ${index + 1}`}
                    className="flex-1 px-3 py-2 border rounded text-black bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = (block.content.items || ['']).filter((_: any, i: number) => i !== index);
                      updateBlock(block.id, { items: newItems.length ? newItems : [''] });
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
                  const newItems = [...(block.content.items || ['']), ''];
                  updateBlock(block.id, { items: newItems });
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Добавить пункт
              </button>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Выберите изображение:</label>
              <select
                value={block.content.src || ''}
                onChange={(e) => updateBlock(block.id, { src: e.target.value })}
                className="w-full px-3 py-2 border rounded text-black bg-white"
              >
                <option value="">-- Выберите изображение --</option>
                {availableImages.map((imgPath) => (
                  <option key={imgPath} value={imgPath}>
                    {imgPath.split("/").pop()}
                  </option>
                ))}
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Alt текст"
              value={block.content.alt || ''}
              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
              className="w-full px-3 py-2 border rounded text-black bg-white"
            />
            <input
              type="text"
              placeholder="Подпись (опционально)"
              value={block.content.caption || ''}
              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
              className="w-full px-3 py-2 border rounded text-black bg-white"
            />
            {block.content.src && (
              <div className="mt-3">
                <img src={block.content.src} alt="Preview" className="h-32 w-auto object-cover rounded border" />
              </div>
            )}
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-3">
            <textarea
              value={block.content.text || ''}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              placeholder="Текст цитаты..."
              rows={3}
              className="w-full px-3 py-2 border rounded text-black bg-white"
            />
            <input
              type="text"
              placeholder="Автор цитаты (опционально)"
              value={block.content.author || ''}
              onChange={(e) => updateBlock(block.id, { author: e.target.value })}
              className="w-full px-3 py-2 border rounded text-black bg-white"
            />
          </div>
        );

      default:
        return <div>Неизвестный тип блока</div>;
    }
  };

  const getBlockTypeLabel = (type: PageBlock['type']) => {
    const labels = {
      heading: 'Заголовок',
      paragraph: 'Текст',
      list: 'Список',
      image: 'Изображение',
      quote: 'Цитата'
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление описаниями страниц</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Выбор страницы */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4 text-black">Выберите страницу</h2>
              
              <select
                value={selectedPageSlug}
                onChange={(e) => handlePageSelect(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-4 text-black bg-white"
              >
                <option value="">-- Выберите страницу --</option>
                {AVAILABLE_PAGES.map((page) => (
                  <option key={page.slug} value={page.slug}>
                    {page.title}
                  </option>
                ))}
              </select>

              {selectedPageSlug && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Загрузить изображение:</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="flex-1 px-3 py-2 border rounded text-black bg-white"
                    />
                    {uploading && <span className="text-sm text-gray-600">Загрузка...</span>}
                  </div>
                  {uploadError && (
                    <div className="text-sm text-red-600">{uploadError}</div>
                  )}

                  <h3 className="font-medium text-gray-700 mt-4">Добавить блок:</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => addBlock('heading')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      + Заголовок
                    </button>
                    <button
                      onClick={() => addBlock('paragraph')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      + Текст
                    </button>
                    <button
                      onClick={() => addBlock('list')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      + Список
                    </button>
                    <button
                      onClick={() => addBlock('image')}
                      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      + Изображение
                    </button>
                    <button
                      onClick={() => addBlock('quote')}
                      className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                      + Цитата
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Редактор блоков */}
          <div className="lg:col-span-2">
            {selectedPageSlug ? (
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Редактор: {AVAILABLE_PAGES.find(p => p.slug === selectedPageSlug)?.title}
                  </h2>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>

                <div className="space-y-6">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-700">
                          {getBlockTypeLabel(block.type)} #{index + 1}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveBlock(block.id, 'up')}
                            disabled={index === 0}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveBlock(block.id, 'down')}
                            disabled={index === blocks.length - 1}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {renderBlockEditor(block)}
                    </div>
                  ))}

                  {blocks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Нет блоков. Добавьте блоки с помощью кнопок слева.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
                Выберите страницу для редактирования описания
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}