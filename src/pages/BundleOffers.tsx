import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BundleOffersSection } from '@/components/BundleOffersSection';

export default function BundleOffers() {
  return (
    <>
      <Helmet>
        <title>Offres Spéciales Pack - Économisez avec nos Bundles</title>
        <meta name="description" content="Découvrez nos offres spéciales pack avec des réductions exclusives. Achetez plusieurs produits ensemble et économisez!" />
        <meta name="keywords" content="offres spéciales, pack, bundle, réduction, économie, promotion" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <BundleOffersSection className="max-w-6xl mx-auto" />
      </div>
    </>
  );
}