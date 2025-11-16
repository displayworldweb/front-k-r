import Image from "next/image";
import Link from "next/link";
import { menuCategories, additionalMenuItems } from "../mock/menuCategories";

interface BurgerDropdownProps {
  isBurgerDropdownOpen: boolean;
  PHONE_MTS: string;
  PHONE_A1: string;
  onLinkClick?: () => void;
}

const BurgerDropdown: React.FC<BurgerDropdownProps> = ({
  isBurgerDropdownOpen,
  PHONE_MTS,
  PHONE_A1,
  onLinkClick,
}) => {
  if (!isBurgerDropdownOpen) return null;

  return (
    <div
      id="burger-dropdown"
      role="menu"
      aria-label="Основное меню"
      className="
        absolute top-[76px] left-0 right-0
        z-50
        bg-white
        shadow-md
        text-sm
        text-[#2c3a54]
        overflow-y-auto
        max-h-[calc(100vh-137px)]
        min-w-90
      "
      style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)" }}
    >
      <nav>
        <ul className="divide-y divide-gray-200">
          {/* Основные категории */}
          {menuCategories.map((category, index) => (
            <li key={index} className="border-b border-gray-200">
              {category.subcategories.length > 0 ? (
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer pr-5 pl-2 py-1.25 font-medium text-[#2c3a54] hover:text-[#2c3a5499] select-none">
                    <div className="flex items-center space-x-2.5">
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={46}
                        height={46}
                      />
                      <span className="font-bold">{category.name}</span>
                    </div>
                    <Image
                      src="/arrow.svg"
                      alt="Раскрыть"
                      width={20}
                      height={20}
                      className="group-open:rotate-180 transition-transform"
                    />
                  </summary>
                  <ul>
                    {category.subcategories.map((sub, subIndex) => (
                      <li key={subIndex} className="bg-[#f5f6fa] pl-16 py-3 border-y border-gray-200 last:border-b-0">
                        <Link
                          href={sub.href}
                          role="menuitem"
                          onClick={onLinkClick}
                          className="block hover:underline text-[#2c3a54]"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  href={category.href!}
                  role="menuitem"
                  onClick={onLinkClick}
                  className="px-6 py-3 font-bold text-[#cd5554] hover:underline gap-4 flex"
                >
                  <Image
                    src={category.icon}
                    alt={category.name}
                    width={26}
                    height={26}
                  />
                  {category.name}
                </Link>
              )}
            </li>
          ))}

          {/* Дополнительные элементы */}
          {additionalMenuItems.map((item, index) => (
            <li key={index} className="border-b border-gray-200">
              {item.subcategories && item.subcategories.length > 0 ? (
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer px-5 py-4 font-medium text-[#2c3a54] hover:text-[#2c3a5499] select-none">
                    <div className="flex items-center space-x-6">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={20}
                        height={20}
                      />
                      <span className="font-bold">{item.name}</span>
                    </div>
                    <Image
                      src="/arrow.svg"
                      alt="Раскрыть"
                      width={20}
                      height={20}
                      className="transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <ul>
                    {item.subcategories.map((sub, subIndex) => (
                      <li key={subIndex} className="bg-[#f5f6fa] pl-16 py-3 border-t border-gray-200">
                        <Link
                          href={sub.href}
                          role="menuitem"
                          onClick={onLinkClick}
                          className="block hover:underline text-[#2c3a54]"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  href={item.href!}
                  role="menuitem"
                  onClick={onLinkClick}
                  className="flex items-center space-x-6 px-5 py-4 font-bold text-[#2c3a54] hover:text-[#2c3a5499]"
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                  />
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Нижняя часть с контактами */}
      <div className="pt-8 px-4.5 pb-4 text-sm text-[#2c3a54]">
        <div className="flex space-x-2.5">
          <a
            href={`tel:${PHONE_MTS.replace(/[\s-]/g, "")}`}
            className="flex items-center space-x-2 hover:underline"
            role="menuitem"
          >
            <span>{PHONE_MTS}</span>
          </a>
          <span>MTS</span>
        </div>
        <div className="flex space-x-2.5">
          <a
            href={`tel:${PHONE_A1.replace(/[\s-]/g, "")}`}
            className="flex items-center space-x-2 hover:underline"
            role="menuitem"
          >
            <span>{PHONE_A1}</span>
          </a>
          <span>A1</span>
        </div>

        <div className="flex space-x-3 mt-2.5">
          <button
            className="bg-[#2c3a54] text-white px-3.25 py-1.25 text-sm rounded-[42px]"
            onClick={() => (window.location.href = "/order-call")}
          >
            Заказать звонок
          </button>
          <a
            href="viber://chat?number=%2B375333226652"
            aria-label="Viber"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/viber.svg" alt="Viber" width={28} height={28} />
          </a>
          <a
            href="https://t.me/+375333226652"
            aria-label="Telegram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/tm.svg" alt="Telegram" width={28} height={28} />
          </a>
          <a
            href="https://wa.me/375333226652"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/wa.svg" alt="WhatsApp" width={28} height={28} />
          </a>
        </div>

        <div className="mt-5 leading-4.5">
          <p>Пн-пт 10:00 до 19:00</p>
          <p>Сб 10:00 до 15:00</p>
          <p>Вскр выходной</p>
        </div>

        <Link href="https://www.instagram.com/pamyatniki_granit_vitebsk/" className="block mt-3.75 items-center">
          <Image width={24} height={24} src={"/ig.svg"} alt="Instagram" />
        </Link>

        <div className="flex items-center mt-5.25 text-[16px] text-[#2c3a54]">
          <span>Витебск, ул. Терешковой 9Б</span>
        </div>

        <div className="flex justify-between items-center leading-[23px]">
          <Link
            href="/contacts"
            className="text-[#cd5554] underline text-sm"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BurgerDropdown;