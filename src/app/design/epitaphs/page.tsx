"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import PathPage from "@/app/components/PathPage";
import SidebarCatalogMenu from "@/app/components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "@/app/components/Sidebar/SidebarStickyHelp";
import EpitaphsGrid from "@/app/components/EpitaphsGrid";
import Link from "next/link";
import { Epitaph } from "@/app/types/types";
import { PageDescriptionBlock } from "@/app/components/PageDescriptionBlock";

const EpitaphsPage = () => {
    const [epitaphs, setEpitaphs] = useState<Epitaph[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEpitaphs() {
            try {
                const data = await apiClient.get("/epitaphs");
                if (data.success) {
                    // Сортировка по номерам в тексте эпитафий
                    const sortedEpitaphs = (data.data || []).sort((a: Epitaph, b: Epitaph) => {
                        const numA = parseInt(a.text.split('.')[0]) || 0;
                        const numB = parseInt(b.text.split('.')[0]) || 0;
                        return numA - numB;
                    });
                    setEpitaphs(sortedEpitaphs);
                }
            } catch (error) {
                console.error("Failed to fetch epitaphs:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchEpitaphs();
    }, []);

    return (
        <>
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">

                    <div className="pl-4 lg:pl-0">
                        <PathPage />
                        <h1 className="text-black text-[28px] mt-2.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Эпитафии</h1>
                    </div>

                    {/* Основной контент */}
                    <div className="mt-5 lg:mt-7.5 font-[600] shadow-xs px-4 pb-5 lg:px-0 rounded-lg">
                        {/* Введение */}
                        <p className="text-[#2c3a54] mb-5">
                            <strong>Эпитафия</strong> — это изречение, которое используется в качестве надгробной надписи. Как правило такой текст наносится на нижнюю часть памятника, однако его можно нанести и на заднюю сторону памятника или на надгробную плиту. Вы можете выбрать эпитафии любой длины и содержания.
                        </p>

                        {/* Блок с карточками эпитафий */}
                        <EpitaphsGrid epitaphs={epitaphs} />
                        <PageDescriptionBlock pageSlug="design-epitaphs" />
                    </div>
                </div>
            </section>
        </>
    );
};

export default EpitaphsPage;