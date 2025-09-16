import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product_id: string;
  product_nom: string;
  product_prix: number;
  quantite: number;
  variables?: {
    color?: string;
    size?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantite'> & { quantite?: number }) => void;
  addToCart: (item: { productId: string; nom: string; prix: number; quantite: number; media?: any[] }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantite: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

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
      quantite: item.quantite
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.product_prix * item.quantite, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        total,
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