import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, StarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductReviewsProps {
  productId: string;
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_verified: boolean;
}

interface RatingStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rating: 0,
    comment: ''
  });
  const { toast } = useToast();

  // Fetch reviews
  const { data: reviews, refetch } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    }
  });

  // Fetch rating stats
  const { data: stats } = useQuery({
    queryKey: ['product-rating-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_product_rating_stats', { p_product_id: productId });

      if (error) throw error;
      return data[0] as RatingStats;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.rating === 0) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit review
      const { data: reviewData, error: submitError } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          customer_name: formData.name,
          customer_phone: formData.phone,
          rating: formData.rating,
          comment: formData.comment
        })
        .select()
        .single();

      if (submitError) throw submitError;

      // Verify purchase
      const { data: verificationResult, error: verifyError } = await supabase
        .rpc('verify_and_approve_review', {
          p_review_id: reviewData.id,
          p_phone: formData.phone,
          p_product_id: productId
        });

      if (verifyError) throw verifyError;

      if (verificationResult) {
        toast({
          title: "Avis vérifié et publié!",
          description: "Votre achat a été vérifié. Votre avis est maintenant visible."
        });
        refetch();
      } else {
        toast({
          title: "Avis soumis",
          description: "Nous n'avons pas trouvé de commande correspondante. Votre avis sera examiné manuellement.",
          variant: "destructive"
        });
      }

      setFormData({ name: '', phone: '', rating: 0, comment: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre avis. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Avis Clients</h2>
          {stats && (
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                {renderStars(Math.round(stats.average_rating || 0))}
                <span className="text-lg font-semibold text-foreground">
                  {stats.average_rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-muted-foreground">
                ({stats.total_reviews} avis)
              </span>
            </div>
          )}
        </div>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
            Laisser un avis
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Laisser un avis</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Numéro de téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0612345678"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilisé pour vérifier votre achat
                  </p>
                </div>
              </div>

              <div>
                <Label>Note *</Label>
                <div className="mt-2">
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Commentaire</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Partagez votre expérience avec ce produit..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Envoi...' : 'Publier l\'avis'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-foreground">{review.customer_name}</h4>
                      {review.is_verified && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-foreground mt-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviews && reviews.length === 0 && (
        <div className="text-center py-8">
          <StarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun avis pour ce produit.</p>
          <p className="text-sm text-muted-foreground">Soyez le premier à laisser un avis!</p>
        </div>
      )}
    </section>
  );
};