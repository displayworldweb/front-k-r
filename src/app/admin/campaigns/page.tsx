'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from "@/lib/api-client";

interface CampaignBlock {
  id: string;
  type: 'text' | 'image' | 'gallery' | 'quote' | 'list';
  content: any;
}

interface Campaign {
  id: number;
  slug: string;
  title: string;
  description?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  images: string[];
  blocks: CampaignBlock[];
  tags: string[];
  products: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminCampaignsNewPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Форма создания кампании
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<CampaignBlock[]>([]);

  // Управление изображениями
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Управление тегами
  const [newTag, setNewTag] = useState('');

  const fetchAvailableImages = async () => {
    try {
      // Предварительный список изображений
      const staticImages = [
        '/promo/1.webp',
        '/promo/2.webp',
        '/promo/3.webp',
        '/campaigns/campaign-1.webp',
        '/campaigns/campaign-2.webp',
        '/campaigns/campaign-3.webp',
      ];
      setAvailableImages(staticImages);
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchAvailableImages();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get('/admin/campaigns?limit=200');
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки кампаний:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'campaigns');

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api') + '/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFeaturedImage(data.data.path);
        await fetchAvailableImages();
      } else {
        setUploadError(data.error || 'Ошибка загрузки');
      }
    } catch (error) {
      setUploadError('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: { [key: string]: string } = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const getDefaultContentForType = (type: CampaignBlock['type']) => {
    switch (type) {
      case 'text':
        return { html: '<p>Введите текст...</p>' };
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'gallery':
        return { images: [], caption: '' };
      case 'quote':
        return { text: '', author: '' };
      case 'list':
        return { ordered: false, items: [''] };
      default:
        return {};
    }
  };

  const addBlock = (type: CampaignBlock['type']) => {
    const newBlock: CampaignBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContentForType(type)
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (blockId: string, newContent: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, content: newContent } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const finalSlug = slug || generateSlug(title);
      
      const body = {
        slug: finalSlug,
        title,
        description,
        content,
        metaTitle,
        metaDescription,
        featuredImage,
        images: [], // Пока оставим пустым
        blocks,
        tags,
        products: [] // Пока оставим пустым
      };

      console.log('Отправляю данные кампании:', body);

      const data = await apiClient.post('/admin/campaigns', body);
      console.log('Ответ сервера:', data);

      if (data.success) {
        setSuccess('✓ Кампания добавлена');
        resetForm();
        await fetchCampaigns();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Ошибка при создании кампании');
        console.error('Campaign creation error:', data);
      }
    } catch (err: any) {
      setError('Ошибка: ' + err.message);
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setContent('');
    setMetaTitle('');
    setMetaDescription('');
    setFeaturedImage('');
    setTags([]);
    setBlocks([]);
  };

  const renderBlockEditor = (block: CampaignBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <textarea
            value={block.content.html || ''}
            onChange={(e) => updateBlock(block.id, { html: e.target.value })}
            placeholder="Введите HTML или простой текст..."
            rows={4}
            className="w-full px-3 py-2 border rounded"
          />
        );
      
      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Выберите изображение:</label>
              <select
                value={block.content.src || ''}
                onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">-- Выберите изображение --</option>
                {availableImages.map((imgPath) => (
                  <option key={imgPath} value={imgPath}>
                    {imgPath.split("/").pop()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Или загрузите новое:</span>
              <input
                type="file"
                accept=".webp,.png,.jpg,.jpeg"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("folder", "campaigns");

                    const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api') + "/upload", {
                      method: "POST",
                      body: formData,
                    });

                    const data = await response.json();
                    if (data.success) {
                      updateBlock(block.id, { ...block.content, src: data.data.path });
                      await fetchAvailableImages();
                    }
                  } catch (err) {
                    console.error('Ошибка загрузки:', err);
                  }
                }}
                className="text-sm"
              />
            </div>
            
            <input
              type="text"
              placeholder="Alt текст"
              value={block.content.alt || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Подпись (опционально)"
              value={block.content.caption || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            {block.content.src && (
              <div className="mt-3">
                <img src={block.content.src} alt="Preview" className="h-32 w-auto object-cover rounded border" />
              </div>
            )}
          </div>
        );
      
      case 'gallery':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Изображения галереи:</label>
              {(block.content.images || []).map((imageSrc: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <select
                    value={imageSrc}
                    onChange={(e) => {
                      const newImages = [...(block.content.images || [])];
                      newImages[index] = e.target.value;
                      updateBlock(block.id, { ...block.content, images: newImages });
                    }}
                    className="flex-1 px-3 py-2 border rounded"
                  >
                    <option value="">-- Выберите изображение --</option>
                    {availableImages.map((imgPath) => (
                      <option key={imgPath} value={imgPath}>
                        {imgPath.split("/").pop()}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = (block.content.images || []).filter((_: string, i: number) => i !== index);
                      updateBlock(block.id, { ...block.content, images: newImages });
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    ×
                  </button>
                  {imageSrc && (
                    <img src={imageSrc} alt="Preview" className="h-12 w-12 object-cover rounded border" />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newImages = [...(block.content.images || []), ''];
                  updateBlock(block.id, { ...block.content, images: newImages });
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                + Добавить изображение
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Или загрузите новые:</span>
              <input
                type="file"
                accept=".webp,.png,.jpg,.jpeg"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  
                  for (const file of files) {
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("folder", "campaigns");

                      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api') + "/upload", {
                        method: "POST",
                        body: formData,
                      });

                      const data = await response.json();
                      if (data.success) {
                        const newImages = [...(block.content.images || []), data.data.path];
                        updateBlock(block.id, { ...block.content, images: newImages });
                      }
                    } catch (err) {
                      console.error('Ошибка загрузки:', err);
                    }
                  }
                  // Обновляем список доступных изображений
                  await fetchAvailableImages();
                }}
                className="text-sm"
              />
            </div>
            
            <input
              type="text"
              placeholder="Подпись к галерее (опционально)"
              value={block.content.caption || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        );
      
      case 'quote':
        return (
          <div className="space-y-2">
            <textarea
              placeholder="Текст цитаты"
              value={block.content.text || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Автор (опционально)"
              value={block.content.author || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, author: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={block.content.ordered || false}
                onChange={(e) => updateBlock(block.id, { ...block.content, ordered: e.target.checked })}
              />
              <span>Нумерованный список</span>
            </label>
            {(block.content.items || ['']).map((item: string, index: number) => (
              <div key={index} className="flex space-x-2">
                <textarea
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(block.content.items || [''])];
                    newItems[index] = e.target.value;
                    updateBlock(block.id, { ...block.content, items: newItems });
                  }}
                  placeholder={`Элемент ${index + 1} (можно использовать HTML для ссылок: <a href="url">текст</a>)`}
                  rows={2}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = (block.content.items || ['']).filter((_: any, i: number) => i !== index);
                    updateBlock(block.id, { ...block.content, items: newItems });
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItems = [...(block.content.items || ['']), ''];
                updateBlock(block.id, { ...block.content, items: newItems });
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              + Добавить элемент
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту кампанию?')) return;

    try {
      const data = await apiClient.delete(`/admin/campaigns/${id}`);
      if (data.success) {
        setSuccess('✓ Кампания удалена');
        await fetchCampaigns();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Ошибка при удалении кампании');
      }
    } catch (error) {
      setError('Ошибка при удалении кампании');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Управление кампаниями</h2>

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

        {/* Форма создания кампании */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded">
          <h3 className="text-lg font-semibold">Создать новую кампанию</h3>
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Основная информация</h3>
            
            <input
              type="text"
              placeholder="Заголовок кампании"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) {
                  setSlug(generateSlug(e.target.value));
                }
              }}
              required
              className="w-full px-4 py-2 border rounded"
            />
            
            <input
              type="text"
              placeholder="Slug (автогенерируется из заголовка)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border rounded text-gray-500"
            />

            <textarea
              placeholder="Описание кампании"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded"
            />

            <textarea
              placeholder="Содержимое кампании"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          {/* SEO */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">SEO настройки</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Meta Title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              <textarea
                placeholder="Meta Description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          {/* Главное изображение */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Главное изображение</h3>
              <div className="space-y-3">
                <select
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="">-- Выберите изображение --</option>
                  {availableImages.map((imgPath) => (
                    <option key={imgPath} value={imgPath}>
                      {imgPath.split("/").pop()}
                    </option>
                  ))}
                </select>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Или загрузите новое:</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".webp,.png,.jpg,.jpeg"
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <span className="text-blue-600">Загрузка...</span>}
                </div>
                {uploadError && <div className="text-red-600 text-sm">{uploadError}</div>}
              </div>
              {featuredImage && (
                <div className="mt-3">
                  <img src={featuredImage} alt="Preview" className="h-24 w-24 object-cover rounded" />
                </div>
              )}
            </div>

          {/* Теги */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Теги</h3>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="Добавить тег..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Добавить
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

          {/* Блоки контента */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Блоки контента</h3>
              
              {/* Кнопки добавления блоков */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => addBlock('text')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  + Текст
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  + Изображение
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('gallery')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  + Галерея
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('quote')}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  + Цитата
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('list')}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  + Список
                </button>
              </div>

              {/* Редакторы блоков */}
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div key={block.id} className="border p-4 rounded bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">
                        {block.type === 'text' && '📄 Текстовый блок'}
                        {block.type === 'image' && '🖼️ Изображение'}
                        {block.type === 'gallery' && '🖼️ Галерея'}
                        {block.type === 'quote' && '💬 Цитата'}
                        {block.type === 'list' && '📋 Список'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ✕ Удалить
                      </button>
                    </div>
                    {renderBlockEditor(block)}
                  </div>
                ))}
                
                {blocks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
                    Контентные блоки не добавлены.<br />
                    Используйте кнопки выше для добавления блоков контента.
                  </div>
                )}
              </div>
            </div>

            {/* Контент (опционально) */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">Дополнительный контент (опционально)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded"
                placeholder="Дополнительная информация (используется если нет блоков контента)..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? '⏳ Создание...' : '✅ Создать кампанию'}
            </button>
        </form>

        {/* Список существующих кампаний */}
        <div className="bg-gray-50 p-6 rounded">
          <h3 className="text-lg font-semibold mb-4">Существующие кампании</h3>
          
          {campaigns.length === 0 ? (
            <p className="text-gray-600">Кампании отсутствуют</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border p-4 rounded flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{campaign.title}</h3>
                    <p className="text-gray-600 text-sm">Slug: {campaign.slug}</p>
                    {campaign.description && (
                      <p className="text-gray-700 mt-2">{campaign.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Создано: {new Date(campaign.createdAt).toLocaleDateString('ru-RU')}</span>
                      <span>Блоков: {campaign.blocks?.length || 0}</span>
                      <span>Тегов: {campaign.tags?.length || 0}</span>
                      {campaign.metaTitle && <span>✅ SEO</span>}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <a
                      href={`/sales/${campaign.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 text-center"
                    >
                      👁️ Просмотр
                    </a>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}