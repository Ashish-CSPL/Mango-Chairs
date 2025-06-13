/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Prefer remotePatterns for Next.js 13+ for better security and specificity
    remotePatterns: [
      {
        protocol: 'https', // or 'http' if your dev server uses http
        hostname: 'res.cloudinary.com', // *** IMPORTANT: Replace with your exact Cloudinary hostname if different ***
        port: '',
        pathname: '/**', // Allows any path on this hostname
      },
      {
        protocol: 'https', // or 'http'
        hostname: 'nxadmin.consociate.co.in', // Your other domain
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // or 'http'
        hostname: 'placehold.co', // Your other domain
        port: '',
        pathname: '/**',
      },
      // If your backend serves profile images directly and that's not 'nxadmin.consociate.co.in', add its domain here.
      // Example: If your backend is at 'yourbackend.com' and serves images from 'yourbackend.com/media/profile_pics/...'
      // {
      //   protocol: 'https',
      //   hostname: 'yourbackend.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
    // The 'domains' array is deprecated in favor of 'remotePatterns' in Next.js 13 and above.
    // Keeping it for reference, but 'remotePatterns' is preferred.
    // domains: [
    //   'nxadmin.consociate.co.in',
    //   'res.cloudinary.com',
    //   'placehold.co',
    // ],
  },
};

module.exports = nextConfig;