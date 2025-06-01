// src/types/user.ts

export interface User {
  full_name: string; // This is good, keep as string
  username: string;
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_code_for_phone_number?: string;
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  profile_picture?: string | null;
}

export interface UserState {
  profile_picture?: string | null;
  full_name: string; // <--- CHANGE THIS TO BE REQUIRED (remove '?')
  username: string;
  email: string;
  id: string;
  token: string;
  is_verified: boolean;
}