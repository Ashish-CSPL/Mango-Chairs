// types/product.ts
import { ReactNode } from 'react';

export interface Variant {
  id: number | string; // Allow for both number and string IDs
  images?: string[]; // Made optional, as some variants might not have dedicated images
  selling_price: number | string;
  base_price?: number | string; // Added base_price for variants
  specification?: {
    colour?: string;
    size?: string; // Example: Add other common specifications
    [key: string]: any; // Allows for dynamic/unknown specification fields
  };
  description?: string;
  colour_code?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keyword?: string | null;
  is_selected?: boolean; // Made optional, often a UI state
  dimensions?: {
    height: number | null;
    weight: number | null;
    length: number | null;
    width: number | null;
  };
  product_details?: any | null;
  care_instruction?: string | null; // Changed to string for consistency
  warranty?: string | null;
  delivery_or_installation_tips?: ReactNode | string | null;
  base_and_selling_price_difference_in_percent?: number; // Made optional if not always present
  stock?: number; // Made optional, as stock might not always be present on a variant object directly
  parentProduct?: Product; // For linking back to the parent product (client-side specific)
}

export interface Product {
  id: number | string; // Allow for both number and string IDs
  slug: string;
  variant_id?: number | null; // Made optional
  sequence_number?: number; // Made optional
  name: string;
  category_id?: number; // Made optional
  category_name?: string; // Made optional
  minimum_order_quantity?: number; // Made optional
  description?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keyword?: string | null;
  base_price?: number | string; // Use number | string for consistency
  selling_price: number | string;
  base_and_selling_price_difference_in_percent?: number; // Made optional
  stock?: number; // Made optional
  is_new_arrival?: boolean; // Made optional
  images?: string[]; // Made optional
  tags?: string[]; // Made optional
  has_variant?: boolean; // Made optional
  variant_list?: Variant[]; // Array of Variant objects

  // Detailed properties for a Product (from previous comprehensive type)
  dimensions?: {
    height: number | null;
    weight: number | null;
    length: number | null;
    width: number | null;
  };
  care_instruction?: string;
  warranty?: string;
  delivery_or_installation_tips?: ReactNode | string;
  product_details?: any;
}