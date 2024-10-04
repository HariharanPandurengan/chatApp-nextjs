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
                source: "/api/(.*)",
                headers: [
                    { Key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { Key: 'Access-Control-Allow-Origin', value: '*'},
                    { key: 'Access-Control-Allow-Method', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'}
                ]
            }
        ]
    }
}

export default nextConfig;
