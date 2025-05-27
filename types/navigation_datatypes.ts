// export interface NavItem {
//   pk: number;
//   val: string;
//   name: string;
//   link: string;
//   children?: NavItem[]; 
// }
// export interface CategoryItem {
//   id: number;
//   title: string;
//   image: string;
// }
// src/types/user.ts
// Or you can put this in a more general types file like src/types.ts

/**
 * Defines the structure for a user object in your application.
 *
 * The 'profile_picture' field is defined as a string or null,
 * representing the URL or path to the user's profile image.
 * This resolves the TypeScript error where it was mistakenly
 * interpreted as a method.
 */
export interface User {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_code_for_phone_number?: string; // Example: +91
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  profile_picture?: string | null; // Corrected: This should be a string or null
}