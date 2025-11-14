"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";

const Blog = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Для адаптивности
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  interface BlogItem {
    id: number | string;
    title: string;
    description?: string;
    content?: string;
    image?: string; // иногда приходит как image
    featuredImage?: string; // фактическое поле из API
    images?: string[]; // массив изображений
    date?: string;
    publishedAt?: string;
    slug?: string;
    link?: string;
  }

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(API_ENDPOINTS.blogs);
        const items: BlogItem[] = Array.isArray(data) ? data : data?.data || [];
        setBlogs(items);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки блога");
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  return (
    <section className="mt-17 lg:mt-30 gradient">
      <div className="max-w-[1300px] pt-[93px] container-centered">
        <h2 className="text-4xl font-bold text-[#2c3a54] ml-2.5 mb-7.5">
          Блог
        </h2>

        {/* Используем flex + gap, чтобы отступы не ломали ширину */}
        {loading && <div className="ml-2.5 text-[#6B809E] mb-4">Загрузка...</div>}
        {error && <div className="ml-2.5 text-red-600 mb-4">{error}</div>}
        <div className="flex flex-col md:flex-row space-x-2.5 space-y-5 md:space-y-0">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="w-full md:w-1/4 md:mx-2.5 bg-white rounded-lg md:shadow-sm overflow-hidden"
            >
              <a href={blog.link || (blog.slug ? `/blog/${blog.slug}` : '#')} className="flex md:block">
                <div className="w-[52%] px-2 md:px-0 bg-[#f5f6fa] md:w-full  ">
                  {(() => {
                    const imgSrc = blog.featuredImage || blog.image || blog.images?.[0];
                    if (!imgSrc) return null;
                    return (
                      <img
                        src={imgSrc}
                        alt={blog.title}
                        className="max-w-full align-middle rounded-lg md:rounded-b-none h-auto"
                        loading="lazy"
                      />
                    );
                  })()}
                </div>
                <div className="w-[48%] justify-between flex flex-col md:block bg-[#f5f6fa] md:bg-white md:w-full px-2 py-0 md:px-6 md:py-5 md:p-6">
                  <h3 className="font-bold text-sm md:text-[16px] text-[#2c3a54] md:mb-1.25">
                    {blog.title}
                  </h3>
                  {blog.description && (
                    <p className="hidden md:block text-[16px] text-[#2c3a54cc] leading-relaxed">
                      {blog.description}
                    </p>
                  )}
                  <span className="text-sm md:hidden text-[#2c3a54cc] leading-relaxed">
                    {blog.date || blog.publishedAt}
                  </span>
                </div>
              </a>
            </div>
          ))}
          {!loading && blogs.length === 0 && !error && (
            <div className="text-[#6B809E] ml-2.5">Нет доступных записей</div>
          )}
        </div>

        <div className="ml-2.5 mt-6 md:mt-8 flex text-center">
          <Link
            href={"/"}
            className="font-bold w-full md:max-w-[338px] px-7.5 py-3 bg-[#2c3a54] border border-[#2c3a54] text-white rounded-full hover:bg-white hover:text-[#2c3a54] transition"
          >
            Смотреть все
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
