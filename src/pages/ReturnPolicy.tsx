import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RotateCcw, Clock, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <RotateCcw className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Politique de Retour
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Nous souhaitons que vous soyez entièrement satisfait de votre achat. 
          Découvrez nos conditions de retour et d'échange.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Return Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Délai de Retour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vous disposez de <strong>14 jours calendaires</strong> à compter de la réception 
                de votre commande pour retourner un produit, conformément au droit de rétractation.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Le délai commence à courir dès la réception du dernier article de votre commande.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Return Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Conditions de Retour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Produits Retournables
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
                  <li>Produits non utilisés et en parfait état</li>
                  <li>Emballage d'origine intact avec étiquettes</li>
                  <li>Articles dans leur conditionnement initial</li>
                  <li>Accessoires et notice d'utilisation inclus</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Produits Non Retournables
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
                  <li>Produits personnalisés ou sur-mesure</li>
                  <li>Articles d'hygiène et cosmétiques ouverts</li>
                  <li>Sous-vêtements et maillots de bain</li>
                  <li>Produits périssables ou à durée de vie limitée</li>
                  <li>Articles endommagés par l'usage</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Return Process */}
          <Card>
            <CardHeader>
              <CardTitle>Procédure de Retour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Demande de Retour</h4>
                    <p className="text-muted-foreground text-sm">
                      Contactez notre service client par email ou téléphone pour déclarer votre intention de retour.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Autorisation de Retour</h4>
                    <p className="text-muted-foreground text-sm">
                      Nous vous fournirons un numéro d'autorisation de retour (RMA) et les instructions d'expédition.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Emballage et Expédition</h4>
                    <p className="text-muted-foreground text-sm">
                      Emballez soigneusement le produit et expédiez-le à l'adresse indiquée avec le numéro RMA.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Traitement du Retour</h4>
                    <p className="text-muted-foreground text-sm">
                      Après réception et vérification, nous procédons au remboursement sous 5-7 jours ouvrés.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Information */}
          <Card>
            <CardHeader>
              <CardTitle>Modalités de Remboursement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Mode de Remboursement</h4>
                <p className="text-muted-foreground text-sm">
                  Le remboursement s'effectue par le même moyen de paiement utilisé lors de l'achat. 
                  Pour les paiements en espèces à la livraison, un virement bancaire sera effectué.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Frais de Retour</h4>
                <p className="text-muted-foreground text-sm">
                  Les frais de retour sont à la charge du client, sauf en cas de produit défectueux 
                  ou d'erreur de notre part. Nous recommandons un envoi avec suivi.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Frais de Livraison</h4>
                <p className="text-muted-foreground text-sm">
                  Les frais de livraison initiaux ne sont pas remboursés, sauf en cas de retour 
                  de la totalité de la commande ou de produit défectueux.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a 
                href="/contact" 
                className="block w-full bg-primary text-primary-foreground text-center px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Demander un Retour
              </a>
              <a 
                href="/suivi-commande" 
                className="block w-full border border-border text-center px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Suivre ma Commande
              </a>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Besoin d'Aide ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-semibold">Service Client</p>
                <p className="text-muted-foreground">+212 6 12 34 56 78</p>
                <p className="text-muted-foreground">contact@felids.ma</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold">Horaires</p>
                <p className="text-muted-foreground">Lun-Ven: 9h-18h</p>
                <p className="text-muted-foreground">Sam: 10h-16h</p>
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Cette politique de retour est conforme à la législation marocaine sur la protection du consommateur.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;