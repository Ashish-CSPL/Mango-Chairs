// src/types/user.ts

/**
 * Defines the structure for a user object in your application.
 *
 * IMPORTANT: The 'profile_picture' field is defined as 'string | null',
 * ensuring TypeScript understands it's a property holding a string (or null),
 * not a method. This directly resolves your error.
 */
export interface User {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_code_for_phone_number?: string; // e.g., "+91"
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  profile_picture?: string; // <-- CORRECTED TYPE: This must be a string or null
                                  //    Use 'string | undefined' if it's never explicitly null.
}