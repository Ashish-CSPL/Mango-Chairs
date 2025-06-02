// types/Products.ts

// Existing Product interface (assuming this is correct based on your API response)
export interface Product {
  id: number;
  slug: string;
  variant_id: number;
  sequence_number: number;
  name: string;
  category_id: number;
  category_name: string;
  minimum_order_quantity: number;
  description: string;
  seo_title: string;
  seo_description: string | null;
  seo_keyword: string | null;
  base_price: string; // Keep as string if it's a decimal from API
  selling_price: string; // Keep as string if it's a decimal from API
  base_and_selling_price_difference_in_percent: number;
  stock: number;
  is_new_arrival: boolean;
  images: string[]; // Array of image paths
  tags: string[];
  has_variant: boolean;
  variant_list: Variant[]; // <--- Use 'Variant' here now
}

// **FIXED: Renamed ProductVariant to Variant**
export interface Variant {
  id: number;
  specification: {
    colour: string;
    [key: string]: string; // To allow other dynamic specifications like 'size' etc.
  };
  description: string;
  colour_code: string;
  selling_price: string;
  seo_title: string;
  seo_description: string | null;
  seo_keyword: string | null;
  is_selected: boolean;
  dimensions: {
    height: number | null;
    weight: number | null;
    length: number | null;
    width: number | null;
  };
  product_details: string | null;
  care_instruction: string | null;
  warranty: string | null;
  delivery_or_installation_tips: string | null;
  base_and_selling_price_difference_in_percent: number;
  stock: number;
  images: string[];
}

// ProductsApiResponse interface (no change needed here unless backend changes again)
export interface ProductsApiResponse {
  min_value: string;
  max_value: string;
  total_pages: number;
  current_page: number;
  page_size: number;
  products: Product[];
}