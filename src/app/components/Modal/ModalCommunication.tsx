"use client";

import React, { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; phone: string }) => void;
  modalContentClassName?: string;
}

const ModalCommunication: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  modalContentClassName = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
      const modalBackdrop = backdropRef.current;
      if (modalBackdrop) {
        modalBackdrop.parentElement!.style.pointerEvents = "auto";
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [isOpen]);

  // Закрытие по Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Закрытие по клику вне
  const handleClickOutside = (e: MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      backdropRef.current &&
      e.target === backdropRef.current
    ) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    // Валидация
    if (!name.trim() || !phone.trim()) {
      setMessage({ type: 'error', text: 'Пожалуйста, заполните все поля' });
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
      
      const messageText = `📞 Новый звонок\n\nИмя: ${name}\nТелефон: ${phone}`;
      
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

      // Вызываем функцию обработки из props
      onSubmit({ name, phone });
      
      setMessage({ type: 'success', text: '✓ Спасибо! Мы свяжемся с вами в ближайшее время' });
      
      // Закрываем модаль через 2 секунды
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setMessage({ type: 'error', text: 'Ошибка при отправке. Попробуйте позже' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-lg w-full max-w-[90%] md:max-w-[480px] px-4 py-7.5 lg:px-7.5 lg:pt-10.75 lg:pb-12.5 relative overflow-hidden overflow-y-auto ${modalContentClassName}`}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Заголовок формы */}
        <div>
          <h2 className="text-2xl font-bold text-[#2c3a54] leading-7.5">Заказать звонок</h2>
          <p className="text-[#2c3a5499] mt-2.5 font-semibold">
            Оставьте Ваши контактные данные и наши специалисты свяжутся с Вами в ближайшее рабочее время для решения Вашего вопроса
          </p>
        </div>

        {/* Сообщения об успехе/ошибке */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Форма */}
        <form
          className="pt-5 md:pt-7"
          onSubmit={handleSubmit} // Используем внутреннюю функцию handleSubmit
        >
          {/* Поле "Ваше имя" */}
          <div className="mb-3">
            <label htmlFor="callback-name" className="block text-sm font-bold text-[#2c3a54] mb-1.25">
              Ваше имя
            </label>
            <input
              id="callback-name"
              name="name"
              type="text"
              className="w-full h-11 px-3.75 py-2 text-sm text-black leading-5.5 border-2 border-[#2c3a5499] rounded-3xl focus:outline-none focus:border-[#2c3a54] bg-white"
              style={{
                transition: "all 0.25s",
              }}
            />
          </div>

          {/* Поле "Телефон" */}
          <div className="mb-3.25">
            <label htmlFor="callback-phone" className="block text-sm font-bold text-[#2c3a54] mb-1.25">
              Телефон
            </label>
            <input
              id="callback-phone"
              name="phone"
              type="tel"
              placeholder="+375 (__) ___-__-__"
              maxLength={19}
              className="w-full h-11 px-3.75 py-2 text-sm text-black leading-5.5 border-2 border-[#2c3a5499] rounded-3xl focus:outline-none focus:border-[#2c3a54] bg-white"
              style={{
                transition: "all 0.25s",
              }}
            />
          </div>

          {/* Кнопка отправки */}
          <div className="mb-2.5 md:mb-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.25 px-3.75 mt-5 text-sm leading-5.5 bg-[#2c3a54] border-[#2c3a54] border rounded-3xl font-bold focus:outline-none text-white transition hover:bg-white hover:text-[#2c3a54] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>

          {/* Политика конфиденциальности */}
          <div className="text-xs text-[#2c3a54]">
            Отправляя заявку, вы соглашаетесь с{" "}
            <a href="#" className="text-[#cd5554] underline">
              политикой конфиденциальности
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCommunication;