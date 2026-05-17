import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Login — Tiffica Tiffin Service Jaipur',
  description: 'Log in to Tiffica — order best tiffin service in Jaipur, manage subscriptions, and track delivery in Vaishali Nagar, Malviya Nagar & Mansarovar.',
  path: '/login',
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
