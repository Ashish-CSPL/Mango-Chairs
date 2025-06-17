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
  Price?: number; // Prefer using Price consistently if API uses this
  price?: number; // Optional fallback
  stock: number;
  productId: number;
  images: VariantImage[] | string[];
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  // Add image here if it's part of your Category object from the API
  image?: string; 
}

export interface Product {
  onSale?: boolean; // Existing property, will be used for 'Sale' badge
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  description?: string;
  type?: "veg" | "non-veg";
  variants?: Variant[];

  // --- THIS IS THE CRUCIAL CHANGE ---
  // Change 'category' to 'categories' and make it an array of Category
  categories?: Category[]; // Make it optional if a product might not always have categories
  // If a product *always* has at least one category, remove the '?'
  // categories: Category[];
  // --- END CRUCIAL CHANGE ---

  // Optional product metadata fields
  reviewsCount?: number;
  rating?: number;
  ingredients?: string[];
  short_description?: string;
  size?: string;
  energyKj?: number;
  energyKcal?: number;
  fat?: number;
  gluxit?: number;
  sugar?: number;
  protein?: number;
  // userId and is_active are present in your Postman response but missing from your Product type.
  // Consider adding them if you use them:
  userId?: number;
  is_active?: boolean;

  // --- ADDED NEW PROPERTIES ---
  isAvailable?: boolean; // Added for store availability (e.g., "Store will open")
  availableTime?: string; // Added for the specific opening time
}

export interface ProductsApiResponse {
  page: number;
  totalPages: number;
  totalItems: number;
  items: Product[];
}