import { useMemo } from 'react';
import { ProductSEO } from '@/types/seo';
import { generateStructuredData, generateBreadcrumbs, SEO_TEMPLATES } from '@/lib/seo';

// Transform database product to SEO data
export function useProductSEO(product: any, locale: string = 'fr-MA'): {
  seo: ProductSEO;
  structuredData: any;
  breadcrumbs: any[];
} {
  return useMemo(() => {
    if (!product) {
      return {
        seo: {} as ProductSEO,
        structuredData: null,
        breadcrumbs: [],
      };
    }

    // Extract or generate SEO data from product
    const seo: ProductSEO = {
      // Core info
      sku: product.id || '',
      brand: 'Votre Marque', // Should come from settings
      product_name: product.nom || '',
      primary_keyword: extractPrimaryKeyword(product.nom, product.description),
      modifiers: extractModifiers(product.nom, product.description),
      url_slug: product.slug || '',
      
      // Meta tags (auto-generated if not present)
      title_tag: product.seo_title || '',
      meta_description: product.seo_description || '',
      
      // Content
      benefit_bullets: extractBenefits(product.description),
      who_its_for: extractTargetAudience(product.description),
      ingredients_summary: product.ingredients_summary || '',
      inci_full: product.inci_full || '',
      how_to_use: product.how_to_use || '',
      
      // Product details
      size_variant: product.size_variant || '',
      price_mad: product.prix || 0,
      availability: product.en_stock ? 'InStock' : 'OutOfStock',
      cod_shipping_note: 'Livraison gratuite partout au Maroc. Paiement à la livraison (COD). Délai 24-48h.',
      
      // FAQ (should be stored in DB or generated)
      faq_pairs: generateDefaultFAQ(product, locale),
      
      // Navigation
      breadcrumb_category: product.category?.name || 'Produits',
      breadcrumb_subcategory: product.subcategory?.name,
      related_product_skus: product.related_products || [],
      ingredient_hub_links: [],
      routine_links: [],
      canonical_url: `${window.location.origin}/produit/${product.slug}`,
      
      // Media
      image_filenames: extractImageFilenames(product.media),
      image_alt_texts: generateImageAltTexts(product.nom, product.media),
      video_filename: extractVideoFilename(product.media),
      
      // Structured data
      gtin_or_mpn: product.gtin || product.mpn,
      aggregate_rating_value: product.rating || 4.8,
      review_count: product.review_count || 127,
      
      // Locale
      locale: locale as any,
    };

    // Auto-generate missing SEO fields
    if (!seo.title_tag) {
      seo.title_tag = SEO_TEMPLATES.title(seo);
    }
    
    if (!seo.meta_description) {
      seo.meta_description = SEO_TEMPLATES.metaDescription(seo);
    }

    const structuredData = generateStructuredData(product, seo);
    const breadcrumbs = generateBreadcrumbs(seo);

    return {
      seo,
      structuredData,
      breadcrumbs,
    };
  }, [product, locale]);
}

// Helper functions to extract SEO data from product content
function extractPrimaryKeyword(name: string, description?: string): string {
  // Simple extraction - should be more sophisticated in production
  return name?.split(' ').slice(0, 2).join(' ').toLowerCase() || '';
}

function extractModifiers(name: string, description?: string): string[] {
  // Extract additional keywords
  const words = (name + ' ' + (description || '')).toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 3).slice(0, 5);
}

function extractBenefits(description?: string): string[] {
  if (!description) return [
    'Qualité premium',
    'Livraison rapide',
    'Satisfaction garantie'
  ];
  
  // Simple extraction - look for benefit patterns
  const benefits = [];
  if (description.includes('hydrat')) benefits.push('Hydratation intense');
  if (description.includes('nourr')) benefits.push('Nutrition profonde');
  if (description.includes('répare')) benefits.push('Réparation efficace');
  if (description.includes('protèg')) benefits.push('Protection optimale');
  
  return benefits.length > 0 ? benefits : [
    'Qualité premium',
    'Livraison rapide',
    'Satisfaction garantie'
  ];
}

function extractTargetAudience(description?: string): string {
  if (!description) return 'tous types de peau';
  
  if (description.includes('sensible')) return 'peaux sensibles';
  if (description.includes('sèche')) return 'peaux sèches';
  if (description.includes('grasse')) return 'peaux grasses';
  if (description.includes('mixte')) return 'peaux mixtes';
  
  return 'tous types de peau';
}

function generateDefaultFAQ(product: any, locale: string): Array<{ question: string; answer: string }> {
  const faqTemplates = {
    'fr-MA': [
      {
        question: `Comment utiliser ${product.nom} ?`,
        answer: product.how_to_use || 'Suivez les instructions sur l\'emballage pour une utilisation optimale.'
      },
      {
        question: 'Quels sont les délais de livraison ?',
        answer: 'Livraison sous 24-48h partout au Maroc avec paiement à la livraison (COD).'
      },
      {
        question: 'Le produit convient-il aux peaux sensibles ?',
        answer: 'Ce produit est formulé pour être doux et convient à la plupart des types de peau. En cas de doute, testez sur une petite zone.'
      },
      {
        question: 'Puis-je retourner le produit ?',
        answer: 'Oui, nous acceptons les retours sous 30 jours si le produit ne vous convient pas.'
      }
    ],
    'ar-MA': [
      {
        question: `كيفية استخدام ${product.nom}؟`,
        answer: product.how_to_use || 'اتبع التعليمات على العبوة للاستخدام الأمثل.'
      },
      {
        question: 'ما هي مواعيد التسليم؟',
        answer: 'التسليم خلال 24-48 ساعة في جميع أنحاء المغرب مع الدفع عند الاستلام.'
      },
      {
        question: 'هل المنتج مناسب للبشرة الحساسة؟',
        answer: 'هذا المنتج مصمم ليكون لطيفًا ومناسبًا لمعظم أنواع البشرة. في حالة الشك، اختبره على منطقة صغيرة.'
      },
      {
        question: 'هل يمكنني إرجاع المنتج؟',
        answer: 'نعم، نقبل المرتجعات خلال 30 يومًا إذا لم يناسبك المنتج.'
      }
    ],
    'en': [
      {
        question: `How to use ${product.nom}?`,
        answer: product.how_to_use || 'Follow the instructions on the packaging for optimal use.'
      },
      {
        question: 'What are the delivery times?',
        answer: 'Delivery within 24-48h throughout Morocco with cash on delivery (COD).'
      },
      {
        question: 'Is the product suitable for sensitive skin?',
        answer: 'This product is formulated to be gentle and suitable for most skin types. If in doubt, test on a small area.'
      },
      {
        question: 'Can I return the product?',
        answer: 'Yes, we accept returns within 30 days if the product does not suit you.'
      }
    ]
  };

  return faqTemplates[locale as keyof typeof faqTemplates] || faqTemplates['fr-MA'];
}

function extractImageFilenames(media: any[]): string[] {
  if (!Array.isArray(media)) return [];
  return media
    .filter(m => m.type === 'image')
    .map((m, index) => `product-${index + 1}.webp`);
}

function generateImageAltTexts(productName: string, media: any[]): string[] {
  if (!Array.isArray(media)) return [];
  return media
    .filter(m => m.type === 'image')
    .map((m, index) => {
      const types = ['vue principale', 'détail', 'utilisation', 'packaging', 'résultat'];
      return `${productName} - ${types[index] || `image ${index + 1}`}`;
    });
}

function extractVideoFilename(media: any[]): string | undefined {
  if (!Array.isArray(media)) return undefined;
  const video = media.find(m => m.type === 'video');
  return video ? 'product-demo.webm' : undefined;
}