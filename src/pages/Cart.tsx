import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { CheckoutModal } from '@/components/CheckoutModal';
import { formatPrice } from '@/lib/format';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="text-center py-8 md:py-12">
          <ShoppingBag className="mx-auto h-16 md:h-24 w-16 md:w-24 text-muted-foreground mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-4">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Découvrez nos produits et ajoutez-en à votre panier !
          </p>
          <Button asChild size="lg">
            <Link to="/produits">Voir les produits</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Mon Panier</h1>
        <Button variant="outline" onClick={clearCart} size="sm">
          Vider le panier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Articles du panier */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product_id}>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg truncate">{item.product_nom}</h3>
                    <p className="text-primary font-semibold text-sm md:text-base">
                      {formatPrice(item.product_prix)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    {/* Contrôles de quantité */}
                    <div className="flex items-center gap-1 md:gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product_id, item.quantite - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-[2.5rem] text-center font-semibold text-sm">
                        {item.quantite}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product_id, item.quantite + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Sous-total */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm md:text-base">
                        {formatPrice(item.product_prix * item.quantite)}
                      </p>
                    </div>

                    {/* Supprimer */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeItem(item.product_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Récapitulatif */}
        <div className="order-first lg:order-last">
          <Card className="lg:sticky lg:top-4">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold text-lg md:text-xl mb-4">Récapitulatif</h3>
              
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-xs md:text-sm">
                    <span className="truncate mr-2">{item.product_nom} x{item.quantite}</span>
                    <span className="font-medium">{formatPrice(item.product_prix * item.quantite)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg md:text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button 
                onClick={() => setShowCheckout(true)}
                size="lg" 
                className="w-full h-12 text-base"
              >
                Finaliser la commande
              </Button>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Paiement à la livraison (COD)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={items}
        onSuccess={clearCart}
      />
    </div>
  );
}