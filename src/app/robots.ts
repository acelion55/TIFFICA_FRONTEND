import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/orders',
          '/profile',
          '/subscriptions',
          '/checkout',
          '/addresses',
          '/schedule',
          '/notifications',
          '/plan',
          '/reorder',
          '/subscribe',
          '/onboarding',
          '/forgot-password',
          '/signup'
        ],
      },
    ],
    sitemap: 'https://tiffica.vercel.app/sitemap.xml',
  };
}
