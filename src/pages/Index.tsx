import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, MessageCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            Boutique en ligne
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Découvrez notre collection unique de produits avec visualisation 3D. 
            Paiement à la livraison, livraison rapide partout au Maroc.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button asChild size="lg">
              <Link to="/produits">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Voir nos produits
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/suivi-commande">
                <Package className="mr-2 h-5 w-5" />
                Suivre ma commande
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Pourquoi nous choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiement à la livraison</h3>
              <p className="text-muted-foreground">
                Payez uniquement à la réception de votre commande. Aucun risque !
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visualisation 3D</h3>
              <p className="text-muted-foreground">
                Explorez nos produits en 3D avant de commander. Une expérience unique !
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support WhatsApp</h3>
              <p className="text-muted-foreground">
                Contactez-nous directement via WhatsApp pour toute question.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
