import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ProductSEO } from '@/types/seo';
import { SEO_TEMPLATES, generateHreflangTags, generateCanonicalUrl } from '@/lib/seo';

interface SEOHeadProps {
  seo: ProductSEO;
  structuredData?: object;
}

export function SEOHead({ seo, structuredData }: SEOHeadProps) {
  const title = SEO_TEMPLATES.title(seo);
  const description = SEO_TEMPLATES.metaDescription(seo);
  const canonicalUrl = generateCanonicalUrl(seo.url_slug);
  const hreflangTags = generateHreflangTags(seo.url_slug);
  const primaryImage = seo.image_filenames?.[0];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={[seo.primary_keyword, ...(seo.modifiers || [])].join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {primaryImage && <meta property="og:image" content={primaryImage} />}
      <meta property="og:site_name" content={seo.brand} />
      <meta property="og:locale" content={seo.locale} />

      {/* Product-specific Open Graph */}
      {seo.price_mad && <meta property="product:price:amount" content={seo.price_mad.toString()} />}
      <meta property="product:price:currency" content="MAD" />
      {seo.availability && <meta property="product:availability" content={seo.availability.toLowerCase()} />}
      {seo.brand && <meta property="product:brand" content={seo.brand} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {primaryImage && <meta name="twitter:image" content={primaryImage} />}

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content={seo.locale} />
      <meta name="geo.region" content="MA" />
      <meta name="geo.country" content="Morocco" />

      {/* Hreflang Tags */}
      {hreflangTags.map(({ hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="format-detection" content="telephone=no" />
    </Helmet>
  );
}