import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, CheckCircle, XCircle, ShieldCheck, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
}

export default function ReviewsManagement() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const { toast } = useToast();

  const { data: reviews, refetch } = useQuery({
    queryKey: ['admin-reviews', filter],
    queryFn: async () => {
      let query = supabase
        .from('product_reviews')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleApprove = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Avis approuvé",
        description: "L'avis est maintenant visible publiquement."
      });
      
      refetch();
    } catch (error) {
      console.error('Error approving review:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'avis.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: false })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Avis rejeté",
        description: "L'avis n'est plus visible publiquement."
      });
      
      refetch();
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'avis.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Avis supprimé",
        description: "L'avis a été supprimé définitivement."
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'avis.",
        variant: "destructive"
      });
    }
  };

  const handleToggleVerified = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_verified: !currentStatus })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Avis marqué comme vérifié" : "Vérification retirée",
        description: !currentStatus 
          ? "L'avis est maintenant marqué comme achat vérifié." 
          : "L'avis n'est plus marqué comme achat vérifié."
      });
      
      refetch();
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de vérification.",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Avis</h1>
          <p className="text-muted-foreground">
            Gérez les avis et notes des clients
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Tous
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          En attente
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Approuvés
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews?.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{review.customer_name}</CardTitle>
                    {review.is_verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Achat vérifié
                      </Badge>
                    )}
                    <Badge 
                      variant={review.is_approved ? "default" : "secondary"}
                      className={review.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {review.is_approved ? 'Approuvé' : 'En attente'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Produit ID: {review.product_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Téléphone: {review.customer_phone}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Verification Toggle Button */}
                  <Button
                    size="sm"
                    variant={review.is_verified ? "default" : "outline"}
                    onClick={() => handleToggleVerified(review.id, review.is_verified)}
                    className={review.is_verified 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "border-blue-300 text-blue-600 hover:bg-blue-50"
                    }
                  >
                    {review.is_verified ? (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-1" />
                        Vérifié
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        Marquer vérifié
                      </>
                    )}
                  </Button>

                  {/* Approval/Rejection Buttons */}
                  {!review.is_approved && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                  )}
                  
                  {review.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(review.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  )}

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'avis</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cet avis définitivement ? 
                          Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(review.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            {review.comment && (
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground">{review.comment}</p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {reviews?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Aucun avis trouvé.' 
                  : filter === 'pending'
                  ? 'Aucun avis en attente.'
                  : 'Aucun avis approuvé.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}