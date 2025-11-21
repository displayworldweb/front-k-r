"use client";

import { useState } from "react";

interface PaginationProps {
    totalPages: number;
    onPageChange: (page: number) => void;
    initialPage?: number;
}

const Pagination = ({ totalPages, onPageChange, initialPage = 1 }: PaginationProps) => {
    const [activePage, setActivePage] = useState(initialPage);

    if (totalPages <= 1) {
        return null;
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setActivePage(page);
            onPageChange(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Вычисляем диапазон страниц для отображения (максимум 3 кружочка)
    let startPage = activePage - 1;
    let endPage = activePage + 1;

    // Если в начале, показываем 0, 1, 2
    if (activePage <= 2) {
        startPage = 1;
        endPage = Math.min(3, totalPages);
    }
    // Если в конце, показываем последние 3
    else if (activePage >= totalPages - 1) {
        startPage = Math.max(1, totalPages - 2);
        endPage = totalPages;
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center space-x-2 mt-8 font-[600]">
            {/* Кнопка "Предыдущая" */}
            <button
                onClick={() => handlePageChange(activePage - 1)}
                hidden={activePage <= 1}
                className="px-4 py-1 rounded-full hover:bg-[#2c3a54] hover:text-white text-[#2c3a54] border border-[#2c3a54] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Предыдущая
            </button>

            {/* Кнопка на первую страницу (если не видна) */}
            {startPage > 1 && (
                <>
                    <button
                        onClick={() => handlePageChange(1)}
                        className="w-8 h-8 rounded-full text-[#2c3a54] border border-[#2c3a54] hover:bg-[#2c3a54] hover:text-white flex items-center justify-center"
                    >
                        1
                    </button>
                    {startPage > 2 && (
                        <span className="w-8 h-8 flex items-center justify-center text-[#2c3a54]">...</span>
                    )}
                </>
            )}

            {/* Кнопки номеров страниц (максимум 3) */}
            {pageNumbers.map((pageNum) => (
                <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-full text-[#2c3a54] border border-[#2c3a54] hover:bg-[#2c3a54] hover:text-white flex items-center justify-center ${
                        activePage === pageNum ? "bg-[#2c3a54] text-white border-0" : ""
                    }`}
                >
                    {pageNum}
                </button>
            ))}

            {/* Кнопка на последнюю страницу (если не видна) */}
            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && (
                        <span className="w-8 h-8 flex items-center justify-center text-[#2c3a54]">...</span>
                    )}
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-8 h-8 rounded-full text-[#2c3a54] border border-[#2c3a54] hover:bg-[#2c3a54] hover:text-white flex items-center justify-center"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Кнопка "Следующая" */}
            <button
                onClick={() => handlePageChange(activePage + 1)}
                hidden={activePage >= totalPages}
                className="px-4 py-1 rounded-full hover:bg-[#2c3a54] hover:text-white text-[#2c3a54] border border-[#2c3a54] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Следующая
            </button>
        </div>
    );
};

export default Pagination;