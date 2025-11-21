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

interface BlogBlock {
  id: string;
  type: 'text' | 'image' | 'gallery' | 'quote' | 'list';
  content: any;
}

interface Blog {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  images: string[];
  blocks: BlogBlock[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

export default function BlogsAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [blocks, setBlocks] = useState<BlogBlock[]>([]);
  
  // SEO хук
  const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('blogs');
  
  // SEO поля
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");

  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchBlogs = async () => {
    try {
      const data = await apiClient.get("/admin/blogs?limit=200");
      console.log('Fetch blogs response:', data);
      if (data.success) {
        // Обрабатываем оба формата ответа
        const blogs = data.blogs || data.data || [];
        setBlogs(blogs);
      } else {
        console.error("Fetch failed:", data.error);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const data = await apiClient.get("/admin/images?folder=blog");
      if (data.success) {
        setAvailableImages(data.data || []);
      } else {
        // Fallback к предустановленному списку с правильными путями
        const predefinedImages = [
          "https://k-r.by/api/static/blog/1.webp",
          "https://k-r.by/api/static/blog/2.webp", 
          "https://k-r.by/api/static/blog/3.webp",
        ];
        setAvailableImages(predefinedImages);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      // Fallback к предустановленному списку при ошибке с правильными путями
      const predefinedImages = [
        "https://k-r.by/api/static/blog/1.webp",
        "https://k-r.by/api/static/blog/2.webp", 
        "https://k-r.by/api/static/blog/3.webp",
      ];
      setAvailableImages(predefinedImages);
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
    fetchBlogs();
    fetchAvailableImages();
  }, []);

  // Автогенерация slug при изменении названия
  useEffect(() => {
    if (title && !editingBlog) {
      setSlug(generateSlug(title));
    }
  }, [title, editingBlog]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog");

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api') + "/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFeaturedImage(data.data.path);
        await fetchAvailableImages();
      } else {
        setUploadError(data.error || "Ошибка загрузки");
      }
    } catch (err) {
      setUploadError("Ошибка загрузки файла");
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addBlock = (type: BlogBlock['type']) => {
    const newBlock: BlogBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContentForType(type)
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContentForType = (type: BlogBlock['type']) => {
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

  const updateBlock = (blockId: string, newContent: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, content: newContent } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  };

  const startEditing = (blog: Blog) => {
    console.log('Edit blog data:', blog);
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug || '');
    setDescription(blog.description || '');
    setContent(blog.content);
    setFeaturedImage(blog.featuredImage || '');
    setTags(blog.tags || []);
    setBlocks(blog.blocks || []);
    // Load SEO fields
    setSeoTitle(blog.seoTitle || '');
    setSeoDescription(blog.seoDescription || '');
    setSeoKeywords(blog.seoKeywords || '');
    setOgImage(blog.ogImage || '');
  };

  const handleSaveEdit = async () => {
    if (!editingBlog) return;
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        title,
        slug,
        description,
        content,
        featuredImage,
        blocks,
        tags,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        ogImage: ogImage || undefined,
      };

      const data = await apiClient.put(`/admin/blogs/${editingBlog.id}`, body);
      console.log('Ответ сервера при обновлении:', data);

      if (data.success) {
        setSuccess('✓ Блог обновлен');
        resetForm();
        setEditingBlog(null);
        await fetchBlogs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Ошибка при обновлении блога');
      }
    } catch (err: any) {
      setError('Ошибка: ' + err.message);
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Если редактируем - используем handleSaveEdit
    if (editingBlog) {
      await handleSaveEdit();
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const finalSlug = slug || generateSlug(title);
      
      const body = {
        slug: finalSlug,
        title,
        description,
        content,
        featuredImage,
        images: [], // Пока оставим пустым
        blocks,
        tags,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        ogImage: ogImage || undefined,
      };

      console.log('Отправляю данные блога:', body);

      const data = await apiClient.post("/admin/blogs", body);
      console.log('Ответ сервера:', data);

      if (data.success) {
        setSuccess("✓ Блог добавлен");
        resetForm();
        await fetchBlogs();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при создании блога");
        console.error("Blog creation error:", data);
      }
    } catch (err: any) {
      setError("Ошибка: " + err.message);
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setContent("");
    setFeaturedImage("");
    setTags([]);
    setBlocks([]);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setOgImage("");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот блог? Действие необратимо!")) return;

    try {
      const data = await apiClient.delete(`/admin/blogs/${id}`);
      if (data.success) {
        setSuccess("✓ Блог удален");
        await fetchBlogs();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при удалении");
      }
    } catch (err: any) {
      setError("Ошибка: " + err.message);
    }
  };

  const renderBlockEditor = (block: BlogBlock) => {
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
                    formData.append("folder", "blog");

                    const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api') + "/upload", {
                      method: "POST",
                      body: formData,
                    });

                    const data = await response.json();
                    if (data.success) {
                      updateBlock(block.id, { ...block.content, src: data.data.path });
                      // Обновляем список доступных изображений
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
              <span className="text-sm text-gray-600">Или загрузите новое:</span>
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
                      formData.append("folder", "blog");

                      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api') + "/upload", {
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
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              + Добавить элемент
            </button>
          </div>
        );
      
      default:
        return <div>Неизвестный тип блока</div>;
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {editingBlog ? `Редактировать: ${editingBlog.title}` : 'Добавить блог'}
          </h2>
          <div className="flex gap-3">
            <BulkSeoUpdateButton
              entityType="blogs"
              categoryKey="blogs"
              categoryName="Блоги"
              onSuccess={async (stats) => {
                setSuccess(`✅ Обновлено ${stats.updated} блогов`);
                await fetchBlogs();
                setTimeout(() => setSuccess(""), 3000);
              }}
            />
          {editingBlog && (
            <button
              type="button"
              onClick={() => {
                setEditingBlog(null);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              ✕ Отмена
            </button>
          )}
        </div>
        {error && <div className="text-red-600 mb-4 p-2 bg-red-50">{error}</div>}
        {success && <div className="text-green-600 mb-4 p-2 bg-green-50">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Основная информация</h3>
            
            <input
              type="text"
              placeholder="Заголовок блога"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              placeholder="Краткое описание блога"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded"
            />
            
            <textarea
              placeholder="Основной текст (используется если нет блоков)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          {/* SEO */}
          {user?.role === 'superadmin' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">SEO</h3>
              
              <input
                type="text"
                placeholder="SEO Заголовок (для поисковых систем)"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              <textarea
                placeholder="SEO Описание (для поисковых систем)"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="SEO Ключевые слова"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="OG Изображение (URL для социальных сетей)"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          )}

          {/* Изображение */}
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
                placeholder="Добавить тег"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Добавить
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-red-500 hover:text-red-700"
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
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => addBlock('text')} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                  + Текст
                </button>
                <button type="button" onClick={() => addBlock('image')} className="px-3 py-1 bg-green-500 text-white rounded text-sm">
                  + Изображение
                </button>
                <button type="button" onClick={() => addBlock('quote')} className="px-3 py-1 bg-purple-500 text-white rounded text-sm">
                  + Цитата
                </button>
                <button type="button" onClick={() => addBlock('list')} className="px-3 py-1 bg-orange-500 text-white rounded text-sm">
                  + Список
                </button>
              </div>
              
              {blocks.map((block, index) => (
                <div key={block.id} className="border rounded p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium capitalize">{block.type}</h4>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  </div>
                  {renderBlockEditor(block)}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (editingBlog ? '⏳ Сохранение...' : '⏳ Добавление...') : (editingBlog ? '💾 Сохранить изменения' : '✅ Добавить блог')}
          </button>
        </form>
      </div>

      {/* Список блогов */}
      <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Список блогов</h2>
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{blog.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{blog.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Slug: {blog.slug} | Блоков: {blog.blocks?.length || 0} | 
                    Создано: {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {blog.featuredImage && (
                    <img src={blog.featuredImage} alt={blog.title} className="w-16 h-16 object-cover rounded" />
                  )}
                  <button
                    onClick={() => startEditing(blog)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
          {blogs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Блоги не найдены
            </div>
          )}
        </div>
      </div>
      </div>
      )}
    </>
  );
}