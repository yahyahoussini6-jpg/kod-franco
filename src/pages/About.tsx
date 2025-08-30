import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Award, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">À propos de nous</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez notre histoire, notre mission et les valeurs qui nous guident 
          dans notre engagement à vous offrir la meilleure expérience d'achat en ligne.
        </p>
      </div>

      {/* Story Section */}
      <section className="mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-foreground mb-4">Notre histoire</h2>
            <p className="text-muted-foreground mb-4">
              Fondée avec la passion de rendre le shopping en ligne accessible et agréable, 
              notre boutique a vu le jour pour répondre aux besoins changeants des consommateurs modernes.
            </p>
            <p className="text-muted-foreground">
              Depuis nos débuts, nous nous efforçons de créer une expérience d'achat unique, 
              en mettant l'accent sur la qualité des produits, la satisfaction client et l'innovation technologique.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-8 text-center">
            <div className="text-6xl font-bold text-primary mb-2">2020</div>
            <p className="text-muted-foreground">Année de création</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-foreground text-center mb-8">Nos valeurs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Orienté client</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Nous plaçons nos clients au cœur de tout ce que nous faisons.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Excellence</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Nous visons l'excellence dans chaque produit et service.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Award className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Qualité</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Nous sélectionnons soigneusement chaque produit pour sa qualité.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Passion</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Notre passion pour le commerce nous pousse à innover constamment.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-3xl font-semibold text-foreground mb-4">Notre mission</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Faciliter l'accès à des produits de qualité grâce à une plateforme e-commerce innovante, 
          tout en offrant une expérience d'achat exceptionnelle avec des fonctionnalités avancées 
          comme la visualisation 3D et un service client réactif.
        </p>
      </section>
    </div>
  );
};

export default About;