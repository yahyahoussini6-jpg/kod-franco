import React from 'react';
import { ProductSEO, StructuredDataProduct } from '@/types/seo';

interface ProductSchemaProps {
  structuredData: StructuredDataProduct;
}

export function ProductSchema({ structuredData }: ProductSchemaProps) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  );
}

// Additional structured data for organization
export function OrganizationSchema({ brandName }: { brandName: string }) {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': brandName,
    'url': window.location.origin,
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'MA',
      'addressRegion': 'Morocco',
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'availableLanguage': ['French', 'Arabic', 'English'],
      'areaServed': 'MA',
    },
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(organizationData)}
    </script>
  );
}

// Website structured data
export function WebsiteSchema() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Votre E-commerce',
    'url': window.location.origin,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${window.location.origin}/recherche?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(websiteData)}
    </script>
  );
}