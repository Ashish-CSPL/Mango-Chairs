// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Keep this if you want React's strict mode
  images: {
    domains: [
      'nxadmin.consociate.co.in',
      'localhost', // Typically for local development images
      'placehold.co', // **Crucially, add this for your placeholder images**
      // Add any other domains where your product images are hosted (e.g., S3, Cloudinary, etc.)
    ],
  },
  // Add other Next.js configurations here if needed
};

module.exports = nextConfig;