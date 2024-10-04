// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['thumbs.dreamstime.com','png.pngtree.com'],
    },
    experimental: {
        serverComponentsExternalPackages: ['socket.io'],
    },
    async headers(){
        return[
            {
                // Apply these headers to all API routes
                source: "/api/(.*)",
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' }, // You can replace '*' with your specific frontend domain
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ]
    }
}

export default nextConfig;
