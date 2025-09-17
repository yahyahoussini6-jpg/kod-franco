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
import ThreeDShowcase from '@/components/ThreeDShowcase';
import { formatPrice } from '@/lib/format';
import { useProductSEO } from '@/hooks/useSEO';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedProducts } from '@/components/seo/RelatedProducts';
import { ProductSchema, OrganizationSchema, WebsiteSchema } from '@/components/seo/ProductSchema';
import { ProductReviews } from '@/components/ProductReviews';
import { ProductRatingSummary } from '@/components/ProductRatingSummary';
import { ProductRecommendations } from '@/components/ProductRecommendations';
import { BundleOffersSection } from '@/components/BundleOffersSection';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '212612345678'; // Default number

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get current locale (should come from context/router in real app)
  const locale = 'fr-MA';

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!category_id (
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Generate SEO data
  const { seo, structuredData, breadcrumbs } = useProductSEO(product, locale);

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
      {/* SEO Head Tags */}
      <SEOHead seo={seo} structuredData={structuredData} />
      <ProductSchema structuredData={structuredData} />
      <OrganizationSchema brandName={seo.brand} />
      <WebsiteSchema />

      {/* Hero Section with SEO Breadcrumbs */}
      <div className="bg-gradient-to-br from-background via-muted/20 to-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
          {/* Left Column - Enhanced Image Gallery */}
          <div className="order-1">
            {images.length > 0 ? (
              <div className="space-y-4 sticky top-4">
                {/* Trust Badge */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
                    ✨ Produit authentique et garanti
                  </div>
                </div>
                
                {/* Main Image with Enhanced Styling */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted shadow-2xl border">
                    <img
                      src={images[currentImageIndex]?.url}
                      alt={product.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                          currentImageIndex === index 
                            ? 'border-primary shadow-lg ring-2 sm:ring-4 ring-primary/20 scale-105' 
                            : 'border-muted hover:border-primary/50 hover:shadow-md'
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

                {/* Real Social Proof from Database */}
                <ProductRatingSummary productId={product.id} />
              </div>
            ) : videos.length > 0 ? (
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-2xl border">
                <video
                  src={videos[0].url}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted rounded-xl shadow-lg border">
                <span className="text-muted-foreground text-sm md:text-base">Aucune image disponible</span>
              </div>
            )}
          </div>

          {/* Right Column - Enhanced Product Information */}
          <div className="order-2 space-y-8">
            {/* Enhanced Product Header */}
            <div className="space-y-6">
              {/* Stock Status with Urgency */}
              <div className="flex items-center gap-3">
                <Badge 
                  variant={product.en_stock ? "default" : "destructive"}
                  className={`px-4 py-2 text-sm font-medium ${
                    product.en_stock 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                      : ''
                  }`}
                >
                  {product.en_stock ? "✅ En stock - Expédition 24h" : "❌ Rupture de stock"}
                </Badge>
                {product.en_stock && (
                  <div className="text-xs text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    🔥 Stock limité !
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {product.nom}
                </h1>
                
                {/* Enhanced Price Display */}
                <div className="mt-4 p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2 sm:gap-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                        {formatPrice(product.prix)}
                      </span>
                      <span className="text-muted-foreground text-sm sm:text-base">TTC</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(Math.round(product.prix * 1.3))}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Économisez {formatPrice(Math.round(product.prix * 0.3))} !
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Description in Features Area */}
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    {product.description ? (
                      <div 
                        className="text-sm text-muted-foreground prose prose-sm prose-gray dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Livraison gratuite
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Paiement sécurisé
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Garantie 30 jours
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Support 24/7
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Product Options */}
            {(colors.length > 0 || sizes.length > 0) && (
              <div className="space-y-6 p-6 bg-gradient-to-br from-card to-card/80 rounded-xl border-2 border-primary/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Personnalisez votre produit</h3>
                </div>
                
                {colors.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">Couleur disponible</Label>
                      {selectedColor && (
                        <Badge variant="outline" className="text-xs">
                          Sélectionné: {selectedColor}
                        </Badge>
                      )}
                    </div>
                    <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {colors.map((color: string) => (
                          <div key={color} className="flex items-center space-x-2">
                            <RadioGroupItem value={color} id={`color-${color}`} />
                            <Label htmlFor={`color-${color}`} className="cursor-pointer flex-1">
                              <div className={`p-3 rounded-lg border-2 transition-all text-center ${
                                selectedColor === color 
                                  ? 'border-primary bg-primary/10 shadow-md' 
                                  : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                              }`}>
                                <span className="text-sm font-medium">{color}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">Taille disponible</Label>
                      {selectedSize && (
                        <Badge variant="outline" className="text-xs">
                          Sélectionné: {selectedSize}
                        </Badge>
                      )}
                    </div>
                    <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {sizes.map((size: string) => (
                          <div key={size} className="flex items-center space-x-2">
                            <RadioGroupItem value={size} id={`size-${size}`} />
                            <Label htmlFor={`size-${size}`} className="cursor-pointer flex-1">
                              <div className={`p-3 rounded-lg border-2 transition-all text-center ${
                                selectedSize === size 
                                  ? 'border-primary bg-primary/10 shadow-md' 
                                  : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                              }`}>
                                <span className="text-sm font-medium">{size}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="space-y-4 pt-6">
              {/* Sticky CTA Container */}
              <div className="bg-gradient-to-r from-card via-card/95 to-card rounded-xl p-4 sm:p-6 border-2 border-primary/20 shadow-xl">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="w-full h-12 sm:h-16 text-lg sm:text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transform hover:scale-[1.02]"
                  disabled={!product.en_stock}
                >
                  <span className="hidden sm:inline">🚀 Acheter maintenant - Livraison 24h</span>
                  <span className="sm:hidden">🚀 Acheter maintenant</span>
                </Button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    size="lg"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 hover:bg-muted/50 font-semibold"
                    disabled={!product.en_stock}
                  >
                    <ShoppingCart className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    <span className="hidden sm:inline">Ajouter au panier</span>
                    <span className="sm:hidden">Panier</span>
                  </Button>

                  <Button
                    onClick={handleWhatsApp}
                    variant="secondary"
                    size="lg"
                    className="h-10 sm:h-12 text-sm sm:text-base bg-green-100 hover:bg-green-200 text-green-800 border border-green-300 font-semibold"
                  >
                    <MessageCircle className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    WhatsApp
                  </Button>
                </div>

              </div>
            </div>

            {/* Additional Trust Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="text-xl sm:text-2xl mb-2">🚚</div>
                <div className="text-xs sm:text-sm font-medium text-green-800">Livraison rapide</div>
                <div className="text-[10px] sm:text-xs text-green-600">24-48h partout au Maroc</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="text-xl sm:text-2xl mb-2">🔒</div>
                <div className="text-xs sm:text-sm font-medium text-blue-800">Paiement sécurisé</div>
                <div className="text-[10px] sm:text-xs text-blue-600">SSL & cryptage avancé</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="text-xl sm:text-2xl mb-2">↩️</div>
                <div className="text-xs sm:text-sm font-medium text-purple-800">Retour gratuit</div>
                <div className="text-[10px] sm:text-xs text-purple-600">30 jours satisfait/remboursé</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Model Section - Enhanced with Scroll */}
        {hasModel3D && (
          <div className="mt-8 sm:mt-12 lg:mt-16" id="hero-3d-section-wrapper">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">Modèle 3D interactif</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-4">
                Explorez le produit en 3D - utilisez votre souris pour faire tourner, zoomer et déplacer le modèle
              </p>
            </div>
            <div className="w-full bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl p-4 sm:p-6 shadow-lg">
              <ThreeDShowcase 
                urlGlb={product.model_url} 
                enableScroll={true}
                containerId="hero-3d-section"
              />
            </div>
            {/* Spacer for scroll effect */}
            <div className="h-[50vh]"></div>
          </div>
        )}
      </div>

      {/* SEO Content Sections */}
      <div className="container mx-auto px-3 sm:px-4 py-8 space-y-12">
        {/* Product Benefits Section */}
        {seo.benefit_bullets && seo.benefit_bullets.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Avantages du produit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seo.benefit_bullets.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary text-sm font-bold">✓</span>
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How to Use Section */}
        {seo.how_to_use && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Mode d'emploi</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: seo.how_to_use }} />
            </div>
          </section>
        )}

        {/* Ingredients Section */}
        {seo.ingredients_summary && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Ingrédients</h2>
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-muted-foreground leading-relaxed">{seo.ingredients_summary}</p>
              {seo.inci_full && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-primary hover:text-primary/80">
                    Voir la composition complète (INCI)
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{seo.inci_full}</p>
                </details>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <FAQSection seo={seo} locale={locale} />

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />

        {/* Bundle Offers */}
        <BundleOffersSection 
          productId={product.id} 
          className="mt-12"
        />

        {/* Upsells and Cross-sells */}
        <ProductRecommendations 
          productId={product.id} 
          currentProductPrice={product.prix}
        />

        {/* Related Products */}
        <RelatedProducts 
          relatedSkus={seo.related_product_skus} 
          currentProductId={product.id}
          locale={locale}
        />

        {/* Trust Signals & Shipping Info */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Livraison & Garanties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-lg">🚚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Livraison gratuite</h3>
                  <p className="text-sm text-muted-foreground">{seo.cod_shipping_note}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💳</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Paiement sécurisé</h3>
                  <p className="text-sm text-muted-foreground">Paiement à la livraison (COD) ou en ligne</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🛡️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Garantie 30 jours</h3>
                  <p className="text-sm text-muted-foreground">Retour gratuit si non satisfait</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 text-lg">📞</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Support client</h3>
                  <p className="text-sm text-muted-foreground">Service client disponible 7j/7</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 p-3 safe-area-pb">
        <div className="flex gap-2">
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="flex-1 h-12 text-sm font-semibold bg-green-100 hover:bg-green-200 text-green-800 border border-green-300"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            onClick={handleBuyNow}
            className="flex-[2] h-12 text-sm font-bold bg-gradient-to-r from-primary to-primary/90"
            disabled={!product.en_stock}
          >
            🚀 Acheter maintenant
          </Button>
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
          variables: {
            color: selectedColor || undefined,
            size: selectedSize || undefined,
          },
        }]}
      />
    </>
  );
}