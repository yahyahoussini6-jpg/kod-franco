import React from 'react';
import { ProductSEO } from '@/types/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQSectionProps {
  seo: ProductSEO;
  locale?: string;
}

export function FAQSection({ seo, locale = 'fr-MA' }: FAQSectionProps) {
  if (!seo.faq_pairs || seo.faq_pairs.length === 0) return null;

  // Generate FAQ structured data
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': seo.faq_pairs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };

  const titles = {
    'fr-MA': 'Questions fréquentes',
    'ar-MA': 'الأسئلة الشائعة',
    'en': 'Frequently Asked Questions',
  };

  return (
    <section className="space-y-6">
      {/* Structured Data for FAQ */}
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          {titles[locale as keyof typeof titles] || titles['fr-MA']}
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {seo.faq_pairs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b">
              <AccordionTrigger className="text-left hover:text-primary transition-colors">
                <h3 className="font-medium">{faq.question}</h3>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}