import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  nom: string;
  prix: number;
  slug: string;
  media: any[];
  en_stock: boolean;
}

interface ProductRelationship {
  id: string;
  related_product_id: string;
  relationship_type: 'upsell' | 'cross_sell';
  related_product: Product;
}

interface ProductRecommendationsProps {
  productId: string;
  currentProductPrice?: number;
}

export function ProductRecommendations({ productId, currentProductPrice }: ProductRecommendationsProps) {
  const { addToCart } = useCart();

  const { data: relationships = [] } = useQuery({
    queryKey: ['product-relationships-public', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_relationships')
        .select(`
          id,
          related_product_id,
          relationship_type,
          related_product:products!product_relationships_related_product_id_fkey(
            id,
            nom,
            prix,
            slug,
            media,
            en_stock
          )
        `)
        .eq('product_id', productId)
        .order('display_order');
      
      if (error) throw error;
      return data as ProductRelationship[];
    },
    enabled: !!productId
  });

  const upsells = relationships.filter(r => r.relationship_type === 'upsell');
  const crossSells = relationships.filter(r => r.relationship_type === 'cross_sell');

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      nom: product.nom,
      prix: product.prix,
      quantite: 1,
      media: product.media
    });
  };

  const getImageUrl = (media: any[]) => {
    if (media && media.length > 0) {
      return `https://msrajpxxrczejxqvwcxl.supabase.co/storage/v1/object/public/product-images/${media[0]}`;
    }
    return '/placeholder.svg';
  };

  if (upsells.length === 0 && crossSells.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {upsells.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Montée en gamme</h3>
            <p className="text-muted-foreground text-sm">Découvrez nos produits premium</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upsells.map((relationship) => {
              const product = relationship.related_product;
              const priceDiff = currentProductPrice ? product.prix - currentProductPrice : 0;
              
              return (
                <Card key={relationship.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-3 overflow-hidden rounded-lg">
                      <img
                        src={getImageUrl(product.media)}
                        alt={product.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {priceDiff > 0 && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          +{formatPrice(priceDiff)}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium mb-2 line-clamp-2">{product.nom}</h4>
                    <p className="text-lg font-semibold text-primary mb-3">{formatPrice(product.prix)}</p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/produit/${product.slug}`}>
                          Voir
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.en_stock}
                        className="px-3"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {crossSells.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Produits complémentaires</h3>
            <p className="text-muted-foreground text-sm">Parfait avec votre sélection</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {crossSells.map((relationship) => {
              const product = relationship.related_product;
              
              return (
                <Card key={relationship.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-3 overflow-hidden rounded-lg">
                      <img
                        src={getImageUrl(product.media)}
                        alt={product.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="font-medium mb-2 line-clamp-2 text-sm">{product.nom}</h4>
                    <p className="text-primary font-semibold mb-3">{formatPrice(product.prix)}</p>
                    <div className="flex gap-1">
                      <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                        <Link to={`/produit/${product.slug}`}>
                          Voir
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.en_stock}
                        className="px-2"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}