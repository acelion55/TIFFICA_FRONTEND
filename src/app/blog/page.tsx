import type { Metadata } from 'next';
import BlogClient from './BlogClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Tiffica Food Blog — Healthy Tiffin & Homemade Food Jaipur',
  description:
    'Tiffica blog — healthy eating, veg tiffin tips, student meal ideas, office lunch & homemade food culture in Jaipur.',
  path: '/blog',
  extraKeywords: 'food blog jaipur, healthy eating tips jaipur, tiffin recipes jaipur',
});

export default function BlogListing() {
  return <BlogClient />;
}
