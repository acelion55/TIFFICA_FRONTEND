import { MetadataRoute } from 'next';
import { SEO_PAGE_SLUGS } from '@/data/seo-pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tiffica.xyz';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

  // Public static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jaipur-tiffin`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
  ];

  const seoLandingRoutes: MetadataRoute.Sitemap = SEO_PAGE_SLUGS.map((slug) => ({
    url: `${baseUrl}/jaipur-tiffin/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Dynamic blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${apiUrl}/blogs`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const blogsData = await response.json();
    
    // Handle both array and object with blogs property
    const blogs = Array.isArray(blogsData) ? blogsData : (blogsData.blogs || blogsData.data || []);
    
    if (Array.isArray(blogs) && blogs.length > 0) {
      blogRoutes = blogs.map((blog: any) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt || blog.publishedAt || blog.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  // Dynamic menu items routes
  let menuRoutes: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${apiUrl}/menu`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const data = await response.json();
    const menuItems = data.items || data.data || [];
    
    if (Array.isArray(menuItems) && menuItems.length > 0) {
      menuRoutes = menuItems.slice(0, 50).map((item: any) => ({
        url: `${baseUrl}/menu?item=${item._id}`,
        lastModified: new Date(item.updatedAt || item.createdAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching menu items for sitemap:', error);
  }

  return [...staticRoutes, ...seoLandingRoutes, ...blogRoutes, ...menuRoutes];
}
