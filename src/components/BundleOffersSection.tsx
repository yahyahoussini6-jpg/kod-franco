import React from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { BundleOfferCard } from './BundleOfferCard';
import { useBundleOffers } from '@/hooks/useBundleOffers';
import { Skeleton } from '@/components/ui/skeleton';

interface BundleOffersSectionProps {
  productId?: string;
  className?: string;
}

export function BundleOffersSection({ productId, className }: BundleOffersSectionProps) {
  const { offers, loading, error } = useBundleOffers(productId);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Offres spéciales</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || offers.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {productId ? 'Offres spéciales avec ce produit' : 'Offres Spéciales Pack'}
          </h2>
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Économisez en achetant nos packs promotionnels !
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <BundleOfferCard
            key={offer.id}
            bundle={offer}
            className="max-w-md mx-auto lg:max-w-none"
          />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="h-4 w-4" />
          <span className="font-semibold">Avantages des packs :</span>
        </div>
        <ul className="space-y-1">
          <li>• Prix réduits sur le deuxième produit</li>
          <li>• Livraison groupée gratuite</li>
          <li>• Paiement à la livraison (COD)</li>
          <li>• Garantie satisfaction</li>
        </ul>
      </div>
    </div>
  );
}