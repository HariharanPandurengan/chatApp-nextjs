// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['thumbs.dreamstime.com'],
    },
    experimental: {
        serverComponentsExternalPackages: ['socket.io'],
    }
}

export default nextConfig;
