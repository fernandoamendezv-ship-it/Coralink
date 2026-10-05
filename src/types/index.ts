export interface ReviewItem {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  title: string;
  mainCategory: 'Personalizados' | 'Papelería creativa' | 'Detalles en resina';
  subCategory: string;
  price: number; // in Nicaraguan Cordobas (C$)
  originalPrice?: number;
  image: string;
  description: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  userRating?: number;
  badge?: string;
  inStock: boolean;
  featured?: boolean;
  isFlashDeal?: boolean;
  availableOptions?: {
    label: string;
    choices: string[];
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
  customNote?: string;
}

export type MainCategory = 'Todos' | 'Personalizados' | 'Papelería creativa' | 'Detalles en resina';
