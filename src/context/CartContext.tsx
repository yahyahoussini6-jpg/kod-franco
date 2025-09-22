import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartBundle } from '@/types/bundle';

export interface CartItem {
  product_id: string;
  product_nom: string;
  product_prix: number;
  quantite: number;
  variables?: {
    color?: string;
    size?: string;
  };
  media?: any[];
}

interface CartContextType {
  items: CartItem[];
  bundles: CartBundle[];
  addItem: (item: Omit<CartItem, 'quantite'> & { quantite?: number }) => void;
  addToCart: (item: { productId: string; nom: string; prix: number; quantite: number; media?: any[] }) => void;
  addBundle: (bundle: CartBundle) => void;
  removeItem: (productId: string) => void;
  removeBundle: (bundleId: string) => void;
  updateQuantity: (productId: string, quantite: number) => void;
  updateBundleQuantity: (bundleId: string, quantite: number) => void;
  clearCart: () => void;
  total: number;
  bundleTotal: number;
  grandTotal: number;
  totalSavings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bundles, setBundles] = useState<CartBundle[]>([]);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedBundles = localStorage.getItem('cartBundles');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedBundles) {
      setBundles(JSON.parse(savedBundles));
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cartBundles', JSON.stringify(bundles));
  }, [bundles]);

  const addItem = (newItem: Omit<CartItem, 'quantite'> & { quantite?: number }) => {
    setItems(currentItems => {
      // Check if item with same product_id and variables already exists
      const existingItemIndex = currentItems.findIndex(item => 
        item.product_id === newItem.product_id && 
        JSON.stringify(item.variables || {}) === JSON.stringify(newItem.variables || {})
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantite += newItem.quantite || 1;
        return updatedItems;
      }
      
      // New item, add to cart
      return [...currentItems, { ...newItem, quantite: newItem.quantite || 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(current => current.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantite: number) => {
    if (quantite <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current =>
      current.map(item =>
        item.product_id === productId ? { ...item, quantite } : item
      )
    );
  };

  const addToCart = (item: { productId: string; nom: string; prix: number; quantite: number; media?: any[] }) => {
    addItem({
      product_id: item.productId,
      product_nom: item.nom,
      product_prix: item.prix,
      quantite: item.quantite,
      media: item.media
    });
  };

  const addBundle = (bundle: CartBundle) => {
    setBundles(current => {
      const existingIndex = current.findIndex(b => b.bundle_id === bundle.bundle_id);
      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = bundle;
        return updated;
      }
      return [...current, bundle];
    });
  };

  const removeBundle = (bundleId: string) => {
    setBundles(current => current.filter(bundle => bundle.bundle_id !== bundleId));
  };

  const updateBundleQuantity = (bundleId: string, quantite: number) => {
    if (quantite <= 0) {
      removeBundle(bundleId);
      return;
    }
    setBundles(current =>
      current.map(bundle =>
        bundle.bundle_id === bundleId
          ? {
              ...bundle,
              primary_item: { ...bundle.primary_item, quantite },
              secondary_item: { ...bundle.secondary_item, quantite }
            }
          : bundle
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setBundles([]);
  };

  const total = items.reduce((sum, item) => sum + item.product_prix * item.quantite, 0);
  const bundleTotal = bundles.reduce((sum, bundle) => sum + bundle.bundle_total * bundle.primary_item.quantite, 0);
  const grandTotal = total + bundleTotal;
  const totalSavings = bundles.reduce((sum, bundle) => sum + bundle.total_savings * bundle.primary_item.quantite, 0);

  // Debug logging
  console.log('Cart Debug:', { items, total, bundleTotal, grandTotal });

  return (
    <CartContext.Provider
      value={{
        items,
        bundles,
        addItem,
        addToCart,
        addBundle,
        removeItem,
        removeBundle,
        updateQuantity,
        updateBundleQuantity,
        clearCart,
        total,
        bundleTotal,
        grandTotal,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}