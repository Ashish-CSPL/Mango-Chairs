// types/product.ts

export interface Product {
  dimensions: any;
  dimensions: any;
  care_instruction: string;
  warranty: string;
  delivery_or_installation_tips: ReactNode;
  product_details: any;
  product_details: any;
  id: number;
  slug: string;
  variant_id: number;
  sequence_number: number;
  name: string;
  category_id: number;
  category_name: string;
  minimum_order_quantity: number;
  description?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keyword?: string | null;
  base_price?: string;
  selling_price: string;
  base_and_selling_price_difference_in_percent: number;
  stock: number;
  is_new_arrival: boolean;
  images?: string[];
  tags?: string[];
  has_variant: boolean;
  variant_list?: Variant[];
}

export interface Variant {
  id: number;
  specification?: {
    colour?: string;
  };
  description?: string;
  colour_code?: string;
  selling_price: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keyword?: string | null;
  is_selected: boolean;
  dimensions?: {
    height: number | null;
    weight: number | null;
    length: number | null;
    width: number | null;
  };
  product_details?: any | null;
  care_instruction?: any | null;
  warranty?: any | null;
  delivery_or_installation_tips?: any | null;
  base_and_selling_price_difference_in_percent: number;
  stock: number;
  images?: string[];
  parentProduct?: Product;
}
