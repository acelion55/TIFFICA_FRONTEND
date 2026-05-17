import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Checkout — Order Tiffin Jaipur | Tiffica',
  description: 'Complete your tiffin order in Jaipur — secure payment, fast delivery to Vaishali Nagar, Malviya Nagar & across Jaipur.',
  path: '/checkout',
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
