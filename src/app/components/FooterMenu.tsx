"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDropdown } from "../context/DropDownContext";
import BurgerDropdown from "./BurgerDropdown";
import FooterPhoneDropdown from "./FooterPhoneDropdown";
import ModalCommunication from "./Modal/ModalCommunication";

const PHONE_MTS = "+375 33 322-66-52";
const PHONE_A1 = "+375 29 622-66-45";

const FooterMenu = () => {
  const [isPhoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const { isBurgerDropdownOpen, toggleBurgerDropdown, closeBurgerDropdown } =
    useDropdown();

  const handleDropdownLinkClick = () => {
    setPhoneDropdownOpen(false);
    closeBurgerDropdown();
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isPhoneDropdownOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
  }, [isPhoneDropdownOpen]);

  // Закрываем меню при смене маршрута
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPhoneDropdownOpen(false);
    closeBurgerDropdown();
  }, [pathname]);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Проверяем, не кликнули ли по кнопкам футера
      const footerButtons = Array.from(
        document.querySelectorAll(".footer-menu-button")
      );
      if (footerButtons.some((btn) => btn.contains(target))) return;

      // Проверяем, не кликнули ли по самому меню
      const phoneDropdown = document.getElementById("footer-phone-dropdown");

      if (
        isPhoneDropdownOpen &&
        phoneDropdown &&
        !phoneDropdown.contains(target)
      ) {
        setPhoneDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPhoneDropdownOpen, isBurgerDropdownOpen]);

  const PhoneDropdownClick = () => {
    setPhoneDropdownOpen((prev) => !prev);
    if (isBurgerDropdownOpen) closeBurgerDropdown(); // закрываем бургер, если открыт
  };

  const BurgerDropdownClick = () => {
    toggleBurgerDropdown();
    if (isPhoneDropdownOpen) setPhoneDropdownOpen(false); // закрываем телефон, если открыт

    if (!isBurgerDropdownOpen && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e6e8ed] shadow-lg z-100">
        <div className="flex">
          {/* Главная — ссылка */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center w-1/4 py-2 px-2 text-center"
          >
            <Image
              src="/menu/home.svg"
              alt="Главная"
              width={25}
              height={24}
              className="mx-auto"
            />
            <span className="text-xs mt-1 text-[#2c3a54]">Главная</span>
          </Link>

          {/* Каталог — кнопка */}
          <button
            type="button"
            onClick={BurgerDropdownClick}
            className="footer-menu-button flex flex-col items-center justify-center w-1/4 py-2 px-2 text-center"
          >
            <Image
              src="/menu/catalog.svg"
              alt="Каталог"
              width={25}
              height={24}
              className="mx-auto"
            />
            <span className="text-xs mt-1 text-[#2c3a54]">Каталог</span>
          </button>

          {/* Портфолио — ссылка */}
          <Link
            href="/works"
            className="flex flex-col items-center justify-center w-1/4 py-2 px-2 text-center"
          >
            <Image
              src="/menu/portfolio.svg"
              alt="Портфолио"
              width={25}
              height={24}
              className="mx-auto"
            />
            <span className="text-xs mt-1 text-[#2c3a54]">Портфолио</span>
          </Link>

          {/* Контакты — кнопка */}
          <button
            onClick={PhoneDropdownClick}
            className="footer-menu-button flex flex-col items-center justify-center w-1/4 py-2 px-2 text-center"
          >
            <Image
              src="/menu/contacts.svg"
              alt="Контакты"
              width={25}
              height={24}
              className="mx-auto"
            />
            <span className="text-xs mt-1 text-[#2c3a54]">Контакты</span>
          </button>
        </div>
      </div>

      {/* Затемнение экрана */}
      {isPhoneDropdownOpen && (
        <div
          className="fixed inset-0 bg-black opacity-15 z-40 pointer-events-auto"
          onClick={() => {
            setPhoneDropdownOpen(false);
            closeBurgerDropdown();
          }}
        ></div>
      )}

      {isBurgerDropdownOpen && (
        <div
          className={`fixed inset-0 bg-black opacity-15 z-40 pointer-events-auto top-[97px] left-0 right-0}`}
          onClick={() => {
            setPhoneDropdownOpen(false);
            closeBurgerDropdown();
          }}
        ></div>
      )}

      {/* Рендерим дропдауны над футером */}
      <FooterPhoneDropdown
        isPhoneDropdownOpen={isPhoneDropdownOpen}
        PHONE_MTS={PHONE_MTS}
        PHONE_A1={PHONE_A1}
        onLinkClick={handleDropdownLinkClick}
        onModalOpen={handleModalOpen}
      />

      {isBurgerDropdownOpen && (
        <BurgerDropdown
          isBurgerDropdownOpen={isBurgerDropdownOpen}
          PHONE_MTS={PHONE_MTS}
          PHONE_A1={PHONE_A1}
          onLinkClick={handleDropdownLinkClick}
          onModalOpen={handleModalOpen}
        />
      )}

      {/* Modal */}
      <ModalCommunication
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FooterMenu;
