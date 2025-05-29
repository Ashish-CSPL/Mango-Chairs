// types/category.ts

export interface Category {
  id: number;
  name: string;
  description: string;
  title: string;
  slug: string;
  seo_title: string;
  seo_data: string; // Consider refining this type if you know its structure
  seo_description: string;
  seo_keyword: string;
  image: string;
  heading: string;
  banner: string;
  product_count: number;
  updated_at: string;
  child_categories: Category[]; // Recursive for nested categories
}