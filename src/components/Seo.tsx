import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

type SeoConfig = {
  title: string;
  description: string;
  path: string;
};

const DEFAULT: SeoConfig = {
  title: 'JSONJoy - Format, Validate, Compare & Convert JSON Online',
  description:
    'Free online JSON tools for developers. Format, beautify, validate, compare, and convert JSON with a beautiful interface. 100% client-side processing - your data never leaves your browser.',
  path: '/',
};

const ROUTES: Record<string, Omit<SeoConfig, 'path'>> = {
  '/': {
    title: 'JSONJoy - Free Online JSON Tools',
    description:
      'Format, validate, view, diff, convert, and generate code or Yup schemas from JSON. Fast, privacy-first, and fully client-side.',
  },
  '/formatter': {
    title: 'JSON Formatter | JSONJoy',
    description:
      'Format and beautify JSON with 2/4-space indentation. Copy or download the formatted JSON instantly.',
  },
  '/validator': {
    title: 'JSON Validator | JSONJoy',
    description:
      'Validate JSON and get helpful error messages with line and column details. Runs fully in your browser.',
  },
  '/viewer': {
    title: 'JSON Viewer | JSONJoy',
    description:
      'Explore JSON in a collapsible tree view with syntax highlighting. Great for large nested JSON.',
  },
  '/diff': {
    title: 'JSON Diff | JSONJoy',
    description:
      'Compare two JSON documents and quickly see added, removed, and modified keys.',
  },
  '/table': {
    title: 'JSON to Table | JSONJoy',
    description:
      'Convert array-based JSON into a clean, responsive table for easy viewing and analysis.',
  },
  '/converter': {
    title: 'JSON Converter (CSV / XML) | JSONJoy',
    description:
      'Convert JSON to CSV or XML for data exchange. Quick, simple, and client-side.',
  },
  '/code-generator': {
    title: 'JSON Code Generator | JSONJoy',
    description:
      'Fetch JSON from a URL and generate TypeScript interfaces or JavaScript code with JSDoc.',
  },
  '/yup-schema': {
    title: 'JSON to Yup Schema Generator | JSONJoy',
    description:
      'Detect JSON field structure and build a Yup validation schema with an interactive validation builder.',
  },
};

function toCanonicalUrl(siteUrl: string, pathname: string) {
  const base = siteUrl.replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function Seo() {
  const { pathname } = useLocation();
  const siteUrl =
    import.meta.env.VITE_SITE_URL?.toString().trim() || window.location.origin;

  const route = ROUTES[pathname] ?? DEFAULT;
  const canonical = toCanonicalUrl(siteUrl, pathname);
  const title = route.title || DEFAULT.title;
  const description = route.description || DEFAULT.description;
  const ogImage = `${siteUrl.replace(/\/$/, '')}/JsonJoy_logo.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={canonical} />
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="JSONJoy" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'JSONJoy',
          url: siteUrl,
        })}
      </script>
    </Helmet>
  );
}

