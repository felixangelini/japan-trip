import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amatelini Japan Trip',
    short_name: 'Amatelini Japan Trip',
    description: 'Amatelini Japan Trip',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: '/512.png',
        type: 'image/png',
        sizes: '512x512',
        form_factor: 'narrow'
      },
      {
        src: '/512.png',
        type: 'image/png',
        sizes: '512x512',
        form_factor: 'wide'
      }
    ]
  }
}