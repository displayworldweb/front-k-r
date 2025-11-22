'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from "@/lib/api-client";
import OurWorksSlider from '@/app/components/OurWorksSlider';
import Footer from '@/app/components/Footer';
import ProductCard from '@/app/components/ProductCard';
import PathPage from '../../components/PathPage';
import SidebarCatalogMenu from '../../components/Sidebar/SidebarCatalogMenu';
import SidebarStickyHelp from '../../components/Sidebar/SidebarStickyHelp';

interface Product {
  id: number;
  name: string;
  price?: number;
  textPrice?: string | null;
  image: string;
  slug: string;
  category?: string;
  displayCategory: string;
  type?: 'monument' | 'accessory' | 'fence' | 'landscape';
}

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
  image?: string; // Для совместимости
  images: string[];
  blocks: CampaignBlock[];
  tags: string[];
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

interface CampaignPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrowMobile, setIsNarrowMobile] = useState(false);
  const [fullProducts, setFullProducts] = useState<Product[]>([]);

  useEffect(() => {
    setIsClient(true);
    
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
      setIsMobile(width < 768);
      setIsNarrowMobile(width < 480);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Функция для конвертации путей изображений
  const convertImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath; // уже полный URL
    if (imagePath.startsWith('/')) {
      // Конвертируем /folder/filename в https://k-r.by/api/static/folder/filename  
      return `https://k-r.by/api/static${imagePath}`;
    }
    return imagePath;
  };

  // Функция для получения полных данных товаров
  const fetchProductDetails = async (productRefs: Array<{id: number, type: string}>) => {
    if (!productRefs || productRefs.length === 0) return [];
    
    try {
      const allProductsData = await apiClient.get('/monuments');
      
      if (allProductsData.success) {
        const allProducts = allProductsData.data;
        
        // Находим полные данные для каждого товара из акции
        const fullProductData = productRefs.map(ref => {
          const product = allProducts.find((p: any) => p.id === ref.id && p.type === ref.type);
          if (product) {
            // Конвертируем URL изображения
            product.image = convertImageUrl(product.image);
          }
          return product || null;
        }).filter(Boolean);
        
        return fullProductData;
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
    
    return [];
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const resolvedParams = await params;
        const data = await apiClient.get(`/campaigns?slug=${resolvedParams.slug}`);
        
        if (data.success && data.data && data.data.length > 0) {
          // Находим акцию с нужным slug (может быть несколько с одинаковым slug)
          const campaignData = data.data.find((campaign: any) => campaign.slug === resolvedParams.slug) || data.data[0];
          setCampaign(campaignData);
          
          // Если у акции есть товары, получаем их полные данные
          if (campaignData.products && campaignData.products.length > 0) {
            // Проверяем, если товары уже содержат полную информацию (старые акции)
            const hasFullData = campaignData.products[0].name && campaignData.products[0].image;
            
            if (hasFullData) {
              // Товары уже содержат полную информацию, но нужно конвертировать URL изображений
              const productsWithFixedImages = campaignData.products.map((product: any) => ({
                ...product,
                image: convertImageUrl(product.image)
              }));
              setFullProducts(productsWithFixedImages);
            } else {
              // Товары содержат только ID и type, нужно получить полные данные
              const productDetails = await fetchProductDetails(campaignData.products);
              setFullProducts(productDetails);
            }
          }
        } else {
          setError('Акция не найдена');
        }
      } catch (err) {
        setError('Ошибка загрузки акции');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params]);

  const renderBlock = (block: CampaignBlock, index: number) => {
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
        const imageSrc = block.content.src?.startsWith('http') 
          ? block.content.src 
          : `https://k-r.by/api/static${block.content.src}`;
        return (
          <div key={block.id || index} className="mb-8">
            <img
              src={imageSrc}
              alt={block.content.alt || ''}
              className="w-full h-auto rounded-lg object-cover" loading="lazy"
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
              {block.content.images?.map((imageSrc: string, imgIndex: number) => {
                const fullImageSrc = imageSrc?.startsWith('http') 
                  ? imageSrc 
                  : `https://k-r.by/api/static${imageSrc}`;
                return (
                  <img
                    key={imgIndex}
                    src={fullImageSrc}
                    alt={`Изображение ${imgIndex + 1}`}
                    className="w-full h-64 object-cover rounded-lg" loading="lazy"
                  />
                );
              })}
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
          <p className="mt-4 text-gray-600">Загрузка акции...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">{error || 'Акция не найдена'}</p>
          <a
            href="/sales"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к акциям
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

          {/* Заголовок акции */}
          <h1 className="text-black text-[28px] mb-5 lg:mb-7.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">
            {campaign.title}
          </h1>

          {/* Описание акции */}
          <div className="mb-7.5">
            {campaign.description && (
              <p className="text-[#2c3a54] mb-5 leading-relaxed">
                {campaign.description}
              </p>
            )}
            
            {/* Гибкие блоки контента */}
            {campaign.blocks && campaign.blocks.length > 0 ? (
              <div className="mb-8">
                {campaign.blocks.map((block, index) => renderBlock(block, index))}
              </div>
            ) : (
              /* Основной контент, если нет блоков */
              campaign.content && (
                <div className="space-y-4">
                  {campaign.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-[#2c3a54] leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    )
                  ))}
                </div>
              )
            )}
            
            {/* Теги */}
            {campaign.tags && campaign.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {campaign.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Товары на акции */}
          {fullProducts && fullProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[28px] font-bold text-[#2c3a54] mb-5">
                Товары на акции
              </h2>
              
              {/* Сетка продуктов */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 mb-7.5">
                {isClient && fullProducts.map((product, index) => (
                  <ProductCard
                    key={`campaign-product-${campaign?.id}-${product.type || 'unknown'}-${product.id || index}`}
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      category: product.category || product.displayCategory,
                      price: product.price,
                      textPrice: product.textPrice || undefined,
                      image: product.image?.startsWith('http') ? product.image : `https://k-r.by/api/static${product.image}`,
                      colors: product.image ? [{ 
                        name: "Стандартный",
                        color: "#000000",
                        image: product.image?.startsWith('http') ? product.image : `https://k-r.by/api/static${product.image}`, 
                        price: product.price
                      }] : [],
                    }}
                    isTablet={isTablet}
                    isMobile={isMobile}
                    isNarrowMobile={isNarrowMobile}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Слайдер наших работ */}
      <OurWorksSlider />

      {/* Футер */}
      <Footer />
    </>
  );
}