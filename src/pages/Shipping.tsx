import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, Package, CheckCircle, CreditCard } from 'lucide-react';

const Shipping = () => {
  const shippingZones = [
    {
      zone: "Casablanca & Rabat",
      delivery: "24-48h",
      cost: "15 DH",
      cities: ["Casablanca", "Rabat", "Salé", "Mohammedia", "Témara"]
    },
    {
      zone: "Grandes Villes",
      delivery: "2-3 jours",
      cost: "25 DH",
      cities: ["Marrakech", "Fès", "Tanger", "Agadir", "Oujda", "Meknès"]
    },
    {
      zone: "Autres Villes",
      delivery: "3-5 jours",
      cost: "35 DH",
      cities: ["Toutes les autres villes du Maroc"]
    }
  ];

  const deliverySteps = [
    {
      step: "Confirmation",
      description: "Votre commande est confirmée et en préparation",
      time: "Immédiat"
    },
    {
      step: "Préparation",
      description: "Vos articles sont emballés avec soin",
      time: "2-6h"
    },
    {
      step: "Expédition",
      description: "Votre colis est remis au transporteur",
      time: "24h max"
    },
    {
      step: "Livraison",
      description: "Réception de votre commande",
      time: "Selon zone"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Truck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Livraison
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez nos options de livraison rapide et sécurisée partout au Maroc. 
          Nous nous engageons à vous livrer dans les meilleurs délais.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Zones et Tarifs de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shippingZones.map((zone, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{zone.zone}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {zone.delivery}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {zone.cost}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Villes: {zone.cities.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Processus de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {deliverySteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold">{step.step}</h4>
                        <Badge variant="outline" className="text-xs">
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options de Livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Livraison Standard</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Livraison à domicile ou bureau</li>
                    <li>• Suivi SMS en temps réel</li>
                    <li>• Signature obligatoire</li>
                    <li>• Assurance incluse</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Paiement à la Livraison</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Payez en espèces au livreur</li>
                    <li>• Vérification avant paiement</li>
                    <li>• Supplément de 5 DH</li>
                    <li>• Disponible partout</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Conditions de Livraison
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-6">
                  <li>Livraison du lundi au samedi (9h-18h)</li>
                  <li>Présence obligatoire lors de la livraison</li>
                  <li>Pièce d'identité requise pour réceptionner</li>
                  <li>Vérification du colis recommandée avant signature</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Retards de Livraison</h4>
                <p className="text-muted-foreground text-sm">
                  En cas de retard, vous serez informé par SMS. Les délais peuvent être prolongés 
                  lors des périodes de forte activité (promotions, fêtes) ou en cas de conditions météorologiques exceptionnelles.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Colis Non Récupéré</h4>
                <p className="text-muted-foreground text-sm">
                  Si vous n'êtes pas présent lors de la livraison, le transporteur tentera une nouvelle 
                  livraison le lendemain. Après 3 tentatives infructueuses, le colis sera retourné.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Track Order */}
          <Card>
            <CardHeader>
              <CardTitle>Suivre ma Commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Utilisez votre code de suivi pour suivre votre commande en temps réel.
              </p>
              <a 
                href="/suivi-commande" 
                className="block w-full bg-primary text-primary-foreground text-center px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Suivre ma Commande
              </a>
            </CardContent>
          </Card>

          {/* Free Shipping */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Livraison Gratuite</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                <strong>Livraison gratuite</strong> pour toute commande supérieure à <strong>200 DH</strong> 
                dans les grandes villes (Casablanca, Rabat, Marrakech, Fès).
              </p>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Support Livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-semibold">Questions sur votre livraison ?</p>
                <p className="text-muted-foreground">+212 6 12 34 56 78</p>
                <p className="text-muted-foreground">livraison@felids.ma</p>
              </div>
              <a 
                href="https://wa.me/+212612345678" 
                className="block w-full border border-border text-center px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                WhatsApp Support
              </a>
            </CardContent>
          </Card>

          {/* Delivery Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Vérifiez votre numéro de téléphone</li>
                <li>• Soyez disponible aux heures de livraison</li>
                <li>• Préparez votre pièce d'identité</li>
                <li>• Vérifiez le colis avant de signer</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Shipping;