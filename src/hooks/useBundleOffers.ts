import { useState, useEffect } from 'react';
import { BundleOffer } from '@/types/bundle';

// Mock data for demonstration - in a real app, this would come from your API
const mockBundleOffers: BundleOffer[] = [
  {
    id: 'bundle-1',
    name: 'Pack Style Complet',
    description: 'Achetez votre article principal et obtenez le second à prix réduit !',
    discount_percentage: 30,
    is_active: true,
    primary_product: {
      product_id: 'prod-1',
      product_nom: 'T-shirt Premium',
      product_prix: 299,
      bundle_prix: 299, // Same price for primary
      media: ['/placeholder.svg'],
      en_stock: true,
      available_variants: {
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Noir', 'Blanc', 'Rouge', 'Bleu']
      }
    },
    secondary_product: {
      product_id: 'prod-2',
      product_nom: 'Casquette Tendance',
      product_prix: 149,
      bundle_prix: 99, // Discounted price
      media: ['/placeholder.svg'],
      en_stock: true,
      available_variants: {
        colors: ['Noir', 'Blanc', 'Rouge']
      }
    }
  },
  {
    id: 'bundle-2',
    name: 'Duo Confort',
    description: 'Le parfait combo pour votre garde-robe !',
    discount_percentage: 25,
    is_active: true,
    primary_product: {
      product_id: 'prod-3',
      product_nom: 'Jean Slim',
      product_prix: 499,
      bundle_prix: 499,
      media: ['/placeholder.svg'],
      en_stock: true,
      available_variants: {
        sizes: ['28', '30', '32', '34', '36']
      }
    },
    secondary_product: {
      product_id: 'prod-4',
      product_nom: 'Ceinture Cuir',
      product_prix: 199,
      bundle_prix: 149,
      media: ['/placeholder.svg'],
      en_stock: true,
      available_variants: {
        colors: ['Noir', 'Marron']
      }
    }
  }
];

export function useBundleOffers() {
  const [offers, setOffers] = useState<BundleOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchOffers = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from your API here
        // const response = await fetch('/api/bundle-offers');
        // const data = await response.json();
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setOffers(mockBundleOffers.filter(offer => offer.is_active));
        setError(null);
      } catch (err) {
        setError('Failed to load bundle offers');
        console.error('Error fetching bundle offers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const getBundlesByProduct = (productId: string): BundleOffer[] => {
    return offers.filter(offer => 
      offer.primary_product.product_id === productId || 
      offer.secondary_product.product_id === productId
    );
  };

  const getBundleById = (bundleId: string): BundleOffer | undefined => {
    return offers.find(offer => offer.id === bundleId);
  };

  return {
    offers,
    loading,
    error,
    getBundlesByProduct,
    getBundleById,
    refetch: () => {
      setLoading(true);
      // Re-fetch logic here
    }
  };
}