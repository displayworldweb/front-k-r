"use client";

import React, { useEffect, useRef, useState } from "react";

interface ProductData {
  name?: string;
  image?: string;
  color?: string;
  price?: number | string;
  oldPrice?: number | string;
  category?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; phone: string }) => void;
  modalContentClassName?: string;
  productData?: ProductData;
}

const ModalCommunication: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  modalContentClassName = "",
  productData,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [countryCode, setCountryCode] = useState('+375');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '');
    
    // Форматируем в зависимости от кода страны
    if (countryCode === '+375') {
      // Формат: +375 (XX) XXX-XX-XX (12 цифр)
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 8) return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
    } else {
      // Формат: +7 (XXX) XXX-XX-XX (11 цифр)
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      if (digits.length <= 8) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    }
  };

  // Обработчик изменения номера телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    
    // Ограничение по количеству цифр
    const maxDigits = countryCode === '+375' ? 9 : 10;
    if (digits.length <= maxDigits) {
      setPhoneNumber(formatPhoneNumber(digits));
    }
  };

  // Валидация номера телефона
  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    
    if (countryCode === '+375') {
      // +375 должен содержать 9 цифр после кода (всего 12)
      return digits.length === 9;
    } else {
      // +7 должен содержать 10 цифр после кода (всего 11)
      return digits.length === 10;
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🚀 Form submitted');
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const fullPhone = countryCode + phoneNumber.replace(/\D/g, '');

    console.log('📝 Form data:', { name, phone: fullPhone });

    // Валидация имени
    if (!name.trim()) {
      console.log('❌ Name validation failed');
      setMessage({ type: 'error', text: 'Пожалуйста, введите ваше имя' });
      return;
    }

    // Валидация телефона
    if (!validatePhone(phoneNumber)) {
      console.log('❌ Phone validation failed');
      const expectedDigits = countryCode === '+375' ? '12 цифр' : '11 цифр';
      setMessage({ type: 'error', text: `Пожалуйста, введите корректный номер телефона (${expectedDigits})` });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Отправляем в Telegram бот
      const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
      
      console.log('🔑 Telegram config:', { 
        hasToken: !!telegramBotToken, 
        hasChat: !!chatId,
        productData 
      });
      
      if (!telegramBotToken || !chatId) {
        throw new Error('Telegram конфигурация не найдена');
      }
      
      // Если есть фото товара, отправляем его отдельно
      if (productData?.image) {
        console.log('📤 Sending photo to Telegram');
        console.log('📦 Product data:', JSON.stringify(productData, null, 2));
        
        // Формируем подпись для фото
        let caption = `📞 Новый заказ звонка\n\n`;
        caption += `👤 Имя: ${name}\n`;
        caption += `📱 Телефон: ${fullPhone}\n`;
        caption += `\n📦 Товар: ${productData.name || 'Не указан'}`;
        
        if (productData.category) {
          caption += `\n📁 Категория: ${productData.category}`;
        }
        
        if (productData.color) {
          caption += `\n🎨 Цвет: ${productData.color}`;
        }
        
        if (productData.price) {
          const price = typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;
          const oldPrice = productData.oldPrice ? (typeof productData.oldPrice === 'string' ? parseFloat(productData.oldPrice) : productData.oldPrice) : 0;
          
          console.log('💰 Price calculation:', { 
            rawPrice: productData.price, 
            rawOldPrice: productData.oldPrice,
            parsedPrice: price, 
            parsedOldPrice: oldPrice,
            hasDiscount: oldPrice > 0 && oldPrice > price 
          });
          
          if (oldPrice > 0 && oldPrice > price) {
            caption += `\n💰 Цена со скидкой: ${price.toFixed(2)} руб.`;
            caption += `\n💵 Старая цена: ${oldPrice.toFixed(2)} руб.`;
          } else {
            caption += `\n💰 Цена: ${price.toFixed(2)} руб.`;
          }
        }
        
        console.log('📝 Caption to send:', caption);
        
        // Преобразуем относительный путь в абсолютный URL
        const imageUrl = productData.image.startsWith('http') 
          ? productData.image 
          : `https://k-r.by${productData.image}`;
        
        console.log('🖼️ Image URL:', imageUrl);
        
        const photoResponse = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              photo: imageUrl,
              caption: caption,
            }),
          }
        );

        console.log('📥 Photo response status:', photoResponse.status);

        if (!photoResponse.ok) {
          const errorData = await photoResponse.json();
          console.error('❌ Telegram photo API error:', errorData);
          throw new Error('Ошибка при отправке фото');
        }

        console.log('✅ Photo sent successfully');
      } else {
        // Если нет фото, отправляем обычное текстовое сообщение
        let messageText = `📞 Новый заказ звонка\n\n`;
        messageText += `👤 Имя: ${name}\n`;
        messageText += `📱 Телефон: ${fullPhone}`;
        
        if (productData) {
          messageText += `\n\n📦 Товар: ${productData.name || 'Не указан'}`;
          
          if (productData.category) {
            messageText += `\n📁 Категория: ${productData.category}`;
          }
          
          if (productData.color) {
            messageText += `\n🎨 Цвет: ${productData.color}`;
          }
          
          if (productData.price) {
            const price = typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;
            const oldPrice = productData.oldPrice ? (typeof productData.oldPrice === 'string' ? parseFloat(productData.oldPrice) : productData.oldPrice) : 0;
            
            if (oldPrice > 0 && oldPrice > price) {
              messageText += `\n💰 Цена со скидкой: ${price.toFixed(2)} руб.`;
              messageText += `\n💵 Старая цена: ${oldPrice.toFixed(2)} руб.`;
            } else {
              messageText += `\n💰 Цена: ${price.toFixed(2)} руб.`;
            }
          }
        }
        
        console.log('📤 Sending text message to Telegram');
        
        const response = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageText,
            }),
          }
        );

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Telegram API error:', errorData);
          throw new Error('Ошибка при отправке сообщения');
        }

        console.log('✅ Message sent successfully');
      }

      // Вызываем функцию обработки из props
      onSubmit({ name, phone: fullPhone });
      
      setMessage({ type: 'success', text: '✓ Спасибо! Мы свяжемся с вами в ближайшее время' });
      
      // Закрываем модаль через 2 секунды
      setTimeout(() => {
        onClose();
        setMessage(null);
        // Очищаем форму
        setPhoneNumber('');
      }, 2000);
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
      setMessage({ type: 'error', text: 'Ошибка при отправке. Попробуйте позже' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-2000 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-lg w-full max-w-[90%] md:max-w-[480px] px-4 py-7.5 lg:px-7.5 lg:pt-10.75 lg:pb-12.5 relative overflow-hidden overflow-y-auto ${modalContentClassName}`}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700 text-xl"
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
            <div className="flex gap-2">
              {/* Выбор кода страны */}
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setPhoneNumber(''); // Очищаем номер при смене кода
                }}
                className="h-11 w-[70px] px-2 text-sm text-black border-2 border-[#2c3a5499] rounded-3xl focus:outline-none focus:border-[#2c3a54] bg-white cursor-pointer appearance-none text-center"
                style={{
                  transition: "all 0.25s",
                  backgroundImage: "none",
                }}
              >
                <option value="+375">+375</option>
                <option value="+7">+7</option>
              </select>
              
              {/* Поле ввода номера */}
              <input
                id="callback-phone"
                name="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder={countryCode === '+375' ? '(29) 123-45-67' : '(812) 234-56-78'}
                className="flex-1 h-11 px-3.75 py-2 text-sm text-black leading-5.5 border-2 border-[#2c3a5499] rounded-3xl focus:outline-none focus:border-[#2c3a54] bg-white"
                style={{
                  transition: "all 0.25s",
                }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {countryCode === '+375' ? 'Формат: +375 (XX) XXX-XX-XX' : 'Формат: +7 (XXX) XXX-XX-XX'}
            </div>
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