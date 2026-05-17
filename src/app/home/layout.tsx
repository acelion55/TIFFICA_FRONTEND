import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Order Tiffin — Home | Tiffica Jaipur',
  description: 'Order daily veg tiffin in Jaipur — browse menu, add to cart, and get homemade food delivery in your area.',
  path: '/home',
});

export default function HomeAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
