import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, ShoppingCart, Truck, CreditCard, RotateCcw } from 'lucide-react';

const FAQ = () => {
  const faqCategories = [
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Commandes",
      items: [
        {
          question: "Comment passer une commande ?",
          answer: "Pour passer une commande, parcourez notre catalogue, ajoutez les produits souhaités à votre panier, puis suivez les étapes de checkout en renseignant vos informations de livraison et de paiement."
        },
        {
          question: "Puis-je modifier ma commande après l'avoir passée ?",
          answer: "Les modifications sont possibles dans les 2 heures suivant la confirmation de commande. Contactez-nous immédiatement pour toute modification nécessaire."
        },
        {
          question: "Comment annuler ma commande ?",
          answer: "Vous pouvez annuler votre commande tant qu'elle n'a pas été expédiée. Contactez notre service client ou utilisez la fonction d'annulation dans votre espace client."
        }
      ]
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Paiement",
      items: [
        {
          question: "Quels modes de paiement acceptez-vous ?",
          answer: "Nous acceptons les cartes bancaires (Visa, MasterCard), PayPal, et le paiement à la livraison pour certaines zones."
        },
        {
          question: "Mes données de paiement sont-elles sécurisées ?",
          answer: "Oui, nous utilisons un cryptage SSL et nos partenaires de paiement sont certifiés PCI DSS pour garantir la sécurité de vos données."
        },
        {
          question: "Quand sera débité mon compte ?",
          answer: "Votre compte est débité au moment de la confirmation de votre commande, sauf pour le paiement à la livraison."
        }
      ]
    },
    {
      icon: <Truck className="h-5 w-5" />,
      title: "Livraison",
      items: [
        {
          question: "Quels sont les délais de livraison ?",
          answer: "Les délais varient selon votre localisation : 24-48h pour les grandes villes, 2-4 jours pour les autres zones. Vous recevrez un numéro de suivi par SMS."
        },
        {
          question: "Livrez-vous partout au Maroc ?",
          answer: "Oui, nous livrons dans toutes les villes du Maroc. Les frais de livraison sont calculés selon la destination."
        },
        {
          question: "Comment suivre ma commande ?",
          answer: "Utilisez le numéro de suivi envoyé par SMS dans notre page 'Suivi de commande' ou contactez notre service client."
        }
      ]
    },
    {
      icon: <RotateCcw className="h-5 w-5" />,
      title: "Retours & Échanges",
      items: [
        {
          question: "Puis-je retourner un produit ?",
          answer: "Oui, vous disposez de 14 jours pour retourner un produit non utilisé dans son emballage d'origine. Consultez notre politique de retour pour plus de détails."
        },
        {
          question: "Comment faire un échange ?",
          answer: "Contactez notre service client pour initier un échange. Nous organiserons la récupération et l'envoi du nouveau produit."
        },
        {
          question: "Qui prend en charge les frais de retour ?",
          answer: "Les frais de retour sont à votre charge, sauf en cas de produit défectueux ou d'erreur de notre part."
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Foire aux Questions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Trouvez rapidement les réponses à vos questions les plus fréquentes. 
          Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter.
        </p>
      </div>

      {/* Search Suggestion */}
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher dans la FAQ..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Fonction de recherche bientôt disponible
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="grid gap-8">
        {faqCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {category.icon}
                </div>
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem key={itemIndex} value={`item-${index}-${itemIndex}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Question non résolue ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notre équipe est là pour vous aider
            </p>
            <div className="space-y-2">
              <a 
                href="/contact" 
                className="block w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Nous contacter
              </a>
              <a 
                href="https://wa.me/+212612345678" 
                className="block w-full border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;