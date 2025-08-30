import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { ShoppingCart, Package, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider, useCart } from "@/context/CartContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import TrackOrder from "./pages/TrackOrder";
import Confirmation from "./pages/Confirmation";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/Layout";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function CartIcon() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantite, 0);
  
  return (
    <Button variant="outline" size="sm" asChild className="relative">
      <Link to="/panier">
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {itemCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

function Navigation() {
  const { user, signOut } = useAuth();
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Boutique
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Accueil
          </Link>
          <Link to="/produits" className="text-muted-foreground hover:text-foreground transition-colors">
            Produits
          </Link>
          <Link to="/suivi-commande" className="text-muted-foreground hover:text-foreground transition-colors">
            Suivi commande
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <Package className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <CartIcon />
        </div>
      </div>
    </nav>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produits" element={<Products />} />
              <Route path="/produit/:slug" element={<ProductDetail />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/suivi-commande" element={<TrackOrder />} />
              <Route path="/confirmation/:code" element={<Confirmation />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminAnalytics />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
