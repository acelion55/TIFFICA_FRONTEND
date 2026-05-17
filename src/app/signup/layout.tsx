import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Sign Up — Tiffica Tiffin Service Jaipur',
  description: 'Create your Tiffica account — affordable veg tiffin, student meal plans & monthly tiffin service in Jaipur.',
  path: '/signup',
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
