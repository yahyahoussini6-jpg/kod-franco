import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, MessageCircle, Gift, Plus, Tag, Palette, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { CheckoutModal } from '@/components/CheckoutModal';
import { formatPrice } from '@/lib/format';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ProductVariant, CartBundle } from '@/types/bundle';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '212612345678';

export default function BundleDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addBundle } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [primaryVariants, setPrimaryVariants] = useState<ProductVariant>({});
  const [secondaryVariants, setSecondaryVariants] = useState<ProductVariant>({});
  const [quantity, setQuantity] = useState(1);
  const [currentPrimaryImageIndex, setCurrentPrimaryImageIndex] = useState(0);
  const [currentSecondaryImageIndex, setCurrentSecondaryImageIndex] = useState(0);
  
  const { data: bundle, isLoading, error } = useQuery({
    queryKey: ['bundle', id],
    queryFn: async () => {
      const { data, error } = await supabase
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
              variables,
              description,
              slug
            )
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      // Transform data to match expected format
      const primaryItem = data.bundle_items?.find(item => item.is_primary);
      const secondaryItems = data.bundle_items?.filter(item => !item.is_primary) || [];
      
      if (!primaryItem || secondaryItems.length === 0) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        discount_percentage: primaryItem.discount_percentage,
        is_active: data.is_active,
        primary_product: {
          product_id: primaryItem.products.id,
          product_nom: primaryItem.products.nom,
          product_prix: primaryItem.original_price,
          bundle_prix: primaryItem.bundle_price,
          media: Array.isArray(primaryItem.products.media) ? primaryItem.products.media : [],
          en_stock: primaryItem.products.en_stock,
          description: primaryItem.products.description,
          slug: primaryItem.products.slug,
          variables: typeof primaryItem.products.variables === 'object' && primaryItem.products.variables ? primaryItem.products.variables : {},
          available_variants: typeof primaryItem.products.variables === 'object' && primaryItem.products.variables ? primaryItem.products.variables : {}
        },
        secondary_product: {
          product_id: secondaryItems[0].products.id,
          product_nom: secondaryItems[0].products.nom,
          product_prix: secondaryItems[0].original_price,
          bundle_prix: secondaryItems[0].bundle_price,
          media: Array.isArray(secondaryItems[0].products.media) ? secondaryItems[0].products.media : [],
          en_stock: secondaryItems[0].products.en_stock,
          description: secondaryItems[0].products.description,
          slug: secondaryItems[0].products.slug,
          variables: typeof secondaryItems[0].products.variables === 'object' && secondaryItems[0].products.variables ? secondaryItems[0].products.variables : {},
          available_variants: typeof secondaryItems[0].products.variables === 'object' && secondaryItems[0].products.variables ? secondaryItems[0].products.variables : {}
        }
      };
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!bundle) return;

    // Validation
    if (!bundle.primary_product.en_stock || !bundle.secondary_product.en_stock) {
      toast({
        title: "Produit non disponible",
        description: "Un des produits du pack n'est plus en stock",
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
      total_savings: (bundle.primary_product.product_prix + bundle.secondary_product.product_prix - bundle.primary_product.bundle_prix - bundle.secondary_product.bundle_prix) * quantity,
      original_total: (bundle.primary_product.product_prix + bundle.secondary_product.product_prix) * quantity,
      bundle_total: (bundle.primary_product.bundle_prix + bundle.secondary_product.bundle_prix) * quantity
    };

    addBundle(cartBundle);
    
    toast({
      title: "Pack ajouté au panier !",
      description: `Économisez ${formatPrice(cartBundle.total_savings)} avec ce pack spécial`,
    });
  };

  const handleWhatsApp = () => {
    if (!bundle) return;
    
    let bundleDetails = `🎁 *${bundle.name}*\n`;
    bundleDetails += `📦 Pack spécial avec ${bundle.discount_percentage}% de réduction\n\n`;
    
    bundleDetails += `🛍️ *Produit principal:* ${bundle.primary_product.product_nom}\n`;
    bundleDetails += `💰 Prix: ${formatPrice(bundle.primary_product.bundle_prix)}\n\n`;
    
    bundleDetails += `🎯 *Produit bonus:* ${bundle.secondary_product.product_nom}\n`;
    bundleDetails += `💰 Prix spécial: ${formatPrice(bundle.secondary_product.bundle_prix)}\n`;
    bundleDetails += `💸 Au lieu de: ${formatPrice(bundle.secondary_product.product_prix)}\n\n`;
    
    const savings = (bundle.primary_product.product_prix + bundle.secondary_product.product_prix) - (bundle.primary_product.bundle_prix + bundle.secondary_product.bundle_prix);
    bundleDetails += `💰 *Total économisé: ${formatPrice(savings)}*\n\n`;
    
    bundleDetails += `🔗 Lien: ${window.location.href}\n\n`;
    bundleDetails += `Bonjour ! Je suis intéressé(e) par cette offre pack. Pouvez-vous me donner plus d'informations ? Merci ! 😊`;
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(bundleDetails)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-muted rounded-lg h-96 animate-pulse" />
          <div className="space-y-4">
            <div className="bg-muted rounded h-8 animate-pulse" />
            <div className="bg-muted rounded h-4 animate-pulse" />
            <div className="bg-muted rounded h-20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pack introuvable</h2>
          <p className="text-muted-foreground">
            Le pack que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  const primaryImages = Array.isArray(bundle.primary_product.media) ? bundle.primary_product.media.filter((m: any) => typeof m === 'object' && m.type === 'image') : [];
  const secondaryImages = Array.isArray(bundle.secondary_product.media) ? bundle.secondary_product.media.filter((m: any) => typeof m === 'object' && m.type === 'image') : [];

  const seo = {
    title: `${bundle.name} - Pack Spécial ${bundle.discount_percentage}% de réduction`,
    description: bundle.description || `Profitez de notre pack spécial ${bundle.name} avec ${bundle.discount_percentage}% de réduction. ${bundle.primary_product.product_nom} + ${bundle.secondary_product.product_nom}`,
    keywords: `pack spécial, bundle, ${bundle.primary_product.product_nom}, ${bundle.secondary_product.product_nom}, réduction, promotion`,
    canonical: `/bundle/${bundle.id}`
  } as any;

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Offres Pack', href: '/offres-bundle' },
    { label: bundle.name, href: `/bundle/${bundle.id}` }
  ];

  
  const originalTotal = (bundle.primary_product.product_prix + bundle.secondary_product.product_prix) * quantity;
  const bundleTotal = (bundle.primary_product.bundle_prix + bundle.secondary_product.bundle_prix) * quantity;
  const savings = originalTotal - bundleTotal;

  return (
    <>
      <SEOHead seo={seo} />
      
      {/* Breadcrumbs */}
      <div className="bg-gradient-to-br from-background via-muted/20 to-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
          
          {/* Left Column - Bundle Images */}
          <div className="order-1">
            <div className="space-y-6 sticky top-4">
              {/* Bundle Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary px-6 py-3 rounded-full text-lg font-bold border border-primary/30">
                  <Gift className="inline mr-2 h-5 w-5" />
                  Pack Spécial {bundle.discount_percentage}% OFF
                </div>
              </div>

              {/* Primary Product Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  {bundle.primary_product.product_nom}
                </h3>
                
                {primaryImages.length > 0 ? (
                  <div className="space-y-3">
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted shadow-lg border">
                      <img
                        src={(primaryImages[currentPrimaryImageIndex] as any)?.url}
                        alt={bundle.primary_product.product_nom}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {primaryImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {primaryImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPrimaryImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                              currentPrimaryImageIndex === index 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <img
                              src={(image as any).url}
                              alt={`${bundle.primary_product.product_nom} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square w-full flex items-center justify-center bg-muted rounded-xl">
                    <span className="text-muted-foreground">Aucune image</span>
                  </div>
                )}
              </div>

              {/* Plus Icon */}
              <div className="flex justify-center">
                <div className="bg-primary/20 rounded-full p-4 border-2 border-primary/30">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Secondary Product Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  {bundle.secondary_product.product_nom}
                  <Badge variant="destructive" className="ml-2">BONUS</Badge>
                </h3>
                
                {secondaryImages.length > 0 ? (
                  <div className="space-y-3">
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted shadow-lg border">
                      <img
                        src={(secondaryImages[currentSecondaryImageIndex] as any)?.url}
                        alt={bundle.secondary_product.product_nom}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {secondaryImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {secondaryImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSecondaryImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                              currentSecondaryImageIndex === index 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <img
                              src={(image as any).url}
                              alt={`${bundle.secondary_product.product_nom} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square w-full flex items-center justify-center bg-muted rounded-xl">
                    <span className="text-muted-foreground">Aucune image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Bundle Information */}
          <div className="order-2 space-y-8">
            {/* Bundle Header */}
            <div className="space-y-6">
              {/* Stock Status */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge 
                  variant={bundle.primary_product.en_stock && bundle.secondary_product.en_stock ? "default" : "destructive"}
                  className={bundle.primary_product.en_stock && bundle.secondary_product.en_stock ? 'bg-green-100 text-green-800 border-green-200' : ''}
                >
                  {bundle.primary_product.en_stock && bundle.secondary_product.en_stock ? "✅ Pack complet en stock" : "❌ Pack non disponible"}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {bundle.discount_percentage}% OFF
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  {bundle.name}
                </h1>
                
                {bundle.description && (
                  <p className="text-muted-foreground mt-2">{bundle.description}</p>
                )}
                
                {/* Enhanced Price Display */}
                <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground line-through">
                        Prix normal: {formatPrice(originalTotal)}
                      </div>
                      <div className="text-4xl font-bold text-primary">
                        {formatPrice(bundleTotal)}
                      </div>
                      <div className="text-lg text-destructive font-semibold">
                        Économisez {formatPrice(savings)} !
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-muted-foreground">Produit 1</div>
                        <div className="font-semibold">{formatPrice(bundle.primary_product.bundle_prix)}</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-muted-foreground">Produit 2</div>
                        <div className="font-semibold text-destructive">
                          {formatPrice(bundle.secondary_product.bundle_prix)}
                          <span className="text-xs ml-1 line-through text-muted-foreground">
                            {formatPrice(bundle.secondary_product.product_prix)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            {(((bundle.primary_product.available_variants as any)?.colors?.length > 0 || (bundle.primary_product.available_variants as any)?.sizes?.length > 0) ||
              ((bundle.secondary_product.available_variants as any)?.colors?.length > 0 || (bundle.secondary_product.available_variants as any)?.sizes?.length > 0)) && (
              <div className="space-y-6 p-6 bg-card rounded-xl border">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Personnalisez votre pack
                </h3>
                
                {/* Primary Product Variants */}
                {((bundle.primary_product.available_variants as any)?.colors?.length > 0 || (bundle.primary_product.available_variants as any)?.sizes?.length > 0) && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Options pour {bundle.primary_product.product_nom}:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(bundle.primary_product.available_variants as any)?.colors?.length > 0 && (
                        <Select 
                          value={primaryVariants.color || ""} 
                          onValueChange={(value) => setPrimaryVariants(prev => ({ ...prev, color: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Couleur" />
                          </SelectTrigger>
                          <SelectContent>
                            {(bundle.primary_product.available_variants as any).colors.map((color: string) => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {(bundle.primary_product.available_variants as any)?.sizes?.length > 0 && (
                        <Select 
                          value={primaryVariants.size || ""} 
                          onValueChange={(value) => setPrimaryVariants(prev => ({ ...prev, size: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Taille" />
                          </SelectTrigger>
                          <SelectContent>
                            {(bundle.primary_product.available_variants as any).sizes.map((size: string) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}

                {/* Secondary Product Variants */}
                {((bundle.secondary_product.available_variants as any)?.colors?.length > 0 || (bundle.secondary_product.available_variants as any)?.sizes?.length > 0) && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Options pour {bundle.secondary_product.product_nom}:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(bundle.secondary_product.available_variants as any)?.colors?.length > 0 && (
                        <Select 
                          value={secondaryVariants.color || ""} 
                          onValueChange={(value) => setSecondaryVariants(prev => ({ ...prev, color: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Couleur" />
                          </SelectTrigger>
                          <SelectContent>
                            {(bundle.secondary_product.available_variants as any).colors.map((color: string) => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {(bundle.secondary_product.available_variants as any)?.sizes?.length > 0 && (
                        <Select 
                          value={secondaryVariants.size || ""} 
                          onValueChange={(value) => setSecondaryVariants(prev => ({ ...prev, size: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Taille" />
                          </SelectTrigger>
                          <SelectContent>
                            {(bundle.secondary_product.available_variants as any).sizes.map((size: string) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <span className="font-medium">Quantité:</span>
              <Select 
                value={quantity.toString()} 
                onValueChange={(value) => setQuantity(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart}
                className="w-full h-14 text-lg font-semibold"
                disabled={!bundle.primary_product.en_stock || !bundle.secondary_product.en_stock}
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Ajouter le pack au panier - {formatPrice(bundleTotal)}
              </Button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckout(true)}
                  className="h-12"
                  disabled={!bundle.primary_product.en_stock || !bundle.secondary_product.en_stock}
                >
                  Acheter maintenant
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleWhatsApp}
                  className="h-12"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Bundle Benefits */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Avantages de ce pack
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Économisez {formatPrice(savings)} par rapport à l'achat séparé
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Livraison groupée gratuite
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Paiement à la livraison (COD)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Garantie satisfaction 30 jours
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          items={[{
            product_id: bundle.primary_product.product_id,
            product_nom: bundle.primary_product.product_nom,
            product_prix: bundle.primary_product.bundle_prix,
            quantite: quantity,
            variables: primaryVariants
          }]}
        />
      )}
    </>
  );
}