import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicit Turbopack configuration to avoid workspace inference and root issues
  turbopack: {
    // Set project root to the frontend directory
    root: path.join(process.cwd()),
  }
};

export default nextConfig;
