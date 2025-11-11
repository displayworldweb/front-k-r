"use client"
import { apiClient } from "@/lib/api-client"
import OurWorksSlider from "../components/OurWorksSlider"
import PathPage from "../components/PathPage"
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu"
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp"
import Pagination from "../components/Pagination"
import { useState, useEffect } from "react"
import Link from 'next/link'
import { PageDescriptionBlock } from "../components/PageDescriptionBlock"

interface BlogPreview {
  id: number;
  slug: string;
  title: string;
  description?: string;
  featuredImage?: string;
  tags: string[];
  createdAt: string;
}

const BlogPage = () => {
    const [blogs, setBlogs] = useState<BlogPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 12;

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await apiClient.get('/blogs');
                
                if (data.success) {
                    setBlogs(data.data || []);
                } else {
                    setError('Ошибка загрузки блогов');
                }
            } catch (err) {
                setError('Ошибка загрузки блогов');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Получаем блоги для текущей страницы
    const totalPages = Math.ceil(blogs.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentBlogs = blogs.slice(startIndex, startIndex + postsPerPage);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка блогов...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">
                    <div className="pl-2.5">
                        <PathPage />
                        <h1 className="text-black text-[28px] mt-2.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Статьи</h1>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 mx-2.5">
                            {error}
                        </div>
                    )}

                    {/* Сетка статей */}
                    {currentBlogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {currentBlogs.map((blog) => (
                                <Link
                                    key={blog.id}
                                    href={`/blog/${blog.slug}`}
                                    className="block group overflow-hidden rounded-lg"
                                >
                                    {/* Контейнер для изображения и текста */}
                                    <div className="flex lg:flex-col h-full px-2.5 mt-7.5">
                                        {/* Изображение */}
                                        <div className="relative mr-5 lg:mr-0 max-w-1/2 lg:max-w-full overflow-hidden">
                                            <img
                                                src={blog.featuredImage || '/blog/default.webp'}
                                                alt={blog.title}
                                                className="w-full h-auto object-cover rounded-lg group-hover:opacity-80 duration-500"
                                            />
                                        </div>

                                        {/* Текстовый блок */}
                                        <div className="lg:mt-2.5 flex flex-col">
                                            <h2 className="text-[16px] font-bold text-[#222222] mb-1.25 leading-4.5 group-hover:underline">
                                                {blog.title}
                                            </h2>
                                            <p className="text-[12px] text-[#969ead] mb-2">
                                                {formatDate(blog.createdAt)}
                                            </p>
                                            {blog.description && (
                                                <p className="text-[12px] text-[#666] line-clamp-2">
                                                    {blog.description.substring(0, 100)}...
                                                </p>
                                            )}
                                            {/* Теги */}
                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {blog.tags.slice(0, 2).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 mx-2.5">
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Блоги пока не опубликованы
                            </h3>
                            <p className="text-gray-500">
                                Скоро здесь появятся полезные статьи и советы
                            </p>
                        </div>
                    )}

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <Pagination
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            initialPage={1}
                        />
                    )}

                    {/* Описание страницы */}
                    <PageDescriptionBlock pageSlug="blogs" />
                </div>
            </section>

            {/* OurWorksSlider внизу страницы */}
            <OurWorksSlider />
        </>
    );
};

export default BlogPage;