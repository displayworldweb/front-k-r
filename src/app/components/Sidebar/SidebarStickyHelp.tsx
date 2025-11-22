'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ModalCommunication from '@/app/components/Modal/ModalCommunication';

export default function SidebarStickyHelp() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-4">
        {/* Изображение */}
        <div className="">
          <Image
            src="/rose.webp"
            alt="Остались вопросы?"
            width={224}
            height={103}
            className="w-full h-auto object-cover rounded-t-xl"
          />
        </div>

        {/* Контент */}
        <div className="text-center px-7.5 pt-7.5 pb-6.25">
          <h3 className="text-[#2c3a54] text-xl font-bold mb-2">Остались вопросы?</h3>
          <p className="text-[#2c3a54] text-sm mb-4">
            Закажите звонок и мы свяжемся с Вами в ближайшее время
          </p>

          {/* Кнопка */}
          <button
            className="w-full py-3 px-4 bg-[#2c3a54] cursor-pointer text-white rounded-full font-medium hover:bg-[#1e2b3f] transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Заказать звонок
          </button>

          {/* Или напишите нам */}
          <div className="mt-4">
            <span className="text-xs text-[#2c3a54]">Или напишите нам</span>
            <div className="flex justify-center gap-3 mt-2">
              {/* Viber */}
              <a
                href="viber://chat?number=%2B375333226652"
                aria-label="Viber"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Image src="/viber.svg" alt="Viber" width={28} height={28} />
              </a>
              {/* Telegram */}
              <a
                href="https://t.me/+375333226652"
                aria-label="Telegram"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Image src="/tm.svg" alt="Telegram" width={28} height={28} />
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/375333226652"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Image src="/wa.svg" alt="WhatsApp" width={28} height={28} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <ModalCommunication
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />
    </>
  );
}