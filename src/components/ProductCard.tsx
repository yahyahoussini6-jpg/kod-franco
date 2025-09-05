import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/format';

interface Product {
  id: string;
  slug: string;
  nom: string;
  description?: string;
  prix: number;
  en_stock: boolean;
  media: any;
  model_url?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const media = Array.isArray(product.media) ? product.media as Array<{type: string, url: string}> : [];
  const imageMedia = media.find(m => m.type === 'image');
  const hasModel3D = product.model_url;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/produit/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-muted relative">
          {imageMedia ? (
            <img
              src={imageMedia.url}
              alt={product.nom}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-xs mb-1">
                  {hasModel3D ? "Modèle 3D disponible" : "Aucune image"}
                </div>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.nom}</h3>
          {product.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}
              {product.description.replace(/<[^>]*>/g, '').length > 100 && '...'}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.prix)}
            </span>
            <Badge variant={product.en_stock ? "default" : "destructive"}>
              {product.en_stock ? "En stock" : "Rupture"}
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}