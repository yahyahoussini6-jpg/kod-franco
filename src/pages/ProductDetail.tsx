import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, MessageCircle, Palette, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { CheckoutModal } from '@/components/CheckoutModal';
import ModelViewer3D from '@/components/ModelViewer3D';
import { formatPrice } from '@/lib/format';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '212612345678'; // Default number

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      product_id: product.id,
      product_nom: product.nom,
      product_prix: product.prix,
      variables: {
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      },
    });
    
    toast({
      title: "Produit ajouté",
      description: `${product.nom} a été ajouté au panier`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    setShowCheckout(true);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    
    // Build detailed product information
    let productDetails = `🛍️ *${product.nom}*\n`;
    productDetails += `💰 Prix: *${formatPrice(product.prix)}*\n`;
    productDetails += `📦 Quantité: 1\n`;
    
    // Add selected options if any
    if (selectedColor) {
      productDetails += `🎨 Couleur: ${selectedColor}\n`;
    }
    if (selectedSize) {
      productDetails += `📏 Taille: ${selectedSize}\n`;
    }
    
    // Add product description if available
    if (product.description) {
      const shortDescription = product.description.length > 100 
        ? product.description.substring(0, 100) + "..."
        : product.description;
      productDetails += `📋 Description: ${shortDescription}\n`;
    }
    
    productDetails += `🔗 Lien produit: ${window.location.href}\n\n`;
    productDetails += `Bonjour ! Je suis intéressé(e) par ce produit. Pouvez-vous me donner plus d'informations sur la disponibilité et les modalités de commande ? Merci ! 😊`;
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(productDetails)}`;
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

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
          <p className="text-muted-foreground">
            Le produit que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </div>
    );
  }

  const media = Array.isArray(product.media) ? product.media as Array<{type: string, url: string}> : [];
  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');
  const hasModel3D = product.model_url;
  const variables = product.variables as any || {};
  const colors = Array.isArray(variables.colors) ? variables.colors : [];
  const sizes = Array.isArray(variables.sizes) ? variables.sizes : [];

  return (
    <>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="order-1">
            {images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-lg">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.nom}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                          currentImageIndex === index 
                            ? 'border-primary shadow-md' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${product.nom} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : videos.length > 0 ? (
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-lg">
                <video
                  src={videos[0].url}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square w-full flex items-center justify-center bg-muted rounded-lg shadow-lg">
                <span className="text-muted-foreground text-sm md:text-base">Aucune image disponible</span>
              </div>
            )}
          </div>

          {/* Right Column - Product Information */}
          <div className="order-2 space-y-6">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{product.nom}</h1>
                  <Badge 
                    variant={product.en_stock ? "default" : "destructive"}
                    className="flex-shrink-0"
                  >
                    {product.en_stock ? "En stock" : "Rupture"}
                  </Badge>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    {formatPrice(product.prix)}
                  </span>
                  <span className="text-muted-foreground text-sm">TTC</span>
                </div>
              </div>
              
              {product.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Product Options */}
            {(colors.length > 0 || sizes.length > 0) && (
              <div className="space-y-6 p-6 border rounded-xl bg-card shadow-sm">
                <h3 className="text-lg font-semibold">Personnalisez votre produit</h3>
                
                {colors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">Couleur</Label>
                    </div>
                    <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                      <div className="flex flex-wrap gap-3">
                        {colors.map((color: string) => (
                          <div key={color} className="flex items-center space-x-2">
                            <RadioGroupItem value={color} id={`color-${color}`} />
                            <Label htmlFor={`color-${color}`} className="cursor-pointer">
                              <Badge 
                                variant={selectedColor === color ? "default" : "outline"}
                                className="px-3 py-1 text-sm hover:shadow-md transition-shadow"
                              >
                                {color}
                              </Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">Taille</Label>
                    </div>
                    <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                      <div className="flex flex-wrap gap-3">
                        {sizes.map((size: string) => (
                          <div key={size} className="flex items-center space-x-2">
                            <RadioGroupItem value={size} id={`size-${size}`} />
                            <Label htmlFor={`size-${size}`} className="cursor-pointer">
                              <Badge 
                                variant={selectedSize === size ? "default" : "outline"}
                                className="px-3 py-1 text-sm hover:shadow-md transition-shadow"
                              >
                                {size}
                              </Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                disabled={!product.en_stock}
              >
                Acheter maintenant
              </Button>
              
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="w-full h-12 text-base border-2 hover:bg-muted/50"
                disabled={!product.en_stock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </Button>

              <Button
                onClick={handleWhatsApp}
                variant="secondary"
                size="lg"
                className="w-full h-12 text-base bg-green-100 hover:bg-green-200 text-green-800 border border-green-300"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Commander via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* 3D Model Section - Full Width Below */}
        {hasModel3D && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Modèle 3D interactif</h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                Explorez le produit en 3D - utilisez votre souris pour faire tourner, zoomer et déplacer le modèle
              </p>
            </div>
            <div className="w-full bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl p-6 shadow-lg">
              <ModelViewer3D urlGlb={product.model_url} />
            </div>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={[{
          product_id: product.id,
          product_nom: product.nom,
          product_prix: product.prix,
          quantite: 1,
          variables: {
            color: selectedColor || undefined,
            size: selectedSize || undefined,
          },
        }]}
      />
    </>
  );
}