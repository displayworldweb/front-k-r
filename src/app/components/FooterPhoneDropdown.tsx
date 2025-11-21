import Image from "next/image";
import Link from "next/link";

interface FooterPhoneDropdownProps {
  isPhoneDropdownOpen: boolean;
  PHONE_MTS: string;
  PHONE_A1: string;
  onLinkClick?: () => void;
}

const FooterPhoneDropdown: React.FC<FooterPhoneDropdownProps> = ({
  isPhoneDropdownOpen,
  PHONE_MTS,
  PHONE_A1,
  onLinkClick,
}) => {
  if (!isPhoneDropdownOpen) return null;

  return (
    <div
      id="footer-phone-dropdown"
      role="menu"
      aria-label="Контактная информация (футер)"
      onClick={onLinkClick}
      className="
        fixed bottom-[60px] left-0 right-0 
        z-50 
        bg-white 
        shadow-md 
        text-sm 
        text-[#2c3a54]
        min-w-90
      "
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      {/* Номера */}
      <div className="flex flex-col border-b border-gray-200 text-[20px]">
        <a
          href={`tel:${PHONE_MTS.replace(/[\s-]/g, "")}`}
          className="flex justify-between items-center hover:bg-[#f8faff] px-5 py-3"
          role="menuitem"
        >
          <div className="flex items-center space-x-2">
            <span>{PHONE_MTS}</span>
          </div>
          <span className="text-gray-500 font-medium">MTS</span>
        </a>
      </div>
      <div className="flex flex-col border-b border-gray-200 text-[20px]">
        <a
          href={`tel:${PHONE_A1.replace(/[\s-]/g, "")}`}
          className="flex justify-between items-center hover:bg-[#f8faff] px-5 py-3"
          role="menuitem"
        >
          <div className="flex items-center space-x-2">
            <span>{PHONE_A1}</span>
          </div>
          <span className="text-gray-500 font-medium">A1</span>
        </a>
      </div>

      {/* Мессенджеры */}
      <div className="flex justify-between border-b border-gray-200 items-center px-5 py-3">
        <div className="flex gap-2.5 items-center space-y-1 text-center">
          <a
            href="viber://chat?number=%2B375333226652"
            aria-label="Viber"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Image src="/viber.svg" alt="Viber" width={28} height={28} />
          </a>
          <span className="text-xs text-[#2c3a54]">Viber</span>
        </div>
        <div className="flex gap-2.5 items-center space-y-1 text-center">
          <a
            href="https://t.me/+375333226652"
            aria-label="Telegram"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Image src="/tm.svg" alt="Telegram" width={28} height={28} />
          </a>
          <span className="text-xs text-[#2c3a54]">Telegram</span>
        </div>
        <div className="flex gap-2.5 items-center space-y-1 text-center">
          <a
            href="https://wa.me/375333226652"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Image src="/wa.svg" alt="WhatsApp" width={28} height={28} />
          </a>
          <span className="text-xs text-[#2c3a54]">WhatsApp</span>
        </div>
      </div>

      {/* Адрес и график */}
      <div className="flex justify-between items-start text-sm px-5 py-3.75">
        <div>
          <div className="flex items-center space-x-2">
            <Image src="/map.svg" alt="Адрес" width={20} height={20} />
            <span className="font-bold text-[16px] text-nowrap leading-4">
              Витебск, ул. Терешковой 9Б
            </span>
          </div>
          <div className="mt-3 mb-1.5 flex space-x-2">
            <Image
              src="/timer.svg"
              alt="Адрес"
              width={20}
              height={20}
              className="self-start pt-0.75"
            />
            <div className="leading-4.25 space-y-0.5">
              <p>Пн–Пт: 09:00 – 18:00</p>
              <p>Сб: 10:00 – 16:00</p>
              <p>Вск: выходной</p>
            </div>
          </div>
        </div>
        <Link
          href="/contacts"
          className="text-[#c24242] absolute right-5 mb-[5px] text-sm underline cursor-pointer text-nowrap self-end"
        >
          Все контакты
        </Link>
      </div>

      {/* Кнопка "Заказать звонок" */}
      <button
        className="w-full bg-[#2c3a54] text-white text-[16px] font-bold px-2.5 py-3.5"
        onClick={() => (window.location.href = "/order-call")}
      >
        Заказать звонок
      </button>
    </div>
  );
};

export default FooterPhoneDropdown;