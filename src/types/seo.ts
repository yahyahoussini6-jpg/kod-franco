export interface ProductSEO {
  // Core Product Info
  sku: string;
  brand: string;
  product_name: string; // H1
  primary_keyword: string;
  modifiers: string[]; // comma-separated keywords
  url_slug: string;
  
  // Meta Tags
  title_tag: string; // ≤ 60 chars
  meta_description: string; // ≤ 155 chars
  
  // Content Blocks
  benefit_bullets: string[]; // 3-5 benefits
  who_its_for: string;
  ingredients_summary?: string;
  inci_full?: string;
  how_to_use?: string;
  
  // Product Details
  size_variant?: string;
  price_mad: number;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  cod_shipping_note: string; // 1-2 lines
  
  // FAQ
  faq_pairs: Array<{ question: string; answer: string }>;
  
  // Navigation & Linking
  breadcrumb_category: string;
  breadcrumb_subcategory?: string;
  related_product_skus: string[];
  ingredient_hub_links?: string[];
  routine_links?: string[];
  canonical_url: string;
  
  // Media
  image_filenames: string[];
  image_alt_texts: string[]; // ordered to match files
  video_filename?: string;
  
  // Structured Data
  gtin_or_mpn?: string;
  aggregate_rating_value?: number;
  review_count?: number;
  
  // Internationalization
  locale: 'fr-MA' | 'ar-MA' | 'en';
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface StructuredDataProduct {
  '@context': string;
  '@type': string;
  name: string;
  image: string[];
  description: string;
  sku: string;
  mpn?: string;
  gtin?: string;
  brand: {
    '@type': string;
    name: string;
  };
  offers: {
    '@type': string;
    url: string;
    priceCurrency: string;
    price: string;
    availability: string;
    priceValidUntil: string;
    shippingDetails?: {
      '@type': string;
      shippingRate: {
        '@type': string;
        value: string;
        currency: string;
      };
      shippingDestination: {
        '@type': string;
        addressCountry: string;
      };
    };
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    reviewCount: string;
  };
  review?: Array<{
    '@type': string;
    reviewRating: {
      '@type': string;
      ratingValue: string;
    };
    author: {
      '@type': string;
      name: string;
    };
    reviewBody: string;
  }>;
}