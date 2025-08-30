import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Confirmation() {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500 mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Commande confirmée !</h1>
        
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="space-y-4">
              <p className="text-lg">
                Votre commande a été créée avec succès.
              </p>
              
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Code de suivi :
                </p>
                <p className="text-2xl font-bold font-mono">
                  {code}
                </p>
              </div>
              
              <div className="text-left space-y-2 text-sm text-muted-foreground">
                <p>✓ Vous recevrez un appel de confirmation dans les prochaines heures</p>
                <p>✓ Paiement à la livraison (COD)</p>
                <p>✓ Livraison sous 24-48h ouvrées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to={`/suivi-commande`}>
              <Package className="mr-2 h-4 w-4" />
              Suivre ma commande
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/produits">
              Continuer mes achats
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}