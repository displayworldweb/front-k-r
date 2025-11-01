"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PathPage from "@/app/components/PathPage";
import SidebarCatalogMenu from "@/app/components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "@/app/components/Sidebar/SidebarStickyHelp";
import ProductCard from "@/app/components/ProductCard";
import Pagination from "@/app/components/Pagination";
import Promo from "@/app/components/Promo";
import { apiClient } from "@/lib/api-client";

interface Fence {
  id: number;
  slug: string;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  createdAt: string;
}

interface CategoryData {
  title: string;
  products: Fence[];
  sortOptions?: string[];
}

const CATEGORY_MAP: Record<string, string> = {
  "granite": "Гранитные ограды",
  "polymer": "С полимерным покрытием",
  "metal": "Металлические ограды",
};

const FencesCategoryPage = () => {
  const params = useParams();
  const categorySlug = params?.category as string;

  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(60);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNarrowMobile, setIsNarrowMobile] = useState(false);
  const [products, setProducts] = useState<Fence[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("Со скидкой");

  const categoryTitle = CATEGORY_MAP[categorySlug?.toLowerCase()] || (categorySlug
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    : "Ограды");

  useEffect(() => {
    setIsClient(true);
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsTablet(width < 1024);
      setIsMobile(width < 768);
      setIsNarrowMobile(width < 420);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const categoryName = CATEGORY_MAP[categorySlug?.toLowerCase()] || categorySlug;
        const encodedCategory = encodeURIComponent(categoryName);
        const data = await apiClient.get(`/fences?category=${encodedCategory}&limit=200`);
        
        if (data.success && data.data) {
          // Преобразуем в формат с colors для совместимости с ProductCard
          const transformed = data.data.map((item: any) => ({
            ...item,
            colors: [{
              name: item.category,
              image: item.image,
              price: item.price,
            }],
          }));
          setProducts(transformed);
        }
      } catch (error) {
        console.error("Ошибка при загрузке оград:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [categorySlug]);

  const currentProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handleProductsPerPageChange = (count: number) => {
    setProductsPerPage(count);
    setCurrentPage(1);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "Со скидкой") {
      return 0;
    }
    return 0;
  });

  const sortedCurrentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  const sortedTotalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const finalProducts = sortedCurrentProducts;
  const finalTotalPages = sortedTotalPages;

  return (
    <>
      <section className="page-centered mt-5 max-w-[1300px] flex">
        <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
          <SidebarCatalogMenu />
          <SidebarStickyHelp />
        </div>
        <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
          <div className={`${isTablet ? 'container-centered' : ''}`}>
            <PathPage />
            <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">
              {categoryTitle}
            </h1>

            {/* Выбор количества товаров на страницу */}
            <div hidden={isTablet} className="flex justify-end mb-5">
              <span className="text-[14px] text-[#6B809E] mr-2 self-center">Выводить по:</span>
              {[60, 120].map((count) => (
                <button
                  key={count}
                  onClick={() => handleProductsPerPageChange(count)}
                  className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${
                    productsPerPage === count
                      ? ""
                      : "cursor-pointer underline underline-offset-3 hover:no-underline"
                  }`}
                >
                  {count}
                </button>
              ))}
              <button
                onClick={() => handleProductsPerPageChange(products.length)}
                className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${
                  productsPerPage === products.length
                    ? ""
                    : "cursor-pointer underline underline-offset-3 hover:no-underline"
                }`}
              >
                Все
              </button>
            </div>

            {/* Сетка продуктов */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 mb-7.5">
              {isClient && !loading ? (
                finalProducts.length > 0 ? (
                  finalProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        textPrice: product.textPrice,
                        image: product.image,
                        colors: product.image ? [{ 
                          name: "Стандартный",
                          color: "#000000",
                          image: product.image, 
                          price: product.price
                        }] : [],
                      }}
                      isTablet={isTablet}
                      isMobile={isMobile}
                      isNarrowMobile={isNarrowMobile}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-600">Товары не найдены</p>
                  </div>
                )
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-600">Загрузка...</p>
                </div>
              )}
            </div>

            {/* Пагинация */}
            {finalTotalPages > 1 && (
              <Pagination
                totalPages={finalTotalPages}
                onPageChange={setCurrentPage}
                initialPage={1}
              />
            )}
          </div>
        </div>
      </section>

      {/* внизу страницы */}
      <div className="mb-12.5 lg:mb-15">
        <Promo />
      </div>
    </>
  );
};

export default FencesCategoryPage;
