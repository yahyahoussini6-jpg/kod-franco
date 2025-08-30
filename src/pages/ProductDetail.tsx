import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media */}
        <div>
          {hasModel3D ? (
            <ModelViewer3D urlObj={product.model_url} />
          ) : images.length > 0 ? (
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={images[0].url}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
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
              <span className="text-muted-foreground">Aucun média disponible</span>
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{product.nom}</h1>
              <Badge variant={product.en_stock ? "default" : "destructive"}>
                {product.en_stock ? "En stock" : "Rupture"}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(product.prix)}
            </p>
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleBuyNow}
              size="lg"
              className="w-full"
              disabled={!product.en_stock}
            >
              Acheter maintenant
            </Button>
            
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="lg"
              className="w-full"
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
                className="w-full"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Commander via WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={[{
          product_id: product.id,
          product_nom: product.nom,
          product_prix: product.prix,
          quantite: 1,
        }]}
      />
    </div>
  );
}