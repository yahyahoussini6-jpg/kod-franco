import { ProductSEO, StructuredDataProduct, BreadcrumbItem } from '@/types/seo';

export const SEO_TEMPLATES = {
  title: (seo: ProductSEO) => 
    `${seo.brand} – ${seo.product_name} ${seo.size_variant || ''} | ${(seo.benefit_bullets || []).slice(0, 2).join(', ')}`.slice(0, 60),
  
  metaDescription: (seo: ProductSEO) => 
    `${seo.product_name} ${seo.size_variant || ''} for ${seo.who_its_for}. ${(seo.benefit_bullets || []).slice(0, 2).join(', ')}. COD Morocco.`.slice(0, 155),
  
  h1: (seo: ProductSEO) => 
    `${seo.product_name} ${seo.size_variant || ''}`,
  
  imageAlt: (seo: ProductSEO, imageType: string, index: number) => 
    `${seo.brand} ${seo.product_name} ${seo.size_variant || ''} – ${imageType || `image ${index + 1}`}`,
};

export function generateStructuredData(product: any, seo: ProductSEO): StructuredDataProduct {
  const baseUrl = window.location.origin;
  const productUrl = `${baseUrl}/produit/${seo.url_slug}`;
  
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: seo.product_name,
    image: seo.image_filenames.map((filename, index) => 
      product.media?.[index]?.url || `${baseUrl}/images/${filename}`
    ),
    description: seo.meta_description,
    sku: seo.sku,
    mpn: seo.gtin_or_mpn,
    gtin: seo.gtin_or_mpn,
    brand: {
      '@type': 'Brand',
      name: seo.brand,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'MAD',
      price: seo.price_mad.toString(),
      availability: `https://schema.org/${seo.availability}`,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'MAD'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'MA'
        }
      }
    },
    ...(seo.aggregate_rating_value && seo.review_count && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: seo.aggregate_rating_value.toString(),
        reviewCount: seo.review_count.toString(),
      }
    }),
  };
}

export function generateBreadcrumbs(seo: ProductSEO): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', href: '/' },
    { label: 'Produits', href: '/produits' },
  ];
  
  if (seo.breadcrumb_category) {
    breadcrumbs.push({
      label: seo.breadcrumb_category,
      href: `/categorie/${seo.breadcrumb_category.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  
  if (seo.breadcrumb_subcategory) {
    breadcrumbs.push({
      label: seo.breadcrumb_subcategory,
      href: `/categorie/${seo.breadcrumb_category.toLowerCase().replace(/\s+/g, '-')}/${seo.breadcrumb_subcategory.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  
  breadcrumbs.push({
    label: seo.product_name,
    href: `/produit/${seo.url_slug}`,
    current: true
  });
  
  return breadcrumbs;
}

export function generateHreflangTags(slug: string): Array<{ hreflang: string; href: string }> {
  const baseUrl = window.location.origin;
  return [
    { hreflang: 'fr-MA', href: `${baseUrl}/produit/${slug}` },
    { hreflang: 'ar-MA', href: `${baseUrl}/ar/produit/${slug}` },
    { hreflang: 'en', href: `${baseUrl}/en/produit/${slug}` },
    { hreflang: 'x-default', href: `${baseUrl}/produit/${slug}` },
  ];
}

export function generateCanonicalUrl(slug: string): string {
  return `${window.location.origin}/produit/${slug}`;
}

// SEO Content Templates for different locales
export const LOCALE_TEMPLATES = {
  'fr-MA': {
    addToCart: 'Ajouter au panier',
    buyNow: 'Acheter maintenant',
    whatsapp: 'Commander via WhatsApp',
    inStock: 'En stock - Expédition 24h',
    outOfStock: 'Rupture de stock',
    freeShipping: 'Livraison gratuite',
    cod: 'Paiement à la livraison',
    guarantee: 'Garantie 30 jours',
    support: 'Support 24/7',
    reviews: 'avis clients',
    benefits: 'Avantages',
    ingredients: 'Ingrédients',
    howToUse: 'Mode d\'emploi',
    faq: 'Questions fréquentes',
    relatedProducts: 'Produits similaires',
  },
  'ar-MA': {
    addToCart: 'أضف إلى السلة',
    buyNow: 'اشتري الآن',
    whatsapp: 'اطلب عبر واتساب',
    inStock: 'متوفر - الشحن خلال 24 ساعة',
    outOfStock: 'نفدت الكمية',
    freeShipping: 'الشحن مجاني',
    cod: 'الدفع عند الاستلام',
    guarantee: 'ضمان 30 يوم',
    support: 'الدعم 24/7',
    reviews: 'تقييمات العملاء',
    benefits: 'الفوائد',
    ingredients: 'المكونات',
    howToUse: 'طريقة الاستخدام',
    faq: 'الأسئلة الشائعة',
    relatedProducts: 'منتجات مشابهة',
  },
  'en': {
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    whatsapp: 'Order via WhatsApp',
    inStock: 'In Stock - 24h Shipping',
    outOfStock: 'Out of Stock',
    freeShipping: 'Free Shipping',
    cod: 'Cash on Delivery',
    guarantee: '30-day Guarantee',
    support: '24/7 Support',
    reviews: 'customer reviews',
    benefits: 'Benefits',
    ingredients: 'Ingredients',
    howToUse: 'How to Use',
    faq: 'FAQ',
    relatedProducts: 'Related Products',
  },
};