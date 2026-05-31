import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Tiffin Menu Jaipur | Veg Meals Under ₹100 | Tiffica',
  description:
    'Browse Tiffica daily menu — pure veg tiffin in Jaipur, meals under ₹100, breakfast, lunch & dinner. Order homemade food delivery in Vaishali Nagar, Malviya Nagar & more.',
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
