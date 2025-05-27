// types/Products.ts

export interface Variant {
  id: number | string;
  images: string[];
  selling_price: number | string;
  specification?: {
    colour?: string;
    [key: string]: any;
  };
  // add other fields here as needed
}

export interface Product {
  id: number | string;
  name: string;
  images: string[];
  base_price: number | string;
  selling_price: number | string;
  variant_list?: Variant[];
  // add other fields here as needed
}
