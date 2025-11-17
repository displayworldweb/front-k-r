"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ModalCommunication from "./Modal/ModalCommunication";

const OrderStepsSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Для адаптивности
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Блокировка скролла при открытии модалки
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";

      const modalBackdrop = document.querySelector(".modal-backdrop");
      if (modalBackdrop) {
        modalBackdrop.parentElement!.style.pointerEvents = "auto";
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }
  }, [isModalOpen]);

  // Закрытие по Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen]);

  // Закрытие по клику вне модалки
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      backdropRef.current &&
      e.target === backdropRef.current
    ) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Функция для открытия модалки
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Функция для закрытия модалки
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Обработчик отправки формы
  const handleModalSubmit = (formData: { name: string; phone: string }) => {
    // Отправка уже произойдёт в ModalCommunication компоненте
    // Эта функция вызывается после успешной отправки
    console.log("Заявка отправлена:", formData);
  };

  return (
    <>
      <section className="max-w-[1300px] mt-17 lg:mt-30 container-centered">
        <h1 className="text-4xl font-bold text-[#2c3a54] ml-2.5 md:ml-0 mb-11.5 md:text-center">
          Как сделать заказ
        </h1>

        <div
          className={`flex ${
            isMobile
              ? "flex-col gap-10"
              : isTablet
              ? "flex-col md:flex-row md:flex-wrap"
              : "flex-row"
          }`}
        >
          {/* Карточка 1: Оставьте заявку */}
          <div
            className={`relative flex flex-col px-4.5 pt-12.5 mx-2.5 rounded-xl bg-[#f5f6fa] ${
              isMobile
                ? ""
                : isTablet
                ? "w-full md:w-[calc(50%-20px)]"
                : "w-[calc(25%-20px)]"
            }`}
          >
            <div className="absolute top-[-24px] left-1/2 transform -translate-x-1/2 w-13 h-13 border-5 border-white bg-[#cd5554] font-bold rounded-full flex items-center justify-center">
              1
            </div>
            <div>
              <div className="text-[#2c3a54] font-bold text-xl leading-7.5 min-h-12 text-center">
                Оставьте заявку
              </div>
              <div className="mt-2.5">
                <p className="text-[#2c3a54] text-center">
                  Позвоните по телефону <br />
                  <a
                    href="tel:+375333226652"
                    className="text-[#2c3a54] font-bold underline"
                  >
                    +375 33 322-66-52
                  </a>
                  ,<br />
                  напишите в мессенджерах
                </p>
                <div className="flex justify-center space-x-2 mt-1.75 mb-3.25">
                  <Link
                    href="viber://chat?number=%2B375333226652"
                    className="rounded-full flex items-center justify-center text-white"
                  >
                    <Image
                      width={40}
                      height={40}
                      src="/viber.svg"
                      alt="Viber"
                    />
                  </Link>
                  <Link
                    href="https://t.me/+375333226652"
                    className="rounded-full flex items-center justify-center text-white"
                  >
                    <Image
                      width={40}
                      height={40}
                      src="/tm.svg"
                      alt="Telegram"
                    />
                  </Link>
                  <Link
                    href="https://wa.me/375333226652"
                    className="rounded-full flex items-center justify-center text-white"
                  >
                    <Image
                      width={40}
                      height={40}
                      src="/wa.svg"
                      alt="WhatsApp"
                    />
                  </Link>
                </div>
                <p className="text-[#2c3a54] mb-8 lg:mb-4 text-center">
                  или оставьте заявку через сайт
                </p>
              </div>
            </div>
            <button
              onClick={openModal}
              className="w-full p-2.5 mb-3.75 lg:mb-0 bg-[#2c3a54] text-white font-bold rounded-full hover:bg-[#1e2b40] transition"
            >
              Оставить заявку
            </button>
          </div>

          {/* Карточка 2: Проконсультируйтесь с менеджером */}
          <div
            className={`relative flex flex-col justify-between px-4.5 pt-12.5 mx-2.5 rounded-xl bg-[#f5f6fa] ${
              isMobile
                ? ""
                : isTablet
                ? "w-full md:w-[calc(50%-20px)]"
                : "w-[calc(25%-20px)]"
            }`}
          >
            <div className="absolute top-[-24px] left-1/2 transform -translate-x-1/2 w-13 h-13 border-5 border-white bg-[#cd5554] font-bold rounded-full flex items-center justify-center">
              2
            </div>
            <div>
              <h3 className="text-[#2c3a54] font-bold text-xl mb-3 text-center">
                Проконсультируйтесь с менеджером
              </h3>
              <p className="text-[#2c3a54] mb-4 text-center">
                Уточним все пожелания, ответим на вопросы, подберем подходящие
                варианты
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/order/1.webp"
                alt="Менеджер"
                className="rounded-lg max-w-[185px] max-h-[170px]"
              />
            </div>
          </div>

          {/* Карточка 3: Сделаем расчет */}
          <div
            className={`relative flex flex-col justify-between px-4.5 pt-12.5 mx-2.5 rounded-xl bg-[#f5f6fa] ${
              isMobile
                ? ""
                : isTablet
                ? "w-full md:w-[calc(50%-20px)]"
                : "w-[calc(25%-20px)]"
            }`}
          >
            <div className="absolute top-[-24px] left-1/2 transform -translate-x-1/2 w-13 h-13 border-5 border-white bg-[#cd5554] font-bold rounded-full flex items-center justify-center">
              3
            </div>
            <div>
              <h3 className="text-[#2c3a54] font-bold text-xl mb-3 text-center">
                Сделаем расчет
              </h3>
              <p className="text-[#2c3a54] mb-4 text-center">
                После согласования понравившегося варианта менеджер сделает
                полный расчет с учетом стоимости всех работ
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/order/2.webp"
                alt="Калькулятор"
                className="rounded-lg max-w-[185px] max-h-[170px]"
              />
            </div>
          </div>

          {/* Карточка 4: Заключим договор и подберём удобный способ оплаты */}
          <div
            className={`relative flex flex-col justify-between px-4.5 pt-12.5 mx-2.5 rounded-xl bg-[#f5f6fa] ${
              isMobile
                ? ""
                : isTablet
                ? "w-full md:w-[calc(50%-20px)]"
                : "w-[calc(25%-20px)]"
            }`}
          >
            <div className="absolute top-[-24px] left-1/2 transform -translate-x-1/2 w-13 h-13 border-5 border-white bg-[#cd5554] font-bold rounded-full flex items-center justify-center">
              4
            </div>
            <div>
              <h3 className="text-[#2c3a54] font-bold text-xl mb-3 text-center">
                Заключим договор и подберём удобный способ оплаты
              </h3>
              <p className="text-[#2c3a54] mb-4 text-center">
                Прописываем все планируемые работы в официальном договоре
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/order/3.webp"
                alt="Договор"
                className="rounded-lg max-w-[185px] max-h-[170px]"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Модальное окно */}
      <ModalCommunication
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

export default OrderStepsSection;
