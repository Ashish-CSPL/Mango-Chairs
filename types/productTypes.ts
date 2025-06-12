export interface VariantImage {
  id: number;
  url: string;
  variantId: number;
}

export interface Variant {
  id: number;
  description: string;
  specification: {
    color: string; // Update to `type: string` if needed
  };
  Price: number;
  stock: number;
  productId: number;
  images: VariantImage[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  description: string;
  variants: Variant[];
}
