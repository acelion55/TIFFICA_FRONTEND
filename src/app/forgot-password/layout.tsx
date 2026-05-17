import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Reset Password — Tiffica Jaipur',
  path: '/forgot-password',
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
