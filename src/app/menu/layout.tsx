import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Daily Tiffin Menu Jaipur | Veg Meals Under ₹100 | Tiffica',
  description:
    'Browse Tiffica daily menu — pure veg tiffin in Jaipur, meals under ₹100, breakfast, lunch & dinner. Order homemade food delivery in Vaishali Nagar, Malviya Nagar & more.',
  path: '/menu',
  extraKeywords: 'daily tiffin service Jaipur, pure veg tiffin Jaipur, lunch box service Jaipur',
});

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
