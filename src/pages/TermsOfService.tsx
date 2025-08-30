import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Scale, Shield, AlertTriangle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ces conditions générales régissent l'utilisation de notre site web et de nos services. 
          Veuillez les lire attentivement.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction et Acceptation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation 
                du site web <strong>boutique.ma</strong> exploité par notre société.
              </p>
              <p className="text-muted-foreground">
                En accédant à notre site ou en passant une commande, vous acceptez d'être lié par ces 
                conditions. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser notre site.
              </p>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ces conditions peuvent être modifiées à tout moment. La dernière version fait foi.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>2. Informations sur l'Entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Dénomination Sociale</h4>
                  <p className="text-muted-foreground text-sm">Boutique SARL</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Registre du Commerce</h4>
                  <p className="text-muted-foreground text-sm">RC N° 123456</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Patente</h4>
                  <p className="text-muted-foreground text-sm">N° 78910111</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Identifiant Fiscal</h4>
                  <p className="text-muted-foreground text-sm">IF 12345678</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Siège Social</h4>
                <p className="text-muted-foreground text-sm">
                  123 Avenue Mohammed V, Casablanca 20000, Maroc
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Website Use */}
          <Card>
            <CardHeader>
              <CardTitle>3. Utilisation du Site Web</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1 Accès au Site</h4>
                <p className="text-muted-foreground text-sm">
                  L'accès au site est gratuit. Tous les coûts afférents à l'accès au site, 
                  que ce soient les frais matériels, logiciels ou d'accès à internet sont 
                  exclusivement à votre charge.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3.2 Utilisation Autorisée</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li>Consulter les produits et services</li>
                  <li>Passer des commandes pour usage personnel</li>
                  <li>Créer un compte client</li>
                  <li>Contacter le service client</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.3 Utilisations Interdites</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li>Usage commercial ou professionnel non autorisé</li>
                  <li>Reproduction ou copie du contenu</li>
                  <li>Perturbation du fonctionnement du site</li>
                  <li>Collecte automatisée de données</li>
                  <li>Transmission de virus ou codes malveillants</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Orders and Payments */}
          <Card>
            <CardHeader>
              <CardTitle>4. Commandes et Paiements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 Processus de Commande</h4>
                <p className="text-muted-foreground text-sm">
                  Pour passer commande, vous devez suivre le processus d'achat en ligne et confirmer 
                  votre commande. Un récapitulatif vous sera envoyé par email.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.2 Prix et Disponibilité</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li>Les prix sont indiqués en Dirham marocain (DH) TTC</li>
                  <li>Les prix peuvent changer sans préavis</li>
                  <li>Les produits sont vendus sous réserve de disponibilité</li>
                  <li>En cas d'indisponibilité, vous serez informé dans les plus brefs délais</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.3 Moyens de Paiement</h4>
                <p className="text-muted-foreground text-sm">
                  Nous acceptons : cartes bancaires, PayPal, et paiement à la livraison. 
                  Tous les paiements sont sécurisés et cryptés.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery and Returns */}
          <Card>
            <CardHeader>
              <CardTitle>5. Livraison et Retours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1 Livraison</h4>
                <p className="text-muted-foreground text-sm">
                  Les conditions de livraison sont détaillées dans notre page "Livraison". 
                  Les délais sont donnés à titre indicatif et peuvent varier selon les circonstances.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.2 Retours et Remboursements</h4>
                <p className="text-muted-foreground text-sm">
                  Conformément à la loi, vous disposez d'un droit de rétractation de 14 jours. 
                  Les conditions détaillées sont disponibles dans notre "Politique de Retour".
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>6. Propriété Intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                L'ensemble des éléments du site (textes, images, logos, icônes, sons, logiciels) 
                constituent des œuvres protégées par les lois en vigueur sur la propriété intellectuelle. 
                Toute reproduction, représentation, modification, publication, transmission ou dénaturation, 
                totale ou partielle, est strictement interdite.
              </p>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle>7. Responsabilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">7.1 Limitation de Responsabilité</h4>
                <p className="text-muted-foreground text-sm">
                  Notre responsabilité ne peut être engagée pour des dommages indirects ou imprévisibles. 
                  En cas de dysfonctionnement du site, nous nous efforcerons de le réparer dans les plus brefs délais.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">7.2 Force Majeure</h4>
                <p className="text-muted-foreground text-sm">
                  Nous ne saurions être tenus responsables de tout retard ou inexécution lorsque la cause 
                  du retard ou de l'inexécution est liée à un cas de force majeure telle que définie par la jurisprudence.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Applicable Law */}
          <Card>
            <CardHeader>
              <CardTitle>8. Droit Applicable et Juridiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Les présentes conditions générales sont régies par le droit marocain. 
                En cas de litige, et à défaut d'accord amiable, les tribunaux de Casablanca seront seuls compétents.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Last Updated */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dernière Mise à Jour</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">15 janvier 2024</p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Liens Utiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/politique-confidentialite" className="block text-sm text-primary hover:underline">
                Politique de Confidentialité
              </a>
              <a href="/politique-retour" className="block text-sm text-primary hover:underline">
                Politique de Retour
              </a>
              <a href="/livraison" className="block text-sm text-primary hover:underline">
                Conditions de Livraison
              </a>
              <a href="/faq" className="block text-sm text-primary hover:underline">
                FAQ
              </a>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Questions Juridiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Pour toute question concernant ces conditions :
              </p>
              <p className="text-sm">
                <strong>Email :</strong> legal@boutique.ma<br />
                <strong>Tél :</strong> +212 6 12 34 56 78
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;