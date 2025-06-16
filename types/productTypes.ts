// types/productTypes.ts

export interface VariantImage {
  id: number;
  url: string;
  variantId: number;
}

export interface Specification {
  type?: string;
  colour?: string;
  material?: string;
  weight?: string;
  size?: string | number | (string | number)[];
}

export interface Variant {
  id: number;
  description?: string;
  specification?: Specification;
  Price?: number;
  price?: number;
  stock: number;
  productId: number;
  images: VariantImage[] | string[];
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  description: string;
  variants: Variant[];

  // Optional fields
  userId?: number;
  stock?: number;
  is_new_arrival?: boolean;
  is_active?: boolean;
  tag?: string[];
  categories?: Category[];
  items?: any; // Optional for response compatibility
}

export interface ProductsApiResponse {
  page: number;
  totalPages: number;
  totalItems: number;
  items: Product[];
}
