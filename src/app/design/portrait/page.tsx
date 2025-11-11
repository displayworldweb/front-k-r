"use client";
import { useEffect, useState } from "react";
import PathPage from "@/app/components/PathPage";
import SidebarCatalogMenu from "@/app/components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "@/app/components/Sidebar/SidebarStickyHelp";
import Promo from "@/app/components/Promo";
import { PageDescriptionBlock } from "@/app/components/PageDescriptionBlock";
import Link from "next/link";

const PortraitEngravingPage = () => {

    return (
        <>
            <section className="page-centered mt-5 max-w-[1300px] flex">
                <div className="max-w-[25%] w-full hidden lg:block space-y-7.5 ml-5">
                    <SidebarCatalogMenu />
                    <SidebarStickyHelp />
                </div>
                <div className="w-[100%] lg:ml-5 lg:max-w-[75%]">

                    <div className="pl-5 lg:pl-0">
                        <PathPage />
                        <h1 className="text-black text-[28px] mt-2.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Гравировка портрета на памятник</h1>
                    </div>

                    {/* Основной контент */}
                    <div className="mt-7.5 font-[600] shadow-xs p-5 lg:p-7.5 rounded-lg">
                        <PageDescriptionBlock pageSlug="design-portrait" />
                        
                        {/* Перейти в разделы */}
                        <p className="text-[#2c3a54] mb-2.5 mt-5">
                            Перейти в разделы:
                        </p>
                        <ul className="list-disc pl-10 text-[#2c3a54] space-y-1">
                            <li><Link href="/design/medallions" className="text-[#969ead]">Медальоны на памятник</Link></li>
                            <li><Link href="/design/text-engraving" className="text-[#969ead]">Гравировка текста</Link></li>
                        </ul>
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

export default PortraitEngravingPage;