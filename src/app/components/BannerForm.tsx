'use client'
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const BannerForm = () => {
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
        <section className="min-h-[657px] md:min-h-[412px] max-w-[1300px] md:rounded-3xl px-7 pt-6 pb-43.75 md:p-10 mt-17 lg:mt-30 container-centered" style={{
            backgroundImage: isMobile ? "url('/banner-form-m.jpg')" : "url(/banner-form.jpg)",
            backgroundSize: isMobile ? "cover" : "",
            backgroundRepeat: "no-repeat",
            backgroundPosition: isMobile ? "50% 100%" : "0 0" 
        }}>
            <div className="w-full md:max-w-[570px]">
                <div className="flex-col">
                    <h1 className="font-bold text-2xl">Хотите что-то особенное? Мы не ограничиваемся каталогом и бесплатно придумаем индивидуальное решение специально для вас!</h1>
                    <p className="mt-2.5 md:mt-4.25 text-[17px]">Давайте продолжим общение в мессенджере, и наши специалисты помогут вам реализовать все пожелания</p>
                </div>
                <form className="pt-5.25 md:pt-7" action={'https://'}>
                    <div className="flex flex-col md:flex-row space-y-1">
                        <input id="callback-phone" className="inline-block w-full md:w-[230px] h-12 rounded-full border-1 border-white px-3.75 py-2 mr-1.75" name="phone" type="tel" placeholder="+375 (__) ___-__-__" maxLength={19} />
                        <button type="submit" className="w-full md:w-max px-4.75 py-2.75 border-2 border-white font-bold text-center cursor-pointer rounded-full">Отправить заявку</button>
                    </div>
                </form>
                <div className="mt-1.5 md:mt-2.25 leading-4">
                    <span className="text-xs">Отправляя заявку, вы соглашаетесь с <Link className="underline text-[#cd5554]" href={'/'}>политикой конфиденциальности</Link></span></div>
            </div>
            <div className="flex space-x-2 mt-8.75">
                <Link
                    href="viber://chat?number=%2B375333226652"
                    className="rounded-full flex items-center justify-center text-white "
                >
                    <Image
                        width={40}
                        height={40}
                        src={"/viber.svg"}
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
                        src={"/tm.svg"}
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
                        src={"/wa.svg"}
                        alt="WhatsApp"
                    />
                </Link>
            </div>
        </section>
    )
};

export default BannerForm;