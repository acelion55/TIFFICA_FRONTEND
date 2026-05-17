import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Jaipur Tiffin Service — Areas, Budget Meals & Plans | Tiffica',
  description:
    'Explore Tiffica Jaipur tiffin pages — best tiffin in Vaishali Nagar, Malviya Nagar, Jagatpura, Mahesh Nagar, Mansarovar, student & office plans, meals under ₹100.',
  path: '/jaipur-tiffin',
});

export default function JaipurTiffinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
