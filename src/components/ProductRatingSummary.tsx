import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star } from 'lucide-react';

interface ProductRatingSummaryProps {
  productId: string;
}

interface RatingStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
}

export const ProductRatingSummary: React.FC<ProductRatingSummaryProps> = ({ productId }) => {
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

  // Fetch a sample recent review
  const { data: sampleReview } = useQuery({
    queryKey: ['product-sample-review', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('comment')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Don't render if no stats or no reviews
  if (!stats || stats.total_reviews === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
      <div className="flex items-center gap-2 text-blue-800 text-sm">
        {renderStars(stats.average_rating)}
        <span className="font-medium">{stats.average_rating?.toFixed(1)}/5</span>
        <span className="text-blue-600">• {stats.total_reviews}+ avis clients</span>
      </div>
      {sampleReview?.comment && (
        <p className="text-blue-700 text-xs mt-1">
          "{sampleReview.comment.length > 60 
            ? sampleReview.comment.substring(0, 60) + "..." 
            : sampleReview.comment}"
        </p>
      )}
    </div>
  );
};