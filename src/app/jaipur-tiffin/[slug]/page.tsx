import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import TiffinLandingClient from '@/components/seo/TiffinLandingClient';
import { buildPageMetadata } from '@/lib/seo';
import { getSeoPageBySlug, SEO_PAGE_SLUGS, SEO_PAGES } from '@/data/seo-pages';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SEO_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPageBySlug(slug);
  if (!page) return {};

  const title = `${page.h1} | Tiffica Jaipur`;
  const description = `${page.intro.slice(0, 155)}… Order fresh veg tiffin in Jaipur with Tiffica.`;

  return buildPageMetadata({
    title,
    description,
    path: `/jaipur-tiffin/${slug}`,
    extraKeywords: page.primaryKeyword,
  });
}

export default async function JaipurTiffinPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoPageBySlug(slug);
  if (!page) notFound();

  const related = SEO_PAGES.filter(
    (p) => p.slug !== slug && (p.category === page.category || p.area === page.area)
  ).slice(0, 6);

  return (
    <>
      <TiffinLandingClient page={page} />
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-8">Related Tiffin Pages</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/jaipur-tiffin/${r.slug}`}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary font-bold text-sm uppercase tracking-tight transition-colors"
              >
                {r.h1}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
