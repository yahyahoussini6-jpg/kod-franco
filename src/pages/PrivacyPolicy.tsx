import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, Lock, Database, UserCheck, AlertCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. 
          Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Cette Politique de Confidentialité décrit nos pratiques concernant la collecte, 
                l'utilisation, le stockage et la protection de vos données personnelles lorsque vous 
                utilisez notre site web <strong>felids.ma</strong>.
              </p>
              <p className="text-muted-foreground">
                En utilisant notre site, vous consentez aux pratiques décrites dans cette politique. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cette politique est conforme à la loi marocaine 09-08 relative à la protection des données personnelles.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                2. Données Collectées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">2.1 Données Fournies Directement</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li><strong>Informations de compte :</strong> nom, prénom, email, mot de passe</li>
                  <li><strong>Informations de livraison :</strong> adresse, ville, code postal, téléphone</li>
                  <li><strong>Informations de paiement :</strong> données de carte bancaire (cryptées)</li>
                  <li><strong>Communications :</strong> messages via formulaires de contact</li>
                  <li><strong>Préférences :</strong> historique d'achats, liste de souhaits</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.2 Données Collectées Automatiquement</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li><strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation</li>
                  <li><strong>Données de navigation :</strong> pages visitées, temps passé, liens cliqués</li>
                  <li><strong>Cookies :</strong> préférences utilisateur, panier d'achat, session</li>
                  <li><strong>Données de géolocalisation :</strong> localisation approximative (si autorisée)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.3 Données de Tiers</h4>
                <p className="text-muted-foreground text-sm">
                  Nous pouvons recevoir des informations de nos partenaires (transporteurs, processeurs de paiement) 
                  nécessaires au traitement de vos commandes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle>3. Utilisation des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">3.1 Finalités Principales</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li>Traitement et livraison de vos commandes</li>
                  <li>Gestion de votre compte client</li>
                  <li>Communication sur vos commandes (confirmations, suivi)</li>
                  <li>Service client et support technique</li>
                  <li>Facturation et comptabilité</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.2 Finalités Secondaires (avec consentement)</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li>Marketing et communication commerciale</li>
                  <li>Personnalisation de l'expérience utilisateur</li>
                  <li>Analyses et statistiques d'utilisation</li>
                  <li>Amélioration de nos produits et services</li>
                  <li>Prévention de la fraude</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>4. Partage des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 Partenaires Autorisés</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li><strong>Transporteurs :</strong> pour la livraison de vos commandes</li>
                  <li><strong>Processeurs de paiement :</strong> pour le traitement des transactions</li>
                  <li><strong>Prestataires techniques :</strong> hébergement, maintenance, sécurité</li>
                  <li><strong>Services analytiques :</strong> Google Analytics (données anonymisées)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.2 Obligations Légales</h4>
                <p className="text-muted-foreground text-sm">
                  Nous pouvons divulguer vos données si requis par la loi, une autorité judiciaire, 
                  ou pour protéger nos droits légitimes.
                </p>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                5. Sécurité des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">5.1 Mesures Techniques</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li>Cryptage SSL/TLS pour toutes les transmissions</li>
                  <li>Chiffrement des mots de passe et données sensibles</li>
                  <li>Pare-feu et systèmes de détection d'intrusion</li>
                  <li>Sauvegardes régulières et sécurisées</li>
                  <li>Mises à jour de sécurité automatiques</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5.2 Mesures Organisationnelles</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li>Accès limité aux données selon les besoins</li>
                  <li>Formation du personnel à la protection des données</li>
                  <li>Procédures de gestion des incidents</li>
                  <li>Audits de sécurité réguliers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>6. Conservation des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Données de Compte</h4>
                  <p className="text-muted-foreground text-sm">Conservées tant que le compte est actif</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Données de Commande</h4>
                  <p className="text-muted-foreground text-sm">10 ans (obligations comptables)</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Données Marketing</h4>
                  <p className="text-muted-foreground text-sm">3 ans après le dernier contact</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Logs Techniques</h4>
                  <p className="text-muted-foreground text-sm">1 an maximum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                7. Vos Droits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Conformément à la loi, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Droit d'Accès</h4>
                  <p className="text-muted-foreground text-xs">Connaître les données que nous détenons sur vous</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Droit de Rectification</h4>
                  <p className="text-muted-foreground text-xs">Corriger les données inexactes ou incomplètes</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Droit d'Effacement</h4>
                  <p className="text-muted-foreground text-xs">Demander la suppression de vos données</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Droit d'Opposition</h4>
                  <p className="text-muted-foreground text-xs">Vous opposer au traitement de vos données</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Comment Exercer vos Droits ?</h4>
                <p className="text-muted-foreground text-sm">
                  Contactez-nous à <strong>privacy@felids.ma</strong> ou par courrier postal. 
                  Nous répondrons dans un délai maximum de 30 jours.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>8. Cookies et Technologies Similaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Types de Cookies Utilisés</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-4">
                  <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
                  <li><strong>Cookies de performance :</strong> analytics et amélioration du site</li>
                  <li><strong>Cookies de préférence :</strong> mémorisation de vos choix</li>
                  <li><strong>Cookies marketing :</strong> publicité ciblée (avec consentement)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Gestion des Cookies</h4>
                <p className="text-muted-foreground text-sm">
                  Vous pouvez paramétrer votre navigateur pour refuser les cookies ou être alerté 
                  de leur dépôt. Certaines fonctionnalités peuvent être limitées.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>9. Modifications de cette Politique</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Nous pouvons modifier cette politique de confidentialité pour refléter les changements 
                de nos pratiques ou pour des raisons légales. Les modifications importantes vous seront 
                communiquées par email ou via une notification sur le site.
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

          {/* Contact DPO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact Protection des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Email :</strong> privacy@felids.ma<br />
                <strong>Adresse :</strong> Délégué à la Protection des Données<br />
                123 Avenue Mohammed V<br />
                Casablanca 20000, Maroc
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a 
                href="/contact" 
                className="block w-full bg-primary text-primary-foreground text-center px-3 py-2 rounded text-sm hover:bg-primary/90 transition-colors"
              >
                Exercer mes Droits
              </a>
              <a 
                href="/faq" 
                className="block w-full border border-border text-center px-3 py-2 rounded text-sm hover:bg-muted transition-colors"
              >
                Questions Fréquentes
              </a>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold">Certifié Conforme</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;