import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BundleOffer } from '@/types/bundle';

export function useBundleOffers(productId?: string) {
  const { data: offers = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['bundle-offers', productId],
    queryFn: async () => {
      let query = supabase
        .from('bundle_offers')
        .select(`
          *,
          bundle_items (
            id,
            product_id,
            is_primary,
            original_price,
            bundle_price,
            discount_percentage,
            min_quantity,
            max_quantity,
            display_order,
            products (
              id,
              nom,
              prix,
              media,
              en_stock,
              variables
            )
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      // Filter by date if applicable
      const now = new Date().toISOString().split('T')[0];
      query = query.or(`start_date.is.null,start_date.lte.${now}`)
                 .or(`end_date.is.null,end_date.gte.${now}`);

      const { data, error } = await query;
      
      if (error) throw error;

      // Transform data to match the expected BundleOffer format
      return data.map(bundle => {
        const primaryItem = bundle.bundle_items?.find(item => item.is_primary);
        const secondaryItems = bundle.bundle_items?.filter(item => !item.is_primary) || [];
        
        // For backwards compatibility, create primary/secondary structure
        const transformedBundle: BundleOffer = {
          id: bundle.id,
          name: bundle.name,
          description: bundle.description || '',
          discount_percentage: primaryItem ? primaryItem.discount_percentage : 0,
          is_active: bundle.is_active,
          primary_product: primaryItem ? {
            product_id: primaryItem.products.id,
            product_nom: primaryItem.products.nom,
            product_prix: primaryItem.original_price,
            bundle_prix: primaryItem.bundle_price,
            media: Array.isArray(primaryItem.products.media) ? primaryItem.products.media : [],
            en_stock: primaryItem.products.en_stock,
            available_variants: typeof primaryItem.products.variables === 'object' && primaryItem.products.variables ? primaryItem.products.variables as any : {}
          } : null,
          secondary_product: secondaryItems[0] ? {
            product_id: secondaryItems[0].products.id,
            product_nom: secondaryItems[0].products.nom,
            product_prix: secondaryItems[0].original_price,
            bundle_prix: secondaryItems[0].bundle_price,
            media: Array.isArray(secondaryItems[0].products.media) ? secondaryItems[0].products.media : [],
            en_stock: secondaryItems[0].products.en_stock,
            available_variants: typeof secondaryItems[0].products.variables === 'object' && secondaryItems[0].products.variables ? secondaryItems[0].products.variables as any : {}
          } : null
        };

        return transformedBundle;
      }).filter(bundle => bundle.primary_product); // Only return bundles with at least a primary product
    }
  });

  const getBundlesByProduct = (targetProductId: string): BundleOffer[] => {
    return offers.filter(offer => 
      offer.primary_product?.product_id === targetProductId || 
      offer.secondary_product?.product_id === targetProductId
    );
  };

  const getBundleById = (bundleId: string): BundleOffer | undefined => {
    return offers.find(offer => offer.id === bundleId);
  };

  // If productId is provided, filter offers for that product
  const filteredOffers = productId ? getBundlesByProduct(productId) : offers;

  return {
    offers: filteredOffers,
    loading,
    error: error?.message || null,
    getBundlesByProduct,
    getBundleById,
    refetch
  };
}