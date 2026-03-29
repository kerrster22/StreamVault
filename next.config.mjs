/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Proxy all /api/* requests to the FastAPI backend.
  // BACKEND_URL is set in docker-compose.yml; falls back to localhost for local dev.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
