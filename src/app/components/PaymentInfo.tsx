"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const PaymentInfo = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Для адаптивности
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <section className="pt-5.5 pb-8 md:py-17.25 bg-[#2c3a54]">
      <div className="container-centered px-4 md:px-4 lg:px-5 max-w-[1300px] ">
        <div className={`flex ${isMobile ? 'flex-col' : 'md:flex-row'} gap-8 md:gap-12 items-start`}>
          {/* Левая колонка — текст и кнопка */}
          <div className={`${isMobile ? 'w-full' : 'md:w-1/3'}`}>
            <h1 className="font-bold text-4xl mb-3.5">
              Платите, <span className="text-[#4fbd76]">как удобно</span>
            </h1>
            <p className="mb-6 text-base">
              Покупайте памятники, ограды и другие изделия в рассрочку
            </p>
            <Link
              className="font-bold w-full text-center py-3 px-4.5 border border-white rounded-full inline-block hover:bg-white hover:text-[#2c3a54] transition"
              href={"/payment"}
            >
              Подробнее о рассрочке
            </Link>
          </div>

          {/* Правая колонка — три блока */}
          <div className={`gap-8 ${isMobile ? 'w-full' : 'md:w-2/3'} ${isMobile ? 'flex flex-col' : 'md:flex md:flex-row'}`}>
            {/* Блок 1: Полная оплата */}
            <div className={`${isMobile ? 'flex items-start gap-4' : 'flex flex-col items-center text-center'}`}>
              <div className={`h-[70px] ${isMobile ? 'flex-shrink-0' : 'mb-4 flex justify-center'}`}>
                <Image width={isMobile ? 65 : 65} height={isMobile ? 48 : 48} src="/payment/1.svg" alt="Полная оплата" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Полная оплата</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Предоплата 30%</li>
                  <li>• Остальное - по готовности</li>
                </ul>
              </div>
            </div>

            {/* Блок 2: Своя рассрочка */}
            <div className={`${isMobile ? 'flex items-start gap-4' : 'flex flex-col items-center text-center'}`}>
              <div className={`h-[70px] ${isMobile ? 'flex-shrink-0' : 'mb-4 flex justify-center'}`}>
                <Image width={isMobile ? 67 : 67} height={isMobile ? 64 : 64} src="/payment/2.svg" alt="Своя рассрочка" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Своя рассрочка</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Предоплата 30%</li>
                  <li>• Остальное - в рассрочку на 6 месяцев</li>
                </ul>
              </div>
            </div>

            {/* Блок 3: Без банка */}
            <div className={`${isMobile ? 'flex items-start gap-4' : 'flex flex-col items-center text-center'}`}>
              <div className={`h-[70px] ${isMobile ? 'flex-shrink-0' : 'mb-4 flex justify-center'}`}>
                <Image width={isMobile ? 72 : 72} height={isMobile ? 72 : 72} src="/payment/3.svg" alt="Без банка" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Без банка</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Оформляйте на месте без походов в банк</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentInfo;