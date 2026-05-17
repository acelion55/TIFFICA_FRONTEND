import type { Metadata } from 'next';

export const SITE_URL = 'https://tiffica.xyz';

/** Jaipur-focused keywords only — no Ajmer/Beawar targeting */
export const GLOBAL_SEO_KEYWORDS = [
  'best tiffin service in vaishali nagar jaipur',
  'best tiffin service in mahesh nagar jaipur',
  'best tiffin service in mansarovar jaipur',
  'best tiffin service in jagatpura jaipur',
  'best tiffin service in malviya nagar jaipur',
  'any tiffin service near jagatpura',
  'any tiffin service near malviya nagar',
  'any tiffin service near vaishali nagar',
  'any tiffin service near mahesh nagar',
  'any tiffin service near mansarovar',
  'best tiffin under 100 rupees in malviya nagar jaipur',
  'best tiffin under 100 rupees in jagatpura jaipur',
  'best tiffin under 100 rupees in vaishali nagar jaipur',
  'best tiffin under 100 rupees in mahesh nagar jaipur',
  'best tiffin under 100 rupees in mansarovar jaipur',
  'best tiffin service in Jaipur',
  'home tiffin service Jaipur',
  'veg tiffin service Jaipur',
  'homemade food delivery Jaipur',
  'lunch box service Jaipur',
  'monthly tiffin service Jaipur',
  'affordable tiffin service Jaipur',
  'healthy tiffin service Jaipur',
  'pure veg tiffin Jaipur',
  'daily tiffin service Jaipur',
  'ghar jaisa khana Jaipur',
  'homemade lunch Jaipur',
  'dabba service Jaipur',
  'tiffin service for students in Jaipur',
  'PG food service Jaipur',
  'student meal service Jaipur',
  'budget tiffin service Jaipur',
  'hostel food delivery Jaipur',
  'affordable food for students Jaipur',
  'monthly tiffin for students in Jaipur',
  'tiffin service for coaching students in Jaipur',
  'homemade food for bachelors Jaipur',
  'tiffin service for bachelor in Jaipur',
  'office lunch service Jaipur',
  'corporate tiffin service Jaipur',
  'lunch delivery for office Jaipur',
  'executive lunch box Jaipur',
  'healthy office meals Jaipur',
  'work lunch delivery Jaipur',
  'daily office tiffin Jaipur',
  'cheap tiffin service Jaipur',
  'tiffin under 80 rupees Jaipur',
  'tiffin under 120 rupees Jaipur',
  'budget meal service Jaipur',
  'low cost homemade food Jaipur',
  'economical tiffin Jaipur',
  'best homemade tiffin service for students in Jaipur',
  'affordable veg tiffin service in Jaipur',
  'healthy homemade lunch delivery Jaipur',
  'daily food delivery service Jaipur',
  'pure veg home food Jaipur',
  'monthly lunch service Jaipur',
  'best food for PG students Jaipur',
  'homemade chapati sabzi delivery Jaipur',
  'north indian tiffin service Jaipur',
  'Jain food tiffin Jaipur',
  'homemade food for working professionals Jaipur',
  'lunch service for bachelors Jaipur',
  'healthy veg meals Jaipur',
  'fresh homemade food Jaipur',
  'roti sabzi delivery Jaipur',
  'ghar ka khana delivery Jaipur',
  'tiffin service for girls Jaipur',
  'hygienic tiffin Jaipur',
  'no onion garlic tiffin Jaipur',
  'Jain tiffin service Jaipur',
].join(', ');

const DEFAULT_DESCRIPTION =
  'Order the best affordable homemade tiffin in Jaipur — Vaishali Nagar, Malviya Nagar, Jagatpura, Mahesh Nagar & Mansarovar. Veg meals, student & office plans, under ₹100 options. Fresh ghar ka khana daily.';

export function buildPageMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  extraKeywords?: string;
}): Metadata {
  const description = opts.description || DEFAULT_DESCRIPTION;
  const keywords = opts.extraKeywords
    ? `${opts.extraKeywords}, ${GLOBAL_SEO_KEYWORDS}`
    : GLOBAL_SEO_KEYWORDS;

  const canonical = opts.path || '/';

  return {
    title: opts.title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: opts.title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: 'Tiffica',
      locale: 'en_IN',
      type: 'website',
      images: ['/logo.jpeg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description,
      images: ['/logo.jpeg'],
    },
    robots: { index: true, follow: true },
  };
}

export const DEFAULT_SITE_METADATA = buildPageMetadata({
  title: 'Tiffica — Best Tiffin Service in Jaipur | Home Cooked Meals',
  description: DEFAULT_DESCRIPTION,
  path: '/',
});
