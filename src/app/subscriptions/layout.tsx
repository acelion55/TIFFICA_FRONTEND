import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Tiffin Subscriptions — Monthly Plans Jaipur | Tiffica',
  description: 'Subscribe to monthly tiffin service Jaipur — affordable veg plans for students, bachelors & families.',
  path: '/subscriptions',
  extraKeywords: 'monthly tiffin service Jaipur, monthly tiffin for students in Jaipur',
});

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
