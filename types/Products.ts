// types/Products.ts

// Define the structure of a product variant's specifications
export interface Specification { // <--- Added 'export' for clarity if needed elsewhere
  colour?: string;
  size?: string; // <--- ADDED THIS LINE
  // Add any other specific variant attributes here (e.g., material if they vary by variant)
}

// Define the structure for product dimensions
export interface Dimensions { // <--- Added 'export'
  height: number | null;
  weight: number | null;
  length: number | null;
  width: number | null;
}

// Define the structure for product details
export interface ProductDetails { // <--- Added 'export'
  material?: string;
  weight_bearing_number?: number;
  is_stackable?: boolean;
  stackable_pieces_number?: number;
  // Add other product details as needed
}

// Define the structure for a product variant
export interface Variant {
  id: number;
  specification?: Specification;
  description?: string;
  colour_code?: string;
  selling_price: string;
  seo_title?: string;
  seo_description?: string | null;
  seo_keyword?: string | null;
  is_selected: boolean;
  dimensions?: Dimensions | null;
  product_details?: ProductDetails | null;
  care_instruction?: string | null;
  warranty?: string | null;
  delivery_or_installation_tips?: string | null;
  base_and_selling_price_difference_in_percent: number;
  stock: number;
  images: string[];
}

// Define the structure for the main product
export interface Product {
  id: string;
  slug: string;
  variant_id: number;
  sequence_number: number;
  name: string;
  category_id: number;
  category_name: string;
  minimum_order_quantity: number;
  description: string;
  seo_title?: string;
  seo_description?: string | null;
  seo_keyword?: string | null;
  base_price: string;
  selling_price: string;
  base_and_selling_price_difference_in_percent: number;
  stock: number;
  is_new_arrival: boolean;
  images: string[];
  tags: string[];
  has_variant: boolean;
  variant_list?: Variant[]; // Optional, as some products might not have variants
  dimensions?: Dimensions | null; // Added based on variant structure, might be top-level for product too
  product_details?: ProductDetails | null; // Added based on variant structure
  care_instruction?: string | null;
  warranty?: string | null;
  delivery_or_installation_tips?: string | null;
  
}