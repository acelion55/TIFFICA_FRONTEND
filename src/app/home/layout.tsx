import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Tiffin — Home | Tiffica Jaipur',
  description: 'Order daily veg tiffin in Jaipur — browse menu, add to cart, and get homemade food delivery in your area.',
};

export default function HomeAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
