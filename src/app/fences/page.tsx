"use client";
import { useEffect, useState } from "react";
import OurWorksSlider from "../components/OurWorksSlider";
import PathPage from "../components/PathPage";
import SidebarCatalogMenu from "../components/Sidebar/SidebarCatalogMenu";
import SidebarStickyHelp from "../components/Sidebar/SidebarStickyHelp";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { categoriesFences } from "../mock/categories";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface Fence {
  id: number;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  createdAt: string;
}

interface FenceProduct {
  id: number;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  createdAt: string;
}

// Функция для получения продуктов для конкретной страницы
const getProductsForPage = (cards: FenceProduct[], page: number, productsPerPage: number) => {
    const startIndex = (page - 1) * productsPerPage;
    return cards.slice(startIndex, startIndex + productsPerPage);
};

// Функция для получения количества страниц
const getTotalPages = (totalProducts: number, productsPerPage: number) => {
    return Math.ceil(totalProducts / productsPerPage);
};

const FencesPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [fences, setFences] = useState<FenceProduct[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(60); // По умолчанию показываем 60 товаров
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isNarrowMobile, setIsNarrowMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    // Для адаптивности и загрузки данных
    useEffect(() => {
        setIsClient(true)
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsTablet(width < 1024);
            setIsMobile(width < 768);
            setIsNarrowMobile(width < 420)
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        
        // Загружаем ограды из БД
        const fetchFences = async () => {
            try {
                const data = await apiClient.get("https://api.k-r.by/api/fences?limit=200");
                if (data.success) {
                    // Преобразуем в формат с colors для совместимости с ProductCard
                    const transformed = (data.data || []).map((item: any) => ({
                        ...item,
                        // Оборачиваем в один "цвет" с основным изображением
                        colors: [{
                            name: item.category,
                            image: item.image,
                            price: item.price,
                        }],
                    }));
                    setFences(transformed);
                }
            } catch (error) {
                console.error("Error fetching fences:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchFences();
        
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Получаем продукты для текущей страницы
    const currentProducts = getProductsForPage(fences, currentPage, productsPerPage);

    // Рассчитываем общее количество страниц
    const totalPages = getTotalPages(fences.length, productsPerPage);

    // Обработчик изменения количества товаров на странице
    const handleProductsPerPageChange = (count: number) => {
        setProductsPerPage(count);
        setCurrentPage(1); // Сбрасываем на первую страницу при изменении количества
    };

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
                        <h1 className="text-black text-[28px] mt-2.5 mb-5 leading-8 lg:text-[40px] lg:leading-12 font-[600]">Гранитные памятники на могилу</h1>

                        {/* Блок категорий */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-7.5">
                            {categoriesFences.map((category) => (
                                <a
                                    key={category.title}
                                    href={category.link}
                                    className="block overflow-hidden rounded-lg"
                                >
                                    <div className="relative flex h-[80px] lg:h-[120px] py-5 pl-3.75 pr-12.5 lg:pr-25 justify-between bg-[#f5f6fa] rounded-lg hover:border-2 border-[#2c3a54]">
                                        <div className="flex flex-col w-[70%] self-center z-10">
                                            <h2 className="text-[16px] font-bold text-[#222222] mb-2.5">{category.title}</h2>
                                            <p className="text-[12px] text-[#969ead]">{category.price}</p>
                                        </div>
                                        <div className="absolute self-center -right-2 rounded-lg max-w-[130px] overflow-hidden">
                                            <img
                                                src={category.img}
                                                alt={category.title}
                                                className={`h-full object-cover rounded-lg ${isTablet ? 'w-[75px]' : 'w-[130px]'}`}
                                            />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Выбор количества товаров на страницу */}
                    <div hidden={isTablet} className="flex justify-end mb-5">
                        <span className="text-[14px] text-[#6B809E] mr-2 self-center">Выводить по:</span>
                        {[60, 120].map((count) => (
                            <button
                                key={count}
                                onClick={() => handleProductsPerPageChange(count)}
                                className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === count
                                    ? ""
                                    : "cursor-pointer underline underline-offset-3 hover:no-underline"
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                        <button
                            onClick={() => handleProductsPerPageChange(fences.length)}
                            className={`px-2 py-1 mx-1 text-[14px] font-medium rounded text-[#2c3a54] ${productsPerPage === fences.length
                                ? ""
                                : "cursor-pointer underline underline-offset-3 hover:no-underline"
                                }`}
                        >
                            Все
                        </button>
                    </div>

                    {/* Сетка продуктов */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 mb-7.5">
                        {isClient ? (
                            currentProducts.map((product: any) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isTablet={isTablet}
                                    isMobile={isMobile}
                                    isNarrowMobile={isNarrowMobile}
                                />
                            ))
                        ) : (
                            currentProducts.map((product) => (
                                <div key={product.id} className="invisible h-0" />
                            ))
                        )}
                    </div>

                    {/* Пагинация */}
                    <Pagination
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        initialPage={1}
                    />

                    {/* Описание страницы */}
                    <div className="mt-7.5 font-[600] shadow-md p-7.5 rounded-lg">
                        {/* Первый абзац */}
                        <p className=" text-[#2c3a54] mb-5">
                            Ограда на могилу – старая традиция со времен, когда памятники устанавливали по уровню земли без заливки фундамента. Тогда оградки ограничивали соседние участки на кладбище. Сегодня же они выполняют больше эстетическую функцию, дополняют памятник. А по православной традиции ограды на кладбище служат границей между миром живых и царством мёртвых, придавая месту погребения завершённый вид.
                        </p>

                        {/* Второй абзац */}
                        <p className=" text-[#2c3a54] mb-5">
                            Изначально ограждения делали из металлических труб, они быстро ржавели и требовали постоянного ухода. Изготовление могильных оград из гранита, мрамора, нержавеющих труб или ковки началось только около 20 лет назад.
                        </p>

                        {/* Заголовок "Виды ритуальных оградок" */}
                        <h2 className="text-[24px] font-bold text-[#2c3a54] mb-3.75">Виды ритуальных оградок</h2>
                        <p className=" text-[#2c3a54] mb-5">«Каменная роза» предлагает около 100 моделей ограждений на кладбище. По материалу изготовления оградки на кладбище делят на:</p>
                        <ol className="list-decimal pl-5  text-[#2c3a54] space-y-1 mb-5">
                            <li>Гранитные ограды. Гарантируют долговечность, эстетику. Гранит устойчив к механическим повреждениям, перепадам температур и влаге, сохраняя свои свойства столетиями. Эти ограды не требуют ухода. Цены на гранитные ограждения начинаются от 560 руб. (модель ГО-2).</li>
                            <li>Металлические ограды с полимерным покрытием. Элегантное решение, сочетающее красоту и прочность. Они подчеркивают уникальность дизайна захоронения и служат десятилетиями.</li>
                            <li>Металлические ограды. Доступный, функциональный вариант. Их стоимость начинается от 80 руб. за м.п. Однако такие конструкции нуждаются в периодической покраске для поддержания внешнего вида.</li>
                            <li>Ограждения с полимерным покрытием. Усовершенствованный вариант металлических моделей. Полимерное покрытие, нанесённое при температуре до 200 °C, увеличивает срок службы, улучшает внешний вид.</li>
                        </ol>

                        {/* Заголовок "Почему важна ограда на могилу?" */}
                        <h2 className="text-[24px] font-bold text-[#2c3a54] mb-3.75">Почему важна ограда на могилу?</h2>
                        <p className=" text-[#2c3a54] mb-5">Ограда на могилу – это классический способ оформления захоронения в соответствии с религиозными и культурными традициями. Она:</p>
                        <ul className="list-disc pl-5  text-[#2c3a54] space-y-1 mb-5">
                            <li>Обозначает границы участка, защищая его от случайных нарушений.</li>
                            <li>Органично дополняет надгробие, особенно если выполнена в едином стиле с другими элементами – скамейкой, столиком или бордюром.</li>
                            <li>Ограничивает доступ животных/случайных прохожих, предотвращая загрязнение.</li>
                        </ul>
                        <p className=" text-[#2c3a54] mb-5">Облагородьте место захоронения своих близких. Закажите ограду, чтобы сохранить память и заботу о них.</p>

                        {/* Заголовок "Как выбрать ограду?" */}
                        <h2 className="text-[24px] font-bold text-[#2c3a54] mb-3.75">Как выбрать ограду?</h2>
                        <p className=" text-[#2c3a54] mb-5">Чтобы купить ограду на кладбище, важно учитывать следующие аспекты:</p>
                        <ul className="list-disc pl-5  text-[#2c3a54] space-y-1 mb-5">
                            <li>Металлические ограды – дешевле, легче по весу, но требуют регулярной покраски. Такие оградки нужно периодически подкрашивать, так как на них со временем появляются следы ржавчины. Полимерные покрытия удлиняют срок службы, делают конструкцию более привлекательной.</li>
                            <li>Металлические ограды с полимерным покрытием меньше подвержены появлению коррозии, но также требуют периодической подкраски.</li>
                            <li>Гранитные ограды и комбинированные подчеркивают статус и легко обслуживаются – достаточно периодически очищать их от загрязнений. Они устойчивы к любым погодным условиям. То же самое можно сказать и о нержавеющей трубе.</li>
                        </ul>
                        <p className=" text-[#2c3a54] mb-5">Наши специалисты могут ответить на Ваши вопросы и помочь в выборе.</p>

                        {/* Заголовок "Почему выбирают «Каменная роза»?" */}
                        <h2 className="text-[24px] font-bold text-[#2c3a54] mb-3.75">Почему выбирают «Каменная роза»?</h2>
                        <p className=" text-[#2c3a54] mb-5">Покупая ограду на могилу в Минске у нас, вы получите:</p>
                        <ul className="list-disc pl-5  text-[#2c3a54] space-y-1 mb-5">
                            <li>Большой каталог гранитных оград: от угловых до полностью закрытых.</li>
                            <li>Более 30 пород гранита для гранитных ограждений.</li>
                            <li>Возможность дополнить ограду лавкой или столиком.</li>
                            <li>Полимерное покрытие для всех металлических оград.</li>
                            <li>Высококачественные материалы и комплектующие.</li>
                            <li>Дизайн, сочетающийся с памятником.</li>
                            <li>Услуги монтажа.</li>
                            <li>Гибкие условия оплаты – наличный и безналичный расчёт, рассрочка до 6 месяцев без переплат.</li>
                        </ul>
                        <p className=" text-[#2c3a54] mb-5">В последнее время набирают популярность угловые гранитные ограды. Они ограничивают участок только по углам. Такие модели стоят дешевле классических ограждений и при этом визуально не перегружают участок. Каталог угловых оград постоянно пополняется строгими и фигурными вариантами.</p>

                        {/* Заголовок "От чего зависит цена ограды на кладбище?" */}
                        <h2 className="text-[24px] font-bold text-[#2c3a54] mb-3.75">От чего зависит цена ограды на кладбище?</h2>
                        <p className=" text-[#2c3a54] mb-5">Цена на ограду для кладбища формируется индивидуально и зависит от:</p>
                        <ul className="list-disc pl-5  text-[#2c3a54] space-y-1 mb-5">
                            <li>Сложности дизайна.</li>
                            <li>Выбранных материалов и их объёма.</li>
                            <li>Вида декоративной отделки.</li>
                            <li>Размеров конструкции.</li>
                            <li>Типа фундамента.</li>
                            <li>Дополнительных услуг, таких как демонтаж старой ограды.</li>
                        </ul>
                        <p className=" text-[#2c3a54] mb-5">Мы предлагаем продукцию с доставкой и установкой.</p>

                        {/* Заголовок "Как сделать заказ на сайте?" */}
                        <h2 className="text-[24px] font-bold text-[#2c3a54] mb-3.75">Как сделать заказ на сайте?</h2>
                        <p className=" text-[#2c3a54] mb-5">Компания «Каменная роза» использует современные технологии и оборудование для производства ритуальных изделий. Чтобы заказать ограду на кладбище, зайдите на наш сайт в раздел «Ограды». Выберите модель, ознакомьтесь с ценами. При необходимости свяжитесь с консультантами по форме обратной связи или номере в шапке сайта.</p>
                        <p className=" text-[#2c3a54] mb-5">Сохраните память о близких на долгие годы с качественными ритуальными изделиями от «Каменная роза»!</p>
                    </div>

                    {/* Блок "Другие категории" */}
                    <div className={`mt-17 lg:mt-30 ${isTablet ? 'container-centered' : ''}`}>
                        <h2 className="text-[28px] font-bold text-[#2c3a54] ml-2.5 mb-3.5 lg:mb-5">Другие категории</h2>
                        {/* Общий блок с flex */}
                        <div className={`flex flex-wrap ${isNarrowMobile ? 'flex-col space-y-2.5' : ''}`}>
                            {/* Карточка "Памятники" */}
                            <div className={`px-1.25 md:px-2.5 max-w-1/2 flex-1/2 min-h-[60px] lg:min-h-[140px] ${isNarrowMobile ? 'max-w-full' : ''}`}>
                                <Link
                                    href="/monuments"
                                    className="block overflow-hidden rounded-lg hover:border-2 border-[#2c3a54] bg-[#f5f6fa] relative h-full items-center p-7.5"
                                >
                                    {/* Текст */}
                                    <h2 className="text-[16px] font-bold text-[#222222] self-start">Памятники</h2>
                                    {/* Изображение с абсолютным позиционированием */}
                                    <img
                                        src="/section/monuments.webp"
                                        alt="Памятники"
                                        className="w-[75px] lg:w-[130px] h-auto object-cover rounded-lg"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '10px',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                </Link>
                            </div>

                            {/* Карточка "Аксессуары" */}
                            <div className={`px-1.25 md:px-2.5 max-w-1/2 flex-1/2 min-h-[60px] lg:min-h-[140px] ${isNarrowMobile ? 'max-w-full' : ''}`}>
                                <Link
                                    href="/accessories"
                                    className="block overflow-hidden rounded-lg hover:border-2 border-[#2c3a54] bg-[#f5f6fa] relative h-full items-center p-7.5"
                                >
                                    {/* Текст */}
                                    <h2 className="text-[16px] font-bold text-[#222222] self-start">Аксессуары</h2>
                                    {/* Изображение с абсолютным позиционированием */}
                                    <img
                                        src="/section/accessories.webp"
                                        alt="Аксессуары"
                                        className="w-[75px] lg:w-[130px] h-auto object-cover rounded-lg"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '10px',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OurWorksSlider внизу страницы */}
            <div className="mb-22.5">
                <OurWorksSlider />
            </div>
        </>
    );
};

export default FencesPage;