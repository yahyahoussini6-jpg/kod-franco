import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, Tag, Gift, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BundleOffer, ProductVariant, CartBundle } from '@/types/bundle';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { toast } from '@/hooks/use-toast';

interface BundleOfferCardProps {
  bundle: BundleOffer;
  className?: string;
}

export function BundleOfferCard({ bundle, className }: BundleOfferCardProps) {
  const { addBundle } = useCart();
  const navigate = useNavigate();
  const [primaryVariants, setPrimaryVariants] = useState<ProductVariant>({});
  const [secondaryVariants, setSecondaryVariants] = useState<ProductVariant>({});
  const [quantity, setQuantity] = useState(1);

  const originalTotal = (bundle.primary_product.product_prix + bundle.secondary_product.product_prix) * quantity;
  const bundleTotal = (bundle.primary_product.product_prix + bundle.secondary_product.bundle_prix) * quantity;
  const savings = originalTotal - bundleTotal;

  const handleAddToCart = () => {
    // Validation
    if (!bundle.primary_product.en_stock || !bundle.secondary_product.en_stock) {
      toast({
        title: "Produit non disponible",
        description: "Un des produits du pack n'est plus en stock",
        variant: "destructive"
      });
      return;
    }

    // Validate primary product variants
    if (bundle.primary_product.available_variants?.sizes && !primaryVariants.size) {
      toast({
        title: "Taille requise",
        description: "Veuillez sélectionner une taille pour le produit principal",
        variant: "destructive"
      });
      return;
    }

    if (bundle.primary_product.available_variants?.colors && !primaryVariants.color) {
      toast({
        title: "Couleur requise",
        description: "Veuillez sélectionner une couleur pour le produit principal",
        variant: "destructive"
      });
      return;
    }

    // Validate secondary product variants
    if (bundle.secondary_product.available_variants?.sizes && !secondaryVariants.size) {
      toast({
        title: "Taille requise",
        description: "Veuillez sélectionner une taille pour le produit bonus",
        variant: "destructive"
      });
      return;
    }

    if (bundle.secondary_product.available_variants?.colors && !secondaryVariants.color) {
      toast({
        title: "Couleur requise",
        description: "Veuillez sélectionner une couleur pour le produit bonus",
        variant: "destructive"
      });
      return;
    }

    const cartBundle: CartBundle = {
      bundle_id: `${bundle.id}-${Date.now()}`,
      bundle_name: bundle.name,
      primary_item: {
        product_id: bundle.primary_product.product_id,
        product_nom: bundle.primary_product.product_nom,
        product_prix: bundle.primary_product.product_prix,
        quantite: quantity,
        variables: primaryVariants,
        media: bundle.primary_product.media
      },
      secondary_item: {
        product_id: bundle.secondary_product.product_id,
        product_nom: bundle.secondary_product.product_nom,
        original_prix: bundle.secondary_product.product_prix,
        bundle_prix: bundle.secondary_product.bundle_prix,
        quantite: quantity,
        variables: secondaryVariants,
        media: bundle.secondary_product.media
      },
      total_savings: savings,
      original_total: originalTotal,
      bundle_total: bundleTotal
    };

    addBundle(cartBundle);
    
    toast({
      title: "Pack ajouté au panier !",
      description: `Économisez ${formatPrice(savings)} avec ce pack spécial`,
    });
  };

  return (
    <Card className={`w-full ${className}`} dir="ltr">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {bundle.name}
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {bundle.discount_percentage}% OFF
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{bundle.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Product */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {bundle.primary_product.media?.[0] && (
              <img 
                src={bundle.primary_product.media[0]}
                alt={bundle.primary_product.product_nom}
                className="w-16 h-16 object-cover rounded-md border"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{bundle.primary_product.product_nom}</h4>
              <p className="text-primary font-semibold">{formatPrice(bundle.primary_product.product_prix)}</p>
            </div>
          </div>

          {/* Primary Product Variants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bundle.primary_product.available_variants?.sizes && (
              <Select 
                value={primaryVariants.size || ""} 
                onValueChange={(value) => setPrimaryVariants(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Taille" />
                </SelectTrigger>
                <SelectContent>
                  {bundle.primary_product.available_variants.sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {bundle.primary_product.available_variants?.colors && (
              <Select 
                value={primaryVariants.color || ""} 
                onValueChange={(value) => setPrimaryVariants(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Couleur" />
                </SelectTrigger>
                <SelectContent>
                  {bundle.primary_product.available_variants.colors.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Plus Icon */}
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-2">
            <Plus className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Secondary Product */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {bundle.secondary_product.media?.[0] && (
              <img 
                src={bundle.secondary_product.media[0]}
                alt={bundle.secondary_product.product_nom}
                className="w-16 h-16 object-cover rounded-md border"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{bundle.secondary_product.product_nom}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(bundle.secondary_product.product_prix)}
                </span>
                <span className="text-primary font-semibold">
                  {formatPrice(bundle.secondary_product.bundle_prix)}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Product Variants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bundle.secondary_product.available_variants?.sizes && (
              <Select 
                value={secondaryVariants.size || ""} 
                onValueChange={(value) => setSecondaryVariants(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Taille" />
                </SelectTrigger>
                <SelectContent>
                  {bundle.secondary_product.available_variants.sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {bundle.secondary_product.available_variants?.colors && (
              <Select 
                value={secondaryVariants.color || ""} 
                onValueChange={(value) => setSecondaryVariants(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Couleur" />
                </SelectTrigger>
                <SelectContent>
                  {bundle.secondary_product.available_variants.colors.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quantité:</span>
          <Select 
            value={quantity.toString()} 
            onValueChange={(value) => setQuantity(parseInt(value))}
          >
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Summary */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prix normal:</span>
            <span className="line-through text-muted-foreground">{formatPrice(originalTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Prix du pack:</span>
            <span className="text-primary">{formatPrice(bundleTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-destructive">
            <span>Vous économisez:</span>
            <span className="font-semibold">{formatPrice(savings)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/bundle/${bundle.id}`)}
            className="h-11 text-sm font-semibold"
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir détails
          </Button>
          <Button 
            onClick={handleAddToCart}
            className="h-11 text-sm font-semibold"
            disabled={!bundle.primary_product.en_stock || !bundle.secondary_product.en_stock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Paiement à la livraison (COD) disponible
        </p>
      </CardContent>
    </Card>
  );
}