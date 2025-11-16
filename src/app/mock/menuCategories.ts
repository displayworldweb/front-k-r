export const menuCategories = [
  {
    name: 'Акции',
    href: '/sales',
    icon: '/percent.svg',
    subcategories: [],
  },
  {
    name: 'Памятники',
    href: '/monuments',
    icon: '/monuments.webp',
    subcategories: [
      { name: 'Одиночные', href: '/monuments/single', img: '/monuments/single.webp' },
      { name: 'Двойные', href: '/monuments/double', img: '/monuments/double.webp' },
      { name: 'Эксклюзивные', href: '/monuments/exclusive', img: '/monuments/exclusive.webp' },
      { name: 'Недорогие', href: '/monuments/cheap', img: '/monuments/cheap.webp' },
      { name: 'В виде креста', href: '/monuments/cross', img: '/monuments/cross.webp' },
      { name: 'В виде сердца', href: '/monuments/heart', img: '/monuments/heart.webp' },
      { name: 'Составные', href: '/monuments/composite', img: '/monuments/single.webp' },
      { name: 'Европейские', href: '/monuments/europe', img: '/monuments/single.webp' },
      { name: 'Художественная резка', href: '/monuments/artistic', img: '/monuments/single.webp' },
      { name: 'В виде деревьев', href: '/monuments/tree', img: '/monuments/single.webp' },
      { name: 'Мемориальные комплексы', href: '/monuments/complex', img: '/monuments/complex.webp' },
    ],
  },
  {
    name: 'Ограды',
    href: '/fences',
    icon: '/fences.webp',
    subcategories: [
      { name: 'Гранитные ограды', href: '/fences/granite', img: '/fences/granite.webp' },
      { name: 'С полимерным покрытием', href: '/fences/polymer', img: '/fences/granite.webp' },
      { name: 'Металлические ограды', href: '/fences/metal', img: '/fences/metal.webp' },
    ],
  },
  {
    name: 'Аксессуары',
    href: "/accessories",
    icon: '/accessories.webp',
    subcategories: [
      { name: 'Вазы', href: '/accessories/vases', img: '/accessories/vases.webp' },
      { name: 'Лампы', href: '/accessories/lamps', img: '/accessories/lamps.webp' },
      { name: 'Скульптуры', href: '/accessories/sculptures', img: '/accessories/sculptures.webp' },
      { name: 'Рамки', href: '/accessories/frames', img: '/accessories/frames.webp' },
      { name: 'Изделия из бронзы', href: '/accessories/bronze', img: '/accessories/bronze.webp' },
      { name: 'Надгробные плиты', href: '/accessories/plates', img: '/accessories/plates.webp' },
      { name: 'Гранитные таблички', href: '/accessories/tables', img: '/accessories/tables.webp' },
    ],
  },
  {
    name: 'Благоустройство',
    href: "/landscape",
    icon: '/landscape.webp',
    subcategories: [
      { name: 'Благоустройство могил', href: '/landscape/graves', img: '/landscape/graves.webp' },
      { name: 'Фундамент для памятников', href: '/landscape/foundation', img: '/landscape/foundation.webp' },
      { name: 'Укладка плитки', href: '/landscape/tiles', img: '/landscape/tiles.webp' },
      { name: 'Столы и скамейки', href: '/landscape/benches', img: '/landscape/benches.webp' },
      { name: 'Щебень декоративный', href: '/landscape/gravel', img: '/landscape/gravel.webp' },
      { name: 'Искусственный газон', href: '/landscape/lawn', img: '/landscape/lawn.webp' },
    ],
  },
  {
    name: 'Услуги',
    href: "/services",
    icon: '/services.webp',
    subcategories: [
      { name: 'Установка памятников', href: '/services/monument-installation', img: '/services/monument-installation.webp' },
      { name: 'Установка оград', href: '/services/fence-installation', img: '/services/fence-installation.webp' },
      { name: 'Изготовление памятников', href: '/services/monument-production', img: '/services/monument-production.webp' },
      { name: 'Демонтаж памятников', href: '/services/monument-dismantle', img: '/services/monument-dismantle.webp' },
      { name: '3D-моделирование', href: '/services/3d', img: '/services/3d-modeling.webp' },
    ],
  },
  {
    name: 'Оформление памятников',
    href: "/design",
    icon: '/design.webp',
    subcategories: [
      { name: 'Эпитафии', href: '/design/epitaphs', img: '/design/epitaphs.webp' },
      { name: 'Гравировка портрета', href: '/design/portrait', img: '/design/portrait.webp' },
      { name: 'Медальоны на памятник', href: '/design/medallions', img: '/design/medallions.webp' },
      { name: 'Гравировка текста', href: '/design/text-engraving', img: '/design/text-engraving.webp' },
    ],
  },
];

// Дополнительные элементы меню (без подкатегорий, для мобильной версии)
export const additionalMenuItems = [
  {
    name: 'О компании',
    href: null, // Dropdown в мобильной
    icon: '/about.svg',
    subcategories: [
      { name: 'Политика конфиденциальности', href: '/policy' },
    ],
  },
  {
    name: 'Наши работы',
    href: '/works',
    icon: '/works.svg',
  },
  {
    name: 'Оплата и доставка',
    href: '/payment',
    icon: '/payment.svg',
  },
  {
    name: 'Блог',
    href: '/blog',
    icon: '/blog.svg',
  },
  {
    name: 'Виды гранита',
    href: '/granite',
    icon: '/granite.svg',
  },
  {
    name: 'Избранное',
    href: '/favorites',
    icon: '/star.svg',
  },
  {
    name: 'Контакты',
    href: '/contacts',
    icon: '/contacts.svg',
  },
];
