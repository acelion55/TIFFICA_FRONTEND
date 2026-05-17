import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { SEO_PAGES } from '@/data/seo-pages';

export const metadata = buildPageMetadata({
  title: 'Jaipur Tiffin Service Areas & Plans | Tiffica',
  description:
    'Browse all Tiffica Jaipur tiffin pages — Vaishali Nagar, Malviya Nagar, Jagatpura, Mahesh Nagar, Mansarovar, student plans, office lunch, Jain food, and meals under ₹100.',
  path: '/jaipur-tiffin',
});

const SECTIONS = [
  { title: 'Best Tiffin by Area', filter: (p: (typeof SEO_PAGES)[0]) => p.category === 'area' },
  { title: 'Tiffin Near You', filter: (p: (typeof SEO_PAGES)[0]) => p.category === 'near' },
  { title: 'Under ₹100 Tiffin', filter: (p: (typeof SEO_PAGES)[0]) => p.category === 'budget' },
  { title: 'Jaipur Tiffin Services', filter: (p: (typeof SEO_PAGES)[0]) => p.category === 'service' },
];

export default function JaipurTiffinIndexPage() {
  return (
    <div className="bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-6">
          Tiffin Service <span className="text-primary italic">Jaipur</span>
        </h1>
        <p className="text-xl text-muted font-medium max-w-2xl mb-16">
          Find the best tiffin service in Jaipur by area, budget, and lifestyle — students, offices, PG, and families.
        </p>

        {SECTIONS.map((section) => {
          const pages = SEO_PAGES.filter(section.filter);
          if (!pages.length) return null;
          return (
            <section key={section.title} className="mb-16">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6">{section.title}</h2>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/jaipur-tiffin/${p.slug}`}
                      className="block p-5 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 font-bold text-sm uppercase tracking-tight transition-all"
                    >
                      {p.h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
