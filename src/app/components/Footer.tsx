"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { footerMenu } from "../mock/footerMenu";

const Footer = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const contentRefs = useRef<{ [key: string]: HTMLUListElement | null }>({});

  const toggleMenu = (menu: string) => {
    if (openMenus.includes(menu)) {
      setOpenMenus(openMenus.filter((item) => item !== menu));
    } else {
      setOpenMenus([...openMenus, menu]);
    }
  };

  // Анимация высоты
  useEffect(() => {
    Object.keys(contentRefs.current).forEach((key) => {
      const el = contentRefs.current[key];
      if (!el) return;

      if (openMenus.includes(key)) {
        el.style.maxHeight = el.scrollHeight + "px";
      } else {
        el.style.maxHeight = "0px";
      }
    });
  }, [openMenus]);

  return (
    <footer className="bg-white border-t border-[#e6e8ed]">
      {/* Мобильное меню (аккордеон) — только на мобильных (<lg), СВЕРХУ */}
      <div className="col-span-12 mx-1 lg:hidden mb-6">
        {[
          { title: "Памятники", key: "monuments", items: footerMenu.monuments },
          {
            title: "Другие товары",
            key: "accessories",
            items: footerMenu.accessories,
          },
          { title: "Услуги", key: "services", items: footerMenu.services },
          { title: "Полезное", key: "useful", items: footerMenu.useful },
        ].map((category) => (
          <div key={category.key} className="border-b border-[#e6e8ed]">
            <button
              onClick={() => toggleMenu(category.key)}
              className={`w-full flex justify-between items-center py-3.75 pr-4 text-left transition-colors ${
                openMenus.includes(category.key)
                  ? "bg-[#2c3a54] text-white"
                  : "text-[#2c3a54] hover:bg-[#f9fafb]"
              }`}
              aria-expanded={openMenus.includes(category.key)}
            >
              <span className="pl-3 text-lg">{category.title}</span>
              <Image
                src={`${openMenus.includes(category.key) ? "/arrow-white.svg" : "/arrow-gray.svg" }`}
                alt="Раскрыть"
                width={18}
                height={12}
                className={`transform transition-transform ${
                  openMenus.includes(category.key) ? "rotate-180" : ""
                }`}
              />
            </button>

            <ul
              ref={(el) => {
                contentRefs.current[category.key] = el;
              }}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: "0px" }}
            >
              {category.items.map((item, index) => (
                <Link key={index} href={item.href}>
                  <li className="py-3.75 ml-7.5 border-b border-[#dee5e8]">
                    <span className="text-[#2c3a54] hover:text-[#2c3a54cc] transition">
                      {item.name}
                    </span>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Верхняя строка */}
      <div className="max-w-[1300px] container-centered pb-6.25 md:pb-7.5 lg:py-15 grid grid-cols-1 lg:grid-cols-12">
        {/* Колонка 1: Контакты (1/3 ширины на десктопе) */}
        <div className="col-span-4">
          <div className="space-y-2">
            <div className="text-[#2c3a54]">+375 33 322-66-52 MTC</div>
            <div className="text-[#2c3a54]">+375 29 622-66-45 A1</div>
          </div>
          <div className="flex mt-1">
            <button className="bg-white border border-[#2c3a54] text-[#2c3a54] px-3.5 py-1 mr-4.25 md:px-3.75 md:py-2.25 rounded-full font-bold hover:bg-[#2c3a54] hover:text-white transition">
              Заказать звонок
            </button>

            <a href="viber://chat?number=%2B375333226652" className="flex mr-2" target="_blank" rel="noopener noreferrer">
              <Image src="/viber.svg" alt="Viber" width={29} height={28} />
            </a>
            <a href="https://t.me/+375333226652" className="flex mr-2" target="_blank" rel="noopener noreferrer">
              <Image src="/tm.svg" alt="Telegram" width={28} height={28} />
            </a>
            <a href="https://wa.me/375333226652" className="flex" target="_blank" rel="noopener noreferrer">
              <Image src="/wa.svg" alt="WhatsApp" width={28} height={28} />
            </a>
          </div>

          <div className="text-sm text-[#969ead] mt-2.5 space-y-1">
            <div>Пн-пт с 10:00 до 19:00</div>
            <div>Сб с 10:00 до 15:00</div>
            <div>Вскр выходной</div>
          </div>

          <div className="text-sm mt-3.75 text-[#2c3a54]">
            Витебск, ул. Терешковой 9Б
          </div>

          <Link
            href="#"
            className="text-sm text-[#2c3a54] mt-1 hover:underline"
          >
            Подробнее
          </Link>
        </div>

        {/* Десктопное меню — только на lg+ */}
        <div className="col-span-2 hidden lg:block px-2.5">
          <h3 className="font-bold text-lg text-[#2c3a54] mb-4">Памятники</h3>
          <ul className="space-y-2">
            {footerMenu.monuments.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-sm text-[#2c3a54] hover:underline hover:text-[#2c3a54cc] transition"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 hidden lg:block px-2.5">
          <h3 className="font-bold text-lg text-[#2c3a54] mb-4">
            Другие товары
          </h3>
          <ul className="space-y-2">
            {footerMenu.accessories.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-sm text-[#2c3a54] hover:underline hover:text-[#2c3a54cc] transition"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 hidden lg:block px-2.5">
          <h3 className="font-bold text-lg text-[#2c3a54] mb-4">Услуги</h3>
          <ul className="space-y-2">
            {footerMenu.services.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-sm text-[#2c3a54] hover:underline hover:text-[#2c3a54cc] transition"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 hidden lg:block px-2.5">
          <h3 className="font-bold text-lg text-[#2c3a54] mb-4">Полезное</h3>
          <ul className="space-y-2">
            {footerMenu.useful.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-sm text-[#2c3a54] hover:underline hover:text-[#2c3a54cc] transition"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Нижняя строка */}
      <div className="bg-[#f5f6fa] pt-9.25 pb-20 lg:py-8">
        <div className="max-w-[1300px] container-centered flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="text-xs text-[#969ead] leading-relaxed lg:max-w-2/3">
            <span className="block max-w-[788px]">
              Данный интернет-сайт носит информационный характер. Каждый заказ
              носит индивидуальный характер. Эскиз товара, размер, варианты
              оформления, окончательная стоимость оговариваются во время личной
              консультации в офисе компании перед заключением договора.
              <br />
              УНП 390490922 ЧПУП «Каменная роза»
              <br />
              Свидетельство о регистрации №775 от 12 ноября 2007 г.
            </span>
          </div>

          <div className="flex flex-col self-start lg:block">
            <span className="text-xs text-[#969ead]">
              Наш рейтинг: 4.9 из 5 (Голосов: 112)
            </span>
            <span className="block text-xs text-[#969ead]">★★★★★</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
