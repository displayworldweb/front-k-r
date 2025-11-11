'use client';

import React, { useState, useEffect } from 'react';
import Footer from '@/app/components/Footer';
import PathPage from '@/app/components/PathPage';
import SidebarCatalogMenu from '@/app/components/Sidebar/SidebarCatalogMenu';
import SidebarStickyHelp from '@/app/components/Sidebar/SidebarStickyHelp';

interface BlogBlock {
  id: string;
  type: 'text' | 'image' | 'gallery' | 'quote' | 'list';
  content: any;
}

interface Blog {
  id: number;
  slug: string;
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
}

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPage({ params }: BlogPageProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by/api'}/blogs?slug=${resolvedParams.slug}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setBlog(data.data[0]);
        } else {
          setError(data.error || 'Блог не найден');
        }
      } catch (err) {
        setError('Ошибка загрузки блога');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params]);

  const renderBlock = (block: BlogBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={block.id || index} className="mb-6">
            <div 
              className="prose prose-lg max-w-none text-[#2c3a54] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: block.content.html || block.content.text }}
            />
          </div>
        );
      
      case 'image':
        return (
          <div key={block.id || index} className="mb-8">
            <img
              src={block.content.src}
              alt={block.content.alt || ''}
              className="w-full h-auto rounded-lg object-cover"
            />
            {block.content.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {block.content.caption}
              </p>
            )}
          </div>
        );
      
      case 'gallery':
        return (
          <div key={block.id || index} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {block.content.images?.map((image: any, imgIndex: number) => (
                <img
                  key={imgIndex}
                  src={image.src}
                  alt={image.alt || ''}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
            {block.content.caption && (
              <p className="text-sm text-gray-600 mt-4 text-center italic">
                {block.content.caption}
              </p>
            )}
          </div>
        );
      
      case 'quote':
        return (
          <blockquote key={block.id || index} className="mb-8 border-l-4 border-blue-500 pl-6 italic text-lg text-gray-700">
            <p>"{block.content.text}"</p>
            {block.content.author && (
              <footer className="mt-2 text-sm text-gray-600">
                — {block.content.author}
              </footer>
            )}
          </blockquote>
        );
      
      case 'list':
        return (
          <div key={block.id || index} className="mb-6">
            {block.content.ordered ? (
              <ol className="list-decimal list-inside space-y-2 text-[#2c3a54]">
                {block.content.items?.map((item: string, itemIndex: number) => (
                  <li 
                    key={itemIndex}
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ol>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-[#2c3a54]">
                {block.content.items?.map((item: string, itemIndex: number) => (
                  <li 
                    key={itemIndex}
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка блога...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">{error || 'Блог не найден'}</p>
          <a
            href="/blog"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к блогу
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="container-centered mt-5 max-w-[1300px] flex">
        <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
          <SidebarCatalogMenu />
          <SidebarStickyHelp />
        </div>
        <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
          <PathPage />

          {/* Заголовок блога с датой */}
          <div className="flex justify-between items-start mb-5 lg:mb-7.5">
            <h1 className="text-black text-[28px] leading-8 lg:text-[40px] lg:leading-12 font-[600] flex-1 pr-4">
              {blog.title}
            </h1>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {new Date(blog.createdAt).toLocaleDateString('ru-RU')}
            </div>
          </div>

          {/* Теги */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Описание */}
          {blog.description && (
            <div className="mb-7.5">
              <p className="text-[#2c3a54] text-lg leading-relaxed">
                {blog.description}
              </p>
            </div>
          )}

          {/* Гибкие блоки контента */}
          {blog.blocks && blog.blocks.length > 0 ? (
            <div className="mb-8">
              {blog.blocks.map((block, index) => renderBlock(block, index))}
            </div>
          ) : (
            /* Основной контент, если нет блоков */
            <div className="mb-8">
              {blog.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-[#2c3a54] leading-relaxed mb-4">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          )}

          {/* Дополнительные изображения */}
          {blog.images && blog.images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#2c3a54] mb-4">
                Дополнительные изображения
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blog.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Изображение ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Футер */}
      <Footer />
    </>
  );
}