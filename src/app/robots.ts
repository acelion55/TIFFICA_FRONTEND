import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',
          '/delivery-partner/*',
          '/api/*',
          '/home',
          '/orders/*',
          '/profile/*',
          '/subscriptions/*',
          '/checkout/*',
          '/addresses/*',
          '/schedule/*',
          '/notifications/*',
          '/plan/*',
          '/reorder/*',
          '/subscribe/*',
          '/onboarding/*',
          '/forgot-password/*',
          '/signup',
          '/login',
          '/analytics/*',
        ],
      },
    ],
    sitemap: 'https://tiffica.vercel.app/sitemap.xml',
  };
}
