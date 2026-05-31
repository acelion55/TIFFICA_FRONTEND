import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule Meals — Daily Tiffin Jaipur | Tiffica',
  description: 'Schedule your daily tiffin delivery in Jaipur — flexible meal plans for students, PG & office lunch service.',
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
