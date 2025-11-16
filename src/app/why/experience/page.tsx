"use client";
import PathPage from "@/app/components/PathPage";
import SidebarCatalogMenu from "@/app/components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "@/app/components/Sidebar/SidebarStickyHelp";
import Promo from "@/app/components/Promo";
import { PageDescriptionBlock } from "@/app/components/PageDescriptionBlock";
import Link from "next/link";

const ExperiencePage = () => {

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
                        <h1 className="text-black text-[28px] mt-2.5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Опыт работы более 30 лет</h1>
                    </div>

                    {/* Основной контент */}
                    <div className="mt-7.5 font-[600] shadow-xs p-5 lg:p-7.5 rounded-lg">
                        <PageDescriptionBlock pageSlug="why-experience" />
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

export default ExperiencePage;
