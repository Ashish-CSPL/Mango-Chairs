export interface BannerData {
  id?: number;
  sequenceNumber?: number;
  title?: string; // from API
  link?: string;  // from API
  heading?: string;
  sub_heading?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;  // from API
  updatedAt?: string;  // from API
}
