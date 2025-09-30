import { useState, useEffect, memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Star, Truck, Shield, MessageCircle, ArrowRight, Sparkles, Bot, ShoppingBasket, ClipboardCheck, HandCoins } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Autoplay from "embla-carousel-autoplay";

// Animation Variants for Framer Motion
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7 }
  }
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

// Interface Produit
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  in_stock: boolean;
  thumbnail_image?: string;
  images?: string[];
  badge_text?: string;
  badge_color?: string;
  rating?: number;
  discount_percentage?: number;
}

// Composant ProductCard avec effet 3D amélioré
const HomePageProductCard = memo(({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const displayImage = product.thumbnail_image || product.images?.[0] || 'https://placehold.co/400x400/F0FFF4/228B22?text=Felids';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      nom: product.name,
      prix: product.price,
      quantite: 1,
      media: [{ url: displayImage, type: 'image' }]
    });
    toast({
      title: "Ajouté au Panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };
  
  const calculatedOriginalPrice = product.price / (1 - (product.discount_percentage || 0) / 100);

  return (
    <motion.div variants={itemVariants} className="h-full">
        <Link to={`/product/${product.id}`} className="block h-full group [perspective:1000px]">
        <Card className="transition-all duration-500 h-full flex flex-col border-transparent group-hover:shadow-2xl group-hover:[transform:rotateY(5deg)_rotateX(5deg)] relative">
            <CardHeader className="p-0">
            <div className="relative w-full h-56 bg-gray-100 overflow-hidden rounded-t-lg">
                <img
                src={displayImage}
                alt={`Photo de ${product.name} - Felids`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {product.discount_percentage && product.discount_percentage > 0 && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white border-red-500">
                    -{product.discount_percentage}%
                </Badge>
                )}
            </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-grow transition-all duration-500 group-hover:[transform:translateZ(20px)]">
            <div className="flex-grow">
                <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                <CardTitle className="text-base font-semibold mb-2 h-12 line-clamp-2">{product.name}</CardTitle>
                <div className="flex items-center mb-3">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="ml-1 text-sm text-gray-600">{product.rating?.toFixed(1) || '4.5'}</span>
                </div>
            </div>
            <div className="mt-auto">
                <div className="flex items-baseline justify-start mb-4">
                <span className="text-xl font-bold text-primary mr-2">{product.price.toFixed(2)} MAD</span>
                {product.discount_percentage && product.discount_percentage > 0 && (
                    <span className="text-gray-500 line-through">{calculatedOriginalPrice.toFixed(2)} MAD</span>
                )}
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                    onClick={handleAddToCart}
                    className="w-full"
                    disabled={!product.in_stock}
                    variant="outline"
                    >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.in_stock ? 'Ajouter au Panier' : 'Épuisé'}
                    </Button>
                </motion.div>
            </div>
            </CardContent>
        </Card>
        </Link>
    </motion.div>
  );
});

const ProductSkeletonCard = () => (
    <Card className="h-full flex flex-col">
        <Skeleton className="h-56 w-full rounded-t-lg" />
        <CardContent className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="mt-auto">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
    </Card>
);

const ParallaxImage = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    return (
        <div ref={ref} className="w-full max-w-sm h-96 overflow-hidden rounded-lg shadow-lg">
             <motion.img
                src="https://placehold.co/500x600/a3e635/4d7c0f?text=Felids+Collection"
                alt="Collection Felids - Produits exclusifs"
                className="w-full h-[140%] object-cover"
                style={{ y }}
             />
        </div>
    )
}

// Composant Principal de la page d'accueil
const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        if (data) {
          const products = data.map(item => ({
            id: item.id,
            name: item.nom,
            price: item.prix,
            description: item.description,
            category: item.category_id,
            in_stock: item.en_stock,
            thumbnail_image: Array.isArray(item.media) && item.media[0] && typeof item.media[0] === 'object' && 'url' in item.media[0] ? (item.media[0] as any).url : null,
            images: Array.isArray(item.media) ? item.media.filter(m => typeof m === 'object' && m !== null && 'url' in m).map(m => (m as any).url) : [],
            rating: 4.5,
            discount_percentage: 0
          }));
          setFeaturedProducts(products.slice(0, 4));
          setNewestProducts(products.slice(4, 8).length ? products.slice(4, 8) : products.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Hero Section avec parallax */}
      <motion.section 
        className="relative h-screen flex items-center justify-center overflow-hidden [perspective:1000px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/F0FFF4/228B22?text=Felids+Hero')] bg-cover bg-center opacity-10" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <Badge variant="outline" className="mb-4 bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Boutique en ligne premium
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Felids Collection
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Découvrez notre collection unique de produits avec visualisation 3D. 
            Paiement à la livraison, livraison rapide partout au Maroc.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button asChild size="lg" className="group">
              <Link to="/produits">
                <ShoppingBasket className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Découvrir nos produits
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="backdrop-blur-sm bg-white/10">
              <Link to="/suivi-commande">
                <ClipboardCheck className="mr-2 h-5 w-5" />
                Suivre ma commande
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Section Pourquoi nous choisir avec animations */}
      <motion.section 
        className="py-20 md:py-32 bg-white/50 backdrop-blur-sm"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-4"
              variants={itemVariants}
            >
              Pourquoi choisir Felids ?
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Une expérience d'achat exceptionnelle avec des avantages uniques
            </motion.p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={listVariants}
          >
            <motion.div variants={itemVariants} className="text-center group">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <HandCoins className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Paiement à la livraison</h3>
              <p className="text-muted-foreground leading-relaxed">
                Payez uniquement à la réception de votre commande. Sécurité et tranquillité d'esprit garanties !
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center group">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visualisation 3D</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explorez nos produits en 3D avant de commander. Une expérience d'achat révolutionnaire !
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center group">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Support WhatsApp 24/7</h3>
              <p className="text-muted-foreground leading-relaxed">
                Contactez-nous directement via WhatsApp pour toute question. Support réactif et personnalisé.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Section Produits avec carrousel */}
      <motion.section 
        className="py-20 md:py-32"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold mb-4"
              variants={itemVariants}
            >
              Nos Produits Phares
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Découvrez notre sélection de produits les plus populaires
            </motion.p>
          </div>

          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12">
              <TabsTrigger value="featured">Produits Phares</TabsTrigger>
              <TabsTrigger value="newest">Nouveautés</TabsTrigger>
            </TabsList>
            
            <TabsContent value="featured" className="w-full">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <ProductSkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {featuredProducts.map((product) => (
                    <HomePageProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="newest" className="w-full">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <ProductSkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {newestProducts.map((product) => (
                    <HomePageProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          <motion.div 
            className="text-center mt-12"
            variants={itemVariants}
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/produits">
                Voir tous nos produits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Section Avantages avec parallax */}
      <motion.section 
        className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-background overflow-hidden"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="mb-4">
                <Shield className="h-4 w-4 mr-2" />
                Garanties Felids
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Votre satisfaction, notre priorité
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Livraison rapide</h3>
                    <p className="text-muted-foreground">Livraison en 24-72h partout au Maroc</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Garantie qualité</h3>
                    <p className="text-muted-foreground">Produits authentiques et de haute qualité</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Support client</h3>
                    <p className="text-muted-foreground">Équipe disponible pour vous accompagner</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex justify-center"
              variants={itemVariants}
            >
              <ParallaxImage />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section FAQ */}
      <motion.section 
        className="py-20 md:py-32 bg-white/50"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              variants={itemVariants}
            >
              Questions Fréquentes
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground"
              variants={itemVariants}
            >
              Tout ce que vous devez savoir sur Felids
            </motion.p>
          </div>
          
          <motion.div variants={itemVariants}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Comment fonctionne le paiement à la livraison ?</AccordionTrigger>
                <AccordionContent>
                  Vous commandez en ligne et ne payez qu'à la réception de votre colis. Notre livreur accepte les espèces et certaines cartes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Quels sont les délais de livraison ?</AccordionTrigger>
                <AccordionContent>
                  La livraison prend généralement entre 24 et 72 heures selon votre ville au Maroc. Livraison gratuite pour les commandes de plus de 500 MAD.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Puis-je retourner un produit ?</AccordionTrigger>
                <AccordionContent>
                  Oui, vous disposez de 7 jours pour nous retourner un produit s'il ne vous convient pas, à condition qu'il n'ait pas été ouvert ou utilisé.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Comment utiliser la visualisation 3D ?</AccordionTrigger>
                <AccordionContent>
                  Sur chaque page produit, cliquez sur l'icône 3D pour explorer le produit sous tous les angles. Vous pouvez zoomer, faire tourner et voir tous les détails.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action final */}
      <motion.section 
        className="py-20 md:py-32 bg-gradient-to-r from-primary to-primary/80 text-white relative overflow-hidden"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Prêt à découvrir Felids ?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Rejoignez des milliers de clients satisfaits et découvrez notre collection unique
            </p>
            <Button asChild size="lg" variant="secondary" className="group">
              <Link to="/produits">
                <ShoppingBasket className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Commencer mes achats
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Index;