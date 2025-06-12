// Ensure these types are in your @/types/Products.ts file
// They are duplicated here for context but should ideally be in one place.

// Define the structure of a product variant's specifications
interface Specification {
  type?: string;
  colour?: string;
  material?: string;
  weight?: string;
  size?: string | number | (string | number)[];
}

// Define the structure for a product variant image
export interface VariantImage {
  id: number;
  url: string;
  variantId: number;
}

// Define the structure for a product variant
export interface Variant {
  id: number;
  description?: string;
  specification?: Specification;
  Price?: number; // Note capital P in API response
  price?: number; // Lowercase p for consistency
  stock: number;
  productId: number;
  images: VariantImage[] | string[];
}

// Define the structure for product categories
interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

// Define the main product structure
export interface Product {
  items: any;
  id: number;
  name: string;
  price: number;
  image: string;
  userId: number;
  stock: number;
  is_new_arrival: boolean;
  is_active: boolean;
  tag: string[];
  slug: string;
  description: string;
  categories: Category[];
  variants: Variant[];
  
}

// Define API response structure - CORRECTED
export interface ProductsApiResponse {
  page: number;
  totalPages: number; // Correct property name from API
  totalItems: number; // Correct property name from API
  items: Product[]; // Correct property name from API
}
