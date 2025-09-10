import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RelatedProductsProps {
  relatedSkus: string[];
  currentProductId: string;
  locale?: string;
}

export function RelatedProducts({ relatedSkus, currentProductId, locale = 'fr-MA' }: RelatedProductsProps) {
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', relatedSkus],
    queryFn: async () => {
      if (relatedSkus.length === 0) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', relatedSkus)
        .neq('id', currentProductId)
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
    enabled: relatedSkus.length > 0,
  });

  if (!relatedProducts || relatedProducts.length === 0) return null;

  const titles = {
    'fr-MA': 'Produits similaires',
    'ar-MA': 'منتجات مشابهة',
    'en': 'Related Products',
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        {titles[locale as keyof typeof titles] || titles['fr-MA']}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/produit/${product.slug}`}>
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.media && Array.isArray(product.media) && product.media.length > 0 ? (
                    <img
                      src={(product.media as Array<{type: string, url: string}>)[0]?.url}
                      alt={`${product.nom} - image produit`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="text-muted-foreground text-sm">Aucune image</span>
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.en_stock ? "default" : "secondary"} className="text-xs">
                      {product.en_stock ? '✅' : '❌'}
                    </Badge>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                    {product.nom}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {formatPrice(product.prix)}
                    </span>
                    {product.en_stock && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        En stock
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}