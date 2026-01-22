import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Inventory Pro',
        short_name: 'Inventory',
        description: 'Gestão de Inventário e Ativos',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#09090b', // zinc-950
        icons: [
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
