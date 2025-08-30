import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary">Boutique</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre destination pour des produits de qualité. Nous nous engageons à vous offrir 
              la meilleure expérience d'achat avec un service client exceptionnel.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navigation</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/produits" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Produits
              </Link>
              <Link to="/suivi-commande" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Suivi de commande
              </Link>
              <Link to="/panier" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Panier
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Service Client</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Politique de retour
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Livraison
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Politique de confidentialité
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+212 6 12 34 56 78</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">contact@boutique.ma</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  123 Avenue Mohammed V<br />
                  Casablanca, Maroc
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Boutique. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Mentions légales
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Plan du site
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}