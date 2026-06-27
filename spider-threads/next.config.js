/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We serve user-uploaded images from /public/uploads with plain <img>,
  // so the image optimizer (and the sharp dependency) is not required.
  images: { unoptimized: true },
};

module.exports = nextConfig;
