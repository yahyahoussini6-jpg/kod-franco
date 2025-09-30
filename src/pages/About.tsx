import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Leaf, Users, Heart, Award, ArrowRight, FlaskConical, Gem, Microscope, Sparkles, BookOpen, Flag, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Value Card Component
const ValueCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.03 }}
            className="flex items-start space-x-4 p-6 bg-white/50 backdrop-blur-lg rounded-xl border border-white/30 shadow-md h-full transition-shadow duration-300 hover:shadow-2xl"
        >
            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mt-1">
                <div className="h-6 w-6 text-primary">{icon}</div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-1 text-gray-800">{title}</h3>
                <p className="text-gray-600">{text}</p>
            </div>
        </motion.div>
    );
};

const About = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Helmet>
        <title>À propos | Felids - Notre Histoire</title>
        <meta name="description" content="Découvrez l'histoire de Felids, une boutique en ligne innovante dédiée à vous offrir les meilleurs produits avec une expérience d'achat unique." />
      </Helmet>
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden flex items-center justify-center text-white [perspective:800px]">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/7262995/pexels-photo-7262995.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative text-center z-10 p-4">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              L'Histoire de Felids
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl mt-4 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              Plus qu'une boutique, une expérience d'achat révolutionnaire.
            </motion.p>
          </div>
        </section>

        {/* Story Section */}
        <motion.section 
          className="py-16 md:py-24 bg-white"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Notre Histoire</h2>
                <p className="text-primary font-semibold mb-4">De l'inspiration à la création</p>
                <p className="text-gray-600 mb-4">
                  Felids est né d'une vision simple : révolutionner l'expérience d'achat en ligne en combinant technologie avancée et service client exceptionnel.
                </p>
                <p className="text-gray-600">
                  Nous avons créé une plateforme où chaque client peut découvrir, explorer et acheter en toute confiance, avec des innovations comme la visualisation 3D et le paiement à la livraison.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-8 text-center">
                <div className="text-6xl font-bold text-primary mb-2">2023</div>
                <p className="text-muted-foreground">Année de création</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section 
          className="py-16 md:py-24 bg-gray-50"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Nos Valeurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Users />, title: "Orienté client", text: "Nous plaçons nos clients au cœur de tout ce que nous faisons." },
                { icon: <Award />, title: "Excellence", text: "Nous visons l'excellence dans chaque produit et service." },
                { icon: <Heart />, title: "Qualité", text: "Nous sélectionnons soigneusement chaque produit pour sa qualité." },
                { icon: <Sparkles />, title: "Innovation", text: "Nous innovons constamment pour améliorer l'expérience client." },
                { icon: <Shield />, title: "Confiance", text: "Nous construisons la confiance à travers la transparence." },
                { icon: <Leaf />, title: "Durabilité", text: "Nous nous engageons pour un commerce responsable." },
              ].map((value, i) => (
                <ValueCard key={i} {...value} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section 
          className="py-16 md:py-24 bg-white"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Notre Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Faciliter l'accès à des produits de qualité grâce à une plateforme e-commerce innovante, 
              tout en offrant une expérience d'achat exceptionnelle avec des fonctionnalités avancées 
              et un service client réactif.
            </p>
            <Button asChild size="lg">
              <Link to="/contact">
                Contactez-nous
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default About;