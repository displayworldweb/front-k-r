'use client'
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const BannerForm = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const phone = formData.get('phone') as string;

        // Валидация
        if (!phone.trim()) {
            setMessage({ type: 'error', text: 'Пожалуйста, введите телефон' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Отправляем в Telegram бот
            const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
            const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
            
            if (!telegramBotToken || !chatId) {
                throw new Error('Telegram конфигурация не найдена');
            }
            
            const messageText = `📞 Заявка из формы в баннере\n\nИмя: Клиент\nТелефон: ${phone}`;
            
            const response = await fetch(
                `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: messageText,
                        parse_mode: 'HTML',
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Ошибка при отправке сообщения');
            }
            
            setMessage({ type: 'success', text: '✓ Спасибо! Мы свяжемся с вами в ближайшее время' });
            
            // Очищаем форму
            (e.currentTarget as HTMLFormElement).reset();
            
            // Скрываем сообщение через 3 секунды
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Ошибка отправки:', error);
            setMessage({ type: 'error', text: 'Ошибка при отправке. Попробуйте позже' });
        } finally {
            setLoading(false);
        }
    };

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
                <form className="pt-5.25 md:pt-7" onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row space-y-1">
                        <input 
                            id="callback-phone" 
                            className="inline-block w-full md:w-[230px] h-12 rounded-full border border-white px-3.75 py-2 mr-1.75 text-black placeholder-gray-400" 
                            name="phone" 
                            type="tel" 
                            placeholder="+375 (__) ___-__-__" 
                            maxLength={19}
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full md:w-max px-4.75 py-2.75 border-2 border-white font-bold text-center cursor-pointer rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? 'Отправка...' : 'Отправить заявку'}
                        </button>
                    </div>
                    {message && (
                        <div
                            className={`mt-3 p-2 rounded text-sm font-medium ${
                                message.type === 'success'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}
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