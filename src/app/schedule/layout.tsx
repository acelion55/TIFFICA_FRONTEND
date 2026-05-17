import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Schedule Meals — Daily Tiffin Jaipur | Tiffica',
  description: 'Schedule your daily tiffin delivery in Jaipur — flexible meal plans for students, PG & office lunch service.',
  path: '/schedule',
  extraKeywords: 'daily tiffin service Jaipur, monthly tiffin service Jaipur',
});

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
