"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const WhyTrustUs = () => {
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Для адаптивности
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsTablet(width < 1024);
      setIsMobile(width < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <section className="bg-[#f5f6fa]">
      <div className=" max-w-[1300px] mt-17 lg:mt-30 container-centered">
        <div className="md:ml-2.5 pt-[93px] mb-[30px]">
          <h2 className="text-4xl font-bold text-[#2c3a54] mb-6">
            Почему нам доверяют
          </h2>
        </div>

        {/* Адаптив: <768px — 1 карточка в ряд */}
        {isMobile ? (
          <>
            {/* Карточка 1 */}
            <div className="mb-4" style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="w-full  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-white flex flex-col justify-between"
                  style={{ padding: "18px 17px 66px 18px", height: '100%' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="max-w-[91%]">
                      <h3 className="font-bold text-md text-[#2c3a54]">
                        Работаем более чем с 30 породами гранита
                      </h3>
                      <p className="text-sm text-[#2c3a54] mt-1 max-w-[87%]">
                        Используем проверенный гранит из лучших месторождений
                        Карелии (Россия), Финляндии, Норвегии, Индии и др
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/why/granite"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold underline transition"
                  >
                    Подробнее
                  </Link>
                  <div className="absolute ml-auto bottom-[7%] right-0">
                    <Image src="/why/1.webp" alt="Гранит" width={125} height={94}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Карточка 2 */}
            <div className="mb-4" style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="w-full  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#B2DBFD] flex flex-col justify-between"
                  style={{ padding: "18px 17px 66px 18px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-md text-[#2c3a54]">
                      Работаем строго по договору
                    </h3>
                    <p className="text-sm text-[#2c3a54] mt-1">
                      После оформления заказа предоставляем договор со списком всех
                      изделий и услуг
                    </p>
                  </div>
                  <Link
                    href="/why/contract"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>

            {/* Карточка 3 */}
            <div className="mb-4" style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="w-full  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#F6D1AA] flex flex-col justify-between"
                  style={{ padding: "18px 17px 66px 18px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-md text-[#2c3a54]">
                      Предоставляем разные варианты оплаты
                    </h3>
                    <p className="text-sm text-[#2c3a54] mt-1">
                      Предоплатная система, наша рассрочка, рассрочка или кредит
                      через банк
                    </p>
                  </div>
                  <Link
                    href="/why/payment"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>

            {/* Карточка 4 */}
            <div className="mb-4" style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="w-full  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#4f6be7] flex flex-col justify-between"
                  style={{ padding: "18px 17px 66px 18px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-md text-white">
                      Предоставляем фото и видео отчёт
                    </h3>
                    <p className="text-sm text-white mt-1">
                      Делаем фото на всех ключевых этапах установки
                    </p>
                  </div>
                  <Link
                    href="/why/report"
                    className="w-full absolute bottom-5.5 left-5.75 text-white rounded-full font-bold underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>

            {/* Карточка 5 */}
            <div className="mb-4" style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="w-full  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#fff] flex flex-col justify-between"
                  style={{ padding: "18px 17px 66px 18px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-md text-[#2c3a54]">
                      Бесплатно рисуем 3D-проект памятника
                    </h3>
                    <p className="text-sm text-[#2c3a54] mt-1">
                      Увидите, как будет выглядеть памятник до установки
                    </p>
                  </div>
                  <Link
                    href="/why/quality"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>

            {/* Карточка 6 */}
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="w-full  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#EAE0D5] flex flex-col justify-between"
                  style={{ padding: "18px 17px 66px 18px", height: '100%' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="max-w-[91%]">
                      <h3 className="font-bold text-md text-[#2c3a54]">
                        Бесплатно храним готовые изделия
                      </h3>
                      <p className="text-sm text-[#2c3a54] mt-1 max-w-[87%]">
                        До установки или самовывоза бесплатно храним памятники на
                        складе
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/why/experience"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold underline transition"
                  >
                    Подробнее
                  </Link>
                  <div className="absolute ml-auto bottom-[7%] right-0">
                    <Image
                      src="/why/2.webp"
                      alt="Памятники"
                      width={125}
                      height={93}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : isTablet ? (
          <>
            {/* Ряд 1 */}
            <div className="flex flex-wrap mb-4" style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Карточка 1: широкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-white flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="max-w-[62%]">
                      <h3 className="font-bold text-xl text-[#2c3a54]">
                        Работаем более чем с 30 породами гранита
                      </h3>
                      <p className="text-md text-[#2c3a54] mt-1">
                        Используем проверенный гранит из лучших месторождений
                        Карелии (Россия), Финляндии, Норвегии, Индии и др
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/why/granite"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                  <div className="absolute ml-auto top-[12%] right-[18px]">
                    <Image src="/why/1.webp" alt="Гранит" width={125} height={94} />
                  </div>
                </div>
              </div>

              {/* Карточка 2: узкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#B2DBFD] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-xl text-[#2c3a54]">
                      Работаем строго по договору
                    </h3>
                    <p className="text-md text-[#2c3a54] mt-1">
                      После оформления заказа предоставляем договор со списком всех
                      изделий и услуг
                    </p>
                  </div>
                  <Link
                    href="/why/contract"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>

            {/* Ряд 2 */}
            <div className="flex flex-wrap  mb-4" style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Карточка 3: узкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#F6D1AA] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-xl text-[#2c3a54]">
                      Предоставляем разные варианты оплаты
                    </h3>
                    <p className="text-md text-[#2c3a54] mt-1">
                      Предоплатная система, наша рассрочка, рассрочка или кредит
                      через банк
                    </p>
                  </div>
                  <Link
                    href="/why/payment"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>

              {/* Карточка 4: узкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#4f6be7] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-lg text-white">
                      Предоставляем фото и видео отчёт
                    </h3>
                    <p className="text-md text-white mt-1">
                      Делаем фото на всех ключевых этапах установки
                    </p>
                  </div>
                  <Link
                    href="/why/report"
                    className="w-full absolute bottom-5.5 left-5.75 text-white rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>

            {/* Ряд 3 */}
            <div className="flex flex-wrap " style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Карточка 5: узкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#fff] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="">
                    <h3 className="font-bold text-xl text-[#2c3a54]">
                      Бесплатно рисуем 3D-проект памятника
                    </h3>
                    <p className="text-md text-[#2c3a54] mt-1">
                      Увидите, как будет выглядеть памятник до установки
                    </p>
                  </div>
                  <Link
                    href="/why/quality"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>

              {/* Карточка 6: широкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] rounded-lg bg-[#EAE0D5] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="max-w-[62%]">
                      <h3 className="font-bold text-xl text-[#2c3a54]">
                        Бесплатно храним готовые изделия
                      </h3>
                      <p className="text-md text-[#2c3a54] mt-1">
                        До установки или самовывоза бесплатно храним памятники на
                        складе
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/why/experience"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                  <div className="absolute ml-auto top-[12%] right-[18px]">
                    <Image
                      src="/why/2.webp"
                      alt="Памятники"
                      width={125}
                      height={93}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Верхний ряд */}
            <div className="flex flex-wrap  mb-5" style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Карточка 1: широкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] mx-2.5 rounded-lg bg-white flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="max-w-[62%]">
                      <h3 className="font-bold text-xl text-[#2c3a54]">
                        Работаем более чем с 30 породами гранита
                      </h3>
                      <p className="text-md text-[#2c3a54] mt-1 max-w-[74%]">
                        Используем проверенный гранит из лучших месторождений
                        Карелии (Россия), Финляндии, Норвегии, Индии и др
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/why/granite"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                  <div className="absolute ml-auto top-[12%] right-[18px]">
                    <Image src="/why/1.webp" alt="Гранит" width={261} height={196}/>
                  </div>
                </div>
              </div>

              {/* Карточка 2: узкая */}
              <div className="w-[25%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] mx-2.5 rounded-lg bg-[#B2DBFD] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="max-w-[92%]">
                    <h3 className="font-bold text-xl text-[#2c3a54]">
                      Работаем строго по договору
                    </h3>
                    <p className="text-md text-[#2c3a54] mt-1 max-w-[74%]">
                      После оформления заказа предоставляем договор со списком всех
                      изделий и услуг
                    </p>
                  </div>
                  <Link
                    href="/why/contract"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>

              {/* Карточка 3: узкая */}
              <div className="w-[25%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] mx-2.5 rounded-lg bg-[#F6D1AA] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="max-w-[92%]">
                    <h3 className="font-bold text-xl text-[#2c3a54]">
                      Предоставляем разные варианты оплаты
                    </h3>
                    <p className="text-md text-[#2c3a54] mt-1 max-w-[74%]">
                      Предоплатная система, наша рассрочка, рассрочка или кредит
                      через банк
                    </p>
                  </div>
                  <Link
                    href="/why/payment"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>

            {/* Нижний ряд */}
            <div className="flex flex-wrap " style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Карточка 4: узкая */}
              <div className="w-[25%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] mx-2.5 rounded-lg bg-[#4f6be7] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="max-w-[92%]">
                    <h3 className="font-bold text-lg text-white">
                      Предоставляем фото и видео отчёт
                    </h3>
                    <p className="text-md text-white mt-1 max-w-[74%]">
                      Делаем фото на всех ключевых этапах установки
                    </p>
                  </div>
                  <Link
                    href="/why/report"
                    className="w-full absolute bottom-5.5 left-5.75 text-white rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>

              {/* Карточка 5: узкая */}
              <div className="w-[25%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] mx-2.5 rounded-lg bg-[#fff] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="max-w-[92%]">
                    <h3 className="font-bold text-xl text-[#2c3a54]">
                      Бесплатно рисуем 3D-проект памятника
                    </h3>
                    <p className="text-md text-[#2c3a54] mt-1 max-w-[74%]">
                      Увидите, как будет выглядеть памятник до установки
                    </p>
                  </div>
                  <Link
                    href="/why/quality"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>

              {/* Карточка 6: широкая */}
              <div className="w-[50%]  mb-6">
                <div
                  className="relative p-6 min-h-[250px] mx-2.5 rounded-lg bg-[#EAE0D5] flex flex-col justify-between"
                  style={{ padding: "22px 22px 60px 23px", height: '100%' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="max-w-[62%]">
                      <h3 className="font-bold text-xl text-[#2c3a54]">
                        Бесплатно храним готовые изделия
                      </h3>
                      <p className="text-md text-[#2c3a54] mt-1 max-w-[74%]">
                        До установки или самовывоза бесплатно храним памятники на
                        складе
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/why/experience"
                    className="w-full absolute bottom-5.5 left-5.75 text-[#2c3a54] rounded-full font-bold hover:underline transition"
                  >
                    Подробнее
                  </Link>
                  <div className="absolute ml-auto top-[12%] right-[18px]">
                    <Image
                      src="/why/2.webp"
                      alt="Памятники"
                      width={261}
                      height={195}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default WhyTrustUs;