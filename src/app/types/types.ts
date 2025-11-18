export type ColorOption = {
  name: string;
  color: string;
  image: string;
  price?: number;
  oldPrice?: number;
  discount?: number;
  hit?: boolean;
};

export type Product = {
  id: number;
  slug?: string;
  name: string;
  description?: string;
  height?: string;
  price?: number;
  oldPrice?: number;
  discount?: number;
  textPrice?: string;
  category: string;
  image: string;
  colors?: ColorOption[];
  options?: Record<string, string>;
  hit?: boolean;
  popular?: boolean;
  new?: boolean;
  productType?: string; // Тип товара: monuments, fences, accessories, landscape
  categorySlug?: string; // Slug категории для корректной генерации ссылок
};

export type Category = {
  title: string;
  price?: string;
  img: string;
  link: string;
};

export type Review = {
  id: number,
  name: string,
  date: string,
  rating: number,
  text: string,
}

export interface Epitaph {
    id?: number;
    text: string;
}

export type Specifications = {
  size?: string;
  secondarySize?: string;
  frameBorder?: string;
  graniteTypes?: string;
  pillar?: string;
  storage?: string;
  warranty?: string;
};

export type Fence = {
  id: number;
  slug: string;
  name: string;
  price?: number;
  textPrice?: string;
  category: string;
  image: string;
  specifications?: Specifications;
  createdAt?: string;
};