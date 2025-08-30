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

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';

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
    if (!product || !WHATSAPP_NUMBER) return;
    
    const message = `Bonjour, je suis intéressé(e) par le produit "${product.nom}" au prix de ${formatPrice(product.prix)}. Quantité: 1. Lien: ${window.location.href}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Images */}
          <div className="order-2 lg:order-1">
            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded border-2 overflow-hidden ${
                          currentImageIndex === index ? 'border-primary' : 'border-muted'
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
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <video
                  src={videos[0].url}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-muted rounded-lg">
                <span className="text-muted-foreground">Aucune image disponible</span>
              </div>
            )}
          </div>

          {/* Informations produit */}
          <div className="order-1 lg:order-2 space-y-4 lg:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold">{product.nom}</h1>
                <Badge variant={product.en_stock ? "default" : "destructive"}>
                  {product.en_stock ? "En stock" : "Rupture"}
                </Badge>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary mb-4">
                {formatPrice(product.prix)}
              </p>
              {product.description && (
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                  {product.description}
                </p>
              )}
            </div>

            {/* Variables */}
            {(colors.length > 0 || sizes.length > 0) && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold">Options disponibles</h3>
                
                {colors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <Label>Couleur</Label>
                    </div>
                    <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color: string) => (
                          <div key={color} className="flex items-center space-x-2">
                            <RadioGroupItem value={color} id={`color-${color}`} />
                            <Label htmlFor={`color-${color}`} className="cursor-pointer">
                              <Badge variant={selectedColor === color ? "default" : "outline"}>
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      <Label>Taille</Label>
                    </div>
                    <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size: string) => (
                          <div key={size} className="flex items-center space-x-2">
                            <RadioGroupItem value={size} id={`size-${size}`} />
                            <Label htmlFor={`size-${size}`} className="cursor-pointer">
                              <Badge variant={selectedSize === size ? "default" : "outline"}>
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

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="w-full h-12 text-base"
                disabled={!product.en_stock}
              >
                Acheter maintenant
              </Button>
              
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="w-full h-12 text-base"
                disabled={!product.en_stock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>

              {WHATSAPP_NUMBER && (
                <Button
                  onClick={handleWhatsApp}
                  variant="secondary"
                  size="lg"
                  className="w-full h-12 text-base"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Commander via WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 3D Model Section - Below everything */}
        {hasModel3D && (
          <div className="mt-8 lg:mt-12">
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Modèle 3D interactif</h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Explorez le produit en 3D - utilisez votre souris pour faire tourner, zoomer et déplacer
              </p>
            </div>
            <div className="w-full">
              <ModelViewer3D urlObj={product.model_url} />
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